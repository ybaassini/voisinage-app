import { storage } from '../config/firebase';
import { Platform } from 'react-native';

class StorageService {
  async uploadImage(uri: string, path: string): Promise<string> {
    console.log(`[StorageService] Début de l'upload de l'image vers ${path}`);
    try {
      // Créer une référence pour l'image
      console.log('[StorageService] Création de la référence de stockage');
      const reference = storage().ref(path);

      // Sur iOS, l'URI commence par 'file://'
      // Sur Android, nous devons ajouter 'file://'
      const filePath = Platform.OS === 'ios' ? uri : `file://${uri}`;
      console.log(`[StorageService] Chemin du fichier: ${filePath}`);

      // Upload l'image
      console.log('[StorageService] Début du transfert du fichier');
      await reference.putFile(filePath);
      console.log('[StorageService] Fichier transféré avec succès');

      // Obtenir l'URL de téléchargement
      console.log('[StorageService] Récupération de l\'URL de téléchargement');
      const downloadURL = await reference.getDownloadURL();
      console.log(`[StorageService] URL obtenue: ${downloadURL}`);

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
