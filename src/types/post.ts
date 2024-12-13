export interface PostResponse {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRating?: number; // Note moyenne de l'utilisateur
  createdAt: number; // Timestamp Unix en secondes
}

export interface Location {
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
  geohash?: string; // Ajout du geohash
  // Ajout des champs pour geofire
  g?: {
    geohash: string;
    geopoint: {
      latitude: number;
      longitude: number;
    };
  };
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
  location: Location;
  distance: number;
  createdAt: number; // Timestamp Unix en secondes
  status: 'active' | 'completed' | 'cancelled';
}

export type CreatePostData = Omit<Post, 'id' | 'createdAt' | 'likes'>;
