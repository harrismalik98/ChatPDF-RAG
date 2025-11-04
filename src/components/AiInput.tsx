'use client'

import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import { CornerRightUp } from "lucide-react";

export default function AiInput ({
  value,
  onChange,
  onSubmit,
  onKeyDown,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 50,
    maxHeight: 500,
  });

  return (
    <div className="w-full">
      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-start gap-2">
        <div className="relative mx-auto mr-20 w-full max-w-4xl mb-4">
          <Textarea
            ref={textareaRef}
            id="ai-input-06"
            placeholder="Ask me anything!"
            className="bg-muted/50 text-foreground ring-primary/20 placeholder:text-muted-foreground/70 w-full max-w-4xl resize-none rounded-3xl border-none py-4 pr-12 pl-6 leading-[1.2] text-wrap"
            value={value}
            onKeyDown={onKeyDown}
            onChange={(e) => {
              onChange(e);
              adjustHeight();
            }}
          />
          <button
            onClick={onSubmit}
            className={cn(
              'bg-primary/10 hover:bg-primary/20 absolute top-1/2 right-3 -translate-y-1/2 rounded-xl p-2 transition-all duration-200',
              value.trim() ? 'opacity-100' : 'cursor-not-allowed opacity-50',
            )}
            type="button"
            disabled={!value.trim()}
          >
            <CornerRightUp
              className={cn(
                'text-primary h-4 w-4 transition-opacity',
                value ? 'opacity-100' : 'opacity-50',
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}