import { NextRequest, NextResponse } from "next/server";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { getApiKeyHash } from "@/lib/gemini-service";

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json({ error: "API Key required" }, { status: 401 });
    }

    const userHash = getApiKeyHash(apiKey);
    const outputDir = path.join(process.cwd(), "public/output");
    
    let folders: string[] = [];
    try {
      folders = await readdir(outputDir);
    } catch (e) {
      // Directory might not exist yet
      return NextResponse.json({ sessions: [] });
    }

    const userSessions = [];

    for (const folder of folders) {
      if (folder.startsWith(`session-${userHash}-`)) {
        const folderPath = path.join(outputDir, folder);
        const folderStats = await stat(folderPath);
        
        const files = await readdir(folderPath);
        const imageUrls = files
          .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
          .map(f => `/api/output/${folder}/${f}`);

        if (imageUrls.length > 0) {
          userSessions.push({
            id: folder,
            createdAt: folderStats.mtime,
            images: imageUrls
          });
        }
      }
    }

    // Sort by newest first
    userSessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({ sessions: userSessions });
  } catch (error: any) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

