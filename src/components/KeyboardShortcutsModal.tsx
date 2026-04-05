interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { category: "Input", items: [
    { keys: ["Enter"], desc: "Send message" },
    { keys: ["Shift", "Enter"], desc: "New line" },
    { keys: ["Esc"], desc: "Clear input / Cancel generation" },
    { keys: ["/"], desc: "Slash commands" },
  ]},
  { category: "Navigation", items: [
    { keys: ["Ctrl", "N"], desc: "New conversation" },
    { keys: ["Ctrl", "L"], desc: "Clear screen" },
    { keys: ["Ctrl", "C"], desc: "Cancel generation" },
    { keys: ["Ctrl", ","], desc: "System prompt settings" },
    { keys: ["Ctrl", "K"], desc: "Toggle sidebar" },
    { keys: ["Ctrl", "?"], desc: "Keyboard shortcuts" },
  ]},
];

const KeyboardShortcutsModal = ({ isOpen, onClose }: KeyboardShortcutsModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-card border border-border rounded-lg shadow-2xl z-50 animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold font-mono text-foreground">⌨ Keyboard Shortcuts</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-4">
          {shortcuts.map((group) => (
            <div key={group.category}>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-2">{group.category}</p>
              <div className="space-y-1.5">
                {group.items.map((s) => (
                  <div key={s.desc} className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{s.desc}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k) => (
                        <kbd key={k} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary border border-border text-muted-foreground min-w-[24px] text-center">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default KeyboardShortcutsModal;
