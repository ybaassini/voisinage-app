import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { logger } from '../utils/logger';

/**
 * Options pour l'upload de fichier
 */
interface UploadOptions {
  /** Dossier de destination dans Storage */
  folder: string;
  /** Préfixe pour le nom du fichier */
  prefix?: string;
}

/**
 * Service pour la gestion des fichiers
 */
export const fileService = {
  /**
   * Upload un fichier et retourne son URL
   */
  async uploadFile(file: File, options: UploadOptions): Promise<string> {
    try {
      logger.info('Uploading file', { 
        name: file.name, 
        size: file.size, 
        type: file.type 
      });

      const fileName = options.prefix 
        ? `${options.prefix}_${Date.now()}_${file.name}`
        : `${Date.now()}_${file.name}`;

      const filePath = `${options.folder}/${fileName}`;
      const fileRef = ref(storage, filePath);

      logger.debug('Starting file upload', { path: filePath });
      const uploadResult = await uploadBytes(fileRef, file);
      
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      logger.info('File uploaded successfully', { url: downloadUrl });
      
      return downloadUrl;
    } catch (error) {
      logger.error('Failed to upload file', error);
      throw error;
    }
  },

  /**
   * Upload plusieurs fichiers
   */
  async uploadMultipleFiles(
    files: File[],
    options: UploadOptions
  ): Promise<string[]> {
    try {
      logger.info('Uploading multiple files', { count: files.length });
      
      const uploadPromises = files.map(file => 
        this.uploadFile(file, options)
      );

      const urls = await Promise.all(uploadPromises);
      logger.debug('All files uploaded', { count: urls.length });
      
      return urls;
    } catch (error) {
      logger.error('Failed to upload multiple files', error);
      throw error;
    }
  }
};
