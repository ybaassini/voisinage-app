import { Platform } from 'react-native';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';
import getEnvVars from './env';

const envVars = getEnvVars();

const firebaseConfig = {
  apiKey: envVars.firebaseApiKey,
  authDomain: envVars.firebaseAuthDomain,
  projectId: envVars.firebaseProjectId,
  storageBucket: envVars.firebaseStorageBucket,
  messagingSenderId: envVars.firebaseMessagingSenderId,
  appId: envVars.firebaseAppId,
  measurementId: envVars.firebaseMeasurementId,
  databaseURL: envVars.firebaseDatabaseUrl
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize services
const firestoreDb = firestore();
const storageInstance = storage;
const databaseInstance = database();
const authInstance = auth();

// Enable Firestore offline persistence
firestoreDb.settings({
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED
});

if (Platform.OS === 'ios') {
  firestoreDb.enableNetwork();
}

export { 
  authInstance,
  firestoreDb as db,
  storageInstance as storage,
  databaseInstance as database,
  firestore
};
