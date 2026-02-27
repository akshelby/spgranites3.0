import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Send, Loader2, MessageCircle, X,
  Mail, Clock, Users, CheckCircle, AlertCircle, ArrowLeft,
  Paperclip, RefreshCw, User,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Message, Conversation } from "@/components/chat/types";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { DateDivider } from "@/components/chat/DateDivider";
import { cn } from "@/lib/utils";

interface ConversationStats {
  total: number;
  open: number;
  closed: number;
}

export default function AdminChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");
  const [stats, setStats] = useState<ConversationStats>({ total: 0, open: 0, closed: 0 });
  const [showMobileChat, setShowMobileChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const loadConversations = useCallback(async () => {
    try {
      const data = await api.get('/api/conversations');
      const convs = (Array.isArray(data) ? data : []) as Conversation[];
      setConversations(convs);
      setStats({
        total: convs.length,
        open: convs.filter(c => c.status === 'open').length,
        closed: convs.filter(c => c.status === 'closed').length,
      });
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 3000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const fetchMessages = useCallback(async () => {
    if (!selectedConversation) return;
    try {
      const data = await api.get(`/api/conversations/${selectedConversation.id}/messages`);
      setMessages(prev => {
        const confirmed = (Array.isArray(data) ? data : []) as Message[];
        const pending = prev.filter(m => m._tempId && m._status === 'sending');
        const merged = [...confirmed];
        pending.forEach(p => {
          if (!merged.some(m => m.content_text === p.content_text && m.sender_type === p.sender_type)) {
            merged.push(p);
          }
        });
        return merged;
      });
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (!selectedConversation) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedConversation, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;
    const text = newMessage.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;

    const optimisticMsg: Message = {
      id: tempId, conversation_id: selectedConversation.id, ref_id: selectedConversation.ref_id,
      sender_type: 'staff', sender_name: 'Support Team', content_text: text,
      media_url: null, media_type: null, created_at: new Date().toISOString(),
      is_read: false, _status: 'sending', _tempId: tempId,
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage("");

    setIsSending(true);
    try {
      const msg = await api.post('/api/messages', {
        conversation_id: selectedConversation.id,
        ref_id: selectedConversation.ref_id,
        sender_type: 'staff',
        sender_name: 'Support Team',
        content_text: text,
      });
      setMessages(prev => prev.map(m => m._tempId === tempId ? { ...msg as Message, _status: 'sent' as const } : m));
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => prev.map(m => m._tempId === tempId ? { ...m, _status: 'failed' as const } : m));
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;
    setIsSending(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const mediaType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'audio';
        try {
          await api.post('/api/messages', {
            conversation_id: selectedConversation.id,
            ref_id: selectedConversation.ref_id,
            sender_type: 'staff',
            sender_name: 'Support Team',
            media_url: dataUrl,
            media_type: mediaType,
          });
          fetchMessages();
        } catch (err) {
          console.error('Error sending media:', err);
          toast({ title: "Error", description: "Failed to send media.", variant: "destructive" });
        }
        setIsSending(false);
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error sending media:', err);
      toast({ title: "Error", description: "Failed to send media.", variant: "destructive" });
      setIsSending(false);
      e.target.value = "";
    }
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation) return;
    try {
      await api.put(`/api/admin/conversations/${selectedConversation.id}`, { status: 'closed' });
      setSelectedConversation({ ...selectedConversation, status: 'closed' });
      toast({ title: "Conversation Closed", description: "The conversation has been marked as closed." });
    } catch (err) {
      console.error('Error closing conversation:', err);
      toast({ title: "Error", description: "Failed to close conversation.", variant: "destructive" });
    }
  };

  const handleReopenConversation = async () => {
    if (!selectedConversation) return;
    try {
      await api.put(`/api/admin/conversations/${selectedConversation.id}`, { status: 'open' });
      setSelectedConversation({ ...selectedConversation, status: 'open' });
      toast({ title: "Conversation Reopened", description: "The conversation is now open." });
    } catch (err) {
      console.error('Error reopening conversation:', err);
      toast({ title: "Error", description: "Failed to reopen conversation.", variant: "destructive" });
    }
  };

  const selectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setShowMobileChat(true);
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch =
      conv.ref_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.customer_phone?.includes(searchQuery) ||
      conv.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const chatBgPattern = 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'p\' width=\'40\' height=\'40\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M20 2a2 2 0 110 4 2 2 0 010-4zM6 18a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM34 28a1 1 0 110 2 1 1 0 010-2z\' fill=\'%23ffffff\' fill-opacity=\'0.03\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'200\' height=\'200\' fill=\'url(%23p)\'/%3E%3C/svg%3E")';

  return (
    <AdminLayout>
      <div className="space-y-3 sm:space-y-4 overflow-x-hidden">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-card rounded-xl border p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold leading-tight">{stats.total}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Total</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-orange-600 leading-tight">{stats.open}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Open</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-green-600 leading-tight">{stats.closed}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Resolved</p>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100dvh-220px)] sm:h-[calc(100vh-240px)] bg-card rounded-2xl overflow-hidden border">
          <div className={cn(
            "w-full md:w-96 border-r flex flex-col bg-card",
            showMobileChat && "hidden md:flex"
          )}>
            <div className="p-3 border-b space-y-2.5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl h-9 text-sm"
                />
              </div>
              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <TabsList className="w-full h-8">
                  <TabsTrigger value="all" className="flex-1 text-xs h-7">All ({stats.total})</TabsTrigger>
                  <TabsTrigger value="open" className="flex-1 text-xs h-7">Open ({stats.open})</TabsTrigger>
                  <TabsTrigger value="closed" className="flex-1 text-xs h-7">Closed ({stats.closed})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <MessageCircle className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No conversations found</p>
                </div>
              ) : (
                <div>
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={cn(
                        "w-full p-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50",
                        selectedConversation?.id === conv.id && "bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-semibold text-sm",
                          conv.status === 'open' ? "bg-orange-500" : "bg-green-500"
                        )}>
                          {conv.customer_name ? conv.customer_name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-foreground truncate">
                              {conv.customer_name || conv.customer_email || conv.ref_id}
                            </span>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                              {conv.last_message_at
                                ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })
                                : "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-primary/70">{conv.ref_id}</span>
                            <Badge
                              variant={conv.status === 'open' ? 'default' : 'secondary'}
                              className={cn(
                                "text-[10px] h-4 px-1.5",
                                conv.status === 'open'
                                  ? "bg-orange-100 text-orange-700 hover:bg-orange-100"
                                  : "bg-green-100 text-green-700 hover:bg-green-100"
                              )}
                            >
                              {conv.status === 'open' ? 'Open' : 'Closed'}
                            </Badge>
                          </div>
                          {conv.last_message_preview && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {conv.last_message_preview}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className={cn(
            "flex-1 flex flex-col min-w-0",
            !showMobileChat && "hidden md:flex"
          )}>
            {selectedConversation ? (
              <>
                <div className="p-2.5 sm:p-3 border-b flex items-center justify-between gap-2 bg-card shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <Button
                      size="icon" variant="ghost" className="md:hidden h-8 w-8 shrink-0"
                      onClick={() => setShowMobileChat(false)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className={cn(
                      "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0",
                      selectedConversation.status === 'open' ? "bg-orange-500" : "bg-green-500"
                    )}>
                      {selectedConversation.customer_name
                        ? selectedConversation.customer_name.charAt(0).toUpperCase()
                        : <User className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="font-bold text-sm truncate max-w-[150px] sm:max-w-none">
                          {selectedConversation.customer_name || selectedConversation.customer_email || selectedConversation.ref_id}
                        </h2>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] h-4 px-1.5 shrink-0",
                            selectedConversation.status === 'open'
                              ? "border-orange-300 text-orange-600"
                              : "border-green-300 text-green-600"
                          )}
                        >
                          {selectedConversation.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground mt-0.5 overflow-hidden">
                        <span className="font-mono shrink-0">{selectedConversation.ref_id}</span>
                        <span className="hidden sm:flex items-center gap-0.5 shrink-0">
                          <Clock className="w-3 h-3" />
                          {format(new Date(selectedConversation.created_at), "dd MMM, h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {selectedConversation.status === 'open' ? (
                      <Button
                        variant="outline" size="sm"
                        onClick={handleCloseConversation}
                        className="text-destructive hover:text-destructive text-xs h-8 px-2 sm:px-3"
                      >
                        <X className="w-3.5 h-3.5 sm:mr-1" />
                        <span className="hidden sm:inline">Close</span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline" size="sm"
                        onClick={handleReopenConversation}
                        className="text-green-600 hover:text-green-600 text-xs h-8 px-2 sm:px-3"
                      >
                        <RefreshCw className="w-3.5 h-3.5 sm:mr-1" />
                        <span className="hidden sm:inline">Reopen</span>
                      </Button>
                    )}
                  </div>
                </div>

                <ScrollArea
                  className="flex-1 bg-[#0B141A]"
                  ref={scrollRef}
                  style={{ backgroundImage: chatBgPattern }}
                >
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-16">
                      <MessageCircle className="w-12 h-12 text-white/20 mb-3" />
                      <p className="text-white/40 text-sm">No messages yet</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {messages.map((message, index) => {
                        const currentDate = new Date(message.created_at);
                        const prevDate = index > 0 ? new Date(messages[index - 1].created_at) : null;
                        const showDivider = !prevDate || currentDate.toDateString() !== prevDate.toDateString();
                        return (
                          <div key={message.id}>
                            {showDivider && <DateDivider date={currentDate} />}
                            <MessageBubble message={message} isAdminView />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>

                <div className="p-2 sm:p-3 border-t bg-card shrink-0">
                  {selectedConversation.status === 'closed' ? (
                    <div className="text-center py-1.5">
                      <p className="text-xs sm:text-sm text-muted-foreground">This conversation is closed.</p>
                      <Button
                        variant="link" size="sm"
                        onClick={handleReopenConversation}
                        className="text-primary text-xs"
                      >
                        Reopen to reply
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-end gap-1.5 sm:gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*,audio/*"
                        className="hidden"
                        onChange={handleSendMedia}
                      />
                      <Button
                        size="icon" variant="ghost"
                        className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSending}
                      >
                        <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                      <Textarea
                        ref={textareaRef}
                        placeholder="Type a reply..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="min-h-[38px] max-h-[120px] rounded-xl resize-none text-sm"
                        rows={1}
                      />
                      <Button
                        size="icon"
                        className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl bg-[#00A884] hover:bg-[#00A884]/90"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                      >
                        {isSending ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <MessageCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="font-semibold text-lg text-muted-foreground">Select a Conversation</h3>
                <p className="text-sm text-muted-foreground mt-1">Choose a conversation from the list</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
