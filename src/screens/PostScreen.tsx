import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, useTheme, TextInput, SegmentedButtons, Button, Menu, Divider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { postService } from '../services/postService';
import { useAuthContext } from '../contexts/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CATEGORIES, CATEGORY_GROUPS } from '../constants/categories';
import { theme } from '../theme/theme';

interface PostScreenProps {
  isBottomSheet?: boolean;
  onDismiss?: () => void;
}

const PostScreen = ({ isBottomSheet, onDismiss }: PostScreenProps) => {
  const theme = useTheme();
  const { user, userProfile } = useAuthContext();
  const [type, setType] = useState('request');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useRequireAuth();

  const handlePost = async () => {
    if (!user || !userProfile) return;

    try {
      setLoading(true);
      await postService.createPost({
        type,
        title,
        description,
        category,
        photos,
        requestor: {
          id: user.uid,
          name: userProfile.displayName || 'Utilisateur',
          avatar: userProfile.photoURL || '',
        },
        location: userProfile.location || { address: 'Non spécifié', coordinates: null },
      });

      // Réinitialiser le formulaire
      setType('request');
      setTitle('');
      setDescription('');
      setCategory('');
      setPhotos([]);

      if (onDismiss) {
        onDismiss();
      }
    } catch (error) {
      console.error('Error creating post:', error);
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

  const selectedCategory = CATEGORIES.find(c => c.id === category);

  const renderCategoryMenu = () => (
    <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={
        <TouchableOpacity
          style={[
            styles.categoryButton,
            { 
              borderColor: theme.colors.outline,
              backgroundColor: theme.colors.surface,
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
                  setCategory(id);
                  setMenuVisible(false);
                }}
              />
            );
          })}
        </React.Fragment>
      ))}
    </Menu>
  );

  return (
    <ScrollView 
      style={[styles.container, isBottomSheet && { backgroundColor: theme.colors.background }]} 
      contentContainerStyle={styles.contentContainer}
    >

      <TextInput
        mode="outlined"
        label="Titre"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        mode="outlined"
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={styles.input}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Catégorie</Text>
      {renderCategoryMenu()}

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

      <Button
        mode="contained"
        onPress={handlePost}
        loading={loading}
        disabled={!title || !description || !category || loading}
        style={styles.submitButton}
      >
        Publier
      </Button>
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
  segmentedButtons: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
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

export default PostScreen;
