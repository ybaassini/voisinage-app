import { Timestamp } from 'firebase/firestore';

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  createdAt: Date;
  read: boolean;
};

export type Conversation = {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  participantIds: string[]; // Liste des IDs des participants pour la recherche
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: Date;
  };
  updatedAt: Date;
  postId?: string; // Optionnel, pour lier la conversation à une annonce
};

export type CreateMessageData = Omit<Message, 'id' | 'createdAt'>;
export type CreateConversationData = Omit<Conversation, 'id' | 'updatedAt' | 'lastMessage' | 'participantIds'>;
