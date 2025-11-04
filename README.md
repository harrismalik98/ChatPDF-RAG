# ChatPDF – RAG Chatbot (LangChain + Pinecone + Groq) 

A Retrieval-Augmented Generation (RAG) based chatbot that allows users to upload PDFs, then chat, ask questions, and get summaries directly from the content.
Built using LangChain, Pinecone, Google Generative AI embeddings, and Groq SDK, this project demonstrates how to combine modern LLMs with vector search for intelligent document interaction.


## Features

The application has following features:

- **Chat with your documents:** Upload a PDF and ask any question about its content.
- **Document summaries:** Automatically generate a short, insightful summary of uploaded PDFs.
- **RAG-based responses:** Uses vector search (Pinecone) + Groq LLMs to provide contextually relevant answers.
- **Document isolation:** Each PDF is indexed separately to ensure accurate, document-specific responses.
- **Automatic cleanup:** Temporary uploaded files are automatically deleted after processing.


## Getting Started

1. Clone this repository to your local machine:
   ```shell
   git clone https://github.com/harrismalik98/ChatPDF-RAG.git
   ```
2. Install the dependencies:
   ```shell
   cd ChatPDF-RAG
   npm install
   ```
3. Configure environment variables by creating a `.env` file in the project root:
   ```shell
   GOOGLE_API_KEY=
   PINECONE_API_KEY=
   PINECONE_INDEX=
   GROQ_API_KEY=
   ```
4. Start the development server:
   ```shell
   npm run dev
   ```
5. Access the application in your web browser at http://localhost:3000


## Technologies Used

The ChatPDF is a full-stack web application built with the following modern tools and technologies:

- **Next.js 15:** A powerful React framework for building fast, scalable, and SEO-friendly web applications with server-side rendering and API routes.

- **LangChain:** A powerful framework that simplifies building LLM-powered applications by managing document loading, chunking, and retrieval workflows.

- **Pinecone:** A fast and scalable vector database for storing embeddings and performing efficient similarity searches in RAG pipelines.

- **Groq SDK:** A high-performance SDK that powers the chatbot’s reasoning and response generation using large open-source LLMs.

- **Google Generative AI Embeddings:** An advanced embedding model that transforms document text into vector representations for accurate context retrieval.

- **TailwindCSS:** A utility-first CSS framework for creating beautiful and responsive user interfaces.

- **ShadcnUI:** A beautifully designed and customizable component library used to enhance the aesthetics and user experience of the website.