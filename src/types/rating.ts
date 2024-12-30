import { Timestamp } from 'firebase/firestore';

export interface Rating {
  id: string;
  rating: number;
  comment?: string;
  senderId: string;
  recipientId: string;
  postId?: string;
  createdAt: Timestamp;
}
