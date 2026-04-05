-- ============================================
-- Claude Code — Database Schema
-- ============================================

-- Conversations table
-- Stores chat sessions with titles and timestamps
CREATE TABLE public.conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Chat messages table
-- Stores individual messages within conversations
CREATE TABLE public.chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,                    -- 'user' or 'assistant'
    content TEXT NOT NULL,                 -- Message text (markdown supported)
    file_name TEXT,                        -- Optional: attached file name
    file_content TEXT,                     -- Optional: attached file content
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

-- Relationships:
--   conversations (1) ──→ (N) chat_messages
--   Deleting a conversation cascades to delete all its messages
