import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { indexDocument, generateSummary } from "@/lib/rag/documentProcessor";


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }


    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/markdown",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload PDF, Word, TXT, or Markdown file." },
        { status: 400 }
      );
    }

    
    // Save file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempDir = path.join(process.cwd(), "temp");
    
    // Create temp directory if it doesn't exist
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }
    
    const filePath = path.join(tempDir, `${Date.now()}-${file.name}`);

    await writeFile(filePath, buffer);

    // Process and index document
    const processedDoc = await indexDocument(filePath);

    // Generate summary
    const summary = await generateSummary(processedDoc.content);

    // Clean up temporary file
    await unlink(filePath);

    return NextResponse.json({
      success: true,
      message: summary,
      metadata: {
        filename: file.name,
        chunks: processedDoc.chunks,
        size: file.size,
        documentId: processedDoc.metadata.documentId,   // Return documentId to frontend
      },
    });

  }
  catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process document" },
      { status: 500 }
    );
  }
}