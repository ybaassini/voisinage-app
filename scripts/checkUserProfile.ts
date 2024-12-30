import { authInstance, db } from '../src/config/firebase';
import { UserProfile } from '../src/types/user';

async function checkUserProfile() {
  console.log('Vérification du profil utilisateur...');

  // Attendre que l'authentification soit initialisée
  await new Promise(resolve => setTimeout(resolve, 1000));

  const user = authInstance.currentUser;
  if (!user) {
    console.log('Aucun utilisateur connecté');
    return;
  }

  console.log('Utilisateur connecté:', user.uid);
  try {
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('Profil non trouvé');
    } else {
      console.log('Profil existant:', userDoc.data());
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du profil:', error);
  }
}

checkUserProfile();
