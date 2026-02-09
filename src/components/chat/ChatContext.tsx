import { createContext, useContext, ReactNode } from 'react';
import { useChatStore } from './useChatStore';

type ChatStoreReturn = ReturnType<typeof useChatStore>;

const ChatContext = createContext<ChatStoreReturn | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const store = useChatStore();
  return <ChatContext.Provider value={store}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatStoreReturn {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
