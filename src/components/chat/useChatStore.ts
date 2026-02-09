import { useState, useCallback } from 'react';
import { ChatState } from './types';

const STORAGE_KEY = 'spg_chat_state';

export function useChatStore() {
  const [state, setState] = useState<ChatState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          isOpen: false,
          refId: null,
          conversationId: null,
          notificationsEnabled: true,
        };
      }
    }
    return {
      isOpen: false,
      refId: null,
      conversationId: null,
      notificationsEnabled: true,
    };
  });

  const updateState = useCallback((updates: Partial<ChatState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const toggleOpen = useCallback(() => {
    updateState({ isOpen: !state.isOpen });
  }, [state.isOpen, updateState]);

  const toggleNotifications = useCallback(() => {
    updateState({ notificationsEnabled: !state.notificationsEnabled });
  }, [state.notificationsEnabled, updateState]);

  const setSession = useCallback((refId: string, conversationId: string) => {
    updateState({ refId, conversationId });
  }, [updateState]);

  const clearSession = useCallback(() => {
    updateState({ refId: null, conversationId: null });
  }, [updateState]);

  return {
    ...state,
    toggleOpen,
    toggleNotifications,
    setSession,
    clearSession,
  };
}
