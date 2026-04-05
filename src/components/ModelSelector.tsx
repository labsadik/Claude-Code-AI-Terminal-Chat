import { useState, useRef, useEffect } from "react";

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description: string;
  speed: "fast" | "medium" | "slow";
  quality: "standard" | "high" | "premium";
}

export const MODELS: ModelInfo[] = [
  { id: "google/gemini-3-flash-preview", name: "Gemini 3 Flash", provider: "Google", description: "Fast, balanced speed & capability", speed: "fast", quality: "high" },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", description: "Top-tier reasoning & multimodal", speed: "slow", quality: "premium" },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google", description: "Good balance of cost & quality", speed: "fast", quality: "high" },
  { id: "openai/gpt-5", name: "GPT-5", provider: "OpenAI", description: "Powerful all-rounder, excellent reasoning", speed: "medium", quality: "premium" },
  { id: "openai/gpt-5-mini", name: "GPT-5 Mini", provider: "OpenAI", description: "Strong performance, lower cost", speed: "fast", quality: "high" },
  { id: "openai/gpt-5.2", name: "GPT-5.2", provider: "OpenAI", description: "Latest with enhanced reasoning", speed: "medium", quality: "premium" },
];

interface ModelSelectorProps {
  selectedModel: string;
  onSelect: (modelId: string) => void;
}

const speedColors = { fast: "text-terminal-green", medium: "text-yellow-400", slow: "text-orange-400" };
const qualityBadge = { standard: "bg-muted", high: "bg-terminal-user/20 text-terminal-user", premium: "bg-accent/20 text-accent" };

const ModelSelector = ({ selectedModel, onSelect }: ModelSelectorProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = MODELS.find((m) => m.id === selectedModel) || MODELS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary"
      >
        <div className={`w-1.5 h-1.5 rounded-full ${speedColors[current.speed]}`} />
        <span className="hidden sm:inline">{current.name}</span>
        <span className="sm:hidden">{current.name.split(" ").pop()}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-1 w-72 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50 animate-fade-in">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs font-semibold font-mono text-foreground">Select Model</p>
            <p className="text-[10px] text-muted-foreground">Choose the AI model for responses</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => { onSelect(model.id); setOpen(false); }}
                className={`w-full text-left px-3 py-2.5 hover:bg-secondary/50 transition-colors ${
                  model.id === selectedModel ? "bg-secondary border-l-2 border-accent" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium font-mono text-foreground">{model.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${qualityBadge[model.quality]}`}>
                    {model.quality}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground/70 font-mono">{model.provider}</span>
                  <span className="text-[10px] text-muted-foreground">{model.description}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <div className={`w-1 h-1 rounded-full ${speedColors[model.speed]}`} />
                  <span className={`text-[10px] font-mono ${speedColors[model.speed]}`}>{model.speed}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
