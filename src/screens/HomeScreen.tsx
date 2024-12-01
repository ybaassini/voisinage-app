import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Chip, useTheme, Searchbar, IconButton, Surface, Avatar, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TouchableOpacity } from 'react-native';
import TimeAgo from '../components/TimeAgo';
import { postService } from '../services/postService';
import { Post } from '../types/post';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const HomeScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Tout', icon: 'view-grid' },
    { id: 'tools', label: 'Outils', icon: 'tools' },
    { id: 'services', label: 'Services', icon: 'account-wrench' },
    { id: 'sports', label: 'Sports', icon: 'basketball' },
    { id: 'education', label: 'Éducation', icon: 'school' },
  ];

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
  }, []); // Charger les posts au montage du composant

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  const handleLike = (postId: string) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const renderItem = ({ item, index }: { item: Post; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.cardContainer}
    >
      <Card 
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            elevation: 0,
            shadowColor: 'transparent', // Supprime l'ombre
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0,
            shadowRadius: 0,
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('PostDetail', { post: item })}
        >
          <Card.Content style={styles.cardContent}>
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
            
            <Chip
              icon={() => (
                <Icon name="tag" size={16} color={theme.colors.secondary} />
            )}
              
              mode="flat"
              style={[styles.categoryChip, { backgroundColor: theme.colors.background, color: theme.colors.secondary }]}
            >
              {item.category}
            </Chip>

            <Text variant="bodyLarge" numberOfLines={3} style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              {item.description}
            </Text>

            {item.photos && item.photos.length > 0 && (
              <Card.Cover 
                source={{ uri: item.photos[0] }} 
                style={styles.coverImage}
              />
            )}
          </Card.Content>
        </TouchableOpacity>

        <Card.Actions style={[styles.actionBanner,{
          justifyContent: 'space-between',
        }]}>
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
              <Text
                style={[
                  styles.actionText,
                  { color: likedPosts[item.id] ? theme.colors.error : theme.colors.onSurfaceVariant }
                ]}
              >
                J'aime
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionRight}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Chat', { 
                postId: item.id,
                recipientName: item.requestor.name,
                recipientAvatar: item.requestor.avatar,
                recipientId: item.requestor.id,
              })}
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
      </Card>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <IconButton
            icon="refresh"
            size={24}
            onPress={fetchPosts}
          />
        </View>
      ) : loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
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
      )}
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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 24,
    marginBottom: 8,
    shadowColor: 'transparent', // Supprime l'ombre
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    borderWidth: 0,
    borderStyle: 'solid',
    elevation: 0,
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
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
    display: 'flex',
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
});

export default HomeScreen;
