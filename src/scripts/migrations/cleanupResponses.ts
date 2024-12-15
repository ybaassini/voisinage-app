import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export async function cleanupResponses(db: any) {
  console.log('🧹 Starting cleanup of invalid responses...');
  
  try {
    const postsRef = collection(db, 'posts');
    const postDocs = await getDocs(postsRef);
    
    let deletedCount = 0;
    
    for (const postDoc of postDocs.docs) {
      const responsesRef = collection(db, `posts/${postDoc.id}/responses`);
      const responseDocs = await getDocs(responsesRef);
      
      for (const responseDoc of responseDocs.docs) {
        const responseData = responseDoc.data();
        
        // Check if the response has invalid user references
        if (
          responseData.userId?.startsWith('user') || 
          !responseData.userId ||
          responseData.userId === '27Gxd9cNaNT6YMiZHQs8PKq2lZg1'
        ) {
          // Delete the invalid response
          await deleteDoc(doc(db, `posts/${postDoc.id}/responses/${responseDoc.id}`));
          deletedCount++;
          console.log(`🗑️ Deleted invalid response: ${responseDoc.id}`);
        }
      }
    }
    
    console.log(`✅ Cleanup completed! Deleted ${deletedCount} invalid responses`);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}
