import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Chip, useTheme, Searchbar, IconButton, Surface, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TouchableOpacity } from 'react-native';
import TimeAgo from '../components/TimeAgo';

const HomeScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});

  const handleLike = (postId: string) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const categories = [
    { id: 'all', label: 'Tout', icon: 'view-grid' },
    { id: 'tools', label: 'Outils', icon: 'tools' },
    { id: 'services', label: 'Services', icon: 'account-wrench' },
    { id: 'sports', label: 'Sports', icon: 'basketball' },
    { id: 'education', label: 'Éducation', icon: 'school' },
  ];

  const mockAnnouncements = [
    {
      id: '1',
      title: 'Prêt de perceuse professionnelle',
      description: 'Perceuse Bosch Professional disponible pour prêt ce weekend. Idéale pour les travaux de rénovation.',
      category: 'Outils',
      user: {
        name: 'Marie D.',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        rating: 4.8,
      },
      rating: 4.8,
      distance: '200m',
      timestamp: new Date().getTime(),
      responses: [],
    },
    {
      id: '2',
      title: 'Cours de guitare personnalisés',
      description: 'Je propose des cours de guitare pour débutants. Apprentissage adapté à votre niveau et à vos objectifs.',
      category: 'Services',
      user: {
        name: 'Pierre M.',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        rating: 4.9,
      },
      rating: 4.9,
      distance: '500m',
      timestamp: new Date().getTime(),
      responses: [],
    },
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simuler un chargement
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderItem = ({ item, index }: any) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.cardContainer}
    >
      <Card 
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
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
                  source={{ uri: item.user.avatar }} 
                />
                <View style={styles.userInfoText}>
                  <Text variant="titleMedium">{item.user.name}</Text>
                  {item.user.rating !== undefined && (
                    <View style={styles.ratingContainer}>
                      <MaterialCommunityIcons 
                        name="star" 
                        size={16} 
                        color={theme.colors.primary} 
                      />
                      <Text style={styles.rating}>
                        {item.user.rating.toFixed(1)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <TimeAgo date={new Date(item.timestamp)} style={{ color: theme.colors.onSurfaceVariant, alignSelf: 'flex-end' }} />
            </View>

            <Text variant="titleLarge" style={styles.title}>
              {item.title}
            </Text>
            <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
              {item.description}
            </Text>

            <View style={styles.footer}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {new Date(item.timestamp).toLocaleDateString()}
              </Text>
              <View style={styles.stats}>
                <View style={styles.stat}>
                  <MaterialCommunityIcons 
                    name="message-outline" 
                    size={16} 
                    color={theme.colors.onSurfaceVariant} 
                  />
                  <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                    {item.responses?.length || 0}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </TouchableOpacity>

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
              onPress={() => navigation.navigate('Chat')}
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

      <FlatList
        data={mockAnnouncements}
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
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfoText: {
    marginLeft: 8,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    opacity: 0.7,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
  },
  actionBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  actionRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  actionText: {
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default HomeScreen;
