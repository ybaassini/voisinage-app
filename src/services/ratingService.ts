import { db, firestore } from '../config/firebase';
import { Rating } from '../types/rating';

class RatingService {
  private readonly COLLECTION_NAME = 'ratings';

  async addRating(rating: Omit<Rating, 'id' | 'createdAt'>): Promise<string> {
    try {

      const ratingData = {
        ...rating,
        createdAt: firestore.Timestamp.now()
      };

      const docRef = await db.collection(this.COLLECTION_NAME).add(ratingData);

      // Mettre à jour la note moyenne de l'utilisateur
      await this.updateUserAverageRating(rating.recipientId);

      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout de l\'évaluation:', error);
      throw error;
    }
  }

  async getUserRatings(userId: string): Promise<Rating[]> {
    try {
      const snapshot = await db
        .collection(this.COLLECTION_NAME)
        .where('recipientId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Rating));
    } catch (error) {
      console.error('Erreur lors de la récupération des évaluations:', error);
      throw error;
    }
  }

  private async updateUserAverageRating(userId: string) {
    try {
      const ratings = await this.getUserRatings(userId);
      
      if (ratings.length === 0) return;

      const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = totalRating / ratings.length;

      await db.collection('users').doc(userId).update({
        averageRating,
        totalRatings: ratings.length
      });

      console.log('✅ Note moyenne mise à jour:', { userId, averageRating, totalRatings: ratings.length });
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la note moyenne:', error);
      throw error;
    }
  }
}

export const ratingService = new RatingService();
