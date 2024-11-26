import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, useTheme, Surface, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(50, 'Le titre ne doit pas dépasser 50 caractères')
    .required('Le titre est requis'),
  description: Yup.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(500, 'La description ne doit pas dépasser 500 caractères')
    .required('La description est requise'),
  category: Yup.string().required('La catégorie est requise'),
});

const PostScreen = () => {
  const theme = useTheme();
  const [images, setImages] = useState<string[]>([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (values: any) => {
    console.log('Annonce à publier:', { ...values, images });
    // TODO: Implémenter l'envoi à Firebase
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View 
        entering={FadeInDown.duration(1000).springify()}
        style={styles.header}
      >
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
          Nouvelle annonce
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Partagez vos services ou votre matériel avec vos voisins
        </Text>
      </Animated.View>

      <Formik
        initialValues={{ title: '', description: '', category: 'services' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
          <Animated.View 
            entering={FadeInUp.duration(1000).springify()}
            style={styles.formContainer}
          >
            <Surface style={styles.form} elevation={1}>
              <TextInput
                label="Titre de l'annonce"
                value={values.title}
                onChangeText={handleChange('title')}
                onBlur={handleBlur('title')}
                style={styles.input}
                error={touched.title && errors.title}
                mode="outlined"
                left={<TextInput.Icon icon="format-title" />}
              />
              {touched.title && errors.title && (
                <Text style={[styles.error, { color: theme.colors.error }]}>
                  {errors.title}
                </Text>
              )}

              <TextInput
                label="Description"
                value={values.description}
                onChangeText={handleChange('description')}
                onBlur={handleBlur('description')}
                multiline
                numberOfLines={4}
                style={[styles.input, styles.textArea]}
                error={touched.description && errors.description}
                mode="outlined"
                left={<TextInput.Icon icon="text" />}
              />
              {touched.description && errors.description && (
                <Text style={[styles.error, { color: theme.colors.error }]}>
                  {errors.description}
                </Text>
              )}

              <Text variant="titleMedium" style={styles.sectionTitle}>Catégorie</Text>
              <SegmentedButtons
                value={values.category}
                onValueChange={(value) => setFieldValue('category', value)}
                buttons={[
                  {
                    value: 'services',
                    label: 'Services',
                    icon: 'account-wrench',
                    checkedColor: theme.colors.primary,
                  },
                  {
                    value: 'materiel',
                    label: 'Matériel',
                    icon: 'tools',
                    checkedColor: theme.colors.primary,
                  },
                  {
                    value: 'autre',
                    label: 'Autre',
                    icon: 'dots-horizontal',
                    checkedColor: theme.colors.primary,
                  },
                ]}
                style={styles.categoryButtons}
              />

              <Text variant="titleMedium" style={styles.sectionTitle}>Photos</Text>
              <View style={styles.imagesContainer}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.image} />
                    <IconButton
                      icon="close-circle"
                      size={24}
                      iconColor={theme.colors.error}
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    />
                  </View>
                ))}
                {images.length < 5 && (
                  <Button
                    mode="outlined"
                    onPress={pickImage}
                    style={styles.addImageButton}
                    icon="camera"
                  >
                    {images.length === 0 ? 'Ajouter des photos' : 'Ajouter'}
                  </Button>
                )}
              </View>

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                icon="send"
              >
                Publier l'annonce
              </Button>
            </Surface>
          </Animated.View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  formContainer: {
    padding: 16,
  },
  form: {
    padding: 24,
    borderRadius: 16,
  },
  input: {
    marginBottom: 4,
  },
  textArea: {
    minHeight: 100,
  },
  error: {
    fontSize: 12,
    marginBottom: 16,
    marginTop: -2,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  categoryButtons: {
    marginBottom: 16,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    margin: 0,
    padding: 0,
  },
  addImageButton: {
    height: 100,
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  submitButton: {
    marginTop: 8,
  },
});

export default PostScreen;
