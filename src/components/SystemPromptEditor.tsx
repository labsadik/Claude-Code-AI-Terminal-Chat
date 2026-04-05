import { useState } from "react";

const PRESET_PROMPTS = [
  { name: "Default", prompt: "You are a helpful AI assistant running in a terminal environment. Keep answers clear, concise, and well-formatted. Use markdown for code blocks." },
  { name: "Code Expert", prompt: "You are an expert software engineer. Write clean, efficient, well-documented code. Explain your reasoning. Follow best practices and design patterns." },
  { name: "Concise", prompt: "You are a concise assistant. Give the shortest accurate answer. Skip pleasantries. Use bullet points. Code over prose." },
  { name: "Teacher", prompt: "You are a patient programming teacher. Explain concepts step-by-step with examples. Ask clarifying questions. Build on fundamentals." },
  { name: "DevOps", prompt: "You are a DevOps and infrastructure expert. Help with CI/CD, Docker, Kubernetes, cloud services, shell scripts, and system administration." },
  { name: "Reviewer", prompt: "You are a senior code reviewer. Analyze code for bugs, security issues, performance problems, and style. Be constructive but thorough." },
];

interface SystemPromptEditorProps {
  systemPrompt: string;
  onSave: (prompt: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SystemPromptEditor = ({ systemPrompt, onSave, isOpen, onClose }: SystemPromptEditorProps) => {
  const [value, setValue] = useState(systemPrompt);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[520px] sm:max-h-[80vh] bg-card border border-border rounded-lg shadow-2xl z-50 flex flex-col animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold font-mono text-foreground">System Prompt</h2>
            <p className="text-[10px] text-muted-foreground">Customize AI behavior and personality</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-3 border-b border-border">
          <p className="text-[10px] text-muted-foreground mb-2 font-mono">Presets</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_PROMPTS.map((p) => (
              <button
                key={p.name}
                onClick={() => setValue(p.prompt)}
                className={`text-[10px] px-2 py-1 rounded font-mono transition-colors ${
                  value === p.prompt
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full h-40 bg-secondary/50 border border-border rounded-md px-3 py-2 text-xs text-foreground font-mono resize-none outline-none focus:border-accent/50 transition-colors"
            placeholder="Enter custom system prompt..."
          />
          <p className="text-[10px] text-muted-foreground mt-1 font-mono">
            {value.length} chars · ~{Math.ceil(value.length / 4)} tokens
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
          <button onClick={onClose} className="text-xs px-3 py-1.5 rounded font-mono text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onSave(value); onClose(); }}
            className="text-xs px-3 py-1.5 rounded font-mono bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default SystemPromptEditor;
