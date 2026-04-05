import { useRef, useState } from "react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileRead: (fileName: string, content: string) => void;
  disabled?: boolean;
}

const SUPPORTED_EXTENSIONS = [
  ".js", ".ts", ".tsx", ".jsx", ".py", ".rb", ".go", ".rs", ".java", ".c", ".cpp", ".h",
  ".css", ".scss", ".html", ".xml", ".json", ".yaml", ".yml", ".toml", ".md", ".txt",
  ".sql", ".sh", ".bash", ".zsh", ".env", ".gitignore", ".dockerfile", ".vue", ".svelte",
  ".php", ".swift", ".kt", ".dart", ".r", ".lua", ".zig", ".csv", ".log", ".cfg", ".ini",
];

const MAX_SIZE = 512 * 1024; // 512KB

const FileUpload = ({ onFileRead, disabled }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = (file: File) => {
    if (file.size > MAX_SIZE) {
      toast.error(`File too large (max 512KB): ${file.name}`);
      return;
    }

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext) && !file.type.startsWith("text/")) {
      toast.error(`Unsupported file type: ${ext}`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileRead(file.name, content);
      toast.success(`Loaded: ${file.name}`);
    };
    reader.onerror = () => toast.error(`Failed to read: ${file.name}`);
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    Array.from(e.dataTransfer.files).forEach(processFile);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={SUPPORTED_EXTENSIONS.join(",")}
        className="hidden"
        onChange={(e) => {
          Array.from(e.target.files || []).forEach(processFile);
          e.target.value = "";
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`shrink-0 pb-0.5 transition-colors ${
          dragOver
            ? "text-accent"
            : "text-muted-foreground hover:text-accent disabled:opacity-30"
        }`}
        title="Upload file for analysis"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>
    </>
  );
};

export default FileUpload;
