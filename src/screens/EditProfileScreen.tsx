import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme, Text, Chip, Portal, Modal, List, Searchbar, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../hooks/useAuth';
import CustomTextArea from '../components/forms/CustomTextArea';
import CustomInput from '../components/forms/CustomInput';
import CustomButton from '../components/forms/CustomButton';
import { userService } from '../services/userService';
import { SERVICE_CATEGORIES, ServiceSubcategory } from '../constants/serviceCategories';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const EditProfileScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [skills, setSkills] = useState<ServiceSubcategory[]>([]);
  const [avatar, setAvatar] = useState('');
  const [error, setError] = useState('');
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mettre à jour les états locaux quand userProfile change
  useEffect(() => {
    if (userProfile) {
      setBio(userProfile.bio || '');
      setAddress(userProfile.location?.address || '');
      setSkills(userProfile.skills || []);
      setAvatar(userProfile.avatar || '');
    }
  }, [userProfile]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Désolé, nous avons besoin des permissions pour accéder à vos photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setLoading(true);
        try {
          const newAvatarUrl = await userService.updateUserAvatar(userProfile!.id, result.assets[0].uri);
          setAvatar(newAvatarUrl);
        } catch (err) {
          console.error('Erreur lors de la mise à jour de l\'avatar:', err);
          setError('Erreur lors de la mise à jour de l\'avatar');
        } finally {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Erreur lors de la sélection de l\'image:', err);
      setError('Erreur lors de la sélection de l\'image');
    }
  };

  // Créer une liste plate de toutes les sous-catégories
  const allSubcategories = SERVICE_CATEGORIES.reduce((acc, category) => {
    return acc.concat(category.subcategories || []);
  }, [] as ServiceSubcategory[]);

  // Filtrer les sous-catégories en fonction de la recherche
  const filteredSubcategories = allSubcategories.filter(subcat =>
    subcat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSkill = (skill: ServiceSubcategory) => {
    if (!skills.find(s => s.id === skill.id)) {
      setSkills([...skills, skill]);
    }
  };

  const handleRemoveSkill = (skillId: string) => {
    setSkills(skills.filter(skill => skill.id !== skillId));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      if (!userProfile?.id) {
        throw new Error('Utilisateur non connecté');
      }

      await userService.updateProfile(userProfile.id, {
        ...userProfile,
        bio,
        location: {
          ...userProfile.location,
          address,
        },
        skills,
      });

      navigation.goBack();
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      setError('Une erreur est survenue lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <IconButton icon="camera" size={24} />
                </View>
              )}
              <View style={styles.editIconContainer}>
                <IconButton
                  icon="pencil"
                  size={16}
                  style={[styles.editIcon, { backgroundColor: theme.colors.primary }]}
                  iconColor={theme.colors.onPrimary}
                />
              </View>
            </TouchableOpacity>
          </View>

          <CustomTextArea
            label="Bio"
            value={bio}
            onChangeText={setBio}
            numberOfLines={4}
            maxLength={500}
            placeholder="Parlez-nous un peu de vous..."
          />

          <CustomInput
            label="Adresse"
            value={address}
            onChangeText={setAddress}
            leftIcon="map-marker"
          />

          <View style={styles.skillsSection}>
            <Text variant="titleMedium" style={styles.skillsTitle}>
              Compétences
            </Text>
            <View style={styles.skillsContainer}>
              {skills.map((skill, index) => (
                <Chip
                icon={() => <MaterialCommunityIcons name="tag" size={16} color={theme.colors.secondary} />}
                key={index}
                mode="flat"
                onClose={() => handleRemoveSkill(skill.id)}
                style={[styles.categoryChip, {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.secondary
                }]}
              >
                {skill.label}
              </Chip>
              ))}
              <Chip
                icon="plus"
                onPress={() => setShowSkillsModal(true)}
                style={styles.addChip}
                textStyle={{ color: theme.colors.primary }}
              >
                Ajouter
              </Chip>
            </View>
          </View>

          {error ? (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          ) : null}

          <CustomButton
            mode="contained"
            onPress={handleSave}
            loading={loading}
            style={styles.button}
          >
            Enregistrer
          </CustomButton>

          <CustomButton
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            Annuler
          </CustomButton>
        </View>
      </ScrollView>

      <Portal>
        <Modal
          visible={showSkillsModal}
          onDismiss={() => setShowSkillsModal(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.background }
          ]}
        >
          <Searchbar
            placeholder="Rechercher une compétence"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
          <ScrollView style={styles.modalScroll}>
            {filteredSubcategories.map(subcat => (
              <List.Item
                key={subcat.id}
                title={subcat.label}
                onPress={() => {
                  handleAddSkill(subcat);
                  setShowSkillsModal(false);
                  setSearchQuery('');
                }}
                right={props =>
                  skills.some(s => s.id === subcat.id) ? (
                    <List.Icon {...props} icon="check" color={theme.colors.primary} />
                  ) : null
                }
              />
            ))}
          </ScrollView>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    gap: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'visible',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  editIcon: {
    margin: 0,
  },
  skillsSection: {
    gap: 8,
  },
  skillsTitle: {
    marginBottom: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  chip: {
    marginRight: 4,
    marginBottom: 4,
  },
  addChip: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  button: {
    marginTop: 8,
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 8,
  },
  modal: {
    margin: 20,
    borderRadius: 8,
    padding: 16,
    maxHeight: '80%',
  },
  modalScroll: {
    marginTop: 16,
  },
  searchBar: {
    marginBottom: 8,
  },
});

export default EditProfileScreen;
