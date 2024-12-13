import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, useTheme, Menu, Divider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { postService } from '../services/postService';
import { useAuthContext } from '../contexts/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CATEGORIES, CATEGORY_GROUPS } from '../constants/categories';
import { theme } from '../theme/theme';
import { useForm } from 'react-hook-form';
import { PostFormData } from '../types/forms';
import { logger } from '../utils/logger';
import CustomInput from '../components/forms/CustomInput';
import CustomButton from '../components/forms/CustomButton';

interface NewPostScreenProps {
  isBottomSheet?: boolean;
  onDismiss?: () => void;
}

const NewPostScreen = ({ isBottomSheet, onDismiss }: NewPostScreenProps) => {
  const theme = useTheme();
  const { user, userProfile } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  const form = useForm<PostFormData>({
    defaultValues: {
      title: '',
      category: '',
      description: '',
      images: [],
    },
  });

  useRequireAuth();

  const handlePost = async () => {
    if (!user || !userProfile) return;

    const formData = form.getValues();

    try {
      setLoading(true);
      await postService.createPost({
        type: 'request',
        title: formData.title,
        description: formData.description,
        category: formData.category,
        photos,
        requestor: {
          id: user.uid,
          name: `${userProfile.firstName} ${userProfile.lastName}` || 'Utilisateur',
          avatar: userProfile.avatar || '',
        },
        status: 'active',
        location: userProfile.location || { address: 'Non spécifié', coordinates: null },
      });

      form.reset();
      setPhotos([]);
      onDismiss?.();
    } catch (error) {
      logger.error('Error creating post:', error);
      alert('Une erreur est survenue lors de la création du post');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const selectedCategory = CATEGORIES.find(c => c.id === form.watch('category'));

  return (
    <ScrollView 
      style={[styles.container, isBottomSheet && { backgroundColor: theme.colors.background }]} 
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title]}>Nouvelle demande</Text>

      <CustomInput
        label="Titre"
        value={form.watch('title')}
        onChangeText={(value) => form.setValue('title', value)}
        style={[styles.input, { borderWidth: 0 }]}
        leftIcon="format-title"
      />

      <CustomInput
        label="Description"
        value={form.watch('description')}
        onChangeText={(value) => form.setValue('description', value)}
        multiline
        numberOfLines={4}
        style={styles.input}
        leftIcon="text"
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Catégorie</Text>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <TouchableOpacity
            style={[
              styles.categoryButton,
              { 
                borderColor: theme.colors.outline,
                borderWidth: 0,
                backgroundColor: theme.colors.surface,
                borderRadius: 4,
              }
            ]}
            onPress={() => setMenuVisible(true)}
          >
            <View style={styles.categoryButtonContent}>
              {selectedCategory ? (
                <>
                  <Icon name={selectedCategory.icon} size={20} color={theme.colors.primary} />
                  <Text style={[styles.categoryButtonText, { color: theme.colors.onSurface }]}>
                    {selectedCategory.label}
                  </Text>
                </>
              ) : (
                <Text style={[styles.categoryButtonText, { color: theme.colors.onSurfaceVariant }]}>
                  Sélectionner une catégorie
                </Text>
              )}
              <Icon name="chevron-down" size={20} color={theme.colors.onSurfaceVariant} />
            </View>
          </TouchableOpacity>
        }
        style={styles.menu}
      >
        {Object.entries(CATEGORY_GROUPS).map(([groupName, categoryIds], groupIndex) => (
          <React.Fragment key={groupName}>
            {groupIndex > 0 && <Divider bold />}
            <Menu.Item
              title={groupName.replace('_', ' ')}
              disabled
              titleStyle={styles.menuGroupTitle}
            />
            {categoryIds.map(id => {
              const categoryItem = CATEGORIES.find(c => c.id === id);
              if (!categoryItem) return null;
              
              return (
                <Menu.Item
                  key={id}
                  title={categoryItem.label}
                  leadingIcon={props => <Icon {...props} name={categoryItem.icon} />}
                  onPress={() => {
                    form.setValue('category', id);
                    setMenuVisible(false);
                  }}
                />
              );
            })}
          </React.Fragment>
        ))}
      </Menu>

      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Photos</Text>
      <View style={styles.photoSection}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: theme.colors.error }]}
              onPress={() => removePhoto(index)}
            >
              <Icon name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        ))}
        {photos.length < 3 && (
          <TouchableOpacity
            style={[styles.addPhotoButton, { borderColor: theme.colors.primary }]}
            onPress={pickImage}
          >
            <Icon name="camera-plus" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <CustomButton
        mode="contained"
        onPress={handlePost}
        loading={loading}
        disabled={!form.watch('title') || !form.watch('description') || !form.watch('category') || loading}
        style={styles.submitButton}
        icon="send"
      >
        Publier
      </CustomButton>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 0,
    borderColor: theme.colors.surface
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryButton: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  categoryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryButtonText: {
    flex: 1,
    fontSize: 16,
  },
  menu: {
    maxWidth: '100%',
  },
  menuGroupTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  photoSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    marginTop: 16,
  },
});

export default NewPostScreen;
