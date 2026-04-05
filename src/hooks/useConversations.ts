import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Msg } from "@/lib/streamChat";

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  last_message_at: string;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all conversations
  const loadConversations = useCallback(async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .order("last_message_at", { ascending: false });
    if (data) setConversations(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(
        data.map((m) => ({
          role: m.role as Msg["role"],
          content: m.content,
          fileName: m.file_name || undefined,
          fileContent: m.file_content || undefined,
        }))
      );
    }
    setActiveId(conversationId);
  }, []);

  // Create new conversation
  const createConversation = useCallback(async (title?: string) => {
    const { data } = await supabase
      .from("conversations")
      .insert({ title: title || "New Conversation" })
      .select()
      .single();
    if (data) {
      setConversations((prev) => [data, ...prev]);
      setActiveId(data.id);
      setMessages([]);
      return data.id;
    }
    return null;
  }, []);

  // Save a message
  const saveMessage = useCallback(
    async (conversationId: string, msg: Msg) => {
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: msg.role,
        content: msg.content,
        file_name: (msg as any).fileName || null,
        file_content: (msg as any).fileContent || null,
      });
      // Update conversation timestamp and title
      const updates: any = { last_message_at: new Date().toISOString() };
      if (msg.role === "user") {
        // Auto-title from first user message
        const conv = conversations.find((c) => c.id === conversationId);
        if (conv?.title === "New Conversation") {
          updates.title = msg.content.slice(0, 80);
        }
      }
      await supabase
        .from("conversations")
        .update(updates)
        .eq("id", conversationId);
      loadConversations();
    },
    [conversations, loadConversations]
  );

  // Delete conversation
  const deleteConversation = useCallback(
    async (id: string) => {
      await supabase.from("conversations").delete().eq("id", id);
      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
      }
      loadConversations();
    },
    [activeId, loadConversations]
  );

  // Rename conversation
  const renameConversation = useCallback(
    async (id: string, title: string) => {
      await supabase.from("conversations").update({ title }).eq("id", id);
      loadConversations();
    },
    [loadConversations]
  );

  return {
    conversations,
    activeId,
    messages,
    setMessages,
    loading,
    loadMessages,
    createConversation,
    saveMessage,
    deleteConversation,
    renameConversation,
    setActiveId,
  };
}
