import type { Msg } from "@/lib/streamChat";

interface StatsBarProps {
  messages: Msg[];
  tokenCount: number;
  model: string;
  isLoading: boolean;
  startTime?: number;
}

const StatsBar = ({ messages, tokenCount, model, isLoading, startTime }: StatsBarProps) => {
  const userMsgs = messages.filter((m) => m.role === "user").length;
  const assistantMsgs = messages.filter((m) => m.role === "assistant").length;
  const modelShort = model.split("/").pop() || model;

  const elapsed = startTime && isLoading ? ((Date.now() - startTime) / 1000).toFixed(1) : null;

  return (
    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono overflow-x-auto whitespace-nowrap">
      <span className="hidden sm:inline">
        <span className="text-terminal-user">●</span> {userMsgs} sent
      </span>
      <span className="hidden sm:inline">
        <span className="text-accent">●</span> {assistantMsgs} recv
      </span>
      <span>~{tokenCount.toLocaleString()} tokens</span>
      {isLoading && elapsed && (
        <span className="text-terminal-green animate-pulse">⏱ {elapsed}s</span>
      )}
      <span className="text-muted-foreground/50 hidden md:inline">{modelShort}</span>
    </div>
  );
};

export default StatsBar;
