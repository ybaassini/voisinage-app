import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';

import { Text, Card, Chip, useTheme, IconButton, Avatar, ActivityIndicator } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import TimeAgo from '../components/TimeAgo';
import { postService } from '../services/postService';
import { Post } from '../types/post';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../theme/theme';
import { convertToDate, formatRelativeTime } from '../utils/dateUtils';

const HomeScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [postSheetVisible, setPostSheetVisible] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10); // Rayon de recherche en km

  const { userProfile } = useAuth();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      let fetchedPosts: Post[] = [];

      if (userProfile?.location?.coordinates) {
        // Convertir le rayon de km en mètres
        const radiusInMeters = searchRadius * 1000;

        // Récupérer les posts à proximité si on a les coordonnées de l'utilisateur
        fetchedPosts = await postService.getNearbyPosts(
          userProfile.location.coordinates.latitude,
          userProfile.location.coordinates.longitude,
          radiusInMeters
        );
      }

      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Erreur lors de la récupération des posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userProfile?.location, searchRadius]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = useCallback((postId: string) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  }, []);

  const navigateToPostDetail = useCallback((post: Post) => {
    navigation.navigate('PostDetail', { post });
  }, [navigation]);

  const handleReply = async (post: Post) => {
    try {
      // Naviguer vers le chat
      navigation.navigate('Chat', {
        postId: post.id,
        recipient: post.requestor,
      });
    } catch (error) {
      console.error('Erreur lors de la réponse:', error);
    }
  };

  const renderPostHeader = useCallback(({ item }: { item: Post }) => (
    <View style={styles.cardHeader}>
      <View style={styles.userInfo}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.requestor.id })}>
          <Avatar.Image
            size={40}
            source={{ uri: item.requestor.avatar }}
          />
        </TouchableOpacity>
        <View style={styles.userInfoText}>
          <Text variant="titleMedium">{`${item.requestor.firstName} ${item.requestor.lastName}`}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {item.distance !== undefined ? (
              <View style={styles.distanceContainer}>
                <MaterialCommunityIcons
                  name="map-marker-distance"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text style={styles.distance}>{item.distance.toFixed(1)} km</Text>
              </View>
            ) : (
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color={theme.colors.onSurfaceVariant}
              />
            )}
          </Text>
        </View>
      </View>
      <View style={styles.responseTimeContainer}>
        <Text style={[styles.responseTimeText, { color: theme.colors.onSurfaceVariant }]}>
          posté
        </Text>
        <TimeAgo
          date={convertToDate(item.createdAt)} 
        />
      </View>
    </View>
  ), [theme.colors.onSurfaceVariant, navigation]);

  const renderPostActions = useCallback(({ item }: { item: Post }) => (
    <Card.Actions style={styles.actionBanner}>
      <View style={styles.actionLeft}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <MaterialCommunityIcons
            name={likedPosts[item.id] ? "heart" : "heart-outline"}
            size={24}
            color={likedPosts[item.id] ? theme.colors.error : theme.colors.onSurfaceVariant}
          />
          <Text style={[styles.actionText, {
            color: likedPosts[item.id] ? theme.colors.error : theme.colors.onSurfaceVariant
          }]}>
            J'aime
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionRight}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleReply(item)}
        >
          <MaterialCommunityIcons
            name="message-reply-text-outline"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={[styles.actionText, { color: theme.colors.primary }]}>
            Répondre
          </Text>
        </TouchableOpacity>
      </View>
    </Card.Actions>
  ), [theme.colors, likedPosts, handleLike, handleReply]);

  const renderItem = useCallback(({ item, index }: { item: Post; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.cardContainer}
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => navigateToPostDetail(item)}>
          <Card.Content style={styles.cardContent}>
            {renderPostHeader({ item })}

            <Chip
              icon={() => <MaterialCommunityIcons name="tag" size={16} color={theme.colors.onPrimary} />}
              mode="flat"
              style={[styles.categoryChip, { color: theme.colors.secondary }]}
            >
              {item.category}
            </Chip>

            <Text variant="bodyLarge"
              numberOfLines={3}
              style={[styles.description]}
            >
              {item.description}
            </Text>

            {item.photos && item.photos?.length > 0 && (
              <Card.Cover
                source={{ uri: item.photos[0] }}
                style={styles.coverImage}
              />
            )}
          </Card.Content>
        </TouchableOpacity>

        {renderPostActions({ item })}
      </Card>
    </Animated.View>
  ), [theme.colors, renderPostHeader, renderPostActions, navigateToPostDetail]);

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <IconButton icon="refresh" size={24} onPress={fetchPosts} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Aucune demande trouvée {userProfile?.location?.coordinates ? `dans un rayon de ${searchRadius}km` : ''}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  list: {
    padding: 8,
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
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 10,
    elevation: 0,
    shadowColor: 'transparent',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfoText: {
    marginLeft: 12,
  },
  categoryChip: {
    backgroundColor: theme.colors.secondary,
    color: theme.colors.onPrimary,
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 24,
    marginBottom: 8,
    elevation: 0,
    borderWidth: 0,
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  coverImage: {
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  actionBanner: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionLeft: {
    flexDirection: 'row',
    width: '50%',
  },
  actionRight: {
    flexDirection: 'row',
    width: '50%',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    width: 56,
    height: 56,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
  },
});

export default HomeScreen;
