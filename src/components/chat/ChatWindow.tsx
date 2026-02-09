import { useState, useEffect, useRef, useCallback } from "react";
import { X, Bell, BellOff, Copy, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Message, Conversation } from "./types";
import { MessageBubble } from "./MessageBubble";
import { DateDivider } from "./DateDivider";
import { ChatInput } from "./ChatInput";
import { ChatLoadingSpinner } from "./ChatLoadingSpinner";
import { ChatEmptyState } from "./ChatEmptyState";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  refId: string | null;
  conversationId: string | null;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  onSetSession: (refId: string, conversationId: string) => void;
  onClearSession: () => void;
}

// Generate a unique reference ID
function generateRefId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SPG-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function ChatWindow({
  isOpen,
  onClose,
  refId,
  conversationId,
  notificationsEnabled,
  onToggleNotifications,
  onSetSession,
  onClearSession,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(!refId);
  const [existingRefId, setExistingRefId] = useState("");
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    notificationSoundRef.current = new Audio('/notification.mp3');
    notificationSoundRef.current.volume = 0.5;
  }, []);

  // Load messages when we have a refId
  useEffect(() => {
    if (!refId) return;

    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('ref_id', refId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages((data as Message[]) || []);
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [refId]);

  // Real-time subscription
  useEffect(() => {
    if (!refId) return;

    const channel = supabase
      .channel(`messages:${refId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ref_id=eq.${refId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => {
            // If this message matches an optimistic one, replace it (mark as sent)
            const optimisticIndex = prev.findIndex(
              m => m._tempId && m.content_text === newMessage.content_text && m.sender_type === 'customer'
            );
            if (optimisticIndex !== -1) {
              const updated = [...prev];
              updated[optimisticIndex] = { ...newMessage, _status: 'sent' as const };
              return updated;
            }
            // Deduplicate by id
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });

          // Play notification sound for staff messages
          if (newMessage.sender_type === 'staff' && notificationsEnabled) {
            notificationSoundRef.current?.play().catch(() => {});
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refId, notificationsEnabled]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const startNewConversation = async () => {
    const newRefId = generateRefId();
    
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ ref_id: newRefId })
        .select()
        .single();

      if (error) throw error;
      
      onSetSession(newRefId, data.id);
      setShowStartScreen(false);
    } catch (err) {
      console.error('Error creating conversation:', err);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resumeConversation = async () => {
    if (!existingRefId.trim()) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select()
        .eq('ref_id', existingRefId.trim().toUpperCase())
        .single();

      if (error || !data) {
        toast({
          title: "Not Found",
          description: "No conversation found with this Reference ID.",
          variant: "destructive",
        });
        return;
      }

      onSetSession(data.ref_id, data.id);
      setShowStartScreen(false);
    } catch (err) {
      console.error('Error resuming conversation:', err);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!refId || !conversationId) return;

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: conversationId,
      ref_id: refId,
      sender_type: 'customer',
      sender_name: null,
      content_text: text,
      media_url: null,
      media_type: null,
      created_at: new Date().toISOString(),
      is_read: false,
      _status: 'sending',
      _tempId: tempId,
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          ref_id: refId,
          sender_type: 'customer',
          content_text: text,
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with confirmed one
      setMessages(prev =>
        prev.map(m => m._tempId === tempId ? { ...data as Message, _status: 'sent' as const } : m)
      );
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev =>
        prev.map(m => m._tempId === tempId ? { ...m, _status: 'failed' as const } : m)
      );
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendMedia = async (file: File, type: 'image' | 'video' | 'audio') => {
    if (!refId || !conversationId) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${refId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(fileName);

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          ref_id: refId,
          sender_type: 'customer',
          media_url: publicUrl,
          media_type: type,
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error sending media:', err);
      toast({
        title: "Error",
        description: "Failed to send media. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyRefId = () => {
    if (refId) {
      navigator.clipboard.writeText(refId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBack = () => {
    onClearSession();
    setShowStartScreen(true);
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-full h-full md:w-[380px] md:h-[600px] md:max-h-[calc(100vh-100px)] flex flex-col bg-white rounded-none md:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="bg-[#001F3F] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!showStartScreen && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
              onClick={handleBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h2 className="font-semibold">S P Granites Support</h2>
            {refId && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-white/70">Ref: {refId}</span>
                <button
                  onClick={copyRefId}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {copied ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
            onClick={onToggleNotifications}
          >
            {notificationsEnabled ? (
              <Bell className="w-5 h-5" />
            ) : (
              <BellOff className="w-5 h-5" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {showStartScreen ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-[#1A1A1A]">Welcome to S P Granites</h3>
            <p className="text-sm text-muted-foreground">
              Start a new conversation or resume an existing one
            </p>
          </div>

          <Button
            className="w-full bg-[#E60000] hover:bg-[#cc0000] text-white rounded-2xl h-12"
            onClick={startNewConversation}
          >
            Start New Complaint
          </Button>

          <div className="w-full space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or resume</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Enter Reference ID (e.g., SPG-XXXXX)"
                value={existingRefId}
                onChange={(e) => setExistingRefId(e.target.value.toUpperCase())}
                className="rounded-xl"
              />
              <Button
                variant="outline"
                className="rounded-xl px-6"
                onClick={resumeConversation}
                disabled={!existingRefId.trim()}
              >
                Resume
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 bg-[#0B141A]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'p\' width=\'40\' height=\'40\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M20 2a2 2 0 110 4 2 2 0 010-4zM6 18a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM34 28a1 1 0 110 2 1 1 0 010-2z\' fill=\'%23ffffff\' fill-opacity=\'0.03\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'200\' height=\'200\' fill=\'url(%23p)\'/%3E%3C/svg%3E")' }}>
            {isLoading ? (
              <ChatLoadingSpinner />
            ) : messages.length === 0 ? (
              <ChatEmptyState refId={refId!} />
            ) : (
              <div className="py-2">
                {messages.map((message, index) => {
                  const currentDate = new Date(message.created_at);
                  const prevDate = index > 0 ? new Date(messages[index - 1].created_at) : null;
                  const showDivider = !prevDate || currentDate.toDateString() !== prevDate.toDateString();

                  return (
                    <div key={message.id}>
                      {showDivider && <DateDivider date={currentDate} />}
                      <MessageBubble message={message} />
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          <ChatInput
            onSendMessage={handleSendMessage}
            onSendMedia={handleSendMedia}
            disabled={isLoading}
          />
        </>
      )}
    </div>
  );
}
