import Constants from 'expo-constants';
import appConfig from '../../app.json';

/**
 * getAppVersion
 * Returns the current app version using expo-constants.
 * Falls back to the version specified in app.json if needed.
 */
export const getAppVersion = () => {
  // For newer Expo, Constants.expoConfig is available.
  const expoVersion = Constants.expoConfig?.version;
  // Fallback: read version from app.json.
  const appJsonVersion = appConfig.expo?.version;
  return expoVersion || appJsonVersion || '1.0.0';
};
