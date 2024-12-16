import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { auth } from '../config/firebase';

class UnreadCountsService {
  private messageSubscription: (() => void) | null = null;
  private notificationSubscription: (() => void) | null = null;

  subscribeToUnreadMessages(callback: (count: number) => void) {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'messages'),
      where('recipientId', '==', user.uid),
      where('read', '==', false)
    );

    this.messageSubscription = onSnapshot(q, (snapshot) => {
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
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    this.notificationSubscription = onSnapshot(q, (snapshot) => {
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
    }
    if (this.notificationSubscription) {
      this.notificationSubscription();
    }
  }
}

export const unreadCountsService = new UnreadCountsService();
