import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { CreateUserProfileData } from '../src/types/user';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD_kkFBrSweOuSt6Bzw7bvsM8EBTF1tlG8",
  authDomain: "jirani-5f130.firebaseapp.com",
  projectId: "jirani-5f130",
  storageBucket: "jirani-5f130.appspot.com",
  messagingSenderId: "141735429392",
  appId: "1:141735429392:web:103a6c5126192cfc1e5195",
  measurementId: "G-K04LHYYPP0"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Import userService après l'initialisation de Firebase
import { userService } from '../src/services/userService';

const users = [
  {
    email: 'sophie.martin@example.com',
    password: 'Test123!',
    profile: {
      email: 'sophie.martin@example.com',
      firstName: 'Sophie',
      lastName: 'Martin',
      bio: 'Passionnée de jardinage et de bricolage. J\'adore partager mes connaissances et aider mes voisins à entretenir leurs espaces verts.',
      location: {
        address: '15 Rue des Lilas, 75020 Paris',
        coordinates: {
          latitude: 48.8566,
          longitude: 2.3522
        }
      },
      skills: [
        { name: 'Jardinage', level: 5 },
        { name: 'Bricolage', level: 4 },
        { name: 'Menuiserie', level: 3 }
      ],
      portfolio: [],
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
    } as CreateUserProfileData
  },
  {
    email: 'marc.dubois@example.com',
    password: 'Test123!',
    profile: {
      email: 'marc.dubois@example.com',
      firstName: 'Marc',
      lastName: 'Dubois',
      bio: 'Électricien professionnel avec 15 ans d\'expérience. Disponible pour des dépannages et conseils en électricité domestique.',
      location: {
        address: '8 Avenue des Roses, 75018 Paris',
        coordinates: {
          latitude: 48.8546,
          longitude: 2.3527
        }
      },
      skills: [
        { name: 'Électricité', level: 5 },
        { name: 'Domotique', level: 4 },
        { name: 'Plomberie', level: 2 }
      ],
      portfolio: [],
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
    } as CreateUserProfileData
  },
  {
    email: 'emma.petit@example.com',
    password: 'Test123!',
    profile: {
      email: 'emma.petit@example.com',
      firstName: 'Emma',
      lastName: 'Petit',
      bio: 'Étudiante en informatique, je propose mon aide pour tout ce qui concerne l\'informatique et les nouvelles technologies.',
      location: {
        address: '25 Rue du Commerce, 75015 Paris',
        coordinates: {
          latitude: 48.8576,
          longitude: 2.3512
        }
      },
      skills: [
        { name: 'Informatique', level: 5 },
        { name: 'Smartphone', level: 5 },
        { name: 'Réseaux', level: 4 }
      ],
      portfolio: [],
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg'
    } as CreateUserProfileData
  },
  {
    email: 'thomas.leroy@example.com',
    password: 'Test123!',
    profile: {
      email: 'thomas.leroy@example.com',
      firstName: 'Thomas',
      lastName: 'Leroy',
      bio: 'Ancien chef cuisinier, je partage ma passion pour la cuisine et donne des cours particuliers. Spécialisé dans la cuisine française traditionnelle.',
      location: {
        address: '12 Rue de la Gaité, 75014 Paris',
        coordinates: {
          latitude: 48.8586,
          longitude: 2.3532
        }
      },
      skills: [
        { name: 'Cuisine', level: 5 },
        { name: 'Pâtisserie', level: 4 },
        { name: 'Organisation d\'événements', level: 3 }
      ],
      portfolio: [],
      avatar: 'https://randomuser.me/api/portraits/men/4.jpg'
    } as CreateUserProfileData
  }
];

const deleteExistingUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await deleteUser(userCredential.user);
    console.log(`Utilisateur ${email} supprimé avec succès`);
  } catch (error: any) {
    if (error.code !== 'auth/user-not-found') {
      console.error(`Erreur lors de la suppression de l'utilisateur ${email}:`, error);
    }
  }
};

const seedUsers = async () => {
  try {
    console.log('Début de la création des utilisateurs...');

    // Supprimer les utilisateurs existants
    console.log('Suppression des utilisateurs existants...');
    for (const user of users) {
      await deleteExistingUser(user.email, user.password);
    }

    // Créer les nouveaux utilisateurs
    for (const user of users) {
      console.log(`\nCréation de l'utilisateur ${user.email}...`);
      
      try {
        // Créer l'utilisateur dans Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );
        
        console.log(`Compte Firebase créé pour ${user.email}`);

        // Créer le profil utilisateur dans Firestore
        await userService.createUserProfile(userCredential.user.uid, user.profile);
        console.log(`Profil utilisateur créé pour ${user.email}`);
        
        // Ajouter quelques notes aléatoires
        console.log(`Ajout des notes pour ${user.email}...`);
        const numberOfRatings = Math.floor(Math.random() * 10) + 5; // 5-15 notes
        for (let i = 0; i < numberOfRatings; i++) {
          const rating = Math.floor(Math.random() * 2) + 4; // Notes entre 4 et 5
          await userService.updateRating(userCredential.user.uid, rating);
        }
        
        console.log(`✅ Utilisateur ${user.email} créé avec succès !`);
      } catch (error: any) {
        console.error(`❌ Erreur lors de la création de l'utilisateur ${user.email}:`, error);
        if (error.code === 'auth/email-already-in-use') {
          console.log(`L'email ${user.email} est déjà utilisé. Tentative de suppression...`);
          await deleteExistingUser(user.email, user.password);
          console.log('Réessayez de lancer le script.');
        }
      }
    }
    
    console.log('\n✅ Tous les utilisateurs ont été créés avec succès !');
  } catch (error) {
    console.error('\n❌ Erreur lors de la création des utilisateurs :', error);
  }
};

// Exécuter le script
console.log('Démarrage du script de création des utilisateurs...\n');
seedUsers()
  .then(() => {
    console.log('\nScript terminé.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nErreur fatale :', error);
    process.exit(1);
  });
