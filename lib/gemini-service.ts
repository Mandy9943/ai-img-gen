import { GoogleGenerativeAI } from "@google/generative-ai";
import mime from "mime";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MODEL = "gemini-3-pro-image-preview";
const OUTPUT_DIR = path.resolve(process.cwd(), "public/output");

export interface GenerationConfig {
  prompt: string;
  variant: "logo" | "banner";
  aspectRatio?: string;
  filename?: string;
}

export async function generateImage(config: GenerationConfig, apiKey: string) {
  if (!apiKey) {
    throw new Error("Missing Google Gemini API Key");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Note: The original script used ai.models.generateContent with a specific config.
  // In the latest SDK, we use getGenerativeModel and then generateContent.
  const model = genAI.getGenerativeModel({ model: MODEL });

  const imageConfig = config.aspectRatio
    ? { aspectRatio: config.aspectRatio, imageSize: "1K" }
    : config.variant === "banner"
    ? { aspectRatio: "16:9", imageSize: "1K" }
    : { aspectRatio: "1:1", imageSize: "1K" };

  const generationConfig = {
    responseModalities: ["IMAGE"] as any, // Modalities might be preview or not fully typed in all SDK versions
    imageConfig,
  };

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: config.prompt }] }],
    generationConfig,
  } as any);

  const response = result.response;
  const candidates = response.candidates ?? [];
  const generatedImages: {
    buffer: Buffer;
    mimeType: string;
    extension: string;
  }[] = [];

  for (const candidate of candidates) {
    const parts = candidate?.content?.parts ?? [];
    for (const part of parts) {
      if ("inlineData" in part && part.inlineData?.data) {
        const buffer = Buffer.from(part.inlineData.data, "base64");
        const mimeType = part.inlineData.mimeType || "image/png";
        const extension = extensionFromMimeType(mimeType);
        generatedImages.push({ buffer, mimeType, extension });
      }
    }
  }

  if (generatedImages.length === 0) {
    throw new Error("No image data was returned by the model.");
  }

  // Save only the first image for now to keep it simple, or we can save all.
  // Returning the results so the caller can handle storage.
  return generatedImages;
}

export async function saveImageLocally(
  buffer: Buffer,
  extension: string,
  prefix: string = "ai-image",
  subDir: string = "",
  useExactName: boolean = false
) {
  const targetDir = path.join(OUTPUT_DIR, subDir);
  await mkdir(targetDir, { recursive: true });

  const filename = useExactName
    ? `${prefix}.${extension}`
    : `${prefix}-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}.${extension}`;

  const filePath = path.join(targetDir, filename);
  await writeFile(filePath, buffer);
  return `/output/${subDir ? subDir + "/" : ""}${filename}`; // Public URL
}

function extensionFromMimeType(mimeType?: string) {
  const fallback = "png";
  if (!mimeType) return fallback;
  const ext = mime.getExtension(mimeType);
  return typeof ext === "string" && ext.length > 0 ? ext : fallback;
}
