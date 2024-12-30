import { Timestamp } from 'firebase/firestore';

export type MessageType = 'text' | 'image' | 'document';

export interface Message {
  id: string;
  conversationId: string;
  type: MessageType;
  text: string;
  mediaUrl?: string;
  mediaType?: string;
  fileName?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  postId?: string;
  createdAt: Date;
  read: boolean;
  readAt?: Date;
}

export interface CreateMessageData {
  conversationId: string;
  type: MessageType;
  text: string;
  mediaUrl?: string;
  mediaType?: string;
  fileName?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  postId?: string;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    displayName: string;
    avatar?: string;
  }[];
  lastMessage?: {
    text: string;
    type: MessageType;
    senderId: string;
    createdAt: Date | Timestamp;
  };
  postId?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  unreadCount?: number;
}

export type CreateConversationData = Omit<Conversation, 'id' | 'createdAt' | 'updatedAt' | 'lastMessage'>;
