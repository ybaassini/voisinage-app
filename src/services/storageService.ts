import { storage } from '../config/firebase';
import { Platform } from 'react-native';

class StorageService {
  async uploadImage(uri: string, path: string): Promise<string> {
    try {
      // Créer une référence pour l'image
      const reference = storage().ref(path);

      // Sur iOS, l'URI commence par 'file://'
      // Sur Android, nous devons ajouter 'file://'
      const filePath = Platform.OS === 'ios' ? uri : `file://${uri}`;

      // Upload l'image
      await reference.putFile(filePath);

      // Obtenir l'URL de téléchargement
      const downloadURL = await reference.getDownloadURL();

      return downloadURL;
    } catch (error) {
      console.error('[StorageService] Erreur lors de l\'upload de l\'image:', error);
      throw error;
    }
  }

  generateUniqueFileName(originalName: string): string {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop() || 'jpg';
    return `${timestamp}-${randomString}.${extension}`;
  }
}

export const storageService = new StorageService();
