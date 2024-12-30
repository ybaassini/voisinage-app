import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Fonction utilitaire pour logger les variables d'environnement (sans les valeurs sensibles)
const logEnvVars = (source: string, vars: any) => {
  console.log(`[ENV] Source: ${source}`);
  console.log('[ENV] Available variables:', Object.keys(vars).filter(key => vars[key]));
};

const getEnvVars = () => {
  const extra = Constants.expoConfig?.extra;

  if (!extra) {
    throw new Error('Missing environment variables in app.config.js');
  }

  const envVars = {
    firebaseApiKey: extra.firebaseApiKey,
    firebaseAuthDomain: extra.firebaseAuthDomain,
    firebaseProjectId: extra.firebaseProjectId,
    firebaseStorageBucket: extra.firebaseStorageBucket,
    firebaseMessagingSenderId: extra.firebaseMessagingSenderId,
    firebaseAppId: extra.firebaseAppId,
    firebaseMeasurementId: extra.firebaseMeasurementId,
    firebaseDatabaseUrl: extra.firebaseDatabaseUrl,
    iOSGoogleMapsApiKey: extra.iOSGoogleMapsApiKey,
    androidGoogleMapsApiKey: extra.androidGoogleMapsApiKey,
    browserGoogleMapsApiKey: extra.browserGoogleMapsApiKey
  };

  // Log les variables disponibles
  console.log('[ENV] Platform:', Platform.OS);
  logEnvVars('Constants.expoConfig.extra', envVars);

  return envVars;
};

export default getEnvVars;
