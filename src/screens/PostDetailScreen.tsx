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
import { Text, Avatar, Card, Button, IconButton, useTheme, Surface, Chip,  } from 'react-native-paper';
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
import ImageViewerModal from '../components/ImageViewerModal';
import { Post } from '../types/post';
import { postService } from '../services/postService';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { theme } from '../theme/theme';
import { useAuth } from '../hooks/useAuth';
import { PostResponse } from '../types/responses';
import { useNotificationContext } from '../providers/NotificationProvider';
import { POST_STATUS } from '../constants/status';
import { convertToDate } from '../utils/dateUtils';

const PostDetailScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const { user, userProfile } = useAuth();
  const requireAuth = useRequireAuth();
  const { sendNotification } = useNotificationContext();
  const [post, setPost] = useState<Post | null>(route.params?.post || null);
  const [loading, setLoading] = useState(!route.params?.post);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<PostResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const scrollY = useSharedValue(0);

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
      const fetchedPost = await postService.getPost(route.params.postId);
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

        // Vérifier si l'utilisateur est le propriétaire du post
        const isPostOwner = post?.requestor?.id === user?.uid;

        // Naviguer vers le chat
        navigation.navigate('Chat', {
          postId: post.id,
          recipient: post.requestor,
          isPostOwner: isPostOwner
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
  }

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
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="message-processing-outline"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            Chargement des réponses...
          </Text>
        </View>
      );
    }

    if (responses.length === 0) {
      return (
        <Animated.View
          entering={FadeIn.delay(300)}
          style={styles.noResponsesContainer}
        >
          <MaterialCommunityIcons
            name="message-text-outline"
            size={48}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={[styles.noResponsesText, { color: theme.colors.onSurfaceVariant }]}>
            Aucune réponse pour le moment
          </Text>
          <Text style={[styles.noResponsesSubtext, { color: theme.colors.onSurfaceVariant }]}>
            Soyez le premier à répondre à cette demande
          </Text>
        </Animated.View>
      );
    }

    return (
      <View style={styles.responsesContainer}>
        <View style={styles.responsesHeader}>
          <MaterialCommunityIcons
            name="message-text-outline"
            size={24}
            color={theme.colors.primary}
            style={styles.responseIcon}
          />
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Réponses ({responses.length})
          </Text>
        </View>

        {responses.map((response, index) => (
          <Animated.View
            key={response.id}
            entering={FadeInRight.delay(index * 100)}
            layout={Layout.springify()}
          >
            <Surface style={styles.responseCard} elevation={1}>
              <TouchableOpacity
                style={styles.responseHeader}
                onPress={() => navigation.navigate('Profile', { userId: response.responser.id })}
              >
                <Avatar.Image
                  size={40}
                  source={{ uri: response.responser.avatar }}
                  style={styles.responseAvatar}
                />
                <View style={styles.responseTextContainer}>
                  <View style={styles.responseHeader}>
                    <Text style={[styles.responseName, { color: theme.colors.onSurface }]}>
                      {`${response.responser.firstName} ${response.responser.lastName}`}
                    </Text>
                    {response.responser.rating && (
                      <View style={styles.ratingContainer}>
                        <MaterialCommunityIcons
                          name="star"
                          size={16}
                          color={theme.colors.primary}
                        />
                        <Text style={[styles.ratingText, { color: theme.colors.primary }]}>
                          {response.responser.rating.average.toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.responseTimeContainer}>
                    <Text style={[styles.responseTimeText, { color: theme.colors.onSurfaceVariant }]}>
                      a répondu 
                    </Text>
                    <TimeAgo
                      date={convertToDate(response.createdAt)}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </Surface>
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
            <View style={styles.userInfo}>
              <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: post.requestor.id })}>
                <Avatar.Image
                  size={40}
                  source={{ uri: post.requestor.avatar }}
                />
              </TouchableOpacity>
              <View style={styles.userInfoText}>
                <Text variant="titleMedium" style={styles.userName}>
                  {post.requestor?.displayName || 'Utilisateur'}
                </Text>
                <View style={styles.locationInfo}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={14}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text 
                    variant="bodySmall" 
                    style={[styles.locationText, { color: theme.colors.onSurfaceVariant }]}
                    numberOfLines={1}
                  >
                    {post.location?.address || 'Adresse non spécifiée'}
                  </Text>
                  {typeof post.distance === 'number' && (
                    <Text 
                      variant="bodySmall" 
                      style={[styles.distanceText, { color: theme.colors.onSurfaceVariant }]}
                    >
                      • {post.distance.toFixed(1)} km
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={styles.mainContent}>
            <Text variant="headlineSmall" style={styles.title}>
              {post.title}
            </Text>
            
            <Text 
              variant="bodyLarge" 
              style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={showFullDescription ? undefined : 3}
            >
              {post.description}
            </Text>
            
            {post.description.length > 150 && (
              <TouchableOpacity 
                onPress={() => setShowFullDescription(!showFullDescription)}
                style={styles.showMoreButton}
              >
                <Text style={[styles.showMoreText, { color: theme.colors.primary }]}>
                  {showFullDescription ? 'Voir moins' : 'Voir plus'}
                </Text>
              </TouchableOpacity>
            )}

            {post.photos && post.photos.length > 0 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.photosScrollView}
              >
                <View style={styles.photosContainer}>
                  {post.photos.map((photo, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.photoWrapper}
                      onPress={() => {
                        setSelectedImageIndex(index);
                        setShowImageViewer(true);
                      }}
                    >
                      <Image
                        source={{ uri: photo }}
                        style={styles.photo}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400)}
            style={styles.metadata}
          >
            <Chip
              icon={() => <MaterialCommunityIcons name="tag" size={16} color={theme.colors.secondary} />}
              mode="flat"
              style={[styles.categoryChip, {
                backgroundColor: theme.colors.background,
                color: theme.colors.secondary
              }]}
            >
              {post.category}
            </Chip>
          </Animated.View>

          {renderResponses()}
        </Surface>
      </Animated.ScrollView>

      {renderActionButtons()}

      <ImageViewerModal
        visible={showImageViewer}
        images={post.photos || []}
        initialIndex={selectedImageIndex}
        onClose={() => setShowImageViewer(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 8,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfoText: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontWeight: '600',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    marginLeft: 4,
    flex: 1,
  },
  distanceText: {
    marginLeft: 4,
  },
  mainContent: {
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
    fontWeight: '600',
  },
  description: {
    lineHeight: 24,
  },
  showMoreButton: {
    marginTop: 8,
  },
  showMoreText: {
    fontWeight: '500',
  },
  photosScrollView: {
    marginTop: 16,
  },
  photosContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  photoWrapper: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  responsesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  responseName: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 24,
    marginBottom: 8,
    elevation: 0,
    borderWidth: 0,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
    padding: 8,
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  noResponsesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  noResponsesText: {
    fontSize: 16,
    fontWeight: '500',
  },
  noResponsesSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  responsesContainer: {
    marginTop: 24,
  },
  responseIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  responseCard: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  responseUserInfo: {
    flexDirection: 'row',
    padding: 12,
  },
  responseAvatar: {
    marginRight: 12,
  },
  responseTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  ratingStarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  starIcon: {
    marginRight: 2,
  },
  reviewCount: {
    fontSize: 12,
    marginLeft: 4,
  },
  responseTimeContainer: {
    lineHeight: 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  responseTimeText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 0,
  },
});

export default PostDetailScreen;
