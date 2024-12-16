import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Avatar, useTheme, Button, Surface, Chip, IconButton, Image } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { UserProfile } from '../types/user';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { theme } from '../theme/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'accueil' | 'photos' | 'avis';

const ProfileScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { userProfile: currentUserProfile } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('accueil');

  // Récupérer l'userId des paramètres de route s'il existe
  const userId = route.params?.userId;
  const isCurrentUser = !userId || (currentUserProfile && userId === currentUserProfile.id);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        let profile: UserProfile | null;

        if (isCurrentUser) {
          profile = currentUserProfile;
        } else {
          profile = await userService.getUserProfile(userId);
        }

        if (!profile) {
          throw new Error('Profil non trouvé');
        }

        setProfileData(profile);
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        setError('Impossible de charger le profil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, currentUserProfile, isCurrentUser]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (error || !profileData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error || 'Profil non trouvé'}</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Retour
        </Button>
      </View>
    );
  }

  const memberSince = formatDistanceToNow(
    new Date(profileData.createdAt),
    { addSuffix: true, locale: fr }
  );

  const renderHeader = () => (
    <Animated.View
      entering={FadeInDown.duration(1000).springify()}
      style={styles.header}
    >
      <Surface style={[styles.profileCard]} elevation={1}>
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={120}
            source={{ uri: profileData.avatar }}
            style={styles.avatar}
          />
          {isCurrentUser && (
            <IconButton
              icon="pencil"
              size={20}
              style={styles.editAvatarButton}
              onPress={() => {/* TODO: Implémenter la modification de l'avatar */ }}
            />
          )}
        </View>

        <View style={styles.userInfo}>
          <Text variant="headlineSmall" style={styles.name}>
            {`${profileData.firstName} ${profileData.lastName}`}
          </Text>

          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons
              name="star"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={[styles.rating, { color: theme.colors.primary }]}>
              {profileData.rating.average.toFixed(1)} ({profileData.rating.count} avis)
            </Text>
          </View>

          <Text style={[styles.memberSince, { color: theme.colors.onSurfaceVariant }]}>
            Membre {memberSince}
          </Text>

          {!isCurrentUser && (
            <Button
              mode="contained"
              icon="message"
              style={styles.messageButton}
              onPress={() => navigation.navigate('Chat', {
                conversationId: null,
                recipient: profileData,
                postId: null
              })}
            >
              Envoyer un message
            </Button>
          )}
        </View>
      </Surface>
    </Animated.View>
  );

  const renderTabs = () => (
    <Surface style={[styles.tabsContainer, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'accueil' && styles.activeTab,
          { borderBottomColor: theme.colors.primary }
        ]}
        onPress={() => setActiveTab('accueil')}
      >
        <Text style={[
          styles.tabText,
          { color: activeTab === 'accueil' ? theme.colors.primary : theme.colors.onSurfaceVariant }
        ]}>
          Accueil
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'photos' && styles.activeTab,
          { borderBottomColor: theme.colors.primary }
        ]}
        onPress={() => setActiveTab('photos')}
      >
        <Text style={[
          styles.tabText,
          { color: activeTab === 'photos' ? theme.colors.primary : theme.colors.onSurfaceVariant }
        ]}>
          Photos
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'avis' && styles.activeTab,
          { borderBottomColor: theme.colors.primary }
        ]}
        onPress={() => setActiveTab('avis')}
      >
        <Text style={[
          styles.tabText,
          { color: activeTab === 'avis' ? theme.colors.primary : theme.colors.onSurfaceVariant }
        ]}>
          Avis
        </Text>
      </TouchableOpacity>
    </Surface>
  );

  const renderAccueilContent = () => (
    <>
      <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
        <Surface style={[styles.sectionCard]} elevation={1}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.sectionTitle}>À propos</Text>
          </View>
          <Text style={styles.bio}>{profileData.bio || 'Aucune bio renseignée'}</Text>
        </Surface>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
        <Surface style={[styles.sectionCard]} elevation={1}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="lightbulb" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.sectionTitle}>Compétences</Text>
          </View>
          <View style={styles.skillsContainer}>
            {profileData.skills && profileData.skills.length > 0 ? (
              profileData.skills.map((skill, index) => (
                <Chip
                icon={() => <MaterialCommunityIcons name="tag" size={16} color={theme.colors.secondary} />}
                mode="flat"
                style={[styles.categoryChip, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.secondary 
                }]}
              >
                {skill.name}
              </Chip>
              ))
            ) : (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                Aucune compétence renseignée
              </Text>
            )}
          </View>
        </Surface>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
        <Surface style={[styles.sectionCard]} elevation={1}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="map-marker" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.sectionTitle}>Localisation</Text>
          </View>
          <Text style={styles.location}>{profileData.location.address}</Text>
        </Surface>
      </Animated.View>
    </>
  );

  const renderPhotosContent = () => (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
      <Surface style={[styles.sectionCard]} elevation={1}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="image-multiple" size={24} color={theme.colors.primary} />
          <Text variant="titleMedium" style={styles.sectionTitle}>Portfolio</Text>
        </View>
        <View style={styles.photosGrid}>
          {profileData.portfolio && profileData.portfolio.length > 0 ? (
            profileData.portfolio.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image
                  source={{ uri: photo.url }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              </View>
            ))
          ) : (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Aucune photo dans le portfolio
            </Text>
          )}
        </View>
      </Surface>
    </Animated.View>
  );

  const renderAvisContent = () => {
    const ratings = [
      { rating: 5, percentage: 98 },
      { rating: 4, percentage: 2 },
      { rating: 3, percentage: 0 },
      { rating: 2, percentage: 0 },
      { rating: 1, percentage: 0 },
    ];

    return (
      <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
        <Surface style={[styles.sectionCard]} elevation={1}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="star" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.sectionTitle}>Avis</Text>
          </View>
          <View style={styles.reviewsContainer}>
            <View style={styles.ratingOverview}>
              <View style={styles.ratingStarContainer}>
                <MaterialCommunityIcons name="star" size={32} color="#F4B95F" />
                <Text style={styles.ratingValue}>{profileData.rating.average.toFixed(1)}/5</Text>
              </View>
              <Text style={styles.ratingCount}>
                Basé sur {profileData.rating.count} avis
              </Text>
            </View>

            <View style={styles.ratingBars}>
              {ratings.map((item) => (
                <View key={item.rating} style={styles.ratingBarRow}>
                  <Text style={styles.ratingNumber}>{item.rating}</Text>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${item.percentage}%`,
                          backgroundColor: item.percentage > 0 ? '#F4B95F' : '#F5F5F5'
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.percentageText}>
                    {item.percentage > 0 ? `${item.percentage}%` : '-'}
                  </Text>
                </View>
              ))}
            </View>

            {profileData.reviews && profileData.reviews.length > 0 ? (
              <View style={styles.reviewsList}>
                {profileData.reviews.map((review, index) => (
                  <View key={index} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <Avatar.Image size={40} source={{ uri: review.reviewer.avatar }} />
                      <View style={styles.reviewerInfo}>
                        <Text style={styles.reviewerName}>
                          {review.reviewer.firstName} {review.reviewer.lastName}
                        </Text>
                        <Text style={styles.reviewDate}>
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: fr })}
                        </Text>
                      </View>
                      <View style={styles.reviewRating}>
                        <MaterialCommunityIcons name="star" size={16} color={theme.colors.primary} />
                        <Text style={styles.reviewRatingText}>{review.rating}</Text>
                      </View>
                    </View>
                    <Text style={styles.reviewContent}>{review.content}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 16 }}>
                Aucun avis pour le moment
              </Text>
            )}
          </View>
        </Surface>
      </Animated.View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'accueil':
        return renderAccueilContent();
      case 'photos':
        return renderPhotosContent();
      case 'avis':
        return renderAvisContent();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderTabs()}
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  profileCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#E1E1E1',
  },
  editAvatarButton: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    backgroundColor: 'white',
  },
  userInfo: {
    alignItems: 'center',
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
  name: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
  },
  rating: {
    marginLeft: 4,
    fontWeight: '500',
  },
  memberSince: {
    marginBottom: 16,
  },
  messageButton: {
    marginTop: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 8,
    fontWeight: '600',
  },
  bio: {
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    marginBottom: 8,
  },
  location: {
    lineHeight: 20,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoContainer: {
    width: (SCREEN_WIDTH - 48) / 2,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  reviewsContainer: {
    gap: 16,
    backgroundColor: theme.colors.surface,
  },
  ratingOverview: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingStarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  ratingValue: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  ratingCount: {
    fontSize: 15,
    color: theme.colors.onSurfaceVariant,
  },
  ratingBars: {
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingNumber: {
    width: 24,
    fontSize: 15,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    width: 40,
    fontSize: 15,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'right',
  },
  reviewsList: {
    gap: 16,
  },
  reviewItem: {
    gap: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerName: {
    fontWeight: '500',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewRatingText: {
    fontWeight: '500',
  },
  reviewContent: {
    lineHeight: 20,
  },
  errorText: {
    marginBottom: 16,
    color: 'red',
  },
});

export default ProfileScreen;
