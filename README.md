# 🤖 Claude Code — AI Terminal Chat

A professional, terminal-styled AI chat application built with React, TypeScript, and  Cloud. Think Claude Code CLI — but in your browser.

![Version](https://img.shields.io/badge/version-1.0-orange)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🚀 What Is It?

Claude Code is a **web-based AI coding assistant** with a terminal-inspired UI. It lets you chat with powerful AI models (Gemini, GPT-5) directly from your browser — with file analysis, conversation history, and a professional developer experience.

---

## 👤 Who Is It For?

- **Developers** who want quick AI-powered code help
- **Students** learning to code with AI guidance
- **DevOps engineers** needing shell/infra assistance
- **Anyone** who prefers a clean, terminal-style chat UI

---

## ✨ Features

### 🧠 Multi-Model AI
- Switch between **6 AI models**: Gemini 3 Flash, Gemini 2.5 Pro, GPT-5, GPT-5 Mini, GPT-5.2
- Real-time **streaming responses** — see tokens as they arrive
- Model quality & speed indicators

### ⚙️ Customizable System Prompts
- **6 presets**: Default, Code Expert, Concise, Teacher, DevOps, Code Reviewer
- Write your own custom system prompt
- Token count estimation for prompts

### 📎 File Upload & Analysis
- Drag & drop code files for AI review
- Supports 40+ file extensions (`.js`, `.py`, `.ts`, `.go`, `.rs`, `.sql`, etc.)
- 512KB max file size per upload

### 💬 Persistent Conversations
- All chats saved to database automatically
- Searchable sidebar with conversation history
- Rename, delete, and switch between conversations
- Auto-titles from first message

### 📊 Real-Time Stats
- Token usage tracking per session
- Message count (sent/received)
- Elapsed time during generation
- Per-model usage display

### ⌨ Slash Commands
| Command | Description |
|---------|-------------|
| `/help` | Show all commands & shortcuts |
| `/clear` | Clear conversation |
| `/new` | Start new conversation |
| `/model` | Show current model info |
| `/cost` | Show token usage estimate |
| `/stats` | Detailed session statistics |
| `/compact` | Compress context window |
| `/export` | Export chat as markdown |
| `/system` | Open system prompt editor |
| `/shortcuts` | Show keyboard shortcuts |
| `/reset` | Reset all settings |

### ⌨ Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift+Enter` | New line |
| `Esc` | Clear input / Cancel |
| `Ctrl+N` | New conversation |
| `Ctrl+L` | Clear screen |
| `Ctrl+C` | Cancel generation |
| `Ctrl+,` | System prompt editor |
| `Ctrl+K` | Toggle sidebar |
| `Ctrl+?` | Shortcuts modal |

### 🎨 UI/UX
- Dark terminal aesthetic with amber accent
- JetBrains Mono font for code feel
- Markdown rendering with syntax-highlighted code blocks
- Copy-to-clipboard on any message or code block
- Responsive design (mobile + desktop)
- Animated typing indicator

---

## 🏗 Architecture

```
src/
├── components/
│   ├── TerminalChat.tsx        # Main chat orchestrator
│   ├── ChatMessage.tsx         # Individual message bubble
│   ├── ChatSidebar.tsx         # Conversation history sidebar
│   ├── FileUpload.tsx          # File drag & drop handler
│   ├── MarkdownRenderer.tsx    # Markdown + syntax highlighting
│   ├── ModelSelector.tsx       # AI model switcher dropdown
│   ├── SystemPromptEditor.tsx  # System prompt modal
│   ├── KeyboardShortcutsModal.tsx  # Shortcuts reference
│   └── StatsBar.tsx            # Real-time token/message stats
├── hooks/
│   └── useConversations.ts     # Database CRUD for conversations
├── lib/
│   └── streamChat.ts           # SSE streaming client
├── pages/
│   └── Index.tsx               # App entry page
└── integrations/
    └── supabase/               # Auto-generated DB client & types

supabase/
└── functions/
    └── chat/
        └── index.ts            # Edge function →  AI Gateway
```

---

## 🗄 Database Schema

### `conversations` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique conversation ID |
| `title` | TEXT | Conversation title (auto-generated) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `last_message_at` | TIMESTAMPTZ | Last activity timestamp |

### `chat_messages` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique message ID |
| `conversation_id` | UUID (FK) | Links to conversation |
| `role` | TEXT | `user` or `assistant` |
| `content` | TEXT | Message text content |
| `file_name` | TEXT (nullable) | Attached file name |
| `file_content` | TEXT (nullable) | Attached file content |
| `created_at` | TIMESTAMPTZ | Message timestamp |

### Relationships
```
conversations (1) ──→ (N) chat_messages
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript 5, Vite 5 |
| Styling | Tailwind CSS v3, custom design tokens |
| Markdown | react-markdown, remark-gfm, rehype-highlight |
| Backend |  Cloud (Supabase Edge Functions) |
| Database | PostgreSQL (via  Cloud) |
| AI Models |  AI Gateway (Gemini, GPT-5) |
| Fonts | JetBrains Mono, Inter |

---

## 📜 License

MIT License

---

