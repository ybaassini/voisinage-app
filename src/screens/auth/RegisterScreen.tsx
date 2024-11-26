import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { registerUser } from '../../store/slices/authSlice';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const validationSchema = Yup.object().shape({
  displayName: Yup.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .required('Le nom est requis'),
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
});

const RegisterScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (values: { displayName: string; email: string; password: string }) => {
    dispatch(registerUser(values));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
                initialValues={{ displayName: '', email: '', password: '', confirmPassword: '' }}
                validationSchema={validationSchema}
                onSubmit={handleRegister}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <View style={styles.form}>
                    <CustomInput
                      label="Nom complet"
                      value={values.displayName}
                      onChangeText={handleChange('displayName')}
                      onBlur={handleBlur('displayName')}
                      error={touched.displayName ? errors.displayName : undefined}
                      leftIcon="account"
                    />

                    <CustomInput
                      label="Email"
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      error={touched.email ? errors.email : undefined}
                      keyboardType="email-address"
                      leftIcon="email"
                    />

                    <CustomInput
                      label="Mot de passe"
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      error={touched.password ? errors.password : undefined}
                      secureTextEntry={!showPassword}
                      leftIcon="lock"
                      rightIcon={showPassword ? 'eye-off' : 'eye'}
                      onRightIconPress={() => setShowPassword(!showPassword)}
                    />

                    <CustomInput
                      label="Confirmer le mot de passe"
                      value={values.confirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      error={touched.confirmPassword ? errors.confirmPassword : undefined}
                      secureTextEntry={!showConfirmPassword}
                      leftIcon="lock-check"
                      rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
                      onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />

                    {error && (
                      <Animated.View 
                        entering={FadeInDown.duration(300)}
                        style={styles.errorContainer}
                      >
                        <Text style={styles.errorText}>{error}</Text>
                      </Animated.View>
                    )}

                    <CustomButton
                      mode="contained"
                      onPress={handleSubmit}
                      loading={loading}
                      icon="account-plus"
                    >
                      S'inscrire
                    </CustomButton>

                    <CustomButton
                      mode="outlined"
                      onPress={() => navigation.navigate('Login')}
                      icon="login"
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
    </SafeAreaView>
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
    justifyContent: 'center',
    padding: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  surface: {
    padding: 24,
    borderRadius: 16,
  },
  form: {
    gap: 8,
  },
  errorContainer: {
    backgroundColor: 'rgba(176, 0, 32, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#B00020',
    marginVertical: 8,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
  },
});

export default RegisterScreen;
