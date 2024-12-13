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

  const createInitialProfile = async (user: UserProfile): Promise<UserProfile> => {

    const profileData: CreateUserProfileData = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: 'Bienvenue sur mon profil !',
      location: {
        address: 'Non spécifiée',
        coordinates: {
          latitude: 0,
          longitude: 0
        },
      },
      avatar: user.avatar,
      skills: [],
      portfolio: [],
    };

    return await userService.createUserProfile(user.id, profileData);
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
