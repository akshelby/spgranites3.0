import { useState, useEffect, useRef } from "react";
import { Search, Send, Loader2, MessageCircle, Phone, X, Image, Video, Mic } from "lucide-react";
import { format } from "date-fns";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Message, Conversation } from "@/components/chat/types";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { cn } from "@/lib/utils";

export default function AdminChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .order('last_message_at', { ascending: false, nullsFirst: false });

        if (error) throw error;
        setConversations((data as Conversation[]) || []);
      } catch (err) {
        console.error('Error loading conversations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();

    // Subscribe to new conversations
    const channel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('ref_id', selectedConversation.ref_id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages((data as Message[]) || []);
      } catch (err) {
        console.error('Error loading messages:', err);
      }
    };

    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`admin-messages:${selectedConversation.ref_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ref_id=eq.${selectedConversation.ref_id}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          ref_id: selectedConversation.ref_id,
          sender_type: 'staff',
          sender_name: 'Support Team',
          content_text: newMessage.trim(),
        });

      if (error) throw error;
      setNewMessage("");
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;

    setIsSending(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedConversation.ref_id}/staff-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(fileName);

      const mediaType = file.type.startsWith('image/') 
        ? 'image' 
        : file.type.startsWith('video/') 
          ? 'video' 
          : 'audio';

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          ref_id: selectedConversation.ref_id,
          sender_type: 'staff',
          sender_name: 'Support Team',
          media_url: publicUrl,
          media_type: mediaType,
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error sending media:', err);
      toast({
        title: "Error",
        description: "Failed to send media.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
      e.target.value = "";
    }
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'closed' })
        .eq('id', selectedConversation.id);

      if (error) throw error;
      
      setSelectedConversation({ ...selectedConversation, status: 'closed' });
      toast({
        title: "Conversation Closed",
        description: "The conversation has been marked as closed.",
      });
    } catch (err) {
      console.error('Error closing conversation:', err);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.ref_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.customer_phone?.includes(searchQuery)
  );

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-120px)] bg-background rounded-2xl overflow-hidden border">
        {/* Sidebar */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by Ref ID or Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <MessageCircle className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                      selectedConversation?.id === conv.id && "bg-muted"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-sm text-[#E60000]">
                            {conv.ref_id}
                          </span>
                          <Badge
                            variant={conv.status === 'open' ? 'default' : 'secondary'}
                            className="text-[10px] h-5"
                          >
                            {conv.status}
                          </Badge>
                        </div>
                        {conv.customer_phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Phone className="w-3 h-3" />
                            {conv.customer_phone}
                          </div>
                        )}
                        {conv.last_message_preview && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {conv.last_message_preview}
                          </p>
                        )}
                      </div>
                      {conv.last_message_at && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {format(new Date(conv.last_message_at), "MMM d, h:mm a")}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between bg-white">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{selectedConversation.ref_id}</h2>
                    <Badge
                      variant={selectedConversation.status === 'open' ? 'default' : 'secondary'}
                    >
                      {selectedConversation.status}
                    </Badge>
                  </div>
                  {selectedConversation.customer_name && (
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.customer_name}
                    </p>
                  )}
                </div>
                {selectedConversation.status === 'open' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCloseConversation}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Close
                  </Button>
                )}
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No messages in this conversation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              {selectedConversation.status === 'open' && (
                <div className="p-4 border-t bg-white">
                  <div className="flex items-end gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*,audio/*"
                      className="hidden"
                      onChange={handleSendMedia}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSending}
                    >
                      <Image className="w-5 h-5" />
                    </Button>
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 min-h-[44px] max-h-[120px] resize-none rounded-2xl"
                      rows={1}
                      disabled={isSending}
                    />
                    <Button
                      size="icon"
                      className="h-10 w-10 rounded-full bg-[#001F3F] hover:bg-[#001F3F]/90"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                    >
                      {isSending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Select a Conversation</h3>
              <p className="text-muted-foreground max-w-sm">
                Choose a conversation from the sidebar to view messages and respond to customers.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
