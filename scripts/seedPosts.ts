import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

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
const db = getFirestore(app);

interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

// Fonction pour récupérer les utilisateurs depuis Firestore
const getUsers = async (): Promise<User[]> => {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<User, 'id'> }));
};

const samplePosts = async () => {
  const users = await getUsers();
  
  // Trouver les utilisateurs par email
  const findUser = (email: string) => users.find(u => u.email === email);
  
  const sophieUser = findUser('sophie.martin@example.com');
  const marcUser = findUser('marc.dubois@example.com');
  const emmaUser = findUser('emma.petit@example.com');
  const thomasUser = findUser('thomas.leroy@example.com');

  return [
    {
      category: 'Jardinage',
      description: 'Je propose mon aide pour la taille des haies et l\'entretien de votre jardin. Équipement professionnel et expérience de plusieurs années.',
      photos: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b'],
      createdAt: new Date(),
      requestor: {
        id: sophieUser?.id || 'unknown',
        name: sophieUser?.displayName || 'Sophie Martin',
        avatar: sophieUser?.photoURL || null
      },
      location: {
        address: '15 Rue des Lilas, 75020 Paris',
        coordinates: {
          latitude: 48.8566,
          longitude: 2.3522
        }
      },
      status: 'active'
    },
    {
      category: 'Bricolage',
      description: 'Électricien professionnel disponible pour petits travaux : installation de prises, diagnostic, réparations. Devis gratuit.',
      photos: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e'],
      createdAt: new Date(),
      requestor: {
        id: marcUser?.id || 'unknown',
        name: marcUser?.displayName || 'Marc Dubois',
        avatar: marcUser?.photoURL || null
      },
      location: {
        address: '8 Avenue des Roses, 75018 Paris',
        coordinates: {
          latitude: 48.8546,
          longitude: 2.3527
        }
      },
      status: 'active'
    },
    {
      category: 'Informatique',
      description: 'Je peux vous aider à configurer votre ordinateur, installer des logiciels, résoudre des problèmes de connexion. Étudiante en informatique.',
      photos: ['https://images.unsplash.com/photo-1517694712202-14dd9538aa97'],
      createdAt: new Date(),
      requestor: {
        id: emmaUser?.id || 'unknown',
        name: emmaUser?.displayName || 'Emma Petit',
        avatar: emmaUser?.photoURL || null
      },
      location: {
        address: '25 Rue du Commerce, 75015 Paris',
        coordinates: {
          latitude: 48.8576,
          longitude: 2.3512
        }
      },
      status: 'active'
    },
    {
      category: 'Cuisine',
      description: 'Chef cuisinier à la retraite, je propose des cours de cuisine française traditionnelle à domicile. Spécialités : sauces, pâtisserie.',
      photos: ['https://images.unsplash.com/photo-1556911220-bff31c812dba'],
      createdAt: new Date(),
      requestor: {
        id: thomasUser?.id || 'unknown',
        name: thomasUser?.displayName || 'Thomas Leroy',
        avatar: thomasUser?.photoURL || null
      },
      location: {
        address: '12 Rue de la Gaité, 75014 Paris',
        coordinates: {
          latitude: 48.8586,
          longitude: 2.3532
        }
      },
      status: 'active'
    },
    {
      category: 'Jardinage',
      description: 'Cherche aide pour créer un petit potager sur mon balcon. Conseils et assistance bienvenus !',
      createdAt: new Date(),
      requestor: {
        id: emmaUser?.id || 'unknown',
        name: emmaUser?.displayName || 'Emma Petit',
        avatar: emmaUser?.photoURL || null
      },
      location: {
        address: '25 Rue du Commerce, 75015 Paris',
        coordinates: {
          latitude: 48.8576,
          longitude: 2.3512
        }
      },
      status: 'active'
    },
    {
      category: 'Bricolage',
      description: 'Besoin d\'aide pour monter des meubles IKEA (armoire, table et chaises). Outils disponibles sur place.',
      createdAt: new Date(),
      requestor: {
        id: sophieUser?.id || 'unknown',
        name: sophieUser?.displayName || 'Sophie Martin',
        avatar: sophieUser?.photoURL || null
      },
      location: {
        address: '15 Rue des Lilas, 75020 Paris',
        coordinates: {
          latitude: 48.8566,
          longitude: 2.3522
        }
      },
      status: 'active'
    }
  ];
};

const seedPosts = async () => {
  try {
    console.log('Début de la création des posts...');
    
    const posts = await samplePosts();
    
    for (const post of posts) {
      await addDoc(collection(db, 'posts'), {
        ...post,
        createdAt: new Date(),
        likes: []
      });
      console.log(`Post créé pour ${post.requestor.name}`);
    }
    
    console.log('Tous les posts ont été créés avec succès !');
  } catch (error) {
    console.error('Erreur lors de la création des posts:', error);
  }
};

// Exécuter le script
console.log('Démarrage du script de création des posts...');
seedPosts()
  .then(() => {
    console.log('Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erreur lors de l\'exécution du script:', error);
    process.exit(1);
  });
