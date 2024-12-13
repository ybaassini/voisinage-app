import { collection, query, orderBy, getDocs, doc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PostResponse } from '../types/post';
import { COLLECTIONS } from '../constants/collections';

export const responseService = {
  async addResponse(
    postId: string,
    responseData: Omit<PostResponse, 'id' | 'createdAt'>
  ): Promise<void> {
    try {
      const postRef = doc(db, COLLECTIONS.POSTS, postId);
      const responsesRef = collection(postRef, COLLECTIONS.RESPONSES);
      
      await addDoc(responsesRef, {
        ...responseData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding response:', error);
      throw error;
    }
  },

  async getPostResponses(postId: string): Promise<PostResponse[]> {
    try {
      const postRef = doc(db, COLLECTIONS.POSTS, postId);
      const responsesRef = collection(postRef, COLLECTIONS.RESPONSES);
      const q = query(responsesRef, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PostResponse));
    } catch (error) {
      console.error('Error getting responses:', error);
      throw error;
    }
  },

  async deleteResponse(postId: string, responseId: string): Promise<void> {
    try {
      const responseRef = doc(
        db,
        COLLECTIONS.POSTS,
        postId,
        COLLECTIONS.RESPONSES,
        responseId
      );
      await deleteDoc(responseRef);
    } catch (error) {
      console.error('Error deleting response:', error);
      throw error;
    }
  }
};
