import { Timestamp, FieldValue } from '@react-native-firebase/firestore';

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
  recipientAvatar?: string;
  postId?: string;
  createdAt: Date | Timestamp;
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
  recipientAvatar?: string;
  postId?: string;
  createdAt: Date | Timestamp | FieldValue;
  read: boolean;
  readAt?: Date;
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
