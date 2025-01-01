import { db, storage, firestore } from '../config/firebase';
import { UserProfile, CreateUserProfileData, Portfolio, Skill } from '../types/user';
import { v4 as uuidv4 } from 'uuid';
import { convertToDate } from '../utils/dateUtils';

class UserService {
  private readonly COLLECTION_NAME = 'users';

  async createUserProfile(userId: string, data: CreateUserProfileData): Promise<UserProfile> {
    try {
      const userRef = db.collection(this.COLLECTION_NAME).doc(userId);
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
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firestore.FieldValue.serverTimestamp(),
      };

      await userRef.set(userData);

      return {
        ...userData,
        createdAt: now,
        lastLoginAt: now,
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const userRef = db.collection(this.COLLECTION_NAME).doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();

      if (!userData) {
        throw new Error('User data is missing');
      }

      // Conversion des timestamps Firestore en objets Date
      const createdAt = convertToDate(userData.createdAt);
      const lastLoginAt = convertToDate(userData.lastLoginAt);

      return userData as UserProfile;
    } catch (error) {
      throw error;
    }
  }

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = db.collection(this.COLLECTION_NAME).doc(userId);
      const updateData = {
        ...data,
        lastLoginAt: firestore.FieldValue.serverTimestamp(),
      };

      await userRef.update(updateData);
    } catch (error) {
      throw error;
    }
  }

  async getUserAvatar(userId: string): Promise<string | null> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile?.avatar) {
        return null;
      }
      return userProfile.avatar;
    } catch (error) {
      return null;
    }
  }

  async updateUserAvatar(userId: string, imageUri: string): Promise<string> {
    try {
      // Créer une référence pour l'image dans Firebase Storage
      const storageRef = storage().ref(`users/${userId}/avatar.jpg`);
      
      // Convertir l'URI de l'image en blob
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération de l'image: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Vérifier la taille du fichier (max 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (blob.size > MAX_FILE_SIZE) {
        throw new Error('L\'image est trop volumineuse. Taille maximum: 5MB');
      }
      
      // Upload l'image
      await storageRef.put(blob);
      
      // Récupérer l'URL de l'image
      const downloadURL = await storageRef.getDownloadURL();
      
      // Mettre à jour le profil utilisateur avec la nouvelle URL
      await this.updateUserProfile(userId, { avatar: downloadURL });
      
      return downloadURL;
    } catch (error: any) {
      // Créer un message d'erreur plus descriptif
      let errorMessage = 'Erreur lors de la mise à jour de l\'avatar: ';
      if (error.code === 'storage/unauthorized') {
        errorMessage += 'Accès non autorisé au stockage.';
      } else if (error.code === 'storage/canceled') {
        errorMessage += 'Opération annulée.';
      } else if (error.code === 'storage/invalid-url') {
        errorMessage += 'URL de l\'image invalide.';
      } else if (error.code === 'storage/retry-limit-exceeded') {
        errorMessage += 'Nombre maximum de tentatives dépassé.';
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage += 'Quota de stockage dépassé.';
      } else {
        errorMessage += error.message || 'Une erreur inconnue est survenue.';
      }
      
      throw new Error(errorMessage);
    }
  }

  async addSkill(userId: string, skill: Skill): Promise<void> {
    try {
      const userRef = db.collection(this.COLLECTION_NAME).doc(userId);
      await userRef.update({
        skills: firestore.FieldValue.arrayUnion(skill)
      });
    } catch (error) {
      throw error;
    }
  }

  async removeSkill(userId: string, skillName: string): Promise<void> {
    try {
      const userRef = db.collection(this.COLLECTION_NAME).doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      
      if (!userData) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const updatedSkills = userData.skills.filter((s: Skill) => s.name !== skillName);
      
      await userRef.update({
        skills: updatedSkills
      });
    } catch (error) {
      throw error;
    }
  }

  async addPortfolioItem(userId: string, imageUri: string, description: string): Promise<void> {
    try {
      const itemId = uuidv4();
      const storageRef = storage().ref(`users/${userId}/portfolio/${itemId}.jpg`);
      
      // Upload de l'image
      const response = await fetch(imageUri);
      const blob = await response.blob();
      await storageRef.put(blob);
      
      // Récupérer l'URL de l'image
      const imageUrl = await storageRef.getDownloadURL();
      
      // Créer l'item du portfolio
      const portfolioItem: Portfolio = {
        id: itemId,
        imageUrl,
        description,
        date: new Date(),
      };
      
      // Ajouter au profil utilisateur
      const userRef = db.collection(this.COLLECTION_NAME).doc(userId);
      await userRef.update({
        portfolio: firestore.FieldValue.arrayUnion({
          ...portfolioItem,
          date: firestore.FieldValue.serverTimestamp()
        })
      });
    } catch (error) {
      throw error;
    }
  }

  async removePortfolioItem(userId: string, itemId: string): Promise<void> {
    try {
      // Supprimer l'image du storage
      const storageRef = storage().ref(`users/${userId}/portfolio/${itemId}.jpg`);
      await storageRef.delete();
      
      // Supprimer l'item du profil utilisateur
      const userRef = db.collection(this.COLLECTION_NAME).doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      
      if (!userData) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const updatedPortfolio = userData.portfolio.filter((item: Portfolio) => item.id !== itemId);
      
      await userRef.update({
        portfolio: updatedPortfolio
      });
    } catch (error) {
      throw error;
    }
  }

  async updateRating(userId: string, newRating: number): Promise<void> {
    try {
      const userRef = db.collection(this.COLLECTION_NAME).doc(userId);
      
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
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
      throw error;
    }
  }

  async updatePortfolio(userId: string, portfolio: { url: string, createdAt: Date }[]): Promise<void> {
    try {
      const userRef = db.collection(this.COLLECTION_NAME).doc(userId);
      await userRef.update({
        portfolio: portfolio
      });
    } catch (error) {
      throw error;
    }
  }

  async addToPortfolio(userId: string, imageUrl: string): Promise<void> {
    try {
      const userRef = db.collection(this.COLLECTION_NAME).doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const currentPortfolio = userDoc.data().portfolio || [];
      const updatedPortfolio = [
        ...currentPortfolio,
        {
          url: imageUrl,
          createdAt: new Date()
        }
      ];

      await this.updatePortfolio(userId, updatedPortfolio);
    } catch (error) {
      throw error;
    }
  }
}

export const userService = new UserService();
