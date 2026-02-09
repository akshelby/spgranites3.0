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
