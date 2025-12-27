import {
  cleanupOldSessions,
  generateImage,
  getApiKeyHash,
  saveImageLocally,
} from "@/lib/gemini-service";
import { NextRequest, NextResponse } from "next/server";
import pLimit from "p-limit";
import { z } from "zod";

const bulkSchema = z.array(
  z.object({
    prompt: z.string().min(1),
    variant: z.enum(["logo", "banner"]).default("logo"),
    aspectRatio: z.string().optional(),
    filename: z.string().optional(),
  })
);

export async function POST(req: NextRequest) {
  try {
    // Run cleanup in the background (no await) to keep it simple and fast
    cleanupOldSessions();

    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key is required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = bulkSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid JSON structure", details: validation.error.format() },
        { status: 400 }
      );
    }

    const configs = validation.data;
    const limit = pLimit(10);
    const userHash = getApiKeyHash(apiKey);
    const sessionId = `session-${userHash}-${Date.now()}`;

    const tasks = configs.map((config, index) =>
      limit(async () => {
        try {
          const images = await generateImage(config, apiKey);
          const results = [];
          for (const img of images) {
            const url = await saveImageLocally(
              img.buffer,
              img.extension,
              config.filename || `bulk-${index}`,
              sessionId,
              !!config.filename
            );
            results.push(url);
          }
          return {
            status: "success",
            prompt: config.prompt,
            urls: results,
          };
        } catch (error: any) {
          console.error(
            `Error generating image for prompt: ${config.prompt}`,
            error
          );
          return {
            status: "error",
            prompt: config.prompt,
            error: error.message || "Unknown error",
          };
        }
      })
    );

    const results = await Promise.all(tasks);

    return NextResponse.json({ results, sessionId });
  } catch (error: any) {
    console.error("Bulk generation error:", error);
    return NextResponse.json(
      { error: "Failed to process bulk request", message: error.message },
      { status: 500 }
    );
  }
}
