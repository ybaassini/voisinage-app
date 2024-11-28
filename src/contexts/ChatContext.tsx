import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { chatService } from '../services/chatService';
import { Conversation, Message } from '../types/chat';

interface ChatContextType {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refreshConversations: () => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = async () => {
    if (!user?.uid) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userConversations = await chatService.getUserConversations(user.uid);
      setConversations(userConversations);
    } catch (err) {
      console.error('Erreur lors du chargement des conversations:', err);
      setError('Impossible de charger les conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user?.uid]);

  const refreshConversations = async () => {
    await loadConversations();
  };

  const sendMessage = async (conversationId: string, text: string) => {
    if (!user?.uid) return;

    try {
      await chatService.sendMessage({
        conversationId,
        senderId: user.uid,
        text,
        read: false
      });
      await refreshConversations();
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      throw err;
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!user?.uid) return;

    try {
      await chatService.markMessagesAsRead(conversationId, user.uid);
      await refreshConversations();
    } catch (err) {
      console.error('Erreur lors du marquage des messages comme lus:', err);
      throw err;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        loading,
        error,
        refreshConversations,
        sendMessage,
        markAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext doit être utilisé à l\'intérieur d\'un ChatProvider');
  }
  return context;
};
