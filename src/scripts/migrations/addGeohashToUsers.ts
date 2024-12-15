import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { UserProfile } from '../../types/user';
import * as geohash from 'ngeohash';

const USERS_COLLECTION = 'users';

async function addGeohashToUsers() {
  try {
    console.log('🔍 Récupération des utilisateurs...');
    const usersRef = collection(db, USERS_COLLECTION);
    const usersSnapshot = await getDocs(usersRef);
    
    console.log(`✅ ${usersSnapshot.size} utilisateurs trouvés`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      try {
        const userData = userDoc.data() as UserProfile;
        
        if (!userData.location?.coordinates) {
          console.warn(`⚠️ Pas de coordonnées pour l'utilisateur ${userDoc.id}`);
          continue;
        }
        
        const { latitude, longitude } = userData.location.coordinates;
        const locationGeohash = geohash.encode(latitude, longitude);
        
        // Mise à jour de la localisation avec le geohash
        const updatedLocation = {
          ...userData.location,
          geohash: locationGeohash,
          g: {
            geohash: locationGeohash,
            geopoint: {
              latitude,
              longitude
            }
          }
        };
        
        // Mise à jour du document
        await updateDoc(doc(db, USERS_COLLECTION, userDoc.id), {
          location: updatedLocation
        });
        
        updatedCount++;
        console.log(`✅ Utilisateur ${userDoc.id} mis à jour avec geohash: ${locationGeohash}`);
        
      } catch (error) {
        console.error(`❌ Erreur lors de la mise à jour de l'utilisateur ${userDoc.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n📊 Résumé de la migration:');
    console.log(`Total d'utilisateurs: ${usersSnapshot.size}`);
    console.log(`Utilisateurs mis à jour: ${updatedCount}`);
    console.log(`Erreurs: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécution de la migration
addGeohashToUsers()
  .then(() => {
    console.log('✨ Migration terminée avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  });
