'use client';

import { Bot, Copy, Sparkles, User } from 'lucide-react';
import { useCallback, useState } from 'react';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import AiInput from './AiInput';
import { motion } from 'framer-motion';
import { FileDropzone } from './FileDropzone';


interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function WorkingChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File[]>([]);
  const [documentId, setDocumentId] = useState<string | null>(null);



  const handleFilesSelected = async(selectedFiles: File[]) => {
    setFile(selectedFiles);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFiles[0]);

      const response = await fetch("/api/rag/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if(data.success)
      {
        setDocumentId(data.metadata.documentId); 
        setMessages(prev => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.message, // This is the document summary provided by the AI
          },
        ]);
      }
    }
    catch(error) {
      console.error("Uploaded error: ", error);
      setError("Failed to process document");
    }
    finally {
      setIsLoading(false);
    }
  }


  const handleRemoveFile = () => {
    setFile([]);
    setMessages([]);
  }
  


  const handleSubmit = useCallback(
    async(e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !documentId) return;

    const userMessage: Message = { 
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input.trim(), documentId: documentId }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.answer,
          },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setError('Failed to get answer');
    } finally {
      setIsLoading(false);
    }
  },
  [input, isLoading, documentId]
);



  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };



  return (
    <div className="mx-auto flex h-svh w-full max-w-4xl flex-col pb-0.5">
      <div className={`flex flex-col ${messages.length >0 ? "" : "justify-center" } h-full overflow-y-auto rounded-xl p-4 text-sm leading-6 shadow-md sm:text-base sm:leading-7`}>
        <div className="absolute inset-0 h-full w-full overflow-hidden">
          <div className="bg-primary/10 absolute top-0 left-1/4 h-96 w-96 animate-pulse rounded-full mix-blend-normal blur-[128px] filter" />
          <div className="bg-secondary/10 absolute right-1/4 bottom-0 h-96 w-96 animate-pulse rounded-full mix-blend-normal blur-[128px] filter delay-700" />
          <div className="bg-primary/10 absolute top-1/4 right-1/3 h-64 w-64 animate-pulse rounded-full mix-blend-normal blur-[96px] filter delay-1000" />
        </div>
        {file.length > 0 && (
          <div className="relative">
              <div className="flex max-w-3xl items-center px-2 mb-6 sm:px-4">
                <User className="bg-secondary text-primary mr-2 flex size-7 rounded-full p-1 sm:mr-4" />
                <div className="w-full md:w-[60%]">
                  <FileDropzone onFilesSelected={handleFilesSelected} files={file} onRemoveFile={handleRemoveFile} />
                </div>
              </div>
          </div>
        )}
        {file.length > 0 ? (
          messages.map((m) => {
            return (
              <div key={m.id} className="mb-4 whitespace-pre-wrap">
                {m.role === 'user' ? (
                  <div className="flex max-w-3xl items-center px-2 sm:px-4">
                    <User className="bg-secondary text-primary mr-2 flex size-7 rounded-full p-1 sm:mr-4" />
                    <p className='py-1.5'>{m.content}</p>
                  </div>
                ) : (
                  <div className="relative mb-4 flex rounded-xl px-2 py-6 sm:px-4 bg-neutral-900">
                    <Bot className="bg-secondary text-primary mr-2 flex size-8 rounded-full p-1 sm:mr-4" />
                    <div className="markdown-body w-full max-w-3xl overflow-x-auto rounded-x mr-8">
                      <Markdown>{m.content}</Markdown>
                    </div>
                    <button
                      type="button"
                      title="copy"
                      className="absolute top-2 right-2 rounded-full bg-secondary p-2 opacity-50 transition-all hover:opacity-90 active:scale-110"
                      onClick={() => copyToClipboard(m.content)}
                    >
                      <Copy className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="relative mx-auto w-full max-w-2xl">
            <motion.div
              className="relative z-10 space-y-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className="space-y-3 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-block"
                >
                  <h1 className="pb-1 text-3xl font-medium tracking-tight">
                    Chat with any PDF
                  </h1>
                  <motion.div
                    className="via-primary/50 h-px bg-gradient-to-r from-transparent to-transparent"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '100%', opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                </motion.div>
                <motion.p
                  className="text-muted-foreground text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Ask questions, get summaries, and more.
                </motion.p>
              </div>

              <FileDropzone onFilesSelected={handleFilesSelected} files={file} onRemoveFile={handleRemoveFile} />
            </motion.div>
          </div>
        )}
        {isLoading && (
          <div className="bg-primary/5 mx-auto flex w-fit items-center gap-2 rounded-full px-4 py-2">
            <Sparkles className="text-primary h-4 w-4 animate-pulse" />
            <span className="from-primary/80 to-primary animate-pulse bg-gradient-to-r bg-clip-text text-sm font-medium text-transparent">
              Generating response...
            </span>
          </div>
        )}
        {error && (
          <div className="border-destructive/20 bg-destructive/10 text-destructive mx-auto w-fit rounded-lg border p-3">
            Something went wrong! Please try again.
          </div>
        )}
      </div>

      {file.length > 0 && 
        <form className="mt-2" onSubmit={handleSubmit}>
          <div className="relative">
            <AiInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
            />
          </div>
        </form>
      }
    </div>
  );
}