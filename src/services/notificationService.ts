import { serverTimestamp } from '@react-native-firebase/firestore';
import { db } from '../config/firebase';
import { Notification } from '../types/notification';

class NotificationService {
  private readonly COLLECTION_NAME = 'notifications';

  async createNotification(notification: Partial<Notification>): Promise<string> {
    try {
      const notificationData = {
        ...notification,
        createdAt: serverTimestamp(),
        read: false
      };

      const docRef = await db.collection(this.COLLECTION_NAME).add(notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const snapshot = await db
        .collection(this.COLLECTION_NAME)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await db
        .collection(this.COLLECTION_NAME)
        .doc(notificationId)
        .update({ read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await db.collection(this.COLLECTION_NAME).doc(notificationId).delete();
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const snapshot = await db
        .collection(this.COLLECTION_NAME)
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();

      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const batch = db.batch();
      const snapshot = await db
        .collection(this.COLLECTION_NAME)
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async savePushToken(userId: string, token: string): Promise<void> {
    try {
      await db.collection(this.COLLECTION_NAME).doc(userId).set({ pushToken: token }, { merge: true });
    } catch (error) {
      console.error('Error saving push token:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
