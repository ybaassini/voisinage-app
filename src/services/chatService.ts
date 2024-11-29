import { ref, push, set, onValue, update, get, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../config/firebase';
import { Message, Conversation, CreateMessageData, CreateConversationData } from '../types/chat';

const CONVERSATIONS_REF = 'conversations';
const MESSAGES_REF = 'messages';
const USER_CONVERSATIONS_REF = 'user_conversations';

// Type pour les données étendues du message
interface ExtendedMessageData extends CreateMessageData {
  recipientId: string;
  recipientName?: string;
  recipientAvatar?: string;
  postId?: string;
}

export const chatService = {
  // Vérifier si une conversation existe
  async checkConversationExists(conversationId: string): Promise<boolean> {
    try {
      console.log('🔍 Vérification de l\'existence de la conversation:', conversationId);
      const conversationRef = ref(database, `${CONVERSATIONS_REF}/${conversationId}`);
      const snapshot = await get(conversationRef);
      const exists = snapshot.exists();
      console.log(exists ? '✅ Conversation trouvée' : '❌ Conversation non trouvée');
      return exists;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de la conversation:', error);
      return false;
    }
  },

  // Créer une nouvelle conversation
  async createConversation(data: CreateConversationData): Promise<Conversation> {
    console.log('📝 Création d\'une nouvelle conversation');
    try {
      const conversationRef = ref(database, CONVERSATIONS_REF);
      const newConversationRef = push(conversationRef);
      const conversationId = newConversationRef.key;

      if (!conversationId) {
        console.error('❌ Échec de la génération de l\'ID de conversation');
        throw new Error('Failed to generate conversation ID');
      }
      console.log('🔑 ID de conversation généré:', conversationId);

      const now = Date.now();
      const conversationData = {
        id: conversationId,
        participants: data.participants,
        participantIds: data.participants.map(p => p.id),
        createdAt: now,
        updatedAt: now,
        lastMessage: null,
        postId: data.postId || null,
        unreadCounts: data.participants.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {}),
      };

      // Créer la conversation
      console.log('💾 Enregistrement de la conversation...');
      await set(newConversationRef, conversationData);
      console.log('✅ Conversation créée avec succès');

      // Ajouter les références aux conversations des utilisateurs
      console.log('🔗 Ajout des références utilisateurs...');
      for (const participant of data.participants) {
        await set(ref(database, `${USER_CONVERSATIONS_REF}/${participant.id}/${conversationId}`), true);
      }
      console.log('✅ Références utilisateurs ajoutées');

      return {
        ...conversationData,
        createdAt: new Date(conversationData.createdAt),
        updatedAt: new Date(conversationData.updatedAt),
      } as Conversation;
    } catch (error) {
      console.error('❌ Erreur lors de la création de la conversation:', error);
      throw error;
    }
  },

  // Envoyer un message
  async sendMessage(data: ExtendedMessageData): Promise<Message> {
    console.log('📝 Début de sendMessage avec les données:', data);
    
    try {
      let targetConversationId = data.conversationId;
      
      // Si pas de conversationId ou si la conversation n'existe pas, en créer une nouvelle
      if (!targetConversationId || !(await this.checkConversationExists(targetConversationId))) {
        console.log('⚠️ Pas de conversation existante, création d\'une nouvelle conversation...');
        
        if (!data.recipientId) {
          console.error('❌ Impossible de créer une conversation sans recipientId');
          throw new Error('RecipientId is required to create a new conversation');
        }
        
        // Créer les participants pour la nouvelle conversation
        const participants = [
          {
            id: data.senderId,
            name: data.senderName,
          },
          {
            id: data.recipientId,
            name: data.recipientName || 'User',
            avatar: data.recipientAvatar
          }
        ];

        // Créer une nouvelle conversation
        const newConversation = await this.createConversation({
          participants,
          postId: data.postId
        });

        // Utiliser l'ID de la nouvelle conversation
        targetConversationId = newConversation.id;
        console.log('✅ Nouvelle conversation créée avec ID:', targetConversationId);
      }

      const now = Date.now();
      console.log('⏰ Timestamp généré:', now);

      const messageRef = ref(database, MESSAGES_REF);
      const newMessageRef = push(messageRef);
      const messageId = newMessageRef.key;

      if (!messageId) {
        console.error('❌ Échec de la génération de l\'ID du message');
        throw new Error('Failed to generate message ID');
      }
      console.log('🔑 ID du message généré:', messageId);

      const messageData = {
        id: messageId,
        conversationId: targetConversationId,
        senderId: data.senderId,
        senderName: data.senderName,
        text: data.text,
        createdAt: now,
        read: false,
      };
      console.log('📋 Données du message préparées:', messageData);

      // Ajouter le message
      console.log('💾 Tentative d\'enregistrement du message...');
      await set(newMessageRef, messageData);
      console.log('✅ Message enregistré avec succès');
      
      // Mettre à jour la conversation
      const conversationRef = ref(database, `${CONVERSATIONS_REF}/${targetConversationId}`);
      const conversationSnapshot = await get(conversationRef);
      const conversation = conversationSnapshot.val();
      
      // Mettre à jour le dernier message
      console.log('📝 Mise à jour du dernier message de la conversation');
      const lastMessageData = {
        id: messageId,
        text: data.text,
        senderId: data.senderId,
        senderName: data.senderName,
        createdAt: now,
      };
      
      await set(ref(database, `${CONVERSATIONS_REF}/${targetConversationId}/lastMessage`), lastMessageData);

      // Mettre à jour la date de mise à jour
      console.log('⏰ Mise à jour de la date de la conversation');
      await set(ref(database, `${CONVERSATIONS_REF}/${targetConversationId}/updatedAt`), now);

      // Mettre à jour les compteurs de messages non lus
      console.log('🔢 Mise à jour des compteurs de messages non lus');
      for (const participantId of conversation.participantIds) {
        if (participantId !== data.senderId) {
          const currentCount = conversation.unreadCounts?.[participantId] || 0;
          console.log(`📊 Mise à jour du compteur pour ${participantId}: ${currentCount} -> ${currentCount + 1}`);
          await set(
            ref(database, `${CONVERSATIONS_REF}/${targetConversationId}/unreadCounts/${participantId}`),
            currentCount + 1
          );
        }
      }
      console.log('✅ Compteurs mis à jour avec succès');

      console.log('✅ Message envoyé avec succès');
      return {
        ...messageData,
        conversationId: targetConversationId,
        createdAt: new Date(messageData.createdAt),
      } as Message;
    } catch (error) {
      console.error('❌ Erreur dans sendMessage:', error);
      throw error;
    }
  },

  // Trouver une conversation existante par postId et participants
  async findConversationByPostAndParticipants(postId: string, participantIds: string[]): Promise<Conversation | null> {
    try {
      console.log('🔍 Recherche d\'une conversation existante:', { postId, participantIds });
      const conversationsRef = ref(database, CONVERSATIONS_REF);
      
      // Récupérer toutes les conversations
      const snapshot = await get(conversationsRef);
      if (!snapshot.exists()) {
        console.log('❌ Aucune conversation trouvée');
        return null;
      }

      // Filtrer les conversations en mémoire
      const conversations = Object.values(snapshot.val()) as Conversation[];
      const existingConversation = conversations.find(conv => {
        const hasMatchingPostId = conv.postId === postId;
        const hasAllParticipants = participantIds.every(id => conv.participantIds.includes(id));
        const sameParticipantsCount = conv.participantIds.length === participantIds.length;
        return hasMatchingPostId && hasAllParticipants && sameParticipantsCount;
      });

      if (existingConversation) {
        console.log('✅ Conversation existante trouvée:', existingConversation.id);
        return existingConversation;
      }

      console.log('❌ Aucune conversation trouvée avec ces critères');
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche de la conversation:', error);
      return null;
    }
  },

  // S'abonner aux messages d'une conversation
  subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void) {
    const messagesQuery = query(
      ref(database, MESSAGES_REF),
      orderByChild('conversationId'),
      equalTo(conversationId)
    );

    return onValue(messagesQuery, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const messages = Object.values(snapshot.val()).map(message => ({
        ...message,
        createdAt: new Date(message.createdAt),
      }));

      callback(messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    });
  },

  // Marquer les messages comme lus
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const messagesQuery = query(
        ref(database, MESSAGES_REF),
        orderByChild('conversationId'),
        equalTo(conversationId)
      );

      const snapshot = await get(messagesQuery);
      if (!snapshot.exists()) return;

      const updates = {};
      Object.entries(snapshot.val()).forEach(([messageId, message]) => {
        if (message.senderId !== userId && !message.read) {
          updates[`${MESSAGES_REF}/${messageId}/read`] = true;
        }
      });

      if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
        await set(ref(database, `${CONVERSATIONS_REF}/${conversationId}/unreadCounts/${userId}`), 0);
      }
    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
    }
  },

  // S'abonner au nombre total de messages non lus
  subscribeToTotalUnreadCount(userId: string, callback: (count: number) => void) {
    const userConversationsRef = ref(database, `${USER_CONVERSATIONS_REF}/${userId}`);

    return onValue(userConversationsRef, async (snapshot) => {
      if (!snapshot.exists()) {
        callback(0);
        return;
      }

      try {
        let totalUnread = 0;
        const conversationIds = Object.keys(snapshot.val());

        for (const conversationId of conversationIds) {
          const conversationRef = ref(database, `${CONVERSATIONS_REF}/${conversationId}`);
          const conversationSnapshot = await get(conversationRef);
          
          if (conversationSnapshot.exists()) {
            const conversation = conversationSnapshot.val();
            totalUnread += conversation.unreadCounts?.[userId] || 0;
          }
        }

        callback(totalUnread);
      } catch (error) {
        console.error('Erreur lors du calcul du nombre total de messages non lus:', error);
        callback(0);
      }
    });
  },

  // S'abonner aux conversations d'un utilisateur
  subscribeToConversations(userId: string, callback: (conversations: Conversation[]) => void) {
    const userConversationsRef = ref(database, `${USER_CONVERSATIONS_REF}/${userId}`);

    return onValue(userConversationsRef, async (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      try {
        const conversationIds = Object.keys(snapshot.val());
        const conversations: Conversation[] = [];

        for (const conversationId of conversationIds) {
          const conversationRef = ref(database, `${CONVERSATIONS_REF}/${conversationId}`);
          const conversationSnapshot = await get(conversationRef);
          
          if (conversationSnapshot.exists()) {
            const conversationData = conversationSnapshot.val();
            conversations.push({
              ...conversationData,
              createdAt: new Date(conversationData.createdAt),
              updatedAt: new Date(conversationData.updatedAt),
              lastMessage: conversationData.lastMessage ? {
                ...conversationData.lastMessage,
                createdAt: new Date(conversationData.lastMessage.createdAt),
              } : null,
            });
          }
        }

        callback(conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
      } catch (error) {
        console.error('Erreur lors de la récupération des conversations:', error);
        callback([]);
      }
    });
  },

  // Récupérer les conversations d'un utilisateur
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const userConversationsRef = ref(database, `${USER_CONVERSATIONS_REF}/${userId}`);
      const snapshot = await get(userConversationsRef);

      if (!snapshot.exists()) {
        return [];
      }

      const conversationIds = Object.keys(snapshot.val());
      const conversations: Conversation[] = [];

      for (const conversationId of conversationIds) {
        const conversationRef = ref(database, `${CONVERSATIONS_REF}/${conversationId}`);
        const conversationSnapshot = await get(conversationRef);
        
        if (conversationSnapshot.exists()) {
          const conversationData = conversationSnapshot.val();
          conversations.push({
            ...conversationData,
            createdAt: new Date(conversationData.createdAt),
            updatedAt: new Date(conversationData.updatedAt),
            lastMessage: conversationData.lastMessage ? {
              ...conversationData.lastMessage,
              createdAt: new Date(conversationData.lastMessage.createdAt),
            } : null,
          });
        }
      }

      return conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      throw error;
    }
  },
};
