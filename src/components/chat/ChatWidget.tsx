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
      {/* Floating Button */}
      <Button
        onClick={toggleOpen}
        className={cn(
          "fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300",
          isOpen
            ? "bg-[#1A1A1A] hover:bg-[#333] scale-0 opacity-0"
            : "bg-[#E60000] hover:bg-[#cc0000] scale-100 opacity-100"
        )}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

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
