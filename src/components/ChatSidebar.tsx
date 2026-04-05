import { useState } from "react";
import { toast } from "sonner";
import type { Conversation } from "@/hooks/useConversations";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ChatSidebar = ({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  isOpen,
  onToggle,
}: ChatSidebarProps) => {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const startRename = (c: Conversation) => {
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const submitRename = () => {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim());
      toast.success("Renamed");
    }
    setEditingId(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
    return d.toLocaleDateString("en", { month: "short", day: "numeric" });
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed lg:relative z-50 h-full bg-[hsl(var(--sidebar-background))] border-r border-sidebar-border flex flex-col transition-all duration-200 ${
          isOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 lg:w-0"
        } overflow-hidden`}
      >
        {/* Header */}
        <div className="p-3 border-b border-sidebar-border shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold font-mono text-sidebar-foreground">
              Conversations
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={onNew}
                className="p-1.5 rounded hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
                title="New conversation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={onToggle}
                className="p-1.5 rounded hover:bg-sidebar-accent text-sidebar-foreground transition-colors lg:hidden"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-sidebar-accent text-sidebar-foreground text-xs rounded px-2.5 py-1.5 outline-none placeholder:text-[hsl(var(--muted-foreground))] border border-sidebar-border focus:border-sidebar-ring transition-colors font-mono"
          />
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-[hsl(var(--muted-foreground))] font-mono">
              {search ? "No matches" : "No conversations yet"}
            </div>
          ) : (
            <div className="p-1.5 space-y-0.5">
              {filtered.map((conv) => (
                <div
                  key={conv.id}
                  className={`group rounded-md px-2.5 py-2 cursor-pointer transition-colors ${
                    activeId === conv.id
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                  onClick={() => onSelect(conv.id)}
                >
                  {editingId === conv.id ? (
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={submitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submitRename();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="w-full bg-transparent text-xs outline-none border-b border-sidebar-ring font-mono"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate font-mono">
                          {conv.title}
                        </p>
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5 font-mono">
                          {formatDate(conv.last_message_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startRename(conv);
                          }}
                          className="p-1 rounded hover:bg-sidebar-accent"
                          title="Rename"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(conv.id);
                          }}
                          className="p-1 rounded hover:bg-destructive/20 text-destructive"
                          title="Delete"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border text-[10px] text-[hsl(var(--muted-foreground))] font-mono">
          {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;
