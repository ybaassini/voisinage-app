export default {
  expo: {
    name: "Voisinage",
    slug: "voisinage-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.jirani.app",
      googleServicesFile: "./GoogleService-Info.plist",
      buildConfiguration: "Release"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.jirani.app",
      googleServicesFile: "./google-services.json"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "@react-native-firebase/app",
        {
          ios: {
            googleServicesFile: "./GoogleService-Info.plist"
          },
          android: {
            googleServicesFile: "./google-services.json"
          }
        }
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
            deploymentTarget: "15.1",
            flipper: false
          },
          android: {
            compileSdkVersion: 33,
            targetSdkVersion: 33,
            buildToolsVersion: "33.0.0"
          }
        }
      ]
    ],
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      firebaseDatabaseUrl: process.env.FIREBASE_DATABASE_URL,
      iOSGoogleMapsApiKey: process.env.IOS_GOOGLE_MAPS_API_KEY,
      androidGoogleMapsApiKey: process.env.ANDROID_GOOGLE_MAPS_API_KEY,
      browserGoogleMapsApiKey: process.env.BROWSER_GOOGLE_MAPS_API_KEY,

      eas: {
        projectId: "b94dffd5-92ac-4c3d-b0d1-e363f8d31c2a"
      }
    }
  }
};
