import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, Timestamp, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Post, CreatePostData, PostResponse, Location } from '../types/post';
import * as geofireCommon from 'geofire-common';

const POSTS_COLLECTION = 'posts';
const RESPONSES_COLLECTION = 'responses';

export const postService = {
  // Récupérer toutes les demandes actives
  async getPosts(): Promise<Post[]> {
    try {
      const q = query(
        collection(db, POSTS_COLLECTION),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  },

  // Créer un nouveau post
  async createPost(data: CreatePostData): Promise<string> {
    try {
      let postData = { ...data };
      
      // Générer les données geofire si les coordonnées sont disponibles
      if (data.location?.coordinates) {
        const { latitude, longitude } = data.location.coordinates;
        const hash = geofireCommon.geohashForLocation([latitude, longitude]);
        
        postData.location = {
          ...postData.location,
          g: {
            geohash: hash,
            geopoint: {
              latitude,
              longitude
            }
          }
        };
      }

      const postRef = await addDoc(collection(db, POSTS_COLLECTION), {
        ...postData,
        createdAt: serverTimestamp(),
      });

      return postRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Récupérer les posts à proximité
  async getNearbyPosts(userLocation: Location, radiusInKm: number = 10): Promise<Post[]> {
    try {
      if (!userLocation.coordinates) {
        throw new Error('User location coordinates are required');
      }

      const { latitude, longitude } = userLocation.coordinates;
      const center = [latitude, longitude];
      const radiusInM = radiusInKm * 1000;

      // Générer les limites de la requête
      const bounds = geofireCommon.geohashQueryBounds(center, radiusInM);
      const posts: Post[] = [];

      // Exécuter une requête pour chaque limite
      const promises = bounds.map(b => {
        const q = query(
          collection(db, POSTS_COLLECTION),
          where('status', '==', 'active'),
          where('location.g.geohash', '>=', b[0]),
          where('location.g.geohash', '<=', b[1])
        );
        return getDocs(q);
      });

      const snapshots = await Promise.all(promises);

      // Traiter les résultats
      for (const snap of snapshots) {
        for (const doc of snap.docs) {
          const post = { 
            id: doc.id, 
            distance: geofireCommon.distanceBetween(center, [
              doc.data().location.g.geopoint.latitude,
              doc.data().location.g.geopoint.longitude
            ]),
            ...doc.data() } as Post;
          
          // Vérifier que le post a des coordonnées valides
          if (post.location?.g?.geopoint) {
            const postLatLng = [
              post.location.g.geopoint.latitude,
              post.location.g.geopoint.longitude
            ];

            // Calculer la distance réelle
            const distanceInKm = geofireCommon.distanceBetween(center, postLatLng)

            // N'ajouter que les posts qui sont réellement dans le rayon
            if (distanceInKm <= radiusInKm) {
              // Ajouter la distance au post pour l'affichage
              posts.push({
                ...post,
                distance: Math.round(distanceInKm * 10) / 10 // Arrondir à 1 décimale
              });
            }
          }
        }
      }

      // Trier par distance
      return posts.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } catch (error) {
      console.error('Error getting nearby posts:', error);
      throw error;
    }
  },

  // Récupérer une demande par son ID
  async getPostById(id: string): Promise<Post | null> {
    try {
      const docRef = doc(db, POSTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Post;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du post:', error);
      throw error;
    }
  },

  // Mettre à jour une demande
  async updatePost(id: string, updateData: Partial<Post>): Promise<void> {
    try {
      const docRef = doc(db, POSTS_COLLECTION, id);
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du post:', error);
      throw error;
    }
  },

  // Supprimer une demande
  async deletePost(id: string): Promise<void> {
    try {
      const docRef = doc(db, POSTS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erreur lors de la suppression du post:', error);
      throw error;
    }
  },

  // Récupérer les demandes d'un utilisateur
  async getUserPosts(userId: string): Promise<Post[]> {
    try {
      const q = query(
        collection(db, POSTS_COLLECTION),
        where('requestor.id', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
    } catch (error) {
      console.error('Erreur lors de la récupération des posts de l\'utilisateur:', error);
      throw error;
    }
  },

  // Récupérer les demandes par catégorie
  async getPostsByCategory(category: string): Promise<Post[]> {
    try {
      const q = query(
        collection(db, POSTS_COLLECTION),
        where('category', '==', category),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
    } catch (error) {
      console.error('Erreur lors de la récupération des posts par catégorie:', error);
      throw error;
    }
  },

  // Ajouter ou retirer un like
  async toggleLike(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, POSTS_COLLECTION, postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        throw new Error('Post non trouvé');
      }

      const likes = postDoc.data().likes || [];
      const isLiked = likes.includes(userId);

      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
      });
    } catch (error) {
      console.error('Erreur lors du toggle like:', error);
      throw error;
    }
  },

  // Ajouter une réponse à un post
  async addResponse(postId: string, responseData: Omit<PostResponse, 'id' | 'createdAt'>): Promise<void> {
    try {
      // Récupérer le profil utilisateur pour obtenir sa note moyenne
      const userDoc = await db.collection('users').doc(responseData.userId).get();
      const userData = userDoc.data();
      const userRating = userData?.rating;

      const postRef = doc(db, POSTS_COLLECTION, postId);
      const responseRef = doc(collection(postRef, RESPONSES_COLLECTION), doc().id);
      await responseRef.set({
        ...responseData,
        userRating,
        id: responseRef.id,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding response:', error);
      throw error;
    }
  },

  // Récupérer les réponses d'un post
  async getPostResponses(postId: string): Promise<PostResponse[]> {
    try {
      const postRef = doc(db, POSTS_COLLECTION, postId);
      const responsesRef = collection(postRef, RESPONSES_COLLECTION);
      const q = query(responsesRef, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().getTime() / 1000,
      } as PostResponse)).filter(Boolean);
    } catch (error) {
      console.error('Erreur lors de la récupération des réponses:', error);
      throw error;
    }
  },

  // Supprimer une réponse
  async deleteResponse(postId: string, responseId: string): Promise<void> {
    try {
      const postRef = doc(db, POSTS_COLLECTION, postId);
      const responseRef = doc(collection(postRef, RESPONSES_COLLECTION), responseId);
      await deleteDoc(responseRef);
    } catch (error) {
      console.error('Erreur lors de la suppression de la réponse:', error);
      throw error;
    }
  },
};
