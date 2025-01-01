import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, TextInput } from 'react-native';
import { Text, useTheme, Menu, Divider, Portal, Modal, Chip, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { postService } from '../services/postService';
import { useAuthContext } from '../contexts/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SERVICE_CATEGORIES, ServiceCategory, ServiceSubcategory } from '../constants/serviceCategories';
import { theme } from '../theme/theme';
import { useForm } from 'react-hook-form';
import { PostFormData } from '../types/forms';
import { logger } from '../utils/logger';
import CustomInput from '../components/forms/CustomInput';
import CustomTextArea from '../components/forms/CustomTextArea';
import CustomButton from '../components/forms/CustomButton';
import CategorySelectionScreen from './CategorySelectionScreen';
import { Alert } from 'react-native';
import AddressAutocompleteInput from '../components/forms/AddressAutocompleteInput';
import { storageService } from '../services/storageService';

interface NewPostScreenProps {
  isBottomSheet?: boolean;
  onDismiss?: () => void;
  onClose?: () => void;
  navigation?: any;
}

interface NewPostFormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  address: string;
  budget: string;
  images: string[];
}

const NewPostScreen = ({ isBottomSheet, onDismiss, onClose, navigation }: NewPostScreenProps) => {
  const theme = useTheme();
  const { user, userProfile } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  const form = useForm<NewPostFormData>({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      address: '',
      budget: '',
      images: [],
    },
    mode: 'onChange',
  });

  useRequireAuth();

  const handleCategorySelect = (category: ServiceCategory | null) => {
    if (category === null) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      return;
    }
    
    setSelectedCategory(category);
  };

  const handleSubcategorySelect = (subcategory: ServiceSubcategory) => {
    if (!selectedCategory) return;
    
    setSelectedSubcategory(subcategory);
    form.setValue('category', `${selectedCategory.id}`);
    form.setValue('subcategory', `${subcategory.id}`);
    setShowCategorySelection(false);
  };

  const handlePost = async () => {
    try {
      setShowErrors(true);
      
      if (!form.watch('title') || !form.watch('description') || !selectedCategory) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires (titre, description et catégorie)');
        return;
      }

      setLoading(true);
      const formData = form.getValues();

      const category = {
        id: formData.category,
        name: SERVICE_CATEGORIES.find(cat => cat.id === formData.category)?.label,
        subcategory: {
          id: formData.subcategory,
          name: SERVICE_CATEGORIES.find(cat => cat.id === formData.category)?.subcategories?.find(sub => sub.id === formData.subcategory)?.label
        }
      };

      if (!category) {
        Alert.alert('Erreur', 'Catégorie invalide');
        return;
      }

      // 1. Créer d'abord le post sans les photos
      const postId = await postService.createPost(user.uid, {
        type: 'request',
        title: formData.title,
        description: formData.description,
        category,
        photos: [], // On commence avec un tableau vide
        requestor: userProfile,
        status: 'active',
        location: {
          address: formData.address
        },
        budget: formData.budget,
      });

      // 2. Si des photos ont été sélectionnées, les uploader
      if (photos.length > 0) {
        try {
          await postService.uploadPostPhotos(postId, photos);
        } catch (error) {
          console.error('Error uploading photos:', error);
          Alert.alert(
            'Attention',
            'La demande a été créée mais certaines photos n\'ont pas pu être uploadées. Vous pourrez les ajouter plus tard.'
          );
        }
      }

      form.reset();
      setPhotos([]);
      onDismiss?.();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la création de la demande. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Demander la permission d'accès à la galerie
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Nous avons besoin de votre permission pour accéder à vos photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5,
      });

      if (!result.canceled && result.assets) {
        // Vérifier la limite de photos
        if (photos.length + result.assets.length > 5) {
          Alert.alert(
            'Limite atteinte',
            'Vous ne pouvez pas ajouter plus de 5 photos par demande.'
          );
          return;
        }

        setPhotos([...photos, ...result.assets.map(asset => asset.uri)]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la sélection des photos.'
      );
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const isFormValid = () => {
    return (
      form.watch('title').trim() !== '' &&
      form.watch('description').trim() !== '' &&
      selectedCategory !== null
    );
  };

  if (showCategorySelection) {
    return (
      <CategorySelectionScreen
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        onSubcategorySelect={handleSubcategorySelect}
        onClose={() => setShowCategorySelection(false)}
      />
    );
  }

  return (
    <ScrollView 
      style={[styles.container, isBottomSheet && { backgroundColor: theme.colors.background }]} 
      contentContainerStyle={styles.contentContainer}
    >
      {/* <StatusBar barStyle="light-content" /> */}
      <Text style={[styles.title]}>Nouvelle demande</Text>

      <CustomInput
        label="Titre de l'annonce *"
        value={form.watch('title')}
        onChangeText={(value) => form.setValue('title', value)}
        style={styles.input}
        leftIcon="format-title"
        error={showErrors && form.watch('title').length === 0}
        helperText={showErrors && form.watch('title').length === 0 ? "Le titre est obligatoire" : ""}
      />

      <CustomTextArea
        label="Description détaillée *"
        value={form.watch('description')}
        onChangeText={(value) => form.setValue('description', value)}
        error={showErrors && form.watch('description').length === 0}
        helperText={showErrors && form.watch('description').length === 0 ? "La description est obligatoire" : ""}
        numberOfLines={8}
        maxLength={1000}
        placeholder="Décrivez votre demande en détail..."
      />

      <AddressAutocompleteInput
        value={form.watch('address')}
        onChangeText={(value) => form.setValue('address', value)}
        onSelect={(address) => form.setValue('address', address)}
        error={showErrors && !form.watch('address')}
        helperText={showErrors && !form.watch('address') ? "L'adresse est obligatoire" : ""}
      />

      <CustomInput
        label="Budget (€)"
        value={form.watch('budget')}
        onChangeText={(value) => form.setValue('budget', value)}
        style={styles.input}
        leftIcon="currency-eur"
        keyboardType="numeric"
      />

      <View style={styles.categorySection}>
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>Catégorie *</Text>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            showErrors && !selectedCategory && styles.errorBorder
          ]}
          onPress={() => setShowCategorySelection(true)}
        >
          {selectedCategory ? (
            <View style={styles.selectedCategory}>
              <Icon name={selectedCategory.icon} size={24} color={theme.colors.primary} />
              <Text style={[styles.categoryText, { color: theme.colors.onSurface }]}>
                {selectedCategory.label}
                {selectedSubcategory ? ` > ${selectedSubcategory.label}` : ''}
              </Text>
            </View>
          ) : (
            <View style={styles.selectedCategory}>
              <Icon name="shape-outline" size={24} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.categoryText, { color: theme.colors.onSurfaceVariant }]}>
                Sélectionner une catégorie
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {showErrors && !selectedCategory && (
          <Text style={styles.errorText}>La catégorie est obligatoire</Text>
        )}
      </View>

      <View style={styles.photosSection}>
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>Photos (max 5)</Text>
        <View style={styles.photoList}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => removePhoto(index)}
              >
                <Icon name="close-circle" size={24} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 5 && (
            <TouchableOpacity
              style={[styles.addPhotoButton, { borderColor: theme.colors.primary }]}
              onPress={pickImage}
            >
              <Icon name="camera-plus" size={32} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <CustomButton
        mode="contained"
        onPress={handlePost}
        loading={loading}
        disabled={loading || !isFormValid()}
        style={styles.submitButton}
      >
        {loading ? 'Publication en cours...' : 'Publier la demande'}
      </CustomButton>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    paddingTop: 8,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textareaContainer: {
    marginBottom: 16,
  },
  textarea: {
    minHeight: 160,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  errorBorder: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 12,
    padding: 16,
    backgroundColor: theme.colors.surfaceVariant,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  photosSection: {
    marginTop: 16,
  },
  photoList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  photoContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    opacity: 0.7,
  },
  disabledButtonText: {
    color: '#9E9E9E',
  },
});

export default NewPostScreen;
