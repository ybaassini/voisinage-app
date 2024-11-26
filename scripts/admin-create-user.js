const admin = require('firebase-admin');

// Initialiser Firebase Admin avec les informations d'identification
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "jirani-5f130",
    clientEmail: "firebase-adminsdk-2bv3d@jirani-5f130.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC9QFLYt4"
  }),
  databaseURL: "https://jirani-5f130.firebaseio.com"
});

async function createUser() {
  try {
    const userRecord = await admin.auth().createUser({
      email: 'test@voisinage.app',
      password: 'Test123!',
      displayName: 'Utilisateur Test',
    });
    console.log('Successfully created new user:', userRecord.uid);
    console.log('Email:', userRecord.email);
    console.log('Display Name:', userRecord.displayName);
  } catch (error) {
    console.log('Error creating new user:', error);
  }
}

createUser();
