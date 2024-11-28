import { collection, doc, getDoc, getDocs, query, where, orderBy, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Notification, CreateNotificationData } from '../types/notification';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const notificationService = {
  // Récupérer toutes les notifications d'un utilisateur
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const notifications: Notification[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          read: data.read,
          createdAt: data.createdAt.toDate(),
          data: data.data
        });
      });

      return notifications;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  },

  // Créer une nouvelle notification
  async createNotification(data: CreateNotificationData): Promise<string> {
    try {
      const notificationData = {
        ...data,
        read: false,
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      throw error;
    }
  },

  // Marquer toutes les notifications d'un utilisateur comme lues
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const batch = [];

      querySnapshot.forEach((doc) => {
        const notificationRef = doc.ref;
        batch.push(updateDoc(notificationRef, { read: true }));
      });

      await Promise.all(batch);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      throw error;
    }
  }
};
