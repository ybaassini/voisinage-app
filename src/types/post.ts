import { Timestamp } from 'firebase/firestore';
import { Location } from './location';
import { PostResponse } from './responses';
import { UserProfile } from './user';

/**
 * Types de post disponibles
 */
export type PostType = 'request' | 'offer';

/**
 * Statuts possibles d'un post
 */
export type PostStatus = 'active' | 'completed' | 'cancelled';

/**
 * Interface principale pour un post
 * @interface Post
 */
export interface Post {
  /** Identifiant unique du post */
  id: string;
  
  /** Type de post (demande ou offre) */
  type: PostType;
  
  /** Titre du post */
  title: string;
  
  /** Description détaillée */
  description: string;
  
  /** Catégorie du post */
  category: string;
  
  /** URLs des photos associées (optionnel) */
  photos?: string[];
  
  /** Liste des IDs des utilisateurs ayant liké (optionnel) */
  likes?: string[];
  
  /** Auteur du post */
  requestor: UserProfile;
  
  /** Localisation du post */
  location: Location;
  
  /** Distance par rapport à l'utilisateur (en km) */
  distance: number;
  
  /** Date de création */
  createdAt: Timestamp | number;
  
  /** Statut actuel du post */
  status: PostStatus;
  
  /** Réponses au post (optionnel) */
  responses?: PostResponse[];
}

/**
 * Interface pour la création d'un nouveau post
 * @interface CreatePostData
 */
export interface CreatePostData {
  /** Type de post */
  type: PostType;
  
  /** Titre du post */
  title: string;
  
  /** Description détaillée */
  description: string;
  
  /** Catégorie du post */
  category: string;
  
  /** Fichiers photos à uploader (optionnel) */
  photos?: File[];
  
  /** Auteur du post */
  requestor: UserProfile;
  
  /** Localisation du post */
  location: Location;
}
