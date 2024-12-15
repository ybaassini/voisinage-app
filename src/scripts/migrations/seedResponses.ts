import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { UserProfile } from '../../types/user';

const sampleUsers: UserProfile[] = [
  {
    id: 'uQW4ZvN9kXhYmP2RsT5L',
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.martin@example.com',
    location: {
      address: '15 Rue de Paris, 75001 Paris',
      coordinates: {
        latitude: 48.8566,
        longitude: 2.3522
      }
    },
    bio: 'Passionnée d\'entraide et de rencontres. Je suis toujours prête à donner un coup de main !',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    rating: { average: 4.8, count: 15 },
    skills: [
      { name: 'Bricolage', level: 4 },
      { name: 'Jardinage', level: 3 }
    ],
    portfolio: [],
    createdAt: new Date(),
    lastLoginAt: new Date()
  },
  {
    id: 'vR3MkL7JpQwXn8YhB4C',
    firstName: 'Thomas',
    lastName: 'Dubois',
    email: 'thomas.dubois@example.com',
    location: {
      address: '25 Rue du Commerce, 69002 Lyon',
      coordinates: {
        latitude: 45.7578,
        longitude: 4.8320
      }
    },
    bio: 'Professionnel du bâtiment à la retraite, je partage mon expérience avec plaisir.',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    rating: { average: 4.5, count: 8 },
    skills: [
      { name: 'Plomberie', level: 5 },
      { name: 'Électricité', level: 4 }
    ],
    portfolio: [],
    createdAt: new Date(),
    lastLoginAt: new Date()
  },
  {
    id: 'wS6NmH9DtUvYk4XpE7F',
    firstName: 'Emma',
    lastName: 'Bernard',
    email: 'emma.bernard@example.com',
    location: {
      address: '8 Avenue des Fleurs, 33000 Bordeaux',
      coordinates: {
        latitude: 44.8378,
        longitude: -0.5792
      }
    },
    bio: 'Enseignante et mère de trois enfants, j\'adore partager mes connaissances.',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    rating: { average: 4.9, count: 20 },
    skills: [
      { name: 'Soutien scolaire', level: 5 },
      { name: 'Garde d\'enfants', level: 5 }
    ],
    portfolio: [],
    createdAt: new Date(),
    lastLoginAt: new Date()
  }
];

const sampleResponses = [
  {
    content: "Je peux vous aider avec votre déménagement ce week-end. J'ai de l'expérience et une camionnette.",
    rating: 5,
    status: 'accepted',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    content: "Je suis disponible pour garder vos enfants pendant les vacances. Je suis diplômée en petite enfance.",
    rating: 4,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    content: "Je peux vous donner des cours de mathématiques. J'ai 5 ans d'expérience en tant que professeur.",
    rating: 5,
    status: 'accepted',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export async function seedResponses(db: any) {
  console.log('🌱 Starting to seed responses...');
  
  try {
    // Get all posts
    const postsRef = collection(db, 'posts');
    const postDocs = await getDocs(postsRef);
    
    let addedCount = 0;
    
    for (const postDoc of postDocs.docs) {
      const responsesRef = collection(db, `posts/${postDoc.id}/responses`);
      
      // Add 1-2 responses per post
      const numResponses = Math.floor(Math.random() * 2) + 1;
      
      for (let i = 0; i < numResponses; i++) {
        const randomResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
        const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
        
        const newResponse = {
          ...randomResponse,
          responser: randomUser,
          requester: sampleUsers[0], // Using first user as requester for consistency
        };
        
        await addDoc(responsesRef, newResponse);
        addedCount++;
        console.log(`✅ Added new response to post: ${postDoc.id}`);
      }
    }
    
    console.log(`🎉 Seeding completed! Added ${addedCount} new responses`);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}
