import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, BellOff, Copy, Check, MessageSquare, Clock, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/components/chat/types";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { DateDivider } from "@/components/chat/DateDivider";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatLoadingSpinner } from "@/components/chat/ChatLoadingSpinner";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { format } from "date-fns";

const STORAGE_KEY = 'spg_chat_state';
const HISTORY_KEY = 'spg_chat_history';

interface ChatHistoryEntry {
  refId: string;
  conversationId: string;
  lastMessage: string;
  lastMessageAt: string;
  status: string;
}

function generateRefId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SPG-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getSavedSession() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { refId: parsed.refId || null, conversationId: parsed.conversationId || null, notificationsEnabled: parsed.notificationsEnabled ?? true };
    }
  } catch {}
  return { refId: null, conversationId: null, notificationsEnabled: true };
}

function saveSession(data: { refId: string | null; conversationId: string | null; notificationsEnabled: boolean }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getHistory(): ChatHistoryEntry[] {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

function saveHistory(history: ChatHistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function addToHistory(entry: ChatHistoryEntry) {
  const history = getHistory();
  const idx = history.findIndex(h => h.refId === entry.refId);
  if (idx !== -1) {
    history[idx] = entry;
  } else {
    history.unshift(entry);
  }
  saveHistory(history.slice(0, 50)); // keep max 50
}

function removeFromHistory(refId: string) {
  const history = getHistory().filter(h => h.refId !== refId);
  saveHistory(history);
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const saved = getSavedSession();

  const [refId, setRefId] = useState<string | null>(saved.refId);
  const [conversationId, setConversationId] = useState<string | null>(saved.conversationId);
  const [notificationsEnabled, setNotificationsEnabled] = useState(saved.notificationsEnabled);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(!saved.refId);
  const [existingRefId, setExistingRefId] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<ChatHistoryEntry[]>(getHistory());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    notificationSoundRef.current = new Audio('/notification.mp3');
    notificationSoundRef.current.volume = 0.5;
  }, []);

  useEffect(() => {
    if (!refId) return;
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages').select('*').eq('ref_id', refId).order('created_at', { ascending: true });
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

  // Update history when messages change
  useEffect(() => {
    if (!refId || !conversationId || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    addToHistory({
      refId,
      conversationId,
      lastMessage: lastMsg.content_text || (lastMsg.media_type ? `📎 ${lastMsg.media_type}` : ''),
      lastMessageAt: lastMsg.created_at,
      status: 'open',
    });
    setHistory(getHistory());
  }, [messages, refId, conversationId]);

  useEffect(() => {
    if (!refId) return;
    const channel = supabase
      .channel(`messages:${refId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages', filter: `ref_id=eq.${refId}`,
      }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages(prev => {
          const optimisticIndex = prev.findIndex(
            m => m._tempId && m.content_text === newMessage.content_text && m.sender_type === 'customer'
          );
          if (optimisticIndex !== -1) {
            const updated = [...prev];
            updated[optimisticIndex] = { ...newMessage, _status: 'sent' as const };
            return updated;
          }
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        if (newMessage.sender_type === 'staff' && notificationsEnabled) {
          notificationSoundRef.current?.play().catch(() => {});
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refId, notificationsEnabled]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const setSession = (newRefId: string, newConvId: string) => {
    setRefId(newRefId);
    setConversationId(newConvId);
    saveSession({ refId: newRefId, conversationId: newConvId, notificationsEnabled });
  };

  const clearSession = () => {
    setRefId(null);
    setConversationId(null);
    saveSession({ refId: null, conversationId: null, notificationsEnabled });
  };

  const toggleNotifications = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    saveSession({ refId, conversationId, notificationsEnabled: next });
  };

  const startNewConversation = async () => {
    const newRefId = generateRefId();
    try {
      const { data, error } = await supabase
        .from('conversations').insert({ ref_id: newRefId }).select().single();
      if (error) throw error;
      setSession(newRefId, data.id);
      setShowStartScreen(false);
    } catch {
      toast({ title: "Error", description: "Failed to start conversation.", variant: "destructive" });
    }
  };

  const resumeFromHistory = (entry: ChatHistoryEntry) => {
    setSession(entry.refId, entry.conversationId);
    setShowStartScreen(false);
  };

  const deleteFromHistory = (e: React.MouseEvent, entryRefId: string) => {
    e.stopPropagation();
    removeFromHistory(entryRefId);
    setHistory(getHistory());
  };

  const resumeConversation = async () => {
    if (!existingRefId.trim()) return;
    try {
      const { data, error } = await supabase
        .from('conversations').select().eq('ref_id', existingRefId.trim().toUpperCase()).single();
      if (error || !data) {
        toast({ title: "Not Found", description: "No conversation found with this Reference ID.", variant: "destructive" });
        return;
      }
      setSession(data.ref_id, data.id);
      setShowStartScreen(false);
    } catch {
      console.error('Error resuming conversation');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!refId || !conversationId) return;
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage: Message = {
      id: tempId, conversation_id: conversationId, ref_id: refId,
      sender_type: 'customer', sender_name: null, content_text: text,
      media_url: null, media_type: null, created_at: new Date().toISOString(),
      is_read: false, _status: 'sending', _tempId: tempId,
    };
    setMessages(prev => [...prev, optimisticMessage]);
    try {
      const { data, error } = await supabase
        .from('messages').insert({ conversation_id: conversationId, ref_id: refId, sender_type: 'customer', content_text: text })
        .select().single();
      if (error) throw error;
      setMessages(prev => prev.map(m => m._tempId === tempId ? { ...data as Message, _status: 'sent' as const } : m));
    } catch {
      setMessages(prev => prev.map(m => m._tempId === tempId ? { ...m, _status: 'failed' as const } : m));
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    }
  };

  const handleSendMedia = async (file: File, type: 'image' | 'video' | 'audio') => {
    if (!refId || !conversationId) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${refId}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('chat-media').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('chat-media').getPublicUrl(fileName);
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId, ref_id: refId, sender_type: 'customer', media_url: publicUrl, media_type: type,
      });
      if (error) throw error;
    } catch {
      toast({ title: "Error", description: "Failed to send media.", variant: "destructive" });
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
    if (!showStartScreen) {
      clearSession();
      setShowStartScreen(true);
      setMessages([]);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="h-dvh flex flex-col bg-background">
      {/* Header */}
      <div className="bg-[#001F3F] text-white p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button
            size="icon" variant="ghost"
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
            onClick={handleBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-semibold">S P Granites Support</h2>
            {refId && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-white/70">Ref: {refId}</span>
                <button onClick={copyRefId} className="text-white/70 hover:text-white transition-colors">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            )}
          </div>
        </div>
        <Button
          size="icon" variant="ghost"
          className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
          onClick={toggleNotifications}
        >
          {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </Button>
      </div>

      {/* Content */}
      {showStartScreen ? (
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6 max-w-lg mx-auto">
            {/* Welcome */}
            <div className="text-center space-y-2 pt-4">
              <h3 className="text-xl font-semibold text-foreground">Welcome to S P Granites</h3>
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

            {/* Previous Conversations */}
            {history.length > 0 && (
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Previous Conversations</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {history.map((entry) => (
                    <button
                      key={entry.refId}
                      onClick={() => resumeFromHistory(entry)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm text-foreground">{entry.refId}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {(() => {
                              try { return format(new Date(entry.lastMessageAt), 'dd MMM, hh:mm a'); } catch { return ''; }
                            })()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {entry.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => deleteFromHistory(e, entry.refId)}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Resume */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or enter Reference ID</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Reference ID (e.g., SPG-XXXXX)"
                  value={existingRefId}
                  onChange={(e) => setExistingRefId(e.target.value.toUpperCase())}
                  className="rounded-xl"
                />
                <Button variant="outline" className="rounded-xl px-6" onClick={resumeConversation} disabled={!existingRefId.trim()}>
                  Resume
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
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
          <ChatInput onSendMessage={handleSendMessage} onSendMedia={handleSendMedia} disabled={isLoading} />
        </>
      )}
    </div>
  );
}
