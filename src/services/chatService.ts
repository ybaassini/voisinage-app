import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, getDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Message, Conversation, CreateMessageData, CreateConversationData } from '../types/chat';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';

export const chatService = {
  // Créer une nouvelle conversation
  async createConversation(data: CreateConversationData): Promise<Conversation> {
    try {
      const conversationData = {
        ...data,
        participantIds: data.participants.map(p => p.id),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      const docRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), conversationData);
      return {
        id: docRef.id,
        ...conversationData,
        updatedAt: conversationData.updatedAt.toDate(),
      } as Conversation;
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      throw error;
    }
  },

  // Récupérer les conversations d'un utilisateur
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const q = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where('participantIds', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt.toDate(),
        lastMessage: doc.data().lastMessage ? {
          ...doc.data().lastMessage,
          createdAt: doc.data().lastMessage.createdAt.toDate(),
        } : undefined,
      })) as Conversation[];
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      throw error;
    }
  },

  // Envoyer un message
  async sendMessage(data: CreateMessageData): Promise<Message> {
    try {
      const messageData = {
        ...data,
        createdAt: Timestamp.fromDate(new Date()),
      };

      // Ajouter le message
      const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData);
      
      // Mettre à jour la conversation
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, data.conversationId);
      await updateDoc(conversationRef, {
        lastMessage: {
          text: data.text,
          senderId: data.senderId,
          createdAt: messageData.createdAt,
        },
        updatedAt: messageData.createdAt,
      });

      return {
        id: docRef.id,
        ...messageData,
        createdAt: messageData.createdAt.toDate(),
      } as Message;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  },

  // Récupérer les messages d'une conversation
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Message[];
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      throw error;
    }
  },

  // Écouter les nouveaux messages d'une conversation
  subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void) {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Message[];
      callback(messages);
    });
  },

  // Marquer les messages comme lus
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    if (!conversationId || !userId) return;
    
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const batch = db.batch();

      querySnapshot.docs.forEach((doc) => {
        const message = doc.data();
        // Ne marquer comme lu que les messages des autres utilisateurs
        if (message.senderId !== userId) {
          batch.update(doc.ref, { read: true });
        }
      });

      await batch.commit();
    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
      // Ne pas propager l'erreur car ce n'est pas critique
      console.error(error);
    }
  },
};
