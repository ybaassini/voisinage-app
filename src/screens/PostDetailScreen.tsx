import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { Text, Avatar, Card, Button, IconButton, useTheme, Surface, Chip, List, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
  SlideInRight,
  FadeIn,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TimeAgo from '../components/TimeAgo';
import { Post } from '../types/post';
import { postService } from '../services/postService';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { theme } from '../theme/theme';
import { useAuth } from '../hooks/useAuth';
import { PostResponse } from '../types/responses';

const PostDetailScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const { user, userProfile } = useAuth();
  const requireAuth = useRequireAuth();
  const [post, setPost] = useState<Post | null>(route.params?.post || null);
  const [loading, setLoading] = useState(!route.params?.post);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<PostResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const scrollY = useSharedValue(0);

  useEffect(() => {
    if (route.params?.postId && !post) {
      fetchPost();
    }
  }, [route.params?.postId]);

  useEffect(() => {
    if (post && user) {
      setIsLiked(post.likes?.includes(user.uid) || false);
    }
  }, [post, user]);

  useEffect(() => {
    if (post) {
      fetchResponses();
    }
  }, [post]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPost = await postService.getPostById(route.params.postId);
      if (fetchedPost) {
        setPost(fetchedPost);
      } else {
        setError('Post non trouvé');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du post:', err);
      setError('Impossible de charger les détails de la demande');
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async () => {
    if (!post) return;
    
    try {
      setLoadingResponses(true);
      const fetchedResponses = await postService.getPostResponses(post.id);
      setResponses(fetchedResponses);
    } catch (error) {
      console.error('Erreur lors de la récupération des réponses:', error);
    } finally {
      setLoadingResponses(false);
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleReply = async () => {
    requireAuth(async () => {
      try {
        // Rafraîchir la liste des réponses
        fetchResponses();

        // Naviguer vers le chat
        navigation.navigate('Chat', {
          postId: post.id,
          recipientId: post?.requestor.id,
          recipientName: post?.requestor.name,
          recipientAvatar: post?.requestor.avatar
        });
      } catch (error) {
        console.error('Erreur lors de la réponse:', error);
      }
    });
  };

  const handleLike = async () => {
    requireAuth(async () => {
      try {
        await postService.toggleLike(post.id, user.uid);
        setPost(prevPost => {
          if (!prevPost) return null;
          const likes = prevPost.likes || [];
          return {
            ...prevPost,
            likes: isLiked
              ? likes.filter(id => id !== user.uid)
              : [...likes, user.uid]
          };
        });
        setIsLiked(!isLiked);
      } catch (error) {
        console.error('Erreur lors du like:', error);
      }
    });
  };

  const renderActionButtons = () => {
    return (
      <Animated.View 
        entering={FadeInDown.delay(500)}
        style={styles.actionButtons}
      >
        <Button
          mode="contained"
          icon="message-reply"
          onPress={handleReply}
          style={styles.replyButton}
        >
          Répondre
        </Button>
        <IconButton
          icon={isLiked ? "heart" : "heart-outline"}
          mode="contained"
          onPress={handleLike}
          style={styles.likeButton}
        />
      </Animated.View>
    );
  };

  const renderResponses = () => {
    if (loadingResponses) {
      return (
        <View style={styles.noResponsesContainer}>
          <Text>Chargement des réponses...</Text>
        </View>
      );
    }
    
    if (responses.length === 0) {
      return (
        <View style={styles.noResponsesContainer}>
          <Text style={styles.noResponsesText}>Aucune réponse pour le moment</Text>
        </View>
      );
    }

    return (
      <View style={styles.responsesContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Réponses ({responses.length})
        </Text>
        {responses.map((response, index) => (
          <Animated.View
            key={response.id}
            entering={FadeInRight.delay(index * 100)}
            style={styles.responseItem}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile', { userId: response.userId })}
              style={styles.responseHeader}
            >
              <Avatar.Image
                size={40}
                source={{ uri: response.userAvatar }}
              />
              <View style={styles.responseInfo}>
                <View style={styles.nameRatingContainer}>
                  <Text style={styles.responseName}>{response.userName}</Text>
                  {response.userRating !== undefined && (
                    <View style={styles.ratingContainer}>
                      <MaterialCommunityIcons
                        name="star"
                        size={16}
                        color={theme.colors.primary}
                      />
                      <Text style={styles.ratingText}>
                        {response.userRating.toFixed(1)}
                      </Text>
                    </View>
                  )}
                </View>
                <TimeAgo date={response.createdAt} style={styles.responseTime} />
              </View>
            </TouchableOpacity>
            {index < responses.length - 1 && <Divider style={styles.responseDivider} />}
          </Animated.View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error || 'Post non trouvé'}</Text>
        <Button onPress={fetchPost} mode="contained" style={{ marginTop: 16 }}>
          Réessayer
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container]} >
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Surface style={styles.contentContainer} elevation={0}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: post.requestor.id })}>
              <Avatar.Image
                size={50}
                source={{ uri: post.requestor.avatar }}
              />
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{post.requestor.name}</Text>
              <TimeAgo date={post.createdAt} style={styles.timeAgo} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)}>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.description}>{post.description}</Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(400)}
            style={styles.metadata}
          >
            <Chip
              icon="tag"
              mode="flat"
              style={[styles.categoryChip, { backgroundColor: theme.colors.background }]}
            >
              {post.category}
            </Chip>

            {post.location.address && (
              <TouchableOpacity>
                <Chip
                  icon="map-marker"
                  mode="flat"
                  style={[styles.locationChip, { backgroundColor: theme.colors.background }]}
                >
                  {`${post.distance.toFixed(1)} km`}
                </Chip>
              </TouchableOpacity>
            )}
          </Animated.View>

          {renderResponses()}
        </Surface>
      </Animated.ScrollView>

      {renderActionButtons()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    elevation: 0,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
    borderRadius: 0,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 12,
    opacity: 0.7,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  locationChip: {
    marginRight: 8,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  replyButton: {
    flex: 1,
    marginRight: 12,
  },
  likeButton: {
    margin: 0,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  responsesContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  noResponsesContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noResponsesText: {
    fontSize: 16,
    opacity: 0.7,
  },
  responseItem: {
    marginBottom: 16,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  responseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  responseName: {
    fontSize: 16,
    fontWeight: '500',
  },
  responseTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  chatButton: {
    marginLeft: 8,
  },
  responseDivider: {
    marginVertical: 8,
  },
  nameRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
});

export default PostDetailScreen;
