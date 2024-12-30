import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { chatService } from '../services/chatService';
import { Conversation, Message } from '../types/chat';

interface ChatContextType {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  loadConversations: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuthContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = async () => {
    console.log('🔄 ChatContext: Démarrage du chargement des conversations');
    
    if (!user?.uid) {
      console.log('❌ ChatContext: Pas d\'utilisateur connecté, réinitialisation des conversations');
      setConversations([]);
      return;
    }

    try {
      console.log('⏳ ChatContext: Début du chargement pour userId:', user.uid);
      setLoading(true);
      setError(null);
      
      const userConversations = await chatService.getUserConversations(user.uid, userProfile.displayName, userProfile.avatar);
      console.log(`✅ ChatContext: ${userConversations.length} conversations chargées`);
      
      setConversations(userConversations);
    } catch (err) {
      console.error('❌ ChatContext: Erreur lors du chargement des conversations:', err);
      setError('Impossible de charger les conversations');
    } finally {
      setLoading(false);
      console.log('🏁 ChatContext: Fin du processus de chargement');
    }
  };

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
        loadConversations,
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
