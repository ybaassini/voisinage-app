import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, serverTimestamp, arrayRemove, arrayUnion, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Post, CreatePostData } from '../types/post';
import { Location } from '../types/location';
import * as geofireCommon from 'geofire-common';
import { COLLECTIONS } from '../constants/collections';
import { calculateDistance, createGeopoint, isValidLocation } from '../utils/locationUtils';
import { logger } from '../utils/logger';
import { PostResponse } from '../types/responses';
import { POST_STATUS } from '../constants/status';

const POSTS_COLLECTION = COLLECTIONS.POSTS;
const RESPONSES_COLLECTION = COLLECTIONS.RESPONSES;
const USERS_COLLECTION = COLLECTIONS.USERS;

export const postService = {
  // Récupérer toutes les demandes actives
  async getPosts(): Promise<Post[]> {
    try {
      logger.info('Fetching all active posts');
      
      const q = query(
        collection(db, POSTS_COLLECTION),
        where('status', '==', POST_STATUS.ACTIVE),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));

      logger.debug('Retrieved posts', { count: posts.length });
      return posts;
    } catch (error) {
      logger.error('Failed to fetch posts', error);
      throw error;
    }
  },

  // Créer un nouveau post
  async createPost(data: CreatePostData): Promise<string> {
    try {
      logger.info('Creating new post', { type: data.type, category: data.category });
      
      const { photos, location, ...postData } = data;
      const photoUrls: string[] = [];

      // Upload photos if any
      if (photos && photos.length > 0) {
        logger.debug('Uploading post photos', { count: photos.length });
        
        for (const photo of photos) {
          const photoRef = ref(storage, `posts/${Date.now()}_${photo.name}`);
          const uploadResult = await uploadBytes(photoRef, photo);
          const photoUrl = await getDownloadURL(uploadResult.ref);
          photoUrls.push(photoUrl);
        }
      }

      // Calculate geohash if location is provided
      let locationData = location;
      if (isValidLocation(location)) {
        logger.debug('Calculating geohash for location', {
          latitude: location.coordinates!.latitude,
          longitude: location.coordinates!.longitude
        });
        
        const { latitude, longitude } = location.coordinates!;
        locationData = {
          ...location,
          g: createGeopoint(latitude, longitude)
        };
      }

      // Create the post
      const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
        ...postData,
        photos: photoUrls,
        location: locationData,
        status: POST_STATUS.ACTIVE,
        createdAt: serverTimestamp()
      });

      logger.info('Post created successfully', { postId: docRef.id });
      return docRef.id;
    } catch (error) {
      logger.error('Failed to create post', error);
      throw error;
    }
  },

  // Récupérer les posts à proximité
  async getNearbyPosts(userLocation: Location, radiusInKm: number = 10): Promise<Post[]> {
    try {
      logger.info('Fetching nearby posts', { radiusInKm });
      
      if (!isValidLocation(userLocation)) {
        logger.error('Invalid user location provided');
        throw new Error('User location coordinates are required');
      }

      const center = [
        userLocation.coordinates!.latitude,
        userLocation.coordinates!.longitude
      ];

      logger.debug('Calculating geohash bounds', { center, radiusInKm });
      const bounds = geofireCommon.geohashQueryBounds(center, radiusInKm * 1000);
      const posts: Post[] = [];

      const queries = bounds.map(([startHash, endHash]) =>
        query(
          collection(db, POSTS_COLLECTION),
          where('status', '==', POST_STATUS.ACTIVE),
          where('location.g.geohash', '>=', startHash),
          where('location.g.geohash', '<=', endHash)
        )
      );

      const snapshots = await Promise.all(queries.map(q => getDocs(q)));
      let processedCount = 0;

      for (const snap of snapshots) {
        for (const doc of snap.docs) {
          const postData = doc.data();
          if (!postData.location?.g?.geopoint) continue;

          const distance = calculateDistance(
            userLocation.coordinates!,
            postData.location.g.geopoint
          );

          if (distance <= radiusInKm) {
            posts.push({
              id: doc.id,
              distance,
              ...postData
            } as Post);
            processedCount++;
          }
        }
      }

      logger.debug('Processed nearby posts', {
        total: processedCount,
        matching: posts.length,
        radiusInKm
      });

      return posts.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      logger.error('Failed to fetch nearby posts', error);
      throw error;
    }
  },

  // Récupérer une demande par son ID
  async getPostById(id: string): Promise<Post | null> {
    try {
      logger.info('Fetching post by ID', { postId: id });
      
      const docRef = doc(db, POSTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        logger.debug('Post not found', { postId: id });
        return null;
      }

      logger.debug('Post retrieved', { postId: id });
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Post;
    } catch (error) {
      logger.error('Failed to fetch post', error);
      throw error;
    }
  },

  // Mettre à jour une demande
  async updatePost(id: string, updateData: Partial<Post>): Promise<void> {
    try {
      logger.info('Updating post', { postId: id });
      
      const docRef = doc(db, POSTS_COLLECTION, id);
      await updateDoc(docRef, updateData);

      logger.debug('Post updated', { postId: id });
    } catch (error) {
      logger.error('Failed to update post', error);
      throw error;
    }
  },

  // Supprimer une demande
  async deletePost(id: string): Promise<void> {
    try {
      logger.info('Deleting post', { postId: id });
      
      const docRef = doc(db, POSTS_COLLECTION, id);
      await deleteDoc(docRef);

      logger.debug('Post deleted', { postId: id });
    } catch (error) {
      logger.error('Failed to delete post', error);
      throw error;
    }
  },

  // Récupérer les demandes d'un utilisateur
  async getUserPosts(userId: string): Promise<Post[]> {
    try {
      logger.info('Fetching user posts', { userId });
      
      const q = query(
        collection(db, POSTS_COLLECTION),
        where('requestor.id', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));

      logger.debug('Retrieved user posts', { count: posts.length });
      return posts;
    } catch (error) {
      logger.error('Failed to fetch user posts', error);
      throw error;
    }
  },

  // Récupérer les demandes par catégorie
  async getPostsByCategory(category: string): Promise<Post[]> {
    try {
      logger.info('Fetching posts by category', { category });
      
      const q = query(
        collection(db, POSTS_COLLECTION),
        where('category', '==', category),
        where('status', '==', POST_STATUS.ACTIVE),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));

      logger.debug('Retrieved posts by category', { count: posts.length });
      return posts;
    } catch (error) {
      logger.error('Failed to fetch posts by category', error);
      throw error;
    }
  },

  // Ajouter ou retirer un like
  async toggleLike(postId: string, userId: string): Promise<void> {
    try {
      logger.info('Toggling like', { postId, userId });
      
      const postRef = doc(db, POSTS_COLLECTION, postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        logger.error('Post not found', { postId });
        throw new Error('Post non trouvé');
      }

      const likes = postDoc.data().likes || [];
      const isLiked = likes.includes(userId);

      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
      });

      logger.debug('Like toggled', { postId, userId });
    } catch (error) {
      logger.error('Failed to toggle like', error);
      throw error;
    }
  },

  // Ajouter une réponse à un post
  async addResponse(postId: string, responseData: Omit<PostResponse, 'id' | 'createdAt'>): Promise<void> {
    try {
      logger.info('Adding response', { postId });
      
      // Récupérer le profil utilisateur pour obtenir sa note moyenne
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, responseData.userId));
      const userData = userDoc.data();
      const userRating = userData?.rating;

      const postRef = doc(db, POSTS_COLLECTION, postId);
      const responseRef = doc(collection(postRef, RESPONSES_COLLECTION), responseData.userId);
      await setDoc(responseRef, {
        ...responseData,
        createdAt: serverTimestamp(),
        userRating
      });

      logger.debug('Response added', { postId });
    } catch (error) {
      logger.error('Failed to add response', error);
      throw error;
    }
  },

  // Récupérer les réponses d'un post
  async getPostResponses(postId: string): Promise<PostResponse[]> {
    try {
      logger.info('Fetching post responses', { postId });
      
      const postRef = doc(db, POSTS_COLLECTION, postId);
      const responsesRef = collection(postRef, RESPONSES_COLLECTION);
      const q = query(responsesRef, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const responses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().getTime() / 1000,
      } as PostResponse)).filter(Boolean);

      logger.debug('Retrieved post responses', { count: responses.length });
      return responses;
    } catch (error) {
      logger.error('Failed to fetch post responses', error);
      throw error;
    }
  },

  // Supprimer une réponse
  async deleteResponse(postId: string, responseId: string): Promise<void> {
    try {
      logger.info('Deleting response', { postId, responseId });
      
      const postRef = doc(db, POSTS_COLLECTION, postId);
      const responseRef = doc(collection(postRef, RESPONSES_COLLECTION), responseId);
      await deleteDoc(responseRef);

      logger.debug('Response deleted', { postId, responseId });
    } catch (error) {
      logger.error('Failed to delete response', error);
      throw error;
    }
  },
};
