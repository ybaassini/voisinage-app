import { db, storage, firestore } from '../config/firebase';
import { Post, CreatePostData } from '../types/post';
import { PostResponse } from '../types/responses';
import { distanceBetween, geohashForLocation, geohashQueryBounds } from 'geofire-common';
import { geocodingService } from './geocodingService';
import { storageService } from './storageService';

class PostService {
  private readonly COLLECTION_NAME = 'posts';

  async createPost(userId: string, data: CreatePostData): Promise<string> {
    try {
      // Valider et géocoder l'adresse
      if (!data.location?.address) {
        throw new Error('L\'adresse est requise');
      }

      const geocodingResult = await geocodingService.validateAndGeocodeAddress(data.location.address);

      // Créer l'objet location avec les coordonnées géocodées
      const coordinates = geocodingResult.coordinates;
      const geohash = geohashForLocation([coordinates.latitude, coordinates.longitude]);

      const location = {
        address: geocodingResult.formattedAddress,
        coordinates: coordinates,
        geohash: geohash,
        g: {
          geohash: geohash,
          geopoint: coordinates
        }
      };

      const postData = {
        ...data,
        userId,
        location,
        createdAt: firestore.Timestamp.now(),
        updatedAt: firestore.Timestamp.now(),
        status: 'active',
        likes: [],
        views: 0,
      };

      const docRef = await db.collection(this.COLLECTION_NAME).add(postData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async getPost(postId: string): Promise<Post | null> {
    try {
      const postDoc = await db.collection(this.COLLECTION_NAME).doc(postId).get();

      if (!postDoc.exists) {
        return null;
      }

      return {
        id: postDoc.id,
        ...postDoc.data()
      } as Post;
    } catch (error) {
      console.error('Error getting post:', error);
      throw error;
    }
  }

  async updatePost(postId: string, updates: Partial<Post>): Promise<void> {
    try {
      const postRef = db.collection(this.COLLECTION_NAME).doc(postId);
      await postRef.update({
        ...updates,
        updatedAt: firestore.Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      await db.collection(this.COLLECTION_NAME).doc(postId).delete();
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    try {
      
      // Créer la requête
      let query = db.collection(this.COLLECTION_NAME)
        .where('requestor.id', '==', userId)
        .orderBy('createdAt', 'desc');

      // Exécuter la requête
      const snapshot = await query.get()
        .catch(error => {
          if (error.code === 'failed-precondition') {
            console.error('❌ Index manquant pour la requête. Veuillez créer un index composé pour requestor.id et createdAt');
            throw new Error('Index manquant pour la requête');
          }
          throw error;
        });

      // Mapper les résultats
      const posts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        };
      }) as Post[];

      return posts;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des posts:', error);
      throw error;
    }
  }

  async getNearbyPosts(latitude: number, longitude: number, radiusInM: number = 5000): Promise<Post[]> {
    try {

      const center = [latitude, longitude];
      const bounds = geohashQueryBounds(center, radiusInM);

      let posts: Post[] = [];

      for (const b of bounds) {
        const q = await db
          .collection(this.COLLECTION_NAME)
          .orderBy('location.geohash')
          .startAt(b[0])
          .endAt(b[1])
          .get();

        q.docs.forEach(doc => {
          const post = { id: doc.id, ...doc.data() } as Post;
          const postLocation = post.location.coordinates;
          const distanceInM = distanceBetween(
            [postLocation.latitude, postLocation.longitude],
            center
          );

          if (distanceInM <= radiusInM) {
            posts.push({...post, distance: distanceInM});
          }
        });
      }

      return posts;
    } catch (error) {
      console.error('Error getting nearby posts:', error);
      throw error;
    }
  }

  async incrementViews(postId: string): Promise<void> {
    try {
      const postRef = db.collection(this.COLLECTION_NAME).doc(postId);
      await postRef.update({
        views: firestore.FieldValue.increment(1)
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  }

  async toggleLike(postId: string, userId: string): Promise<void> {
    try {
      const postRef = db.collection(this.COLLECTION_NAME).doc(postId);
      const post = await postRef.get();

      if (!post.exists) {
        throw new Error('Post not found');
      }

      const likes = post.data()?.likes || [];
      const isLiked = likes.includes(userId);

      await postRef.update({
        likes: isLiked
          ? firestore.FieldValue.arrayRemove(userId)
          : firestore.FieldValue.arrayUnion(userId)
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  async getPostResponses(postId: string): Promise<PostResponse[]> {
    try {
      const snapshot = await db
        .collection(this.COLLECTION_NAME)
        .doc(postId)
        .collection('responses')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PostResponse[];
    } catch (error) {
      console.error('Error getting post responses:', error);
      throw error;
    }
  }

  async uploadPostPhotos(postId: string, photoUris: string[]): Promise<string[]> {
    
    try {
      const uploadedPhotos = await Promise.all(
        photoUris.map(async (photoUri, index) => {
          
          try {
            const fileName = storageService.generateUniqueFileName(photoUri);
            
            const path = `posts/${postId}/${fileName}`;
            
            const url = await storageService.uploadImage(photoUri, path);
            
            return url;
          } catch (error) {
            console.error(`[PostService] Erreur lors de l'upload de la photo ${index + 1}:`, error);
            return null;
          }
        })
      );

      // Filtrer les photos qui n'ont pas pu être uploadées
      const successfullyUploadedPhotos = uploadedPhotos.filter((url): url is string => url !== null);

      if (successfullyUploadedPhotos.length > 0) {
        // Mettre à jour le document du post avec les URLs des photos
        await this.updatePost(postId, {
          photos: successfullyUploadedPhotos
        });
      }

      return successfullyUploadedPhotos;
    } catch (error) {
      console.error('[PostService] Erreur lors du processus d\'upload des photos:', error);
      throw error;
    }
  }
}

export const postService = new PostService();
