const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

// Initialiser Firebase Admin avec le compte de service
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://jirani-5f130.firebaseio.com"
});

async function createUser() {
  try {
    const userRecord = await admin.auth().createUser({
      email: 'test@voisinage.app',
      password: 'Test123!',
    });
    console.log('Compte test créé avec succès !');
    console.log('UID:', userRecord.uid);
    console.log('Email:', userRecord.email)
  } catch (error) {
    console.error('Erreur lors de la création du compte:', error.message);
  } finally {
    process.exit();
  }
}

createUser();
