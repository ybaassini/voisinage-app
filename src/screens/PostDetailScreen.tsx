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
import { Text, Avatar, Card, Button, IconButton, useTheme, MD3Theme, Surface, Chip } from 'react-native-paper';
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
import { useAuthContext } from '../contexts/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';

const PostDetailScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const { user } = useAuthContext();
  const requireAuth = useRequireAuth();
  const [post, setPost] = useState<Post | null>(route.params?.post || null);
  const [loading, setLoading] = useState(!route.params?.post);
  const [error, setError] = useState<string | null>(null);
  
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

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(scrollY.value, [0, 100], [250, 150], 'clamp'),
      opacity: interpolate(scrollY.value, [0, 100], [1, 0.8], 'clamp'),
    };
  });

  const handleContactPress = () => {
    navigation.navigate('Chat', { postId: post?.id });
  };

  const handleLocationPress = () => {
    if (post?.location.coordinates) {
      const { latitude, longitude } = post.location.coordinates;
      const url = Platform.select({
        ios: `maps://app?saddr=Current%20Location&daddr=${latitude},${longitude}`,
        android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
      });
      
      Linking.canOpenURL(url!).then(supported => {
        if (supported) {
          Linking.openURL(url!);
        } else {
          Linking.openURL(
            `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
          );
        }
      });
    }
  };

  const handleReply = () => {
    requireAuth(() => {
      navigation.navigate('Chat', {
        conversationId: undefined,
        postId: post.id,
        recipientId: post.requestor.id,
      });
    });
  };

  const handleLike = async () => {
    requireAuth(async () => {
      try {
        await postService.toggleLike(post.id, user.uid);
        // Mettre à jour l'état local du post
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {post.photos && post.photos.length > 0 && (
          <Animated.View style={[styles.imageContainer, headerStyle]}>
            <Image
              source={{ uri: post.photos[0] }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
          </Animated.View>
        )}

        <Surface style={styles.contentContainer}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
            <View style={styles.userContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: post.requestor.id })}>
                <Avatar.Image
                  size={50}
                  source={{ uri: post.requestor.avatar }}
                  defaultSource={require('../assets/default-avatar.png')}
                />
              </TouchableOpacity>
              <View style={styles.userInfo}>
                <Text variant="titleMedium">{post.requestor.name}</Text>
                <TimeAgo date={post.createdAt} style={{ color: theme.colors.onSurfaceVariant }} />
              </View>
            </View>

            <Chip
              icon="tag"
              mode="flat"
              style={[styles.categoryChip, { backgroundColor: theme.colors.primaryContainer }]}
            >
              {post.category}
            </Chip>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={styles.descriptionContainer}>
            <Text
              variant="bodyLarge"
              style={[styles.description, { color: theme.colors.onSurface }]}
              numberOfLines={showFullDescription ? undefined : 3}
            >
              {post.description}
            </Text>
            {post.description.length > 150 && (
              <TouchableOpacity
                onPress={() => setShowFullDescription(!showFullDescription)}
                style={styles.readMoreButton}
              >
                <Text style={{ color: theme.colors.primary }}>
                  {showFullDescription ? 'Voir moins' : 'Voir plus'}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)} style={styles.locationContainer}>
            <Surface style={styles.locationCard}>
              <TouchableOpacity onPress={handleLocationPress} style={styles.locationContent}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.locationText}>
                  <Text variant="titleSmall">Localisation</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {post.location.address}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </Surface>
          </Animated.View>

          {post.photos && post.photos.length > 1 && (
            <Animated.View entering={FadeInDown.delay(500)} style={styles.photosContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Photos</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.photosScroll}
              >
                {post.photos.map((photo, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      // TODO: Ajouter une vue plein écran pour les photos
                    }}
                  >
                    <Image
                      source={{ uri: photo }}
                      style={styles.thumbnailImage}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          )}
        </Surface>
      </Animated.ScrollView>

      <Animated.View
        entering={FadeInDown}
        style={[styles.bottomBar, { backgroundColor: theme.colors.surface }]}
      >
        {renderActionButtons()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    marginBottom: 16,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  description: {
    lineHeight: 24,
  },
  readMoreButton: {
    marginTop: 8,
  },
  locationContainer: {
    marginBottom: 24,
  },
  locationCard: {
    borderRadius: 12,
    elevation: 2,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  locationText: {
    flex: 1,
    marginLeft: 12,
  },
  photosContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  photosScroll: {
    flexGrow: 0,
  },
  thumbnailImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  replyButton: {
    flex: 1,
    marginRight: 8,
  },
  likeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
});

export default PostDetailScreen;
