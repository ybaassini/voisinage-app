export interface PostResponse {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRating?: number; // Note moyenne de l'utilisateur
  createdAt: number; // Timestamp Unix en secondes
}

export interface Post {
  id: string;
  type: 'request' | 'offer';
  title: string;
  description: string;
  category: string;
  photos?: string[];
  likes?: string[];
  requestor: {
    id: string;
    name: string;
    avatar: string;
  };
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  createdAt: number; // Timestamp Unix en secondes
  status: 'active' | 'completed' | 'cancelled';
}

export type CreatePostData = Omit<Post, 'id' | 'createdAt' | 'likes'>;
