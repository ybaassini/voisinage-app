import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Formik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Le titre est requis'),
  description: Yup.string().required('La description est requise'),
  category: Yup.string().required('La catégorie est requise'),
});

const PostScreen = () => {
  const [images, setImages] = useState([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.uri]);
    }
  };

  const handleSubmit = (values) => {
    console.log('Annonce à publier:', { ...values, images });
    // TODO: Implémenter l'envoi à Firebase
  };

  return (
    <ScrollView style={styles.container}>
      <Formik
        initialValues={{ title: '', description: '', category: 'services' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
            <TextInput
              label="Titre de l'annonce"
              value={values.title}
              onChangeText={handleChange('title')}
              onBlur={handleBlur('title')}
              style={styles.input}
              error={touched.title && errors.title}
            />
            {touched.title && errors.title && (
              <Text style={styles.error}>{errors.title}</Text>
            )}

            <TextInput
              label="Description"
              value={values.description}
              onChangeText={handleChange('description')}
              onBlur={handleBlur('description')}
              multiline
              numberOfLines={4}
              style={styles.input}
              error={touched.description && errors.description}
            />
            {touched.description && errors.description && (
              <Text style={styles.error}>{errors.description}</Text>
            )}

            <SegmentedButtons
              value={values.category}
              onValueChange={handleChange('category')}
              buttons={[
                { value: 'services', label: 'Services' },
                { value: 'materiel', label: 'Matériel' },
                { value: 'autre', label: 'Autre' },
              ]}
              style={styles.categoryButtons}
            />

            <Button
              mode="contained"
              onPress={pickImage}
              style={styles.button}
              icon="camera"
            >
              Ajouter des photos
            </Button>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
            >
              Publier l'annonce
            </Button>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 8,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  categoryButtons: {
    marginVertical: 16,
  },
  button: {
    marginVertical: 8,
  },
});

export default PostScreen;
