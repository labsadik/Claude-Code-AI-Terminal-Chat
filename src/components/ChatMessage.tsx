import { useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { toast } from "sonner";
import type { Msg } from "@/lib/streamChat";

interface ChatMessageProps {
  msg: Msg;
  isLoading?: boolean;
  isLast?: boolean;
}

const ChatMessage = ({ msg, isLoading, isLast }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);

  const copyMessage = async () => {
    await navigator.clipboard.writeText(msg.content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (msg.role === "user") {
    return (
      <div className="flex gap-3 items-start group">
        <div className="shrink-0 w-6 h-6 rounded bg-[hsl(var(--terminal-user))]/15 flex items-center justify-center mt-0.5">
          <span className="text-[hsl(var(--terminal-user))] text-xs font-mono font-bold">U</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-medium text-[hsl(var(--terminal-user))] font-mono">You</p>
            <button
              onClick={copyMessage}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
              title="Copy"
            >
              <svg className="w-3 h-3 text-muted-foreground hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          {(msg as any).fileName && (
            <div className="mb-2 inline-flex items-center gap-1.5 bg-secondary/50 border border-border rounded px-2 py-1 text-xs text-muted-foreground font-mono">
              <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {(msg as any).fileName}
            </div>
          )}
          <div className="text-sm text-foreground whitespace-pre-wrap break-words">
            {msg.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 items-start group">
      <div className="shrink-0 w-6 h-6 rounded bg-accent/15 flex items-center justify-center mt-0.5">
        <span className="text-accent text-xs font-mono font-bold">A</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs font-medium text-accent font-mono">Claude</p>
          <button
            onClick={copyMessage}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
            title="Copy"
          >
            {copied ? (
              <svg className="w-3 h-3 text-terminal-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-muted-foreground hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
        <div className="text-sm">
          <MarkdownRenderer content={msg.content} />
          {isLoading && isLast && (
            <span className="inline-block w-1.5 h-4 bg-accent ml-0.5 animate-cursor-blink align-middle" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
