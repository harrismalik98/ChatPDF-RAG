import { NextRequest, NextResponse } from "next/server";
import { answerQuestion } from "@/lib/rag/chatService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, documentId } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Get answer using RAG
    const response = await answerQuestion(question, documentId, 5);

    return NextResponse.json({
      success: true,
      answer: response.answer,
    });

  }
  catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process question" },
      { status: 500 }
    );
  }
}