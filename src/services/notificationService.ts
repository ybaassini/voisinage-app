import { collection, doc, getDoc, getDocs, query, where, orderBy, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Notification, CreateNotificationData } from '../types/notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoNotifications from 'expo-notifications';

const NOTIFICATIONS_COLLECTION = 'notifications';
const PUSH_TOKENS_COLLECTION = 'pushTokens';

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

      // Créer la notification dans Firestore
      const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notificationData);

      // Récupérer le token push de l'utilisateur
      const userPushToken = await this.getUserPushToken(data.userId);

      if (userPushToken) {
        // Envoyer une notification push
        await this.sendPushNotification(
          userPushToken,
          data.title,
          data.message,
          {
            notificationId: docRef.id,
            type: data.type,
            ...data.data
          }
        );
      }

      // Mettre à jour le badge
      await this.updateBadgeCount(data.userId);

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

      // Récupérer la notification pour obtenir l'userId
      const notificationDoc = await getDoc(notificationRef);
      if (notificationDoc.exists()) {
        const userId = notificationDoc.data().userId;
        await this.updateBadgeCount(userId);
      }
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
      await this.updateBadgeCount(userId);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      throw error;
    }
  },

  // Sauvegarder le token push d'un utilisateur
  async savePushToken(userId: string, token: string): Promise<void> {
    try {
      const tokenRef = doc(db, PUSH_TOKENS_COLLECTION, userId);
      await updateDoc(tokenRef, { token });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token push:', error);
      throw error;
    }
  },

  // Récupérer le token push d'un utilisateur
  async getUserPushToken(userId: string): Promise<string | null> {
    try {
      const tokenRef = doc(db, PUSH_TOKENS_COLLECTION, userId);
      const tokenDoc = await getDoc(tokenRef);
      return tokenDoc.exists() ? tokenDoc.data().token : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du token push:', error);
      return null;
    }
  },

  // Mettre à jour le compteur de badge
  async updateBadgeCount(userId: string): Promise<void> {
    try {
      const notifications = await this.getUserNotifications(userId);
      const unreadCount = notifications.filter(n => !n.read).length;
      await ExpoNotifications.setBadgeCountAsync(unreadCount);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du badge:', error);
    }
  },

  // Envoyer une notification push
  async sendPushNotification(token: string, title: string, body: string, data: any): Promise<void> {
    try {
      const message = {
        to: token,
        sound: 'default',
        title,
        body,
        data,
      };

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification push:', error);
      throw error;
    }
  },
};
