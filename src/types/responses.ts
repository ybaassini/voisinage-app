import { Timestamp } from 'firebase/firestore';

/**
 * Interface représentant la réponse à un post
 * @interface PostResponse
 */
export interface PostResponse {
  /** Identifiant unique de la réponse */
  id: string;
  
  /** Identifiant de l'utilisateur qui a répondu */
  userId: string;
  
  /** Nom de l'utilisateur qui a répondu */
  userName: string;
  
  /** URL de l'avatar de l'utilisateur */
  userAvatar: string;
  
  /** Note moyenne de l'utilisateur (optionnel) */
  userRating?: number;
  
  /** Timestamp de création de la réponse */
  createdAt: Timestamp | number;
  
  /** Contenu de la réponse */
  content: string;
}

/**
 * Interface pour la création d'une nouvelle réponse
 * @interface CreateResponseData
 */
export interface CreateResponseData {
  /** Contenu de la réponse */
  content: string;
  
  /** Identifiant de l'utilisateur qui crée la réponse */
  userId: string;
  
  /** Nom de l'utilisateur */
  userName: string;
  
  /** URL de l'avatar de l'utilisateur */
  userAvatar: string;
  
  /** Note moyenne de l'utilisateur (optionnel) */
  userRating?: number;
}
