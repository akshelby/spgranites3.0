import { useEffect } from "react";
import { useChat } from "./ChatContext";
import { ChatWindow } from "./ChatWindow";

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
  } = useChat();

  useEffect(() => {
    const handler = () => {
      if (!isOpen) toggleOpen();
    };
    window.addEventListener('open-chat-widget', handler);
    return () => window.removeEventListener('open-chat-widget', handler);
  }, [isOpen, toggleOpen]);

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
