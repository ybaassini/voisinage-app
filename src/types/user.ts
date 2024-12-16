import { Coordinates } from "./location";

export type Skill = {
  name: string;
  level: number; // 1-5
};

export type Portfolio = {
  id: string;
  imageUrl: string;
  description: string;
  date: Date;
};

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  location: {
    address: string;
    coordinates: Coordinates;
    g: {
      geohash: string;
      geopoint: Coordinates;
    };
    geohash: string;
  };
  rating: {
    average: number; // Sur 5
    count: number;
  };
  bio: string;
  avatar?: string;
  skills: Skill[];
  portfolio: Portfolio[];
  createdAt: Date;
  lastLoginAt: Date;
};

export type CreateUserProfileData = Omit<UserProfile, 'id' | 'createdAt' | 'lastLoginAt' | 'rating'>;
