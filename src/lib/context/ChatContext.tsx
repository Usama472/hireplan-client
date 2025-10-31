import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

interface ChatContextType {
  refreshConversations: () => void;
  conversationUpdated: (conversationId: string) => void;
  refreshTrigger: number;
}

const ChatContext = createContext<ChatContextType>({
  refreshConversations: () => {},
  conversationUpdated: () => {},
  refreshTrigger: 0,
});

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const refreshConversations = useCallback(() => {
    // Debounce rapid refresh calls to prevent flicker
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = setTimeout(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 100);
  }, []);

  const conversationUpdated = useCallback((conversationId: string) => {
    // Trigger a silent refresh of conversation lists with debounce
    refreshConversations();
  }, [refreshConversations]);

  // Listen for cross-tab/window communication
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chat_conversation_updated') {
        refreshConversations();
        // Clean up the storage item
        localStorage.removeItem('chat_conversation_updated');
      }
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'REFRESH_CONVERSATIONS') {
        refreshConversations();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('message', handleMessage);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [refreshConversations]);

  return (
    <ChatContext.Provider value={{
      refreshConversations,
      conversationUpdated,
      refreshTrigger
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
