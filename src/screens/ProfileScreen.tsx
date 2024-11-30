import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text, Avatar, Button, Surface, useTheme, TextInput, Chip, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useUserContext } from '../contexts/UserContext';

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { 
    userProfile,
    loading,
    error,
    updateProfile,
    updateAvatar,
    addSkill,
    removeSkill,
    addPortfolioItem,
    removePortfolioItem,
    refreshProfile
  } = useUserContext();

  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);

  // Log du contexte utilisateur
  useEffect(() => {
    console.log('UserContext State:', {
      userProfile,
      loading,
      error,
      isEditing
    });
  }, [userProfile, loading, error, isEditing]);

  // Rafraîchir le profil au montage du composant
  useEffect(() => {
    refreshProfile();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon={isEditing ? "check" : "pencil"}
          mode="contained"
          onPress={handleEditToggle}
          style={{ marginRight: 8 }}
        />
      ),
    });
  }, [isEditing, navigation]);

  const handleEditToggle = async () => {
    if (isEditing && userProfile) {
      try {
        await updateProfile({
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          bio: userProfile.bio,
          location: userProfile.location,
        });
        Alert.alert('Succès', 'Profil mis à jour avec succès');
      } catch (err) {
        Alert.alert('Erreur', 'Impossible de mettre à jour le profil. Veuillez réessayer.');
      }
    }
    setIsEditing(!isEditing);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace('Auth');
            } catch (error) {
              Alert.alert(
                'Erreur',
                'Une erreur est survenue lors de la déconnexion. Veuillez réessayer.',
                [{ text: 'OK' }]
              );
            }
          }
        },
      ]
    );
  };

  const pickImage = async (isAvatar = false) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: isAvatar ? [1, 1] : [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const imageUri = result.assets[0].uri;
        if (isAvatar) {
          await updateAvatar(imageUri);
        } else {
          await addPortfolioItem(imageUri, '');
        }
      } catch (err) {
        Alert.alert('Erreur', 'Impossible de mettre à jour l\'image. Veuillez réessayer.');
      }
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;

    try {
      await addSkill(newSkill.trim(), 1);
      setNewSkill('');
      setShowSkillInput(false);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible d\'ajouter la compétence. Veuillez réessayer.');
    }
  };

  const handleRemoveSkill = async (skillName: string) => {
    try {
      await removeSkill(skillName);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de supprimer la compétence. Veuillez réessayer.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text variant="bodyLarge" style={{ marginBottom: 16 }}>
          {error}
        </Text>
        <Button mode="contained" onPress={refreshProfile}>
          Réessayer
        </Button>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text variant="bodyLarge" style={{ marginBottom: 16 }}>
          Profil non trouvé
        </Text>
        <Button mode="contained" onPress={() => navigation.replace('Auth')}>
          Se connecter
        </Button>
      </View>
    );
  }

  const renderSection = (title: string, children: React.ReactNode) => (
    <Animated.View
      entering={FadeInDown.springify()}
      style={[styles.section, { backgroundColor: theme.colors.surface }]}
    >
      <Text variant="titleMedium" style={styles.sectionTitle}>{title}</Text>
      {children}
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <Surface style={[styles.profileHeader, { backgroundColor: theme.colors.background }]}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              size={100}
              source={{ uri: userProfile.avatar || 'https://via.placeholder.com/150' }}
            />
            {isEditing && (
              <IconButton
                icon="camera"
                mode="contained"
                size={20}
                onPress={() => pickImage(true)}
                style={styles.editAvatarButton}
              />
            )}
          </View>
          
          {isEditing ? (
            <TextInput
              mode="outlined"
              value={`${userProfile.firstName} ${userProfile.lastName}`}
              onChangeText={(text) => {
                const [firstName = '', lastName = ''] = text.split(' ');
                updateProfile({ firstName, lastName });
              }}
              style={styles.nameInput}
            />
          ) : (
            <Text variant="headlineSmall" style={styles.name}>
              {`${userProfile.firstName} ${userProfile.lastName}`}
            </Text>
          )}

          <View style={styles.locationRatingContainer}>
            <View style={styles.locationContainer}>
              <MaterialCommunityIcons 
                name="map-marker" 
                size={16} 
                color={theme.colors.primary}
              />
              {isEditing ? (
                <TextInput
                  mode="flat"
                  value={userProfile.location.address}
                  onChangeText={(text) => 
                    updateProfile({ 
                      location: { ...userProfile.location, address: text } 
                    })
                  }
                  style={styles.cityInput}
                />
              ) : (
                <Text style={styles.city}>{userProfile.location.address}</Text>
              )}
            </View>
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <MaterialCommunityIcons
                    key={star}
                    name={star <= Math.floor(userProfile.rating.average) ? 'star' : 'star-outline'}
                    size={16}
                    color={theme.colors.primary}
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>
                {userProfile.rating.average.toFixed(1)} ({userProfile.rating.count} avis)
              </Text>
            </View>
          </View>
        </Surface>

        {renderSection('À propos',
          isEditing ? (
            <TextInput
              mode="outlined"
              value={userProfile.bio}
              onChangeText={(text) => 
                updateProfile({ bio: text })
              }
              multiline
              numberOfLines={4}
              style={styles.bioInput}
            />
          ) : (
            <Text style={styles.bio}>{userProfile.bio}</Text>
          )
        )}

        {renderSection('Compétences',
          <View>
            <View style={styles.skillsContainer}>
              {userProfile.skills.map((skill, index) => (
                <Chip
                  key={index}
                  onClose={isEditing ? () => handleRemoveSkill(skill.name) : undefined}
                  style={styles.skillChip}
                  textStyle={{ color: theme.colors.onSurface }}
                >
                  {skill.name}
                </Chip>
              ))}
              {isEditing && !showSkillInput && (
                <Button
                  mode="outlined"
                  icon="plus"
                  onPress={() => setShowSkillInput(true)}
                >
                  Ajouter
                </Button>
              )}
            </View>
            {showSkillInput && (
              <View style={styles.addSkillContainer}>
                <TextInput
                  mode="outlined"
                  value={newSkill}
                  onChangeText={setNewSkill}
                  placeholder="Nouvelle compétence"
                  style={styles.skillInput}
                />
                <Button onPress={handleAddSkill}>Ajouter</Button>
              </View>
            )}
          </View>
        )}

        {renderSection('Photos de mes réalisations',
          <View>
            <View style={styles.photosGrid}>
              {userProfile.portfolio.map((item, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: item.imageUrl }} style={styles.photo} />
                  {isEditing && (
                    <IconButton
                      icon="close"
                      mode="contained"
                      size={20}
                      onPress={() => removePortfolioItem(item.id)}
                      style={styles.removePhotoButton}
                    />
                  )}
                </View>
              ))}
              {isEditing && (
                <TouchableOpacity
                  style={[styles.addPhotoButton, { borderColor: theme.colors.primary }]}
                  onPress={() => pickImage(false)}
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={32}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor={theme.colors.error}
        >
          Déconnexion
        </Button>
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
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowColor: 'transparent',
    borderBottomWidth: 0,
    elevation: 0,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  editAvatarButton: {
    position: 'absolute',
    right: -8,
    bottom: -8,
  },
  name: {
    marginBottom: 8,
    textAlign: 'center',
  },
  nameInput: {
    marginBottom: 8,
    width: '100%',
  },
  locationRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  city: {
    marginLeft: 4,
  },
  cityInput: {
    flex: 1,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
  },
  section: {
    margin: 8,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  bio: {
    lineHeight: 20,
  },
  bioInput: {
    width: '100%',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  addSkillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  skillInput: {
    flex: 1,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoContainer: {
    width: '48%',
    aspectRatio: 1,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    right: -8,
    top: -8,
  },
  addPhotoButton: {
    width: '48%',
    aspectRatio: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    margin: 16,
  },
});

export default ProfileScreen;
