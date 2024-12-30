import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, FirebaseAuthTypes } from '@react-native-firebase/auth';
import { authInstance } from '../config/firebase';
import { userService } from '../services/userService';
import { UserProfile } from '../types/user';

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: authInstance.currentUser as FirebaseAuthTypes.User | null,
    userProfile: null,
    loading: true,
    error: null,
  });

  const updateProfile = useCallback(async (userId: string, updates: Partial<UserProfile>) => {
    try {
      await userService.updateUserProfile(userId, updates);
      // Au lieu de refaire un appel, mettre à jour directement l'état
      setAuthState(prev => ({
        ...prev,
        userProfile: prev.userProfile ? { ...prev.userProfile, ...updates } : null,
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }, []);

  const refreshProfile = useCallback(async (userId: string) => {
    if (!userId || authState.loading) return;
    
    try {
      const profile = await userService.getUserProfile(userId);
      if (profile) {
        setAuthState(prev => ({
          ...prev,
          userProfile: profile,
        }));
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du profil:', error);
    }
  }, [authState.loading]);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(authInstance);
      setAuthState({
        user: null,
        userProfile: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let profileLoading = false;

    const loadProfile = async (user: FirebaseAuthTypes.User) => {
      if (profileLoading || !isMounted) return;
      
      profileLoading = true;
      try {
        const profile = await userService.getUserProfile(user.uid);
        if (isMounted) {
          setAuthState({
            user,
            userProfile: profile,
            loading: false,
            error: profile ? null : 'Profil non trouvé',
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        if (isMounted) {
          setAuthState({
            user: null,
            userProfile: null,
            loading: false,
            error: error.message,
          });
        }
      } finally {
        profileLoading = false;
      }
    };

    // Charger le profil initial si l'utilisateur est déjà connecté
    const currentUser = authInstance.currentUser;
    if (currentUser && !authState.userProfile && !profileLoading) {
      loadProfile(currentUser);
    }

    // Écouter les changements d'authentification
    const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
      if (!isMounted) return;

      if (user) {
        // Mettre à jour immédiatement l'utilisateur
        setAuthState(prev => ({
          ...prev,
          user,
          loading: !prev.userProfile,
        }));

        // Charger le profil si nécessaire
        if (!authState.userProfile) {
          loadProfile(user);
        }
      } else {
        // Réinitialiser l'état si déconnecté
        setAuthState({
          user: null,
          userProfile: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return {
    ...authState,
    updateProfile,
    refreshProfile,
    signOut,
  };
};
