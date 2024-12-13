import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import * as geofireCommon from 'geofire-common';

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

async function applyGeohashToExistingPosts() {
  try {
    console.log('Starting geohash update process...');
    
    // Get all posts
    const postsRef = collection(db, 'posts');
    const querySnapshot = await getDocs(postsRef);
    
    console.log(`Found ${querySnapshot.size} posts to update`);
    
    const updatePromises = querySnapshot.docs.map(async (docSnapshot) => {
      const post = docSnapshot.data();
      
      if (!post.location?.coordinates?.latitude || !post.location?.coordinates?.longitude) {
        console.log(`Skipping post ${docSnapshot.id} - No valid location data`);
        return;
      }
      
      // Calculate geohash
      const geohash = geofireCommon.geohashForLocation([
        post.location.coordinates.latitude,
        post.location.coordinates.longitude
      ]);
      
      // Update the document with both geohash formats
      const postRef = doc(db, 'posts', docSnapshot.id);
      await updateDoc(postRef, {
        'location.geohash': geohash,
        'location.g': {
          geohash: geohash,
          geopoint: {
            latitude: post.location.coordinates.latitude,
            longitude: post.location.coordinates.longitude
          }
        }
      });
      
      console.log(`Updated post ${docSnapshot.id} with geohash: ${geohash}`);
    });
    
    await Promise.all(updatePromises);
    console.log('Geohash update process completed successfully!');
    
  } catch (error) {
    console.error('Error updating geohashes:', error);
  }
}

// Run the script
applyGeohashToExistingPosts();
