import { auth, db } from '../src/config/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { UserProfile } from '../src/types/user';

const USERS_COLLECTION = 'users';

async function checkUserProfile() {
  // Attendre que l'authentification soit initialisée
  await new Promise(resolve => setTimeout(resolve, 1000));

  const user = auth.currentUser;
  if (!user) {
    console.log('Aucun utilisateur connecté');
    return;
  }

  console.log('Utilisateur connecté:', user.uid);

  try {
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.log('Création d\'un nouveau profil utilisateur');
      
      const newProfile: UserProfile = {
        id: user.uid,
        firstName: 'Nouvel',
        lastName: 'Utilisateur',
        email: user.email || '',
        bio: 'Aucune biographie disponible.',
        avatar: null,
        location: {
          address: 'Non spécifiée',
          coordinates: null
        },
        rating: {
          average: 0,
          count: 0
        },
        skills: [],
        portfolio: [],
        createdAt: new Date(),
        lastLoginAt: new Date()
      };

      await setDoc(userRef, {
        ...newProfile,
        createdAt: Timestamp.fromDate(newProfile.createdAt),
        lastLoginAt: Timestamp.fromDate(newProfile.lastLoginAt)
      });

      console.log('Profil créé avec succès');
    } else {
      console.log('Profil existant:', userDoc.data());
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du profil:', error);
  }
}

checkUserProfile();
