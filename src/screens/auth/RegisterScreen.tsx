import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { registerUser } from '../../store/slices/authSlice';

const validationSchema = Yup.object().shape({
  displayName: Yup.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .required('Le nom est requis'),
  email: Yup.string()
    .email('Email invalide')
    .required('L\'email est requis'),
  password: Yup.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Le mot de passe est requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('La confirmation du mot de passe est requise'),
});

const RegisterScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleRegister = async (values: { displayName: string; email: string; password: string }) => {
    dispatch(registerUser(values));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Surface style={styles.surface}>
          <Text variant="headlineMedium" style={styles.title}>
            Inscription
          </Text>
          
          <Formik
            initialValues={{ displayName: '', email: '', password: '', confirmPassword: '' }}
            validationSchema={validationSchema}
            onSubmit={handleRegister}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.form}>
                <TextInput
                  label="Nom complet"
                  value={values.displayName}
                  onChangeText={handleChange('displayName')}
                  onBlur={handleBlur('displayName')}
                  error={touched.displayName && !!errors.displayName}
                  style={styles.input}
                />
                {touched.displayName && errors.displayName && (
                  <Text style={styles.errorText}>{errors.displayName}</Text>
                )}

                <TextInput
                  label="Email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && !!errors.email}
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                <TextInput
                  label="Mot de passe"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={touched.password && !!errors.password}
                  secureTextEntry
                  style={styles.input}
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                <TextInput
                  label="Confirmer le mot de passe"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  error={touched.confirmPassword && !!errors.confirmPassword}
                  secureTextEntry
                  style={styles.input}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}

                {error && <Text style={styles.errorText}>{error}</Text>}

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  style={styles.button}
                >
                  S'inscrire
                </Button>

                <Button
                  mode="text"
                  onPress={() => navigation.navigate('Login')}
                  style={styles.button}
                >
                  Déjà un compte ? Se connecter
                </Button>
              </View>
            )}
          </Formik>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  surface: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 8,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: -8,
  },
});

export default RegisterScreen;
