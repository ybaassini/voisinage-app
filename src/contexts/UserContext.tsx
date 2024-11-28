import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { userService } from '../services/userService';
import { UserProfile } from '../types/user';

interface UserContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  addSkill: (skillName: string, level: number) => Promise<void>;
  removeSkill: (skillName: string) => Promise<void>;
  updateAvatar: (imageUri: string) => Promise<void>;
  addPortfolioItem: (imageUri: string, description: string) => Promise<void>;
  removePortfolioItem: (itemId: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserProfile = async () => {
    if (!user?.uid) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const profile = await userService.getCurrentUserProfile(user.uid);
      setUserProfile(profile);
    } catch (err) {
      console.error('Erreur lors du chargement du profil:', err);
      setError('Impossible de charger le profil utilisateur');
    } finally {
      setLoading(false);
    }
  };

  // Charger le profil utilisateur au montage et quand l'utilisateur change
  useEffect(() => {
    loadUserProfile();
  }, [user?.uid]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.uid || !userProfile) return;

    try {
      setLoading(true);
      await userService.updateUserProfile(user.uid, updates);
      await loadUserProfile(); // Recharger le profil après la mise à jour
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await loadUserProfile();
  };

  const addSkill = async (skillName: string, level: number) => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      await userService.addSkill(user.uid, { name: skillName, level });
      await loadUserProfile();
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la compétence:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeSkill = async (skillName: string) => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      await userService.removeSkill(user.uid, skillName);
      await loadUserProfile();
    } catch (err) {
      console.error('Erreur lors de la suppression de la compétence:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (imageUri: string) => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      await userService.updateUserAvatar(user.uid, imageUri);
      await loadUserProfile();
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'avatar:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addPortfolioItem = async (imageUri: string, description: string) => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      await userService.addPortfolioItem(user.uid, imageUri, description);
      await loadUserProfile();
    } catch (err) {
      console.error('Erreur lors de l\'ajout au portfolio:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removePortfolioItem = async (itemId: string) => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      await userService.removePortfolioItem(user.uid, itemId);
      await loadUserProfile();
    } catch (err) {
      console.error('Erreur lors de la suppression du portfolio:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    userProfile,
    loading,
    error,
    updateProfile,
    refreshProfile,
    addSkill,
    removeSkill,
    updateAvatar,
    addPortfolioItem,
    removePortfolioItem,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
