import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { vectorStore } from "./vectorStore";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

interface ProcessedDocument {
  content: string;
  chunks: number;
  metadata: Record<string, unknown>;
}


// Process and index a document into Pinecone
export async function indexDocument(
  filePath: string
): Promise<ProcessedDocument> {
  // Load the PDF
  const loader = new PDFLoader(filePath, { splitPages: false });
  const docs = await loader.load();
  
  if (!docs || docs.length === 0) {
    throw new Error("Failed to load document");
  }

  const docContent = docs[0].pageContent;
  const metadata = docs[0].metadata;


  // Split document into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 200,
  });
  const texts = await textSplitter.splitText(docContent);


  // Generate a unique document ID
  const documentId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;


  // Prepare documents for indexing
  const documents = texts.map((chunk:string) => ({
    pageContent: chunk,
    metadata: {
      ...metadata,
      documentId: documentId,
      source: filePath,
      timestamp: new Date().toISOString(),
    },
  }));

  // Add to vector store
  await vectorStore.addDocuments(documents);

  return {
    content: docContent,
    chunks: documents.length,
    metadata: {
      ...metadata,
      documentId,
    },
  };
}


// Generate a summary of the document
export async function generateSummary(content: string): Promise<string> {
    
  const systemPrompt = `You are an expert document summarizer. Create a concise, informative summary of the provided document.
    ### Instructions:
    - Capture the main topics, key points, and essential information
    - Keep the summary between 3-5 bullet points
    - Be clear, accurate, and professional
    - End with: "Ready to chat about it?" in bold font
    `;


  const chatCompletion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `Please summarize this document:\n\n${content.slice(0, 10000)}`, // Limit to avoid token issues
      },
    ],
  });

  return chatCompletion.choices[0]?.message.content || "Summary unavailable.";
}