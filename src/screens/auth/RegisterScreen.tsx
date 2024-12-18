import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';

import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { registerUser } from '../../store/slices/authSlice';
import CustomInput from '../../components/forms/CustomInput';
import CustomButton from '../../components/forms/CustomButton';
import { theme } from '../../theme/theme';
import { CreateUserProfileData, Skill } from '../../types/user';
import * as Location from 'expo-location';
import * as geofireCommon from 'geofire-common';

const validationSchema = Yup.object().shape({
  lastName: Yup.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .required('Le nom est requis'),
  firstName: Yup.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .required('Le prénom est requis'),
  email: Yup.string()
    .email('Email invalide')
    .required('L\'email est requis'),
  password: Yup.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{6,}$/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    )
    .required('Le mot de passe est requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('La confirmation du mot de passe est requise'),
  location: Yup.object().shape({
    address: Yup.string().required('L\'adresse est requise'),
  }),
});

const RegisterScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (values: any) => {
    try {
      // Obtenir les coordonnées à partir de l'adresse
      const locationResult = await Location.geocodeAsync(values.location.address);
      
      if (locationResult.length > 0) {
        const { latitude, longitude, } = locationResult[0];
        const geohash = geofireCommon.geohashForLocation([latitude, longitude]);
        
        const userProfileData: Partial<CreateUserProfileData> = {
          firstName: values.firstName,
          lastName: values.lastName,
          displayName: `${values.firstName} ${values.lastName}`,
          email: values.email,
          bio: values.bio,
          location: {
            address: values.location.address,
            coordinates: { latitude, longitude },
            g: {
              geohash, 
              geopoint: { latitude, longitude }
            },
            geohash
          },
          skills: [],
          portfolio: [],
          avatar: ''
        };

        dispatch(registerUser({ ...values, profile: userProfileData }));
      } else {
        // Gérer le cas où l'adresse n'a pas pu être géocodée
        console.error('Adresse non trouvée');
      }
    } catch (error) {
      console.error('Erreur lors du géocodage:', error);
    }
  };

  const initialValues = {
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    location: {
      address: ''
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            entering={FadeInDown.duration(1000).springify()}
            style={styles.headerContainer}
          >
            <Text variant="displaySmall" style={[styles.title, { color: theme.colors.primary }]}>
              Créer un compte
            </Text>
            <Text variant="titleMedium" style={styles.subtitle}>
              Rejoignez votre communauté de voisinage
            </Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.duration(1000).springify()}
            style={styles.formContainer}
          >
            <Surface style={styles.surface} elevation={2}>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleRegister}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <View style={styles.form}>
                    <CustomInput
                      label="Prénom"
                      value={values.firstName}
                      onChangeText={handleChange('firstName')}
                      onBlur={handleBlur('firstName')}
                      error={touched.firstName ? errors.firstName : undefined}
                      leftIcon="account"
                    />

                    <CustomInput
                      label="Nom"
                      value={values.lastName}
                      onChangeText={handleChange('lastName')}
                      onBlur={handleBlur('lastName')}
                      error={touched.lastName ? errors.lastName : undefined}
                      leftIcon="account"
                    />

                    <CustomInput
                      label="Nom d'affichage"
                      value={values.displayName}
                      onChangeText={handleChange('displayName')}
                      onBlur={handleBlur('displayName')}
                      error={touched.displayName ? errors.displayName : undefined}
                      leftIcon="account-badge"
                    />

                    <CustomInput
                      label="Email"
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      error={touched.email ? errors.email : undefined}
                      leftIcon="email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />

                    <CustomInput
                      label="Bio"
                      value={values.bio}
                      onChangeText={handleChange('bio')}
                      onBlur={handleBlur('bio')}
                      error={touched.bio ? errors.bio : undefined}
                      leftIcon="text"
                      multiline
                      numberOfLines={3}
                    />

                    <CustomInput
                      label="Adresse"
                      value={values.location.address}
                      onChangeText={handleChange('location.address')}
                      onBlur={handleBlur('location.address')}
                      error={touched.location?.address ? errors.location?.address : undefined}
                      leftIcon="map-marker"
                    />

                    <CustomInput
                      label="Mot de passe"
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      error={touched.password ? errors.password : undefined}
                      leftIcon="lock"
                      secureTextEntry={!showPassword}
                      rightIcon={showPassword ? 'eye-off' : 'eye'}
                      onRightIconPress={() => setShowPassword(!showPassword)}
                    />

                    <CustomInput
                      label="Confirmer le mot de passe"
                      value={values.confirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      error={touched.confirmPassword ? errors.confirmPassword : undefined}
                      leftIcon="lock-check"
                      secureTextEntry={!showConfirmPassword}
                      rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
                      onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />

                    {error && (
                      <Text style={[styles.errorText, { color: theme.colors.error }]}>
                        {error}
                      </Text>
                    )}

                    <CustomButton
                      mode="contained"
                      onPress={handleSubmit}
                      loading={loading}
                      style={styles.button}
                    >
                      S'inscrire
                    </CustomButton>

                    <CustomButton
                      mode="text"
                      onPress={() => navigation.navigate('Login')}
                      style={styles.linkButton}
                    >
                      Déjà un compte ? Se connecter
                    </CustomButton>
                  </View>
                )}
              </Formik>
            </Surface>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  formContainer: {
    flex: 1,
  },
  surface: {
    padding: 20,
    borderRadius: 10,
  },
  form: {
    gap: 16,
  },
  button: {
    marginTop: 10,
  },
  linkButton: {
    marginTop: 10,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 10,
  },
});

export default RegisterScreen;
