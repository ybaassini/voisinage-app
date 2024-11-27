import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Text, TextInput, Button, useTheme, SegmentedButtons, IconButton, Surface, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, FadeIn, SlideInRight } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { postService } from '../services/postService';

const PostScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [postType, setPostType] = useState('service');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const renderImagePreview = () => {
    if (images.length === 0) {
      return (
        <Button
          mode="outlined"
          icon="camera-plus"
          onPress={handleImagePick}
          style={styles.addImageButton}
          contentStyle={styles.addImageButtonContent}
        >
          Ajouter des photos
        </Button>
      );
    }

    return (
      <View style={styles.imagePreviewContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {images.map((image, index) => (
            <Animated.View 
              key={index}
              entering={FadeInDown.delay(index * 100)}
              style={styles.imagePreview}
            >
              <IconButton
                icon="close-circle"
                size={20}
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              />
              <Animated.Image
                source={{ uri: image.uri }}
                style={styles.previewImage}
              />
            </Animated.View>
          ))}
          <Button
            mode="outlined"
            icon="plus"
            onPress={handleImagePick}
            style={[styles.addMoreButton, { borderColor: theme.colors.primary }]}
            labelStyle={{ color: theme.colors.primary }}
          >
            Plus
          </Button>
        </ScrollView>
      </View>
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const postData = {
        category: postType,
        description: description.trim(),
        requestor: {
          id: 'user123', // À remplacer par l'ID de l'utilisateur connecté
          name: 'Utilisateur', // À remplacer par le nom de l'utilisateur connecté
        },
        location: {
          address: '',
          coordinates: {
            latitude: 0,
            longitude: 0,
          }
        },
        status: 'active' as const,
        title: title.trim(),
      };

      // Préparer les images pour l'upload
      const photoFiles = images.map(image => ({
        uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`
      }));

      const createdPost = await postService.createPost(postData, photoFiles.length > 0 ? photoFiles : undefined);
      console.log('Post créé avec succès:', createdPost);
      
      setShowSuccessModal(true);
      
      // Réinitialiser le formulaire
      setTitle('');
      setDescription('');
      setImages([]);
      
      // Attendre 2 secondes avant de rediriger
      setTimeout(() => {
        setShowSuccessModal(false);
        navigation.navigate('Home');
      }, 2000);
    } catch (err) {
      console.error('Erreur détaillée lors de la création du post:', err);
      setError(err.message || 'Une erreur est survenue lors de la création de votre annonce');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            entering={FadeIn.duration(500)}
            style={styles.content}
          >
            <Text 
              variant="headlineMedium" 
              style={[styles.header, { color: theme.colors.primary }]}
            >
              Nouvelle annonce
            </Text>

            <Surface style={styles.card}>
              <Animated.View 
                entering={SlideInRight.duration(500)}
                style={styles.typeSelector}
              >
                <SegmentedButtons
                  value={postType}
                  onValueChange={(value) => setPostType(value)}
                  buttons={[
                    {
                      value: 'service',
                      label: 'Service',
                      icon: 'account-wrench',
                      style: postType === 'service' ? { backgroundColor: theme.colors.primaryContainer, borderRadius: 8 } : undefined
                    },
                    {
                      value: 'material',
                      label: 'Matériel',
                      icon: 'package-variant',
                      style: postType === 'material' ? { backgroundColor: theme.colors.primaryContainer, borderRadius: 8 } : undefined
                    },
                  ]}
                />
              </Animated.View>

              <Animated.View 
                entering={FadeInDown.duration(500).delay(200)}
                style={styles.formContainer}
              >
                <TextInput
                  mode="outlined"
                  label="Titre de l'annonce"
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                  placeholder={postType === 'service' ? "Ex: Réparation plomberie" : "Ex: Prêt perceuse"}
                  outlineStyle={styles.inputOutline}
                />

                <TextInput
                  mode="outlined"
                  label="Description"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  style={[styles.input, styles.descriptionInput]}
                  placeholder={postType === 'service' ? 
                    "Décrivez le service que vous proposez..." : 
                    "Décrivez le matériel que vous souhaitez prêter..."}
                  outlineStyle={styles.inputOutline}
                />

                {renderImagePreview()}
              </Animated.View>
            </Surface>
          </Animated.View>
        </ScrollView>

        <Animated.View 
          entering={FadeInDown.duration(500).delay(400)}
          style={styles.footer}
        >
          {error ? (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          ) : null}
          
          <Button 
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
            disabled={loading}
          >
            {loading ? 'Publication en cours...' : 'Publier l\'annonce'}
          </Button>
        </Animated.View>
      </KeyboardAvoidingView>

      <Portal>
        <Modal
          visible={showSuccessModal}
          dismissable={false}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface }
          ]}
        >
          <MaterialCommunityIcons
            name="check-circle"
            size={64}
            color={theme.colors.primary}
          />
          <Text variant="headlineSmall" style={styles.modalText}>
            Annonce publiée avec succès !
          </Text>
          <ActivityIndicator animating={true} color={theme.colors.primary} />
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    elevation: 4,
  },
  typeSelector: {
    marginBottom: 24,
  },
  formContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  inputOutline: {
    borderRadius: 8,
  },
  descriptionInput: {
    minHeight: 120,
  },
  imagePreviewContainer: {
    marginTop: 16,
  },
  imagePreview: {
    position: 'relative',
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    margin: 0,
    zIndex: 1,
  },
  addImageButton: {
    borderStyle: 'dashed',
    borderRadius: 12,
    borderWidth: 2,
    height: 100,
  },
  addImageButtonContent: {
    height: '100%',
  },
  addMoreButton: {
    height: 100,
    borderStyle: 'dashed',
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 0 : 16,
  },
  submitButton: {
    borderRadius: 12,
    marginBottom: Platform.OS === 'ios' ? 16 : 0,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  errorText: {
    marginBottom: 8,
    textAlign: 'center',
  },
  modal: {
    padding: 20,
    margin: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalText: {
    marginVertical: 16,
    textAlign: 'center',
  },
});

export default PostScreen;
