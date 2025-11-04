import { vectorStore } from "./vectorStore";
import Groq from "groq-sdk";

const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

interface ChatResponse {
  answer: string;
}


// Answer a question using RAG
export async function answerQuestion(
  question: string,
  documentId: string,
  topK: number = 5
): Promise<ChatResponse> {

  const filter = {
    documentId: documentId,
  }

  const relevantChunks = await vectorStore.similaritySearch(question, topK, filter);
  const context = relevantChunks.map((chunk) => chunk.pageContent).join("\n\n");
  


  const systemPrompt = `You are an intelligent and helpful AI assistant designed to answer user questions based on the provided relevant context.
    ### Instructions:
    - Use ONLY the information from the relevant context to answer the question.
    - If the answer cannot be found in the provided context, respond politely:
    "This information doesn't appear in the provided document, so I'm unable to answer that."
    - Keep your answer **concise, accurate, and directly relevant** to the question.
    - Do **not** include unnecessary explanations, assumptions, or unrelated details.
    - If numerical data, dates, or facts are mentioned, ensure they match exactly with the document context.
    - Use clear sentence structure or short bullet points for clarity when appropriate.

    ### Current date and time:
    ${new Date().toUTCString()}
    `;

    
  const userQuery = `Question: ${question}
    Relevant context:${context}`;


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
        content: userQuery,
      },
    ],
  });


  const answer = chatCompletion.choices[0]?.message.content || "No answer available.";

  return {
    answer
  };
}