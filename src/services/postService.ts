import { db, storage, firestore } from '../config/firebase';
import { Post, CreatePostData } from '../types/post';
import { PostResponse } from '../types/responses';
import { distanceBetween, geohashForLocation, geohashQueryBounds } from 'geofire-common';
import { geocodingService } from './geocodingService';

class PostService {
  private readonly COLLECTION_NAME = 'posts';

  async createPost(userId: string, data: CreatePostData): Promise<string> {
    try {
      // Valider et géocoder l'adresse
      console.log('🔍 Validation de l\'adresse:', data.location?.address);
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

      console.log('📍 Localisation formatée:', location);

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
      console.log('✅ Post créé avec succès:', docRef.id);
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

  async uploadPostImage(userId: string, imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const filename = `posts/${userId}/${Date.now()}.jpg`;
      const storageRef = storage().ref(filename);

      await storageRef.put(blob);
      return await storageRef.getDownloadURL();
    } catch (error) {
      console.error('Error uploading post image:', error);
      throw error;
    }
  }

  async deletePostImage(imageUrl: string): Promise<void> {
    try {
      if (imageUrl) {
        const storageRef = storage().refFromURL(imageUrl);
        await storageRef.delete();
      }
    } catch (error) {
      console.error('Error deleting post image:', error);
      throw error;
    }
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    try {
      console.log('🔍 Récupération des posts de l\'utilisateur:', userId);
      
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
        console.log('📄 Post trouvé:', {
          id: doc.id,
          requestorId: data.requestor?.id,
          title: data.title,
          createdAt: data.createdAt
        });
        return {
          id: doc.id,
          ...data
        };
      }) as Post[];

      console.log('✅ Nombre de posts récupérés:', posts.length);
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
      console.log('Geohash bounds:', bounds);

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
}

export const postService = new PostService();
