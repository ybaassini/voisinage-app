import { collection, doc, getDoc, setDoc, updateDoc, Timestamp, runTransaction, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { UserProfile, CreateUserProfileData, Portfolio, Skill } from '../types/user';
import { v4 as uuidv4 } from 'uuid';

const USERS_COLLECTION = 'users';

export const userService = {
  // Créer ou mettre à jour le profil d'un utilisateur
  async createUserProfile(userId: string, data: CreateUserProfileData): Promise<UserProfile> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const now = new Date();
      
      const userData = {
        ...data,
        id: userId,
        rating: {
          average: 0,
          count: 0
        },
        skills: data.skills || [],
        portfolio: data.portfolio || [],
        avatar: data.avatar || '',
        createdAt: Timestamp.fromDate(now),
        lastLoginAt: Timestamp.fromDate(now),
      };

      await setDoc(userRef, userData);

      return {
        ...userData,
        createdAt: now,
        lastLoginAt: now,
      };
    } catch (error) {
      console.error('Erreur lors de la création du profil utilisateur:', error);
      throw error;
    }
  },

  // Récupérer le profil d'un utilisateur
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);

      console.log('userDoc', userDoc.data());

      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();

      // Conversion des timestamps Firestore en objets Date
      const createdAt = userData.createdAt?.toDate() || new Date();
      const lastLoginAt = userData.lastLoginAt?.toDate() || new Date();

      // Construction du profil utilisateur avec les données de Firestore
      const profile: UserProfile = {
        id: userDoc.id,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        bio: userData.bio || '',
        avatar: userData.avatar || null,
        location: {
          address: userData.location?.address || '',
          coordinates: userData.location?.coordinates || null
        },
        rating: {
          average: userData.rating?.average || 0,
          count: userData.rating?.count || 0
        },
        skills: (userData.skills || []).map((skill: any) => ({
          name: skill.name,
          level: skill.level
        })),
        portfolio: (userData.portfolio || []).map((item: any) => ({
          id: item.id || uuidv4(),
          imageUrl: item.imageUrl,
          description: item.description || '',
          date: item.date?.toDate() || new Date()
        })),
        createdAt,
        lastLoginAt
      };

      return profile;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil utilisateur:', error);
      throw error;
    }
  },

  // Récupérer le profil de l'utilisateur courant
  async getCurrentUserProfile(userId: string | undefined): Promise<UserProfile | null> {
    if (!userId) {
      throw new Error('Aucun utilisateur connecté');
    }

    try {
      const profile = await this.getUserProfile(userId);
      
      if (!profile) {
        throw new Error('Profil utilisateur non trouvé');
      }

      return profile;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil utilisateur courant:', error);
      throw error;
    }
  },

  // Mettre à jour le profil d'un utilisateur
  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const updateData = {
        ...data,
        lastLoginAt: Timestamp.fromDate(new Date()),
      };

      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil utilisateur:', error);
      throw error;
    }
  },

  // Mettre à jour l'avatar d'un utilisateur
  async updateUserAvatar(userId: string, imageUri: string): Promise<string> {
    try {
      // Créer une référence pour l'image dans Firebase Storage
      const storageRef = ref(storage, `users/${userId}/avatar.jpg`);
      
      // Convertir l'URI de l'image en blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Upload l'image
      await uploadBytes(storageRef, blob);
      
      // Récupérer l'URL de l'image
      const downloadURL = await getDownloadURL(storageRef);
      
      // Mettre à jour le profil utilisateur avec la nouvelle URL
      await this.updateUserProfile(userId, { avatar: downloadURL });
      
      return downloadURL;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'avatar:', error);
      throw error;
    }
  },

  // Ajouter une compétence
  async addSkill(userId: string, skill: Skill): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        skills: arrayUnion(skill)
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la compétence:', error);
      throw error;
    }
  },

  // Supprimer une compétence
  async removeSkill(userId: string, skillName: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      if (!userData) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const updatedSkills = userData.skills.filter((s: Skill) => s.name !== skillName);
      
      await updateDoc(userRef, {
        skills: updatedSkills
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la compétence:', error);
      throw error;
    }
  },

  // Ajouter une réalisation au portfolio
  async addPortfolioItem(userId: string, imageUri: string, description: string): Promise<void> {
    try {
      const itemId = uuidv4();
      const storageRef = ref(storage, `users/${userId}/portfolio/${itemId}.jpg`);
      
      // Upload de l'image
      const response = await fetch(imageUri);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
      
      // Récupérer l'URL de l'image
      const imageUrl = await getDownloadURL(storageRef);
      
      // Créer l'item du portfolio
      const portfolioItem: Portfolio = {
        id: itemId,
        imageUrl,
        description,
        date: new Date(),
      };
      
      // Ajouter au profil utilisateur
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        portfolio: arrayUnion({
          ...portfolioItem,
          date: Timestamp.fromDate(portfolioItem.date)
        })
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'item au portfolio:', error);
      throw error;
    }
  },

  // Supprimer une réalisation du portfolio
  async removePortfolioItem(userId: string, itemId: string): Promise<void> {
    try {
      // Supprimer l'image du storage
      const storageRef = ref(storage, `users/${userId}/portfolio/${itemId}.jpg`);
      await deleteObject(storageRef);
      
      // Supprimer l'item du profil utilisateur
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      if (!userData) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const updatedPortfolio = userData.portfolio.filter((item: Portfolio) => item.id !== itemId);
      
      await updateDoc(userRef, {
        portfolio: updatedPortfolio
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'item du portfolio:', error);
      throw error;
    }
  },

  // Mettre à jour la note d'un utilisateur
  async updateRating(userId: string, newRating: number): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error('Utilisateur non trouvé');
        }

        const userData = userDoc.data();
        const currentRating = userData.rating;
        
        const newAverage = ((currentRating.average * currentRating.count) + newRating) / (currentRating.count + 1);
        
        transaction.update(userRef, {
          rating: {
            average: newAverage,
            count: currentRating.count + 1
          }
        });
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note:', error);
      throw error;
    }
  },
};
