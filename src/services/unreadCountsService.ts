import { db, authInstance } from '../config/firebase';

class UnreadCountsService {
  private messageSubscription: (() => void) | null = null;
  private notificationSubscription: (() => void) | null = null;

  subscribeToUnreadMessages(callback: (count: number) => void) {
    const user = authInstance.currentUser;
    if (!user) return;

    const q = db.collection('messages')
      .where('recipientId', '==', user.uid)
      .where('read', '==', false);

    this.messageSubscription = q.onSnapshot((snapshot) => {
      const count = snapshot.docs.length;
      callback(count);
    });

    return () => {
      if (this.messageSubscription) {
        this.messageSubscription();
      }
    };
  }

  subscribeToUnreadNotifications(callback: (count: number) => void) {
    const user = authInstance.currentUser;
    if (!user) return;

    const q = db.collection('notifications')
      .where('userId', '==', user.uid)
      .where('read', '==', false);

    this.notificationSubscription = q.onSnapshot((snapshot) => {
      const count = snapshot.docs.length;
      callback(count);
    });

    return () => {
      if (this.notificationSubscription) {
        this.notificationSubscription();
      }
    };
  }

  cleanup() {
    if (this.messageSubscription) {
      this.messageSubscription();
      this.messageSubscription = null;
    }
    if (this.notificationSubscription) {
      this.notificationSubscription();
      this.notificationSubscription = null;
    }
  }
}

export const unreadCountsService = new UnreadCountsService();
