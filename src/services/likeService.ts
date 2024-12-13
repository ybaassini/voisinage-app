import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';

export const likeService = {
  async toggleLike(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, COLLECTIONS.POSTS, postId);
      const post = await postRef.get();
      
      if (!post.exists()) {
        throw new Error('Post not found');
      }
      
      const likes = post.data()?.likes || [];
      const isLiked = likes.includes(userId);
      
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }
};
