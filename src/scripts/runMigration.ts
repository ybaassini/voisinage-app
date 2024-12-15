import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { cleanupResponses } from './migrations/cleanupResponses';
import { seedResponses } from './migrations/seedResponses';

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

async function runMigration() {
  try {
    // Step 1: Clean up invalid responses
    await cleanupResponses(db);
    
    // Step 2: Add new sample responses
    await seedResponses(db);
    
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
