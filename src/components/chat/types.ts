export interface Message {
  id: string;
  conversation_id: string;
  ref_id: string;
  sender_type: 'staff' | 'customer';
  sender_name: string | null;
  content_text: string | null;
  media_url: string | null;
  media_type: 'image' | 'video' | 'audio' | null;
  created_at: string;
  is_read: boolean;
  _status?: 'sending' | 'sent' | 'failed';
  _tempId?: string;
}

export interface Conversation {
  id: string;
  ref_id: string;
  customer_phone: string | null;
  customer_name: string | null;
  customer_email: string | null;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  last_message_preview: string | null;
}

export interface ChatState {
  isOpen: boolean;
  refId: string | null;
  conversationId: string | null;
  notificationsEnabled: boolean;
}
