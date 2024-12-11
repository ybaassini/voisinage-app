import { db } from '../src/config/firebase';
import { collection, getDocs, doc, addDoc, Timestamp } from 'firebase/firestore';

const POSTS_COLLECTION = 'posts';
const RESPONSES_COLLECTION = 'responses';

const sampleUsers = [
  {
    userId: 'user1',
    userName: 'Sophie Martin',
    userAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    userId: 'user2',
    userName: 'Thomas Dubois',
    userAvatar: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    userId: 'user3',
    userName: 'Emma Bernard',
    userAvatar: 'https://randomuser.me/api/portraits/women/3.jpg',
  },
  {
    userId: 'user4',
    userName: 'Lucas Petit',
    userAvatar: 'https://randomuser.me/api/portraits/men/4.jpg',
  },
  {
    userId: 'user5',
    userName: 'Julie Moreau',
    userAvatar: 'https://randomuser.me/api/portraits/women/5.jpg',
  },
];

const addResponsesToPost = async (postId: string) => {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const numResponses = Math.floor(Math.random() * 3) + 1; // 1 à 3 réponses par post
  
  const selectedUsers = [...sampleUsers]
    .sort(() => 0.5 - Math.random())
    .slice(0, numResponses);

  for (const user of selectedUsers) {
    const responseData = {
      ...user,
      createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)), // Réponses dans les 7 derniers jours
    };

    try {
      await addDoc(collection(postRef, RESPONSES_COLLECTION), responseData);
      console.log(`Réponse ajoutée au post ${postId}`);
    } catch (error) {
      console.error(`Erreur lors de l'ajout de la réponse au post ${postId}:`, error);
    }
  }
};

const seedResponses = async () => {
  try {
    const postsSnapshot = await getDocs(collection(db, POSTS_COLLECTION));
    
    for (const postDoc of postsSnapshot.docs) {
      await addResponsesToPost(postDoc.id);
    }
    
    console.log('Ajout des réponses terminé !');
  } catch (error) {
    console.error('Erreur lors de l\'ajout des réponses:', error);
  }
};

// Exécuter le script
seedResponses();
