import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import mime from "mime";

const NOINDEX_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await params as required in newer Next.js versions
    const resolvedParams = await params;
    const filePath = path.join(process.cwd(), "public/output", ...resolvedParams.path);
    
    const fileBuffer = await readFile(filePath);
    const mimeType = mime.getType(filePath) || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
        ...NOINDEX_HEADERS,
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("File not found", {
      status: 404,
      headers: {
        ...NOINDEX_HEADERS,
      },
    });
  }
}

