import { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { userService } from '../services/userService';
import { UserProfile, CreateUserProfileData } from '../types/user';

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userProfile: null,
    loading: true,
    error: null,
  });

  const createInitialProfile = async (user: User): Promise<UserProfile> => {
    // Extraire le nom et le prénom de l'email si pas de displayName
    let firstName = '', lastName = '';
    if (user.displayName) {
      [firstName, lastName] = user.displayName.split(' ');
    } else if (user.email) {
      firstName = user.email.split('@')[0];
      lastName = '';
    }

    const profileData: CreateUserProfileData = {
      email: user.email || '',
      firstName,
      lastName,
      bio: 'Bienvenue sur mon profil !',
      location: {
        address: 'Non spécifiée',
        coordinates: null,
      },
      avatar: user.photoURL || null,
      skills: [],
      portfolio: [],
    };

    return await userService.createUserProfile(user.uid, profileData);
  };

  const updateProfile = useCallback(async (userId: string, updates: Partial<UserProfile>) => {
    try {
      await userService.updateUserProfile(userId, updates);
      const updatedProfile = await userService.getUserProfile(userId);
      if (updatedProfile) {
        setAuthState(prev => ({
          ...prev,
          userProfile: updatedProfile,
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }, []);

  const refreshProfile = useCallback(async (userId: string) => {
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
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          if (user) {
            setAuthState(prev => ({ ...prev, loading: true }));
            
            // Récupérer ou créer le profil utilisateur
            let userProfile = await userService.getUserProfile(user.uid);
            
            if (!userProfile) {
              console.log('Création d\'un nouveau profil pour:', user.uid);
              userProfile = await createInitialProfile(user);
            } else {
              // Mettre à jour la dernière connexion silencieusement
              userService.updateUserProfile(user.uid, {})
                .catch(err => console.error('Erreur lors de la mise à jour de lastLoginAt:', err));
            }

            setAuthState({
              user,
              userProfile,
              loading: false,
              error: null,
            });
          } else {
            setAuthState({
              user: null,
              userProfile: null,
              loading: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Erreur lors de la gestion du profil utilisateur:', error);
          setAuthState({
            user: null,
            userProfile: null,
            loading: false,
            error: error.message,
          });
        }
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    ...authState,
    updateProfile,
    refreshProfile,
  };
};
