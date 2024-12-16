import { Timestamp } from 'firebase/firestore';
import { UserProfile } from './user';

/**
 * Interface représentant la réponse à un post
 * @interface PostResponse
 */
export interface PostResponse {
  /** Identifiant unique de la réponse */
  id: string;
  
  /** l'utilisateur qui a répondu */
  responser: UserProfile;

  /** demandeur */
  requestor: UserProfile;

  /** Timestamp de création de la réponse */
  createdAt: Timestamp | number;
  
  /** Contenu de la réponse */
  content: string;

  /** Statut de la réponse */
  status?: 'pending' | 'accepted' | 'rejected';
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
