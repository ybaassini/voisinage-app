import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { logger } from '../utils/logger';

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export const categoryService = {
  /**
   * Récupère toutes les catégories
   */
  async getCategories(): Promise<Category[]> {
    try {
      logger.info('Fetching categories');
      
      const categoriesRef = collection(db, 'categories');
      const querySnapshot = await getDocs(categoriesRef);
      
      const categories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));

      logger.debug('Retrieved categories', { count: categories.length });
      return categories;
    } catch (error) {
      logger.error('Failed to fetch categories', error);
      throw error;
    }
  },

  /**
   * Récupère une catégorie par son ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      logger.info('Fetching category by ID', { categoryId: id });
      
      const categoryRef = doc(db, 'categories', id);
      const docSnap = await getDoc(categoryRef);

      if (!docSnap.exists()) {
        logger.debug('Category not found', { categoryId: id });
        return null;
      }

      const category = {
        id: docSnap.id,
        ...docSnap.data()
      } as Category;

      logger.debug('Category retrieved', { categoryId: id });
      return category;
    } catch (error) {
      logger.error('Failed to fetch category', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques des catégories
   */
  async getCategoryStats(): Promise<{ [key: string]: number }> {
    try {
      logger.info('Calculating category statistics');
      
      const postsRef = collection(db, COLLECTIONS.POSTS);
      const activePostsQuery = query(
        postsRef,
        where('status', '==', 'active')
      );
      
      const querySnapshot = await getDocs(activePostsQuery);
      const stats: { [key: string]: number } = {};

      querySnapshot.docs.forEach(doc => {
        const category = doc.data().category;
        stats[category] = (stats[category] || 0) + 1;
      });

      logger.debug('Category statistics calculated', { stats });
      return stats;
    } catch (error) {
      logger.error('Failed to calculate category statistics', error);
      throw error;
    }
  }
};
