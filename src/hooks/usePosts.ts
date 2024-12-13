import { useState, useEffect, useCallback } from 'react';
import { Post } from '../types/post';
import { postService } from '../services/postService';
import { useLocation } from './useLocation';

interface UsePostsOptions {
  radius?: number;
  category?: string;
  userId?: string;
  cacheResults?: boolean;
}

export function usePosts(options: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentLocation } = useLocation();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let fetchedPosts: Post[];
      const cacheKey = `posts_${JSON.stringify(options)}`;

      // Check cache first if enabled
      if (options.cacheResults) {
        const cachedPosts = cache.get<Post[]>(cacheKey);
        if (cachedPosts) {
          setPosts(cachedPosts);
          setLoading(false);
          return;
        }
      }

      // Fetch posts based on options
      if (options.category) {
        fetchedPosts = await postService.getPostsByCategory(options.category);
      } else if (options.userId) {
        fetchedPosts = await postService.getUserPosts(options.userId);
      } else if (currentLocation) {
        fetchedPosts = await postService.getNearbyPosts(
          currentLocation,
          options.radius || 10
        );
      } else {
        fetchedPosts = await postService.getPosts();
      }

      // Cache results if enabled
      if (options.cacheResults) {
        cache.set(cacheKey, fetchedPosts, { ttl: 5 * 60 * 1000 }); // 5 minutes
      }

      setPosts(fetchedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      analytics.trackError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [options, currentLocation]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const refreshPosts = useCallback(() => {
    if (options.cacheResults) {
      const cacheKey = `posts_${JSON.stringify(options)}`;
      cache.delete(cacheKey);
    }
    return fetchPosts();
  }, [fetchPosts, options]);

  return {
    posts,
    loading,
    error,
    refreshPosts
  };
}
