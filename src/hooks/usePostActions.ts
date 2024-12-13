import { useState, useCallback } from 'react';
import { postService } from '../services/postService';
import { likeService } from '../services/likeService';
import { useAuth } from './useAuth';
import { Post } from '../types/post';

export function usePostActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleError = (err: any) => {
    const message = err instanceof Error ? err.message : 'Une erreur est survenue';
    setError(message);
    analytics.trackError(err as Error);
    return message;
  };

  const toggleLike = useCallback(async (postId: string) => {
    if (!user) return 'Vous devez être connecté pour aimer un post';
    
    try {
      setLoading(true);
      setError(null);
      await likeService.toggleLike(postId, user.id);
      return null;
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deletePost = useCallback(async (postId: string) => {
    if (!user) return 'Vous devez être connecté pour supprimer un post';
    
    try {
      setLoading(true);
      setError(null);
      await postService.deletePost(postId);
      return null;
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updatePost = useCallback(async (postId: string, data: Partial<Post>) => {
    if (!user) return 'Vous devez être connecté pour modifier un post';
    
    try {
      setLoading(true);
      setError(null);
      await postService.updatePost(postId, data);
      return null;
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    error,
    toggleLike,
    deletePost,
    updatePost
  };
}
