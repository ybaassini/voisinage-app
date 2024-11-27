import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Text, Avatar, Card, Button, IconButton, useTheme, MD3Theme, Surface } from 'react-native-paper';
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

// Types pour les réponses et le post
type Response = {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    responseTime: string;
  };
  message: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
};

type Post = {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
  };
  timestamp: string;
  responses: Response[];
};

// Données mockées pour le développement
const mockPost: Post = {
  id: '1',
  title: 'Besoin d\'aide pour déménagement',
  description: 'Je cherche quelqu\'un pour m\'aider à déménager ce weekend. J\'ai principalement des cartons et quelques meubles légers. Le déménagement se fera dans le même quartier.',
  category: 'Aide',
  image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea',
  user: {
    id: '1',
    name: 'Marie Laurent',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    rating: 4.5,
  },
  timestamp: '2024-02-15T10:00:00Z',
  responses: [
    {
      id: '1',
      user: {
        id: '2',
        name: 'Thomas Martin',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        rating: 4.8,
        responseTime: '< 1h',
      },
      message: 'Je suis disponible samedi matin pour vous aider !',
      timestamp: '2024-02-15T10:30:00Z',
      status: 'pending',
    },
    {
      id: '2',
      user: {
        id: '3',
        name: 'Sophie Dubois',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        rating: 4.2,
        responseTime: '2h',
      },
      message: 'Je peux vous aider dimanche après-midi si ça vous convient.',
      timestamp: '2024-02-15T11:00:00Z',
      status: 'pending',
    },
  ],
};

const PostDetailScreen = () => {
  const theme = useTheme<MD3Theme>();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const post = route.params?.post || mockPost;
  
  const screenWidth = Dimensions.get('window').width;
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  const scrollY = useSharedValue(0);

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

  const renderRating = (rating: number | undefined) => {
    if (rating === undefined) return null;
    
    return (
      <Animated.View 
        entering={FadeInRight.delay(300)} 
        style={styles.ratingContainer}
      >
        <MaterialCommunityIcons name="star" size={16} color={theme.colors.primary} />
        <Text style={[styles.ratingText, { color: theme.colors.onSurface }]}>{rating.toFixed(1)}</Text>
      </Animated.View>
    );
  };

  const renderResponseTime = (time: string) => {
    return (
      <Animated.View 
        entering={FadeInRight.delay(400)} 
        style={styles.responseTimeContainer}
      >
        <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.primary} />
        <Text style={[styles.responseTimeText, { color: theme.colors.onSurface }]}>{time}</Text>
      </Animated.View>
    );
  };

  const renderUserInfo = (user: Post['user'] | Response['user']) => {
    return (
      <Animated.View 
        entering={FadeInDown.delay(200)} 
        style={styles.userContainer}
      >
        <TouchableOpacity>
          <Avatar.Image size={40} source={{ uri: user.avatar }} />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            {user.name}
          </Text>
          {user.rating !== undefined && renderRating(user.rating)}
          {'responseTime' in user && renderResponseTime(user.responseTime)}
        </View>
      </Animated.View>
    );
  };

  const renderResponse = (response: Response, index: number) => {
    const isSelected = selectedResponse === response.id;
    
    return (
      <Animated.View
        entering={SlideInRight.delay(index * 200)}
        layout={Layout.springify()}
        key={response.id}
      >
        <Card 
          style={[
            styles.responseCard,
            isSelected && [styles.selectedCard, { borderColor: theme.colors.primary }],
          ]}
          onPress={() => setSelectedResponse(isSelected ? null : response.id)}
        >
          <Card.Content>
            {renderUserInfo(response.user)}
            <Text style={[styles.responseMessage, { color: theme.colors.onSurface }]}>
              {response.message}
            </Text>
            
            {isSelected && (
              <Animated.View 
                entering={FadeInDown}
                style={styles.responseActions}
              >
                <Button
                  mode="contained"
                  onPress={() => {}}
                  style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                  icon="check"
                >
                  Accepter
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {}}
                  style={styles.actionButton}
                  textColor={theme.colors.error}
                  icon="close"
                >
                  Refuser
                </Button>
                <IconButton
                  icon="message-outline"
                  mode="contained-tonal"
                  onPress={() => navigation.navigate('Chat')}
                  style={styles.messageButton}
                />
              </Animated.View>
            )}
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Animated.ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.imageContainer, headerStyle]}>
          <Image
            source={{ uri: post.image }}
            style={[styles.image, { width: screenWidth }]}
          />
          <View style={[styles.gradient, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
          <Animated.Text 
            entering={FadeIn.delay(300)}
            style={[styles.imageTitle, { color: theme.colors.surface }]}
          >
            {post.title}
          </Animated.Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100)}>
          <Card style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              {renderUserInfo(post.user)}
              
              <View style={styles.categoryContainer}>
                <Surface style={[styles.categoryChip, { backgroundColor: theme.colors.primaryContainer }]}>
                  <MaterialCommunityIcons name="tag" size={18} color={theme.colors.primary} />
                  <Text style={[styles.category, { color: theme.colors.primary }]}>
                    {post.category}
                  </Text>
                </Surface>
              </View>

              <TouchableOpacity 
                onPress={() => setShowFullDescription(!showFullDescription)}
                style={styles.descriptionContainer}
              >
                <Text 
                  variant="bodyLarge" 
                  style={[styles.description, { color: theme.colors.onSurface }]}
                  numberOfLines={showFullDescription ? undefined : 3}
                >
                  {post.description}
                </Text>
                {post.description.length > 150 && (
                  <Text style={[styles.readMore, { color: theme.colors.primary }]}>
                    {showFullDescription ? 'Voir moins' : 'Lire la suite'}
                  </Text>
                )}
              </TouchableOpacity>

              <Text variant="bodySmall" style={[styles.timestamp, { color: theme.colors.onSurfaceVariant }]}>
                Publié le {new Date(post.timestamp).toLocaleDateString()}
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>

        <View style={styles.responsesSection}>
          <Text variant="titleLarge" style={[styles.responseTitle, { color: theme.colors.onSurface }]}>
            Réponses ({post.responses?.length || 0})
          </Text>
          {post.responses?.map((response, index) => renderResponse(response, index))}
        </View>
      </Animated.ScrollView>

      <Animated.View 
        entering={FadeInDown.delay(500)}
        style={[styles.actionBanner, { backgroundColor: theme.colors.surface }]} 
        elevation={4}
      >
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonContainer]}
            onPress={() => setIsLiked(!isLiked)}
          >
            <MaterialCommunityIcons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? theme.colors.error : theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.actionText,
                { color: isLiked ? theme.colors.error : theme.colors.onSurfaceVariant }
              ]}
            >
              J'aime
            </Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={() => navigation.navigate('Chat')}
            icon="message-reply-text-outline"
            style={styles.replyButton}
          >
            Répondre
          </Button>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  image: {
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageTitle: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  contentCard: {
    margin: 16,
    marginTop: -30,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  responseTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  responseTimeText: {
    marginLeft: 4,
    fontSize: 14,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  category: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  description: {
    marginBottom: 8,
    lineHeight: 22,
  },
  readMore: {
    fontWeight: '600',
  },
  timestamp: {
    opacity: 0.7,
  },
  responsesSection: {
    padding: 16,
  },
  responseTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  responseCard: {
    marginBottom: 12,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  selectedCard: {
    borderWidth: 2,
    borderRadius: 16,
  },
  responseMessage: {
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 20,
  },
  responseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  messageButton: {
    marginLeft: 8,
  },
  actionBanner: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  replyButton: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 12,
  },
});

export default PostDetailScreen;
