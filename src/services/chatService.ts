import { db, firestore, storage } from '../config/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  Timestamp,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Message, Conversation, CreateMessageData, CreateConversationData } from '../types/chat';
import { convertToDate } from '../utils/dateUtils';
import { useNotificationContext } from '../providers/NotificationProvider';

class ChatService {

  private readonly COLLECTION_NAME = 'conversations';
  private readonly MESSAGES_COLLECTION = 'messages';

  async checkConversationExists(conversationId: string): Promise<boolean> {
    try {
      const conversationRef = db.collection(this.COLLECTION_NAME).doc(conversationId);
      
      return conversationRef.get().then(doc => doc.exists);
    } catch (error) {
      console.error('Erreur lors de la vérification de la conversation:', error);
      return false;
    }
  }

  async createConversation(data: CreateConversationData): Promise<Conversation> {
    try {
      
      const conversationData = {
        participants: data.participants.map(p => ({
          id: p.id,
          displayName: p.displayName,
          avatar: p.avatar || ''
        })),
        postId: data.postId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };


      const docRef = await db.collection(this.COLLECTION_NAME).add(conversationData);
      
      return {
        id: docRef.id,
        ...conversationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as Conversation;
    } catch (error) {
      console.error(' Erreur lors de la création de la conversation:', error);
      throw error;
    }
  }

  async sendMessage(data: CreateMessageData): Promise<void> {
    const { sendNotification } = useNotificationContext();

    try {
      const batch = db.batch();
      // si data.conversationId est null, créer une nouvelle conversation
      if (!data.conversationId) {
        const conversationData = {
          participants: [
            {
              id: data.senderId,
              displayName: data.senderName,
              avatar: data.senderAvatar
            },
            {
              id: data.recipientId,
              displayName: data.recipientName,
              avatar: data.recipientAvatar
            }
          ],
          postId: data.postId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessage: {
            text: data.text,
            type: data.type || 'text',
            senderId: data.senderId,
            createdAt: serverTimestamp(),
          },
        };

        await this.createConversation(conversationData);
        sendNotification(
          data.recipientId,
          `${data.senderName} vous a envoyé un message`,
          data.text
        );
      }

      // Créer le message
      const messagesRef = db.collection(this.MESSAGES_COLLECTION);
      const messageDoc = messagesRef.doc();
      const messageData = {
        id: messageDoc.id,
        ...data,
        createdAt: serverTimestamp(),
        read: false,
        readAt: null,
      };

      batch.set(messageDoc, messageData);

      // Mettre à jour la conversation
      const conversationRef = db.collection(this.COLLECTION_NAME).doc(data.conversationId);
      batch.update(conversationRef, {
        lastMessage: {
          text: data.text,
          type: data.type || 'text',
          senderId: data.senderId,
          createdAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });

      // Exécuter les opérations en batch
      await batch.commit();
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  }

  async uploadMedia(file: Blob, path: string): Promise<string> {
    const storageRef = storage().ref(path);
    await storageRef.put(file);
    return storageRef.getDownloadURL();
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    const messageRef = db.collection(this.MESSAGES_COLLECTION).doc(messageId);
    await messageRef.update({ read: true, readAt: serverTimestamp() });
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const messagesRef = db.collection(this.MESSAGES_COLLECTION);
      const q = messagesRef
        .where('conversationId', '==', conversationId)
        .where('recipientId', '==', userId)
        .where('read', '==', false);

      const querySnapshot = await q.get();
      
      if (querySnapshot.empty) return;

      const batch = db.batch();

      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          read: true,
          readAt: serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
      throw error;
    }
  }

  async markMessagesAsRead(conversationId: string, recipientId: string) {
    try {
      const messagesRef = db.collection(this.MESSAGES_COLLECTION);
      const q = messagesRef
        .where('conversationId', '==', conversationId)
        .where('recipientId', '==', recipientId)
        .where('read', '==', false);

      const snapshot = await q.get();
      const batch = db.batch();

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void): () => void {
    
    const messagesRef = db.collection(this.MESSAGES_COLLECTION);

    const q = messagesRef
      .where('conversationId', '==', conversationId)
      .orderBy('createdAt', 'desc');

    return q.onSnapshot((snapshot) => {
      
      const messages = snapshot.docs.map((doc) => {
        const messageData = doc.data();

        return {
          id: doc.id,
          ...messageData,
          createdAt: convertToDate(messageData.createdAt),
          readAt: messageData.readAt ? convertToDate(messageData.readAt) : null,
        } as Message;
      });

      callback(messages);
    }, (error) => {
      console.error(' Erreur dans le listener de messages:', error);
    });
  }

  async findConversationByPostAndParticipants(
    postId: string,
    participantIds: string[]
  ): Promise<Conversation | null> {
    try {
      const conversationsRef = db.collection(this.COLLECTION_NAME);
      const q = conversationsRef
      where('postId', '==', postId),
      where('participants', 'array-contains-any', participantIds)
      orderBy('updatedAt', 'desc');

      const querySnapshot = await q.get();
      const conversations = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((conv: any) =>
          participantIds.every((id) =>
            conv.participants.some((p: any) => p.id === id)
          )
        );

      return conversations[0] as Conversation || null;
    } catch (error) {
      console.error('Erreur lors de la recherche de la conversation:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    const messagesRef = db.collection(this.MESSAGES_COLLECTION);
    const q = messagesRef
      .where('recipientId', '==', userId)
      .where('read', '==', false);

    const querySnapshot = await q.get();
    return querySnapshot.size;
  }

  subscribeToConversations(userId: string, displayName: string, callback: (conversations: Conversation[]) => void): () => void {
    
    // Créer un tableau de participants pour la requête
    const participantQuery = {
      id: userId,
      displayName,
    };

    return db.collection(this.COLLECTION_NAME)
      .where('participants', 'array-contains', participantQuery)
      .orderBy('updatedAt', 'desc')
      .onSnapshot((snapshot) => {
        const conversations = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Conversation[];
        callback(conversations);
      });
  }

  subscribeToTotalUnreadCount(userId: string, callback: (count: number) => void): () => void {
    return db.collection(this.MESSAGES_COLLECTION)
      .where('recipientId', '==', userId)
      .where('read', '==', false)
      .onSnapshot((snapshot) => {
        const count = snapshot.size;
        callback(count);
      });
  }

  async getUserConversations(userId: string, displayName: string, avatar: string): Promise<Conversation[]> {
    
    try {
      const conversationsRef = db.collection(this.COLLECTION_NAME);

      const q = conversationsRef
        .where('participants', 'array-contains', { 
          id: userId,
          displayName,
          avatar
        })
        .orderBy('updatedAt', 'desc');

      const querySnapshot = await q.get();

      const conversations = querySnapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          ...data,
          createdAt: convertToDate(data.createdAt),
          updatedAt: convertToDate(data.updatedAt),
          lastMessage: {
            ...data.lastMessage,
            createdAt: convertToDate(data.lastMessage.createdAt),
          } 
        } as Conversation;
      });

      return conversations;
    } catch (error) {
      console.error(' Erreur lors de la récupération des conversations:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
