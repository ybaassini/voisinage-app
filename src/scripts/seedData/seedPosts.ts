import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, query, limit, Timestamp } from 'firebase/firestore';
import { UserProfile } from '../../types/user';
import { Post } from '../../types/post';
import { PostResponse } from '../../types/responses';
import { POST_STATUS } from '../../constants/status';

const firebaseConfig = {
  apiKey: "AIzaSyD_kkFBrSweOuSt6Bzw7bvsM8EBTF1tlG8",
  authDomain: "jirani-5f130.firebaseapp.com",
  projectId: "jirani-5f130",
  storageBucket: "jirani-5f130.appspot.com",
  messagingSenderId: "141735429392",
  appId: "1:141735429392:web:103a6c5126192cfc1e5195",
  measurementId: "G-K04LHYYPP0",
  databaseURL: "https://jirani-5f130-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getExistingUsers(): Promise<UserProfile[]> {
  console.log('🔍 Récupération des utilisateurs existants...');
  const usersRef = collection(db, 'users');
  const q = query(usersRef, limit(5)); // Limiter à 5 utilisateurs pour l'exemple
  const userDocs = await getDocs(q);
  
  const users = userDocs.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as UserProfile[];
  
  console.log(`✅ ${users.length} utilisateurs récupérés`);
  return users;
}

function generateResponses(users: UserProfile[], requestor: UserProfile): Omit<PostResponse, 'id'>[] {
  const responders = users.filter(user => user.id !== requestor.id);
  
  return responders.map(responser => ({
    content: `Je peux vous aider ! J'ai de l'expérience en ${responser.skills?.[0]?.name || 'ce domaine'}.`,
    responser,
    requestor,
    createdAt: Timestamp.fromDate(new Date()),
    status: Math.random() > 0.5 ? 'accepted' : 'pending',
    rating: Math.random() > 0.5 ? Math.floor(Math.random() * 2) + 4 : 0 // Note entre 4 et 5 ou 0
  }));
}

async function clearExistingData() {
  console.log('🧹 Nettoyage des données existantes...');
  
  // Supprimer les posts existants
  const postsRef = collection(db, 'posts');
  const postDocs = await getDocs(postsRef);
  
  for (const doc of postDocs.docs) {
    // Supprimer d'abord les réponses
    const responsesRef = collection(db, `posts/${doc.id}/responses`);
    const responseDocs = await getDocs(responsesRef);
    
    for (const responseDoc of responseDocs.docs) {
      await deleteDoc(responseDoc.ref);
    }
    
    // Puis supprimer le post
    await deleteDoc(doc.ref);
  }
  
  console.log(`✅ ${postDocs.size} posts et leurs réponses ont été supprimés`);
}

async function seedData() {
  try {
    // Récupérer les utilisateurs existants
    const users = await getExistingUsers();
    if (users.length < 2) {
      throw new Error('Il faut au moins 2 utilisateurs dans la base de données');
    }

    // Nettoyer les données existantes
    await clearExistingData();
    
    console.log('🌱 Début de l\'ajout des nouvelles données...');
    
    // Création des posts
    const posts = [
      {
        type: 'request',
        title: 'Besoin d\'aide pour déménagement',
        description: 'Je déménage le weekend prochain et j\'aurais besoin d\'aide pour porter des meubles et des cartons. Je fournis le café et le repas !',
        category: 'Déménagement',
        photos: ['https://images.unsplash.com/photo-1600518464441-9154a4dea21b'],
        requestor: users[0],
        location: {
          ...users[0].location,
          geohash: users[0].location.geohash,
          g: {
            geohash: users[0].location.geohash,
            geopoint: users[0].location.coordinates
          },
        },
        createdAt: Timestamp.fromDate(new Date()),
        status: POST_STATUS.ACTIVE,
        likes: []
      },
      {
        type: 'request',
        title: 'Cours de mathématiques niveau terminale',
        description: 'Mon fils est en terminale S et a des difficultés en mathématiques. Nous recherchons quelqu\'un pour l\'aider à préparer le bac. Idéalement 2h par semaine.',
        category: 'Éducation',
        requestor: users[1],
        location: {
          ...users[1].location,
          geohash: users[1].location.geohash,
          g: {
            geohash: users[1].location.geohash,
            geopoint: users[1].location.coordinates
          },
        },
        createdAt: Timestamp.fromDate(new Date()),
        status: POST_STATUS.ACTIVE,
        likes: []
      },
      {
        type: 'request',
        title: 'Réparation fuite robinet cuisine',
        description: 'Mon robinet de cuisine fuit et j\'ai besoin d\'aide pour le réparer. C\'est assez urgent.',
        category: 'Bricolage',
        photos: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7'],
        requestor: users[0],
        location: {
          ...users[0].location,
          geohash: users[0].location.geohash,
          g: {
            geohash: users[0].location.geohash,
            geopoint: users[0].location.coordinates
          },
        },
        createdAt: Timestamp.fromDate(new Date()),
        status: 'active',
        likes: []
      },
      {
        type: 'request',
        title: 'Garde de chat pendant les vacances',
        description: 'Je pars en vacances pendant 2 semaines et je cherche quelqu\'un pour s\'occuper de mon chat. Il est très affectueux et facile à vivre.',
        category: 'Animaux',
        photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba'],
        requestor: users[2],
        location: {
          ...users[2].location,
          geohash: users[2].location.geohash,
          g: {
            geohash: users[2].location.geohash,
            geopoint: users[2].location.coordinates
          },
        },
        createdAt: Timestamp.fromDate(new Date()),
        status: 'active',
        likes: []
      },
      {
        type: 'request',
        title: 'Initiation à la guitare',
        description: 'Je cherche quelqu\'un pour me donner des cours de guitare débutant. J\'ai ma propre guitare acoustique.',
        category: 'Musique',
        requestor: users[3],
        location: {
          ...users[3].location,
          geohash: 'u2q2n',
          g: {
            geohash: 'u2q2n',
            geopoint: users[3].location.coordinates
          },
        },
        createdAt: Timestamp.fromDate(new Date()),
        status: POST_STATUS.ACTIVE,
        likes: []
      },
      {
        type: 'request',
        title: 'Aide pour monter un meuble IKEA',
        description: 'Je viens d\'acheter une armoire IKEA et j\'aurais besoin d\'aide pour la monter. Le montage devrait prendre environ 2-3 heures.',
        category: 'Bricolage',
        photos: ['https://images.unsplash.com/photo-1631679706909-1844bbd07221'],
        requestor: users[1],
        location: {
          ...users[1].location,
          geohash: users[1].location.geohash,
          g: {
            geohash: users[1].location.geohash,
            geopoint: users[1].location.coordinates
          },
        },
        createdAt: Timestamp.fromDate(new Date()),
        status: POST_STATUS.ACTIVE,
        likes: []
      },
      {
        type: 'request',
        title: 'Cours de cuisine italienne',
        description: 'Je cherche quelqu\'un qui pourrait m\'apprendre à faire des pâtes fraîches et des sauces maison. Idéalement chez moi car j\'ai tout l\'équipement nécessaire.',
        category: 'Cuisine',
        requestor: users[2],
        location: {
          ...users[2].location,
          geohash: users[2].location.geohash,
          g: {
            geohash: users[2].location.geohash,
            geopoint: users[2].location.coordinates
          },
        },
        createdAt: Timestamp.fromDate(new Date()),
        status: POST_STATUS.ACTIVE,
        likes: []
      },
      {
        type: 'request',
        title: 'Aide au jardinage',
        description: 'Je cherche de l\'aide pour tailler mes arbres fruitiers et entretenir mon potager. Le jardin fait environ 200m².',
        category: 'Jardinage',
        photos: ['https://images.unsplash.com/photo-1599629954294-16b7f4fb9f38'],
        requestor: users[0],
        location: {
          ...users[0].location,
          geohash: users[0].location.geohash,
          g: {
            geohash: users[0].location.geohash,
            geopoint: users[0].location.coordinates
          },
        },
        createdAt: Timestamp.fromDate(new Date()),
        status: POST_STATUS.ACTIVE,
        likes: []
      },
      {
        type: 'request',
        title: 'Cours de photographie',
        description: 'Débutant en photographie, je cherche quelqu\'un pour m\'apprendre les bases (composition, exposition, etc.). J\'ai un reflex numérique.',
        category: 'Art',
        requestor: users[3],
        location: {
          ...users[3].location,
          geohash: users[3].location.geohash,
          g: {
            geohash: users[3].location.geohash,
            geopoint: users[3].location.coordinates
          },
        },
        createdAt: Timestamp.fromDate(new Date()),
        status: 'active',
        likes: []
      },
      {
        type: 'request',
        title: 'Aide informatique pour senior',
        description: 'Ma grand-mère aimerait apprendre à utiliser une tablette pour faire des appels vidéo avec la famille. Nous cherchons quelqu\'un de patient pour lui expliquer.',
        category: 'Informatique',
        requestor: users[1],
        location: {
          ...users[1].location,
          geohash: users[1].location.geohash,
          g: {
            geohash: users[1].location.geohash,
            geopoint: users[1].location.coordinates
          },
        },
        createdAt: Timestamp.fromDate(new Date()),
        status: POST_STATUS.ACTIVE,
        likes: []
      }
    ];
    
    for (const post of posts) {
      // Créer le post
      const postRef = await addDoc(collection(db, 'posts'), {
        ...post,
        distance: 0, // La distance sera calculée côté client
      });
      
      console.log(`✅ Post créé: ${postRef.id}`);
      
      // Générer et ajouter les réponses pour ce post
      const responses = generateResponses(users, post.requestor);
      for (const response of responses) {
        const responseRef = await addDoc(collection(db, `posts/${postRef.id}/responses`), response);
        console.log(`  ↳ Réponse ajoutée: ${responseRef.id}`);
      }
    }
    
    console.log('🎉 Données ajoutées avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données:', error);
    process.exit(1);
  }
}

// Lancer le script
seedData();
