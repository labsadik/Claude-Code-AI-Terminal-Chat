import { useState, useRef, useEffect, useCallback } from "react";
import { streamChat, type Msg } from "@/lib/streamChat";
import { toast } from "sonner";
import ChatMessage from "./ChatMessage";
import FileUpload from "./FileUpload";
import ChatSidebar from "./ChatSidebar";
import ModelSelector, { MODELS } from "./ModelSelector";
import SystemPromptEditor from "./SystemPromptEditor";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";
import StatsBar from "./StatsBar";
import { useConversations } from "@/hooks/useConversations";

const DEFAULT_SYSTEM_PROMPT = "You are a helpful AI assistant running in a terminal environment. Keep answers clear, concise, and well-formatted. Use markdown for code blocks. Be friendly but efficient, like a knowledgeable CLI tool.";

const SLASH_COMMANDS: Record<string, { description: string; action: string }> = {
  "/clear": { description: "Clear conversation", action: "clear" },
  "/help": { description: "Show available commands", action: "help" },
  "/compact": { description: "Summarize conversation to save context", action: "compact" },
  "/model": { description: "Show/switch model", action: "model" },
  "/cost": { description: "Show token usage estimate", action: "cost" },
  "/export": { description: "Export conversation as markdown", action: "export" },
  "/new": { description: "Start new conversation", action: "new" },
  "/system": { description: "Open system prompt editor", action: "system" },
  "/stats": { description: "Show detailed session stats", action: "stats" },
  "/shortcuts": { description: "Show keyboard shortcuts", action: "shortcuts" },
  "/reset": { description: "Reset all settings to default", action: "reset" },
};

const HELP_TEXT = `## ⌨ Commands & Shortcuts

### Slash Commands
| Command | Description |
|---------|-------------|
| \`/clear\` | Clear conversation history |
| \`/help\` | Show this help message |
| \`/compact\` | Summarize & compress context |
| \`/model\` | Show current model info |
| \`/cost\` | Show estimated token usage |
| \`/export\` | Export as markdown file |
| \`/new\` | Start new conversation |
| \`/system\` | Open system prompt editor |
| \`/stats\` | Show detailed session stats |
| \`/shortcuts\` | Show keyboard shortcuts |
| \`/reset\` | Reset all settings |

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| \`Enter\` | Send message |
| \`Shift+Enter\` | New line |
| \`Ctrl+C\` | Cancel generation |
| \`Ctrl+L\` | Clear screen |
| \`Ctrl+N\` | New conversation |
| \`Ctrl+,\` | System prompt |
| \`Ctrl+K\` | Toggle sidebar |
| \`Ctrl+?\` | Shortcuts modal |
| \`Esc\` | Clear input |

### Features
- 📎 **File Upload** — Drag & drop or click clip icon
- 💬 **Conversations** — Persistent history with search
- 🧠 **Multi-Model** — Switch between Gemini & GPT models
- ⚙️ **System Prompts** — Customize AI personality
- 📋 **Copy Messages** — Hover any message to copy
- 📊 **Token Tracking** — Real-time usage estimates`;

const TerminalChat = () => {
  const {
    conversations, activeId, messages, setMessages,
    loadMessages, createConversation, saveMessage,
    deleteConversation, renameConversation,
  } = useConversations();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; content: string }[]>([]);
  const [selectedModel, setSelectedModel] = useState("google/gemini-3-flash-preview");
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [streamStartTime, setStreamStartTime] = useState<number | undefined>();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isLoading) textareaRef.current?.focus();
  }, [isLoading]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [input]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setSidebarOpen(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const estimateTokens = (text: string) => Math.ceil(text.length / 4);

  const addSystemMessage = (content: string) => {
    setMessages((prev) => [...prev, { role: "assistant", content }]);
  };

  const handleNewConversation = useCallback(async () => {
    await createConversation();
    setTokenCount(0);
  }, [createConversation]);

  const handleSlashCommand = (command: string): boolean => {
    const parts = command.trim().toLowerCase().split(" ");
    const cmd = parts[0];
    const handler = SLASH_COMMANDS[cmd];
    if (!handler) return false;

    switch (handler.action) {
      case "clear":
        setMessages([]);
        setTokenCount(0);
        toast.success("Conversation cleared");
        break;
      case "help":
        addSystemMessage(HELP_TEXT);
        break;
      case "model": {
        const current = MODELS.find((m) => m.id === selectedModel) || MODELS[0];
        addSystemMessage(
          `**Current Model:** \`${current.name}\`\n**Provider:** ${current.provider}\n**Quality:** ${current.quality}\n**Speed:** ${current.speed}\n**ID:** \`${current.id}\`\n\n*Use the model selector in the bottom bar or type \`/model <name>\` to switch.*`
        );
        break;
      }
      case "cost":
        addSystemMessage(
          `**📊 Session Usage**\n- Messages: ${messages.length}\n- Est. tokens: ~${tokenCount.toLocaleString()}\n- Model: ${selectedModel.split("/").pop()}\n- System prompt: ${systemPrompt.length} chars (~${Math.ceil(systemPrompt.length / 4)} tokens)`
        );
        break;
      case "compact": {
        const summary = `[Conversation compacted: ${messages.length} messages summarized]`;
        const lastFew = messages.slice(-4);
        setMessages([{ role: "assistant", content: summary }, ...lastFew]);
        toast.success("Conversation compacted");
        break;
      }
      case "export": {
        const md = messages
          .map((m) => `## ${m.role === "user" ? "You" : "Assistant"}\n\n${m.content}`)
          .join("\n\n---\n\n");
        const blob = new Blob([md], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `conversation-${Date.now()}.md`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Exported as markdown");
        break;
      }
      case "new":
        handleNewConversation();
        break;
      case "system":
        setShowSystemPrompt(true);
        break;
      case "shortcuts":
        setShowShortcuts(true);
        break;
      case "stats": {
        const totalChars = messages.reduce((a, m) => a + m.content.length, 0);
        const avgLen = messages.length ? Math.round(totalChars / messages.length) : 0;
        addSystemMessage(
          `**📊 Detailed Stats**\n- Total messages: ${messages.length}\n- User messages: ${messages.filter(m => m.role === "user").length}\n- Assistant messages: ${messages.filter(m => m.role === "assistant").length}\n- Est. tokens: ~${tokenCount.toLocaleString()}\n- Avg message length: ${avgLen} chars\n- Total characters: ${totalChars.toLocaleString()}\n- Model: \`${selectedModel}\`\n- System prompt: ${systemPrompt.length} chars`
        );
        break;
      }
      case "reset":
        setSelectedModel("google/gemini-3-flash-preview");
        setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
        toast.success("Settings reset to defaults");
        break;
    }
    return true;
  };

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setStreamStartTime(undefined);
      toast("Generation cancelled");
    }
  }, []);

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed && attachedFiles.length === 0) return;
    if (isLoading) return;

    if (trimmed.startsWith("/")) {
      setInput("");
      if (handleSlashCommand(trimmed)) return;
      toast.error(`Unknown command: ${trimmed.split(" ")[0]}. Type /help for commands.`);
      return;
    }

    let convId = activeId;
    if (!convId) {
      convId = await createConversation(trimmed.slice(0, 80));
      if (!convId) return;
    }

    let content = trimmed;
    if (attachedFiles.length > 0) {
      const fileBlocks = attachedFiles
        .map((f) => `\n\n📎 **File: ${f.name}**\n\`\`\`\n${f.content}\n\`\`\``)
        .join("");
      content = trimmed + fileBlocks;
    }

    const userMsg: Msg = { role: "user", content };
    const userMsgWithMeta = {
      ...userMsg,
      fileName: attachedFiles.length > 0 ? attachedFiles.map((f) => f.name).join(", ") : undefined,
    };

    setMessages((prev) => [...prev, userMsgWithMeta as Msg]);
    setInput("");
    setAttachedFiles([]);
    setIsLoading(true);
    setStreamStartTime(Date.now());
    setTokenCount((prev) => prev + estimateTokens(content));

    await saveMessage(convId, userMsg);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    abortControllerRef.current = new AbortController();

    try {
      await streamChat({
        messages: [...messages, userMsg],
        model: selectedModel,
        systemPrompt,
        onDelta: upsertAssistant,
        onDone: async () => {
          setIsLoading(false);
          setStreamStartTime(undefined);
          setTokenCount((prev) => prev + estimateTokens(assistantSoFar));
          if (assistantSoFar) {
            await saveMessage(convId!, { role: "assistant", content: assistantSoFar });
          }
        },
        onError: (err) => toast.error(err),
      });
    } catch {
      if (abortControllerRef.current?.signal.aborted) return;
      toast.error("Failed to connect");
      setIsLoading(false);
      setStreamStartTime(undefined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); return; }
    if (e.key === "Escape") { if (isLoading) cancelGeneration(); else setInput(""); return; }
    if (e.key === "l" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setMessages([]); setTokenCount(0); return; }
    if (e.key === "n" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleNewConversation(); return; }
    if (e.key === "c" && e.ctrlKey && isLoading) { e.preventDefault(); cancelGeneration(); }
    if (e.key === "," && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setShowSystemPrompt(true); }
    if (e.key === "k" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setSidebarOpen(p => !p); }
    if (e.key === "/" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setShowShortcuts(true); }
  };

  const showSlashHint = input.startsWith("/") && !input.includes(" ");
  const matchingCommands = showSlashHint
    ? Object.entries(SLASH_COMMANDS).filter(([cmd]) => cmd.startsWith(input.toLowerCase()))
    : [];

  return (
    <div className="flex h-screen bg-background font-sans text-foreground">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={loadMessages}
        onNew={handleNewConversation}
        onDelete={deleteConversation}
        onRename={renameConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <SystemPromptEditor
        systemPrompt={systemPrompt}
        onSave={setSystemPrompt}
        isOpen={showSystemPrompt}
        onClose={() => setShowSystemPrompt(false)}
      />

      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="border-b border-border px-4 py-2.5 flex items-center justify-between shrink-0 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className={`w-2 h-2 rounded-full ${isLoading ? "bg-terminal-green animate-pulse" : "bg-accent"}`} />
            <span className="text-sm font-semibold tracking-tight font-mono">claude-code</span>
            <span className="text-xs text-muted-foreground font-mono hidden sm:inline">v1.0</span>
          </div>
          <div className="flex items-center gap-2">
            <StatsBar messages={messages} tokenCount={tokenCount} model={selectedModel} isLoading={isLoading} startTime={streamStartTime} />
            <div className="flex items-center gap-1.5 ml-2">
              <button onClick={() => setShowSystemPrompt(true)} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="System Prompt (Ctrl+,)">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button onClick={() => setShowShortcuts(true)} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Shortcuts (Ctrl+?)">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {isLoading && (
                <button onClick={cancelGeneration} className="text-xs text-destructive hover:text-destructive/80 font-mono transition-colors px-1.5">
                  ■ stop
                </button>
              )}
              <button onClick={handleNewConversation} className="text-xs text-muted-foreground hover:text-accent font-mono transition-colors px-1.5" title="New conversation (Ctrl+N)">
                + new
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
            {messages.length === 0 && (
              <div className="animate-fade-in space-y-6 pt-8">
                <div className="space-y-2">
                  <h1 className="text-xl font-semibold text-foreground">
                    Welcome to <span className="text-accent">Claude Code</span>
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                    AI-powered coding assistant with multi-model support, file analysis, conversation history, and markdown rendering.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { icon: "🧠", label: "Multi-Model", desc: "GPT-5, Gemini Pro & Flash" },
                    { icon: "📎", label: "File Analysis", desc: "Upload code for review" },
                    { icon: "⚙️", label: "System Prompts", desc: "Customize AI behavior" },
                    { icon: "💬", label: "History", desc: "Persistent conversations" },
                    { icon: "📊", label: "Token Stats", desc: "Real-time usage tracking" },
                    { icon: "⌨", label: "Shortcuts", desc: "Power user hotkeys" },
                  ].map((f) => (
                    <div key={f.label} className="bg-card border border-border rounded-lg px-3 py-2.5">
                      <span className="text-base">{f.icon}</span>
                      <p className="text-xs font-medium text-foreground mt-1 font-mono">{f.label}</p>
                      <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Explain how React hooks work",
                    "Review my code for performance issues",
                    "Write a Python script to parse CSV",
                    "Design a REST API for a todo app",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => { setInput(suggestion); textareaRef.current?.focus(); }}
                      className="text-left text-xs text-muted-foreground hover:text-foreground bg-card hover:bg-secondary border border-border rounded-lg px-3 py-2.5 transition-all hover:border-accent/30"
                    >
                      <span className="text-accent mr-1.5">→</span>
                      {suggestion}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-[10px] text-muted-foreground/60 font-mono">
                  <span>Powered by Labsadik</span>
                  <span>Type <code className="text-accent">/help</code> for commands</span>
                  <span>📎 Drag & drop files</span>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className="animate-fade-in">
                <ChatMessage msg={msg} isLoading={isLoading} isLast={i === messages.length - 1} />
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3 items-start animate-fade-in">
                <div className="shrink-0 w-6 h-6 rounded bg-accent/15 flex items-center justify-center mt-0.5">
                  <span className="text-accent text-xs font-mono font-bold">A</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-accent mb-1 font-mono">Assistant</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse [animation-delay:0.4s]" />
                    <span className="text-xs text-muted-foreground ml-2 font-mono">
                      Thinking with {(MODELS.find(m => m.id === selectedModel) || MODELS[0]).name}...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Attached files */}
        {attachedFiles.length > 0 && (
          <div className="border-t border-border px-4 py-2 bg-card/30">
            <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
              {attachedFiles.map((f, i) => (
                <div key={i} className="inline-flex items-center gap-1.5 bg-secondary border border-border rounded px-2 py-1 text-xs font-mono text-muted-foreground">
                  <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {f.name}
                  <button onClick={() => setAttachedFiles((prev) => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive ml-1">×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border shrink-0 bg-card/30 backdrop-blur-sm relative">
          {matchingCommands.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 bg-card border border-border border-b-0 rounded-t-lg overflow-hidden max-w-3xl mx-auto">
              {matchingCommands.map(([cmd, { description }]) => (
                <button
                  key={cmd}
                  onClick={() => { setInput(cmd); textareaRef.current?.focus(); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-secondary flex items-center gap-3 transition-colors"
                >
                  <span className="text-accent font-mono text-xs">{cmd}</span>
                  <span className="text-muted-foreground text-xs">{description}</span>
                </button>
              ))}
            </div>
          )}

          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-end gap-2 bg-secondary/50 border border-border rounded-lg px-3 py-2 focus-within:border-accent/50 transition-colors">
              <span className="text-accent font-mono text-sm shrink-0 pb-0.5">❯</span>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onDrop={(e) => {
                  e.preventDefault();
                  Array.from(e.dataTransfer.files).forEach((file) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setAttachedFiles((prev) => [...prev, { name: file.name, content: ev.target?.result as string }]);
                    };
                    reader.readAsText(file);
                  });
                }}
                onDragOver={(e) => e.preventDefault()}
                placeholder={isLoading ? "Generating... (Esc to cancel)" : "Type a message... (/ for commands)"}
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm disabled:opacity-50 resize-none font-mono leading-relaxed max-h-[200px]"
                autoFocus
              />
              <FileUpload onFileRead={(name, content) => setAttachedFiles((prev) => [...prev, { name, content }])} disabled={isLoading} />
              <button onClick={send} disabled={isLoading || (!input.trim() && attachedFiles.length === 0)} className="shrink-0 pb-0.5 text-muted-foreground hover:text-accent disabled:opacity-30 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1">
              <span className="text-[10px] text-muted-foreground/50 font-mono hidden sm:inline">
                Enter send · Shift+Enter newline · /help commands · 📎 files
              </span>
              <ModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalChat;
