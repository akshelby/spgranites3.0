import { supabase } from "../../supabase";

export interface Conversation {
  id: string;
  ref_id: string;
  customer_phone?: string;
  customer_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  last_message_preview?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  ref_id?: string;
  sender_type: string;
  sender_name?: string;
  content_text?: string;
  media_url?: string;
  media_type?: string;
  created_at: string;
  is_read: boolean;
}

export interface IChatStorage {
  getConversation(id: string): Promise<Conversation | undefined>;
  getAllConversations(): Promise<Conversation[]>;
  createConversation(customerName?: string): Promise<Conversation>;
  deleteConversation(id: string): Promise<void>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(conversationId: string, senderType: string, content: string): Promise<Message>;
}

export const chatStorage: IChatStorage = {
  async getConversation(id: string) {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return undefined;
    return data as Conversation;
  },

  async getAllConversations() {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("last_message_at", { ascending: false });
    if (error || !data) return [];
    return data as Conversation[];
  },

  async createConversation(customerName?: string) {
    const ref_id = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const { data, error } = await supabase
      .from("conversations")
      .insert({ ref_id, customer_name: customerName, status: "open" })
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || "Failed to create conversation");
    return data as Conversation;
  },

  async deleteConversation(id: string) {
    await supabase.from("messages").delete().eq("conversation_id", id);
    await supabase.from("conversations").delete().eq("id", id);
  },

  async getMessagesByConversation(conversationId: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return data as Message[];
  },

  async createMessage(conversationId: string, senderType: string, content: string) {
    const ref_id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        ref_id,
        sender_type: senderType,
        content_text: content,
      })
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || "Failed to create message");
    return data as Message;
  },
};
