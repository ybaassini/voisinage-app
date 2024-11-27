import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Avatar, Button, Surface, useTheme, TextInput, Chip, IconButton, List, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const ProfileScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Marie Dupont',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    city: 'Bordeaux',
    rating: 4.8,
    reviewCount: 15,
    bio: 'Passionnée de bricolage et jardinage. J\'aime partager mes connaissances et aider mes voisins.',
    skills: [
      'Bricolage',
      'Jardinage',
      'Peinture',
      'Plomberie',
      'Électricité basique',
    ],
    workPhotos: [
      'https://images.unsplash.com/photo-1503594384566-461fe158e797',
      'https://images.unsplash.com/photo-1574511098078-b28037dae334',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a',
    ],
  });

  const [newSkill, setNewSkill] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon={isEditing ? "check" : "pencil"}
          mode="contained"
          onPress={() => setIsEditing(!isEditing)}
          style={{ marginRight: 8 }}
        />
      ),
    });
  }, [isEditing, navigation]);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            // Ajouter la logique de déconnexion ici
            console.log('Déconnexion');
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
      if (isAvatar) {
        setProfileData({ ...profileData, avatar: result.assets[0].uri });
      } else {
        setProfileData({
          ...profileData,
          workPhotos: [...profileData.workPhotos, result.assets[0].uri],
        });
      }
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...profileData.workPhotos];
    newPhotos.splice(index, 1);
    setProfileData({ ...profileData, workPhotos: newPhotos });
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()],
      });
      setNewSkill('');
      setShowSkillInput(false);
    }
  };

  const removeSkill = (skill: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter((s) => s !== skill),
    });
  };

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
    <SafeAreaView style={[styles.container, { backgroundColor: '#F5F5F5' }]}>
      <ScrollView style={styles.scrollView}>
        <Surface style={[styles.profileHeader, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              size={100}
              source={{ uri: profileData.avatar }}
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
              value={profileData.name}
              onChangeText={(text) => setProfileData({ ...profileData, name: text })}
              style={styles.nameInput}
            />
          ) : (
            <Text variant="headlineSmall" style={styles.name}>
              {profileData.name}
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
                  value={profileData.city}
                  onChangeText={(text) => setProfileData({ ...profileData, city: text })}
                  style={styles.cityInput}
                />
              ) : (
                <Text style={styles.city}>{profileData.city}</Text>
              )}
            </View>
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <MaterialCommunityIcons
                    key={star}
                    name={star <= Math.floor(profileData.rating) ? 'star' : 'star-outline'}
                    size={16}
                    color={theme.colors.primary}
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>
                {profileData.rating} ({profileData.reviewCount} avis)
              </Text>
            </View>
          </View>
        </Surface>

        {renderSection('Présentation', 
          isEditing ? (
            <TextInput
              mode="outlined"
              value={profileData.bio}
              onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
              multiline
              numberOfLines={4}
              style={styles.bioInput}
            />
          ) : (
            <Text variant="bodyLarge" style={styles.bio}>
              {profileData.bio}
            </Text>
          )
        )}

        {renderSection('Compétences',
          <View>
            <View style={styles.skillsContainer}>
              {profileData.skills.map((skill, index) => (
                <Chip
                  key={index}
                  onClose={isEditing ? () => removeSkill(skill) : undefined}
                  style={styles.skillChip}
                  textStyle={{ color: theme.colors.onSurface }}
                >
                  {skill}
                </Chip>
              ))}
              {isEditing && !showSkillInput && (
                <Button
                  mode="outlined"
                  onPress={() => setShowSkillInput(true)}
                  icon="plus"
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
                  right={
                    <TextInput.Icon
                      icon="check"
                      onPress={addSkill}
                    />
                  }
                  style={styles.skillInput}
                />
              </View>
            )}
          </View>
        )}

        {renderSection('Photos de mes réalisations',
          <View>
            <View style={styles.photosGrid}>
              {profileData.workPhotos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  {isEditing && (
                    <IconButton
                      icon="close"
                      mode="contained"
                      size={20}
                      onPress={() => removePhoto(index)}
                      style={styles.removePhotoButton}
                    />
                  )}
                </View>
              ))}
              {isEditing && (
                <TouchableOpacity
                  style={[styles.addPhotoButton, { borderColor: theme.colors.outline }]}
                  onPress={() => pickImage(false)}
                >
                  <MaterialCommunityIcons
                    name="camera-plus"
                    size={32}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {renderSection('Paramètres',
          <View>
            <List.Item
              title="Modifier le mot de passe"
              left={props => <List.Icon {...props} icon="key" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Notifications"
              left={props => <List.Icon {...props} icon="bell" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Confidentialité"
              left={props => <List.Icon {...props} icon="shield-account" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Déconnexion"
              left={props => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
              titleStyle={{ color: theme.colors.error }}
              onPress={handleLogout}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -8,
    right: -8,
  },
  name: {
    fontWeight: '600',
  },
  nameInput: {
    width: '80%',
    textAlign: 'center',
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  bio: {
    lineHeight: 24,
  },
  bioInput: {
    marginTop: 8,
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
    marginTop: 12,
  },
  skillInput: {
    marginBottom: 8,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoContainer: {
    width: '31%',
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
    top: -8,
    right: -8,
  },
  addPhotoButton: {
    width: '31%',
    aspectRatio: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationRatingContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  city: {
    fontSize: 14,
    color: '#666',
  },
  cityInput: {
    height: 24,
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
});

export default ProfileScreen;
