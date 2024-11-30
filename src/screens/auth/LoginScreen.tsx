import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { loginUser } from '../../store/slices/authSlice';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('L\'email est requis'),
  password: Yup.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Le mot de passe est requis'),
});

const LoginScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    dispatch(loginUser(values));
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
              Bienvenue
            </Text>
            <Text variant="titleMedium" style={styles.subtitle}>
              Connectez-vous pour rejoindre votre communauté
            </Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.duration(1000).springify()}
            style={styles.formContainer}
          >
            <Surface style={styles.surface} elevation={2}>
              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleLogin}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <View style={styles.form}>
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
                      icon="login"
                    >
                      Se connecter
                    </CustomButton>

                    <CustomButton
                      mode="outlined"
                      onPress={() => navigation.navigate('Register')}
                      icon="account-plus"
                    >
                      Créer un compte
                    </CustomButton>

                    <CustomButton
                      mode="text"
                      onPress={() => navigation.navigate('ForgotPassword')}
                      icon="lock-reset"
                    >
                      Mot de passe oublié ?
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
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  surface: {
    padding: 24,
    borderRadius: 16,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    shadowOffset: { width: 0, height: 0 },
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

export default LoginScreen;
