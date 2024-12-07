import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, useTheme, IconButton, Avatar, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TimeAgo from '../components/TimeAgo';
import { postService } from '../services/postService';
import { Post } from '../types/post';
import { CATEGORIES } from '../constants/categories';
import PostBottomSheet from '../components/PostBottomSheet';

const HomeScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [postSheetVisible, setPostSheetVisible] = useState(false);

  const fetchPosts = async () => {
    try {
      setError(null);
      const fetchedPosts = await postService.getPosts();
      setPosts(fetchedPosts);
    } catch (err) {
      console.error('Erreur lors de la récupération des posts:', err);
      setError('Impossible de charger les demandes. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  const handleLike = useCallback((postId: string) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  }, []);

  const navigateToChat = useCallback((item: Post) => {
    navigation.navigate('Chat', { 
      postId: item.id,
      recipientName: item.requestor.name,
      recipientAvatar: item.requestor.avatar,
      recipientId: item.requestor.id,
    });
  }, [navigation]);

  const navigateToPostDetail = useCallback((post: Post) => {
    navigation.navigate('PostDetail', { post });
  }, [navigation]);

  const renderPostHeader = useCallback(({ item }: { item: Post }) => (
    <View style={styles.cardHeader}>
      <View style={styles.userInfo}>
        <Avatar.Image 
          size={40} 
          source={{ uri: item.requestor.avatar }} 
          defaultSource={require('../assets/default-avatar.png')}
        />
        <View style={styles.userInfoText}>
          <Text variant="titleMedium">{item.requestor.name}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {item.location.address}
          </Text>
        </View>
      </View>
      <TimeAgo date={item.createdAt} style={{ color: theme.colors.onSurfaceVariant }} />
    </View>
  ), [theme.colors.onSurfaceVariant]);

  const renderPostActions = useCallback(({ item }: { item: Post }) => (
    <Card.Actions style={styles.actionBanner}>
      <View style={styles.actionLeft}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <Icon
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
          onPress={() => navigateToChat(item)}
        >
          <Icon
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
  ), [theme.colors, likedPosts, handleLike, navigateToChat]);

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
              icon={() => <Icon name="tag" size={16} color={theme.colors.secondary} />}
              mode="flat"
              style={[styles.categoryChip, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.secondary 
              }]}
            >
              {item.category}
            </Chip>

            <Text variant="bodyLarge" 
              numberOfLines={3} 
              style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
            >
              {item.description}
            </Text>

            {item.photos?.length > 0 && (
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

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.centerContainer}>
            <Text>Aucune demande trouvée</Text>
          </View>
        )}
      />
    </SafeAreaView>
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
    padding: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionLeft: {
    flexDirection: 'row',
  },
  actionRight: {
    flexDirection: 'row',
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
});

export default HomeScreen;
