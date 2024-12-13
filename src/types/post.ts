import { Timestamp } from 'firebase/firestore';
import { Location } from './location';
import { PostResponse } from './responses';

/**
 * Types de post disponibles
 */
export type PostType = 'request' | 'offer';

/**
 * Statuts possibles d'un post
 */
export type PostStatus = 'active' | 'completed' | 'cancelled';

/**
 * Interface pour les informations de l'auteur d'un post
 * @interface PostAuthor
 */
export interface PostAuthor {
  /** Identifiant de l'auteur */
  id: string;
  
  /** Nom de l'auteur */
  name: string;
  
  /** URL de l'avatar de l'auteur */
  avatar: string;
  
  /** Note moyenne de l'auteur (optionnel) */
  rating?: number;
}

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
  
  /** Informations sur l'auteur */
  requestor: PostAuthor;
  
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
  
  /** Informations sur l'auteur */
  requestor: PostAuthor;
  
  /** Localisation du post */
  location: Location;
}
