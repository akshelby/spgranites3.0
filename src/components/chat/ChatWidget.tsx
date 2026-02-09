import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "./useChatStore";
import { ChatWindow } from "./ChatWindow";
import { cn } from "@/lib/utils";

export function ChatWidget() {
  const {
    isOpen,
    refId,
    conversationId,
    notificationsEnabled,
    toggleOpen,
    toggleNotifications,
    setSession,
    clearSession,
  } = useChatStore();

  return (
    <>
      {/* Chat Window */}
      <ChatWindow
        isOpen={isOpen}
        onClose={toggleOpen}
        refId={refId}
        conversationId={conversationId}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={toggleNotifications}
        onSetSession={setSession}
        onClearSession={clearSession}
      />
    </>
  );
}
