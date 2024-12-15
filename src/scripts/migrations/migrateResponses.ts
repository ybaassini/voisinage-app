import { collection, query, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../constants/collections';
import { PostResponse } from '../../types/responses';
import { UserProfile } from '../../types/user';

interface OldResponse {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRating?: number;
  createdAt: any;
  postId: string;
}

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (!userDoc.exists()) {
      console.log(`⚠️ User not found: ${userId}`);
      return null;
    }
    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error(`❌ Error fetching user ${userId}:`, error);
    return null;
  }
}

async function migrateResponses() {
  try {
    console.log('🚀 Starting responses migration...');
    let migratedCount = 0;
    let errorCount = 0;

    // Parcourir tous les posts
    const postsSnapshot = await getDocs(collection(db, COLLECTIONS.POSTS));
    
    for (const postDoc of postsSnapshot.docs) {
      const postId = postDoc.id;
      console.log(`\n📝 Processing post: ${postId}`);
      
      // Récupérer le demandeur du post
      const postData = postDoc.data();
      const requesterId = postData.requestor.id;
      const requesterProfile = await getUserProfile(requesterId);
      
      if (!requesterProfile) {
        console.log(`⚠️ Requester not found for post ${postId}, skipping responses`);
        continue;
      }

      // Récupérer toutes les réponses du post
      const responsesRef = collection(doc(db, COLLECTIONS.POSTS, postId), COLLECTIONS.RESPONSES);
      const responsesSnapshot = await getDocs(responsesRef);

      for (const responseDoc of responsesSnapshot.docs) {
        try {
          const oldResponse = responseDoc.data() as OldResponse;
          
          // Récupérer le profil de l'utilisateur qui a répondu
          const responserProfile = await getUserProfile(oldResponse.userId);
          
          if (!responserProfile) {
            console.log(`⚠️ Responser not found for response ${responseDoc.id}, skipping`);
            errorCount++;
            continue;
          }

          // Créer la nouvelle structure de réponse
          const newResponse: Partial<PostResponse> = {
            reponser: responserProfile,
            requester: requesterProfile,
            createdAt: oldResponse.createdAt,
          };

          // Mettre à jour le document
          await updateDoc(responseDoc.ref, newResponse);
          console.log(`✅ Migrated response: ${responseDoc.id}`);
          migratedCount++;

        } catch (error) {
          console.error(`❌ Error migrating response ${responseDoc.id}:`, error);
          errorCount++;
        }
      }
    }

    console.log('\n🏁 Migration completed!');
    console.log(`✅ Successfully migrated: ${migratedCount} responses`);
    console.log(`❌ Errors encountered: ${errorCount} responses`);

  } catch (error) {
    console.error('❌ Fatal error during migration:', error);
  }
}

// Exécuter la migration
migrateResponses().then(() => {
  console.log('Migration script finished');
  process.exit(0);
}).catch((error) => {
  console.error('Migration script failed:', error);
  process.exit(1);
});
