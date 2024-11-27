import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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

const samplePosts = [
  {
    category: 'Outils',
    description: 'Je prête ma perceuse Bosch Professional GSB 18V-50 avec 2 batteries. Idéale pour les travaux de bricolage. Disponible ce weekend.',
    photos: ['https://images.unsplash.com/photo-1586864387967-d02ef85d93e8'],
    createdAt: new Date(),
    requestor: {
      id: 'user1',
      name: 'Marie Dubois',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    location: {
      address: '15 Rue de la République, Lyon',
      coordinates: {
        latitude: 45.7640,
        longitude: 4.8357
      }
    },
    status: 'active'
  },
  {
    category: 'Services',
    description: 'Professeur de guitare depuis 10 ans, je propose des cours particuliers pour débutants et intermédiaires. Première séance gratuite.',
    photos: ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1'],
    createdAt: new Date(),
    requestor: {
      id: 'user2',
      name: 'Pierre Martin',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    location: {
      address: '8 Avenue Jean Jaurès, Lyon',
      coordinates: {
        latitude: 45.7578,
        longitude: 4.8320
      }
    },
    status: 'active'
  },
  {
    category: 'Sports',
    description: 'Recherche partenaire(s) pour jouer au tennis le weekend. Niveau intermédiaire. Je dispose de raquettes supplémentaires.',
    photos: ['https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0'],
    createdAt: new Date(),
    requestor: {
      id: 'user3',
      name: 'Sophie Bernard',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    location: {
      address: 'Parc de la Tête d\'Or, Lyon',
      coordinates: {
        latitude: 45.7771,
        longitude: 4.8520
      }
    },
    status: 'active'
  },
  {
    category: 'Education',
    description: 'Je donne des cours de mathématiques niveau lycée. Spécialisé en préparation au bac S. Méthodologie et exercices personnalisés.',
    createdAt: new Date(),
    requestor: {
      id: 'user4',
      name: 'Lucas Petit',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
    },
    location: {
      address: '25 Rue de la Part-Dieu, Lyon',
      coordinates: {
        latitude: 45.7605,
        longitude: 4.8570
      }
    },
    status: 'active'
  },
  {
    category: 'Outils',
    description: 'Échelle télescopique 3.8m à emprunter. Parfaite pour travaux en hauteur. Très stable et facile à transporter.',
    photos: ['https://images.unsplash.com/photo-1590674899484-d5640e854abe'],
    createdAt: new Date(),
    requestor: {
      id: 'user5',
      name: 'Thomas Roux',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    location: {
      address: '12 Rue Garibaldi, Lyon',
      coordinates: {
        latitude: 45.7512,
        longitude: 4.8520
      }
    },
    status: 'active'
  }
];

async function seedPosts() {
  try {
    console.log('Début de l\'ajout des posts...');
    
    for (const post of samplePosts) {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...post,
        createdAt: new Date() // Assurer que chaque post a une date différente
      });
      console.log('Post ajouté avec ID:', docRef.id);
    }
    
    console.log('Tous les posts ont été ajoutés avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'ajout des posts:', error);
  }
}

// Exécuter le script
seedPosts();
