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
      console.log('📝 Création d\'une nouvelle conversation:', data);
      
      const conversationData = {
        participants: data.participants.map(p => ({
          id: p.id,
          displayName: p.displayName,
          avatar: p.avatar || ''
        })),
        postId: data.postId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null,
      };

      console.log('📝 Données de la conversation:', conversationData);

      const docRef = await db.collection(this.COLLECTION_NAME).add(conversationData);
      console.log('✅ Conversation créée avec l\'ID:', docRef.id);

      return {
        id: docRef.id,
        ...conversationData,
        createdAt: firestore.Timestamp.now(),
        updatedAt: firestore.Timestamp.now(),
      } as Conversation;
    } catch (error) {
      console.error('❌ Erreur lors de la création de la conversation:', error);
      throw error;
    }
  }

  async sendMessage(data: CreateMessageData): Promise<void> {
    try {
      const batch = db.batch();

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
    console.log('🔄 Démarrage de subscribeToMessages pour conversationId:', conversationId);
    
    const messagesRef = db.collection(this.MESSAGES_COLLECTION);
    console.log('🔍 Construction de la requête messages avec:', {
      collection: this.MESSAGES_COLLECTION,
      filter: 'conversationId ==',
      orderBy: 'createdAt asc'
    });

    const q = messagesRef
      .where('conversationId', '==', conversationId)
      .orderBy('createdAt', 'asc');

    return q.onSnapshot((snapshot) => {
      console.log(`📨 Réception de ${snapshot.docs.length} messages`);
      
      const messages = snapshot.docs.map((doc) => {
        const messageData = doc.data();
        console.log(`📝 Message ${doc.id}:`, {
          senderId: messageData.senderId,
          type: messageData.type,
          createdAt: messageData.createdAt,
          read: messageData.read
        });
        
        return {
          id: doc.id,
          ...messageData,
        } as Message;
      });

      console.log('✅ Messages traités et envoyés au callback');
      callback(messages);
    }, (error) => {
      console.error('❌ Erreur dans le listener de messages:', error);
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
    console.log('🔄 Démarrage de subscribeToConversations pour userId:', userId);
    
    // Créer un tableau de participants pour la requête
    const participantQuery = {
      id: userId,
      displayName,
    };

    console.log('📝 Query construite:', JSON.stringify({
      collection: 'conversations',
      conditions: {
        participants: participantQuery,
        orderBy: 'updatedAt desc'
      }
    }, null, 2));

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
    console.log('📱 Démarrage de getUserConversations pour userId:', userId);
    
    try {
      const conversationsRef = db.collection(this.COLLECTION_NAME);
      console.log('🔍 Construction de la requête avec:', {
        collection: this.COLLECTION_NAME,
        filter: 'participants array-contains',
        participant: { id: userId },
        orderBy: 'updatedAt desc'
      });

      const q = conversationsRef
        .where('participants', 'array-contains', { 
          id: userId,
          displayName,
          avatar
        })
        .orderBy('updatedAt', 'desc');

      console.log('⏳ Exécution de la requête...');
      const querySnapshot = await q.get();
      console.log(`✅ ${querySnapshot.size} conversations trouvées`);

      const conversations = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log(`📝 Traitement de la conversation ${doc.id}:`, {
          participants: data.participants,
          lastMessage: data.lastMessage ? {
            text: data.lastMessage.text,
            createdAt: data.lastMessage.createdAt
          } : null
        });

        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastMessage: data.lastMessage ? {
            ...data.lastMessage,
            createdAt: data.lastMessage.createdAt?.toDate() || new Date(),
          } : null,
        } as Conversation;
      });

      console.log('✅ Conversations traitées et formatées avec succès');
      return conversations;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des conversations:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
