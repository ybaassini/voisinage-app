import { Timestamp } from 'firebase/firestore';

export type NotificationType = 'message' | 'request' | 'service' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: {
    postId?: string;
    chatId?: string;
    requestId?: string;
  };
}

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    postId?: string;
    chatId?: string;
    requestId?: string;
  };
}
