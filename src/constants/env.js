import Config from "react-native-config";

export const ENV = {
  ENV_NAME: Config.ENV_NAME || "development",
  API_BASE_URL: Config.API_BASE_URL || "https://localhost:3000",
  OPENAI_API_KEY:
    Config.OPENAI_API_KEY ||
    "",
  OPENAI_API_URL: Config.OPENAI_API_URL || "https://api.openai.com/v1",
  SENTRY_DSN: Config.SENTRY_DSN || "",
  MAPS: {
    GOOGLE_MAPS_API_KEY:
      Config.GOOGLE_MAPS_API_KEY || "",
  },
  FIREBASE: {
    apiKey:
      Config.FIREBASE_API_KEY || "",
    authDomain: Config.FIREBASE_AUTH_DOMAIN || "",
    projectId: Config.FIREBASE_PROJECT_ID || "",
    storageBucket:
      Config.FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID || "",
    appId:
      Config.FIREBASE_APP_ID || "",
    measurementId: Config.FIREBASE_MEASUREMENT_ID || "",
  },
};
