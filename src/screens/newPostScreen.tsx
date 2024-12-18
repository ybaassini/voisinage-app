import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, TextInput } from 'react-native';
import { Text, useTheme, Menu, Divider, Portal, Modal, Chip } from 'react-native-paper';
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
    form.setValue('category', `${selectedCategory.id}_${subcategory.id}`);
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
        address: formData.address,
        budget: formData.budget,
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
      <StatusBar barStyle="light-content" />
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

      <CustomInput
        label="Adresse"
        value={form.watch('address')}
        onChangeText={(value) => form.setValue('address', value)}
        style={styles.input}
        leftIcon="map-marker"
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
        disabled={!isFormValid()}
        style={[
          styles.submitButton,
          !isFormValid() && styles.disabledButton
        ]}
        labelStyle={!isFormValid() ? styles.disabledButtonText : undefined}
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
    paddingBottom: 32,
  },
  title: {
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
    borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: 8,
    padding: 16,
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
