import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD_kkFBrSweOuSt6Bzw7bvsM8EBTF1tlG8",
  authDomain: "jirani-5f130.firebaseapp.com",
  projectId: "jirani-5f130",
  storageBucket: "jirani-5f130.firebasestorage.app",
  messagingSenderId: "141735429392",
  appId: "1:141735429392:web:103a6c5126192cfc1e5195",
  measurementId: "G-K04LHYYPP0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function createTestUser() {
  try {
    const email = 'test@voisinage.app';
    const password = 'Test123!';
    const displayName = 'Utilisateur Test';

    console.log('Création du compte test...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    console.log('Mise à jour du profil...');
    await updateProfile(userCredential.user, {
      displayName: displayName
    });

    console.log('Compte test créé avec succès !');
    console.log('Email:', email);
    console.log('Mot de passe:', password);
    console.log('Nom:', displayName);
  } catch (error: any) {
    console.error('Erreur lors de la création du compte:', error.message);
  }
}

createTestUser();
