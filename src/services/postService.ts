import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, Timestamp, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Post, CreatePostData, PostResponse } from '../types/post';
import { Platform } from 'react-native';
import { fetch } from 'react-native-fetch-polyfill';

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
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Post[];
    } catch (error) {
      console.error('Erreur lors de la récupération des posts:', error);
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
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt.toDate(),
        } as Post;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du post:', error);
      throw error;
    }
  },

  // Créer une nouvelle demande
  async createPost(postData: CreatePostData, photoFiles?: Array<{ uri: string; type: string; name: string }>): Promise<Post> {
    try {
      // Upload des photos si présentes
      const photoUrls = [];
      if (photoFiles && photoFiles.length > 0) {
        for (const file of photoFiles) {
          try {
            // Convertir l'URI en blob
            const response = await fetch(file.uri);
            const blob = await response.blob();

            const photoRef = ref(storage, `posts/${Date.now()}_${file.name}`);
            await uploadBytes(photoRef, blob);
            const url = await getDownloadURL(photoRef);
            photoUrls.push(url);
          } catch (uploadError) {
            console.error('Erreur lors de l\'upload de l\'image:', uploadError);
            // Continue avec les autres images même si une échoue
          }
        }
      }

      // Préparer les données pour Firestore
      const firestoreData = {
        ...postData,
        photos: photoUrls,
        createdAt: Timestamp.fromDate(new Date()),
        status: postData.status || 'active',
      };

      // Supprimer les champs undefined
      Object.keys(firestoreData).forEach(key => {
        if (firestoreData[key] === undefined) {
          delete firestoreData[key];
        }
      });

      const docRef = await addDoc(collection(db, POSTS_COLLECTION), firestoreData);
      
      // Retourner le post créé
      return {
        id: docRef.id,
        ...firestoreData,
        createdAt: firestoreData.createdAt.toDate(),
      } as Post;
    } catch (error) {
      console.error('Erreur détaillée lors de la création du post:', error);
      throw new Error('Impossible de créer le post: ' + error.message);
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
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Post[];
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
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Post[];
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

      const responseRef = db.collection('posts').doc(postId).collection('responses').doc();
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
      })) as PostResponse[];
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
