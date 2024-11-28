export type Post = {
  id: string;
  category: string;
  description: string;
  photos?: string[]; // URLs des photos
  createdAt: Date;
  requestor: {
    id: string;
    name: string;
    avatar?: string;
  };
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  status: 'active' | 'completed' | 'cancelled';
  likes?: string[]; // IDs des utilisateurs qui ont aimé le post
};

export type CreatePostData = Omit<Post, 'id' | 'createdAt' | 'likes'>;
