import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { theme } from '../../theme/theme';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('L\'email est requis'),
});

const ForgotPasswordScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (values: { email: string }) => {
    try {
      setLoading(true);
      setError(null);
      const auth = getAuth();
      await sendPasswordResetEmail(auth, values.email);
      setSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('Aucun compte n\'est associé à cet email');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer plus tard.');
      }
    } finally {
      setLoading(false);
    }
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
              Mot de passe oublié ?
            </Text>
            <Text variant="titleMedium" style={styles.subtitle}>
              Entrez votre email pour réinitialiser votre mot de passe
            </Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.duration(1000).springify()}
            style={styles.formContainer}
          >
            <Surface style={styles.surface} elevation={2}>
              {success ? (
                <View style={styles.successContainer}>
                  <Text variant="titleMedium" style={styles.successTitle}>
                    Email envoyé !
                  </Text>
                  <Text style={styles.successText}>
                    Consultez votre boîte mail pour réinitialiser votre mot de passe.
                  </Text>
                  <CustomButton
                    mode="contained"
                    onPress={() => navigation.navigate('Login')}
                    icon="login"
                  >
                    Retour à la connexion
                  </CustomButton>
                </View>
              ) : (
                <Formik
                  initialValues={{ email: '' }}
                  validationSchema={validationSchema}
                  onSubmit={handleResetPassword}
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
                        autoCapitalize="none"
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
                        icon="email-send"
                      >
                        Envoyer le lien
                      </CustomButton>

                      <CustomButton
                        mode="outlined"
                        onPress={() => navigation.goBack()}
                        icon="arrow-left"
                      >
                        Retour
                      </CustomButton>
                    </View>
                  )}
                </Formik>
              )}
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
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: 16,
  },
  form: {
    gap: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(176, 0, 32, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#B00020',
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
  },
  successContainer: {
    alignItems: 'center',
    gap: 16,
  },
  successTitle: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  successText: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 8,
  },
});

export default ForgotPasswordScreen;
