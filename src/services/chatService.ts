import { db, storage } from '../config/firebase';
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
  async checkConversationExists(conversationId: string): Promise<boolean> {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      const docSnap = await getDoc(conversationRef);
      return docSnap.exists();
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

      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      console.log('✅ Conversation créée avec l\'ID:', docRef.id);

      return {
        id: docRef.id,
        ...conversationData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Conversation;
    } catch (error) {
      console.error('❌ Erreur lors de la création de la conversation:', error);
      throw error;
    }
  }

  async sendMessage(data: CreateMessageData): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Créer le message
      const messagesRef = collection(db, 'messages');
      const messageDoc = doc(messagesRef);
      const messageData = {
        id: messageDoc.id,
        ...data,
        createdAt: serverTimestamp(),
        read: false,
        readAt: null,
      };

      batch.set(messageDoc, messageData);

      // Mettre à jour la conversation
      const conversationRef = doc(db, 'conversations', data.conversationId);
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
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      read: true,
      readAt: serverTimestamp(),
    });
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        where('recipientId', '==', userId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return;

      const batch = writeBatch(db);

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
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        where('recipientId', '==', recipientId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void): () => void {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      callback(messages);
    });
  }

  async findConversationByPostAndParticipants(
    postId: string,
    participantIds: string[]
  ): Promise<Conversation | null> {
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('postId', '==', postId),
        where('participants', 'array-contains-any', participantIds)
      );

      const querySnapshot = await getDocs(q);
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
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('recipientId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  }

  subscribeToConversations(userId: string, displayName: string, callback: (conversations: Conversation[]) => void): () => void {
    console.log('🔄 Démarrage de subscribeToConversations pour userId:', userId);
    
    // Créer un tableau de participants pour la requête
    const participantQuery = {
      id: userId,
      displayName,
    };
    
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', participantQuery),
      orderBy('updatedAt', 'desc')
    );

    console.log('📝 Query construite:', JSON.stringify({
      collection: 'conversations',
      conditions: {
        participants: participantQuery,
        orderBy: 'updatedAt desc'
      }
    }, null, 2));

    return onSnapshot(q, (snapshot) => {
      console.log(`📥 Snapshot reçu avec ${snapshot.docs.length} documents`);
      
      if (snapshot.empty) {
        console.log('ℹ️ Aucune conversation trouvée');
        callback([]);
        return;
      }

      snapshot.docChanges().forEach(change => {
        console.log(`🔄 Document ${change.doc.id} a été ${change.type}`);
        console.log('Document data:', change.doc.data());
      });

      const conversations = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('📄 Document data:', JSON.stringify({
          id: doc.id,
          participants: data.participants,
          lastMessage: data.lastMessage,
          postId: data.postId,
          timestamps: {
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          }
        }, null, 2));

        return {
          id: doc.id,
          participants: data.participants,
          lastMessage: data.lastMessage ? {
            ...data.lastMessage,
            createdAt: data.lastMessage.createdAt?.toDate() || new Date()
          } : null,
          postId: data.postId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Conversation;
      });

      console.log(`✅ ${conversations.length} conversations transformées et envoyées au callback`);
      callback(conversations);
    }, (error) => {
      console.error('❌ Erreur lors de l\'écoute des conversations:', error);
    });
  }

  subscribeToTotalUnreadCount(userId: string, callback: (count: number) => void): () => void {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('recipientId', '==', userId),
      where('read', '==', false)
    );

    return onSnapshot(q, (snapshot) => {
      callback(snapshot.size);
    });
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', { id: userId }),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
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
  }
}

export const chatService = new ChatService();
