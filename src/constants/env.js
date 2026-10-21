import Config from "react-native-config";

// Values come from EXPO_PUBLIC_* variables in .env, which Expo inlines at bundle time
// (Expo Go, dev builds and web). react-native-config is kept as a fallback for native
// builds that wire it up; without its native module it returns an empty object.
export const ENV = {
  ENV_NAME: process.env.EXPO_PUBLIC_ENV_NAME || Config.ENV_NAME || "development",
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_BASE_URL || Config.API_BASE_URL || "https://localhost:3000",
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || Config.OPENAI_API_KEY || "",
  OPENAI_API_URL:
    process.env.EXPO_PUBLIC_OPENAI_API_URL || Config.OPENAI_API_URL || "https://api.openai.com/v1",
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN || Config.SENTRY_DSN || "",
  MAPS: {
    GOOGLE_MAPS_API_KEY:
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || Config.GOOGLE_MAPS_API_KEY || "",
  },
  FIREBASE: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || Config.FIREBASE_API_KEY || "",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || Config.FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || Config.FIREBASE_PROJECT_ID || "",
    storageBucket:
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || Config.FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
      Config.FIREBASE_MESSAGING_SENDER_ID ||
      "",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || Config.FIREBASE_APP_ID || "",
    measurementId:
      process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || Config.FIREBASE_MEASUREMENT_ID || "",
  },
};
