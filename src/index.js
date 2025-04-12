import 'react-native-url-polyfill/auto'; 
import { AppRegistry, Platform } from 'react-native';
import App from './App';

const APP_NAME = 'main';

AppRegistry.registerComponent(APP_NAME, () => App);

if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root');
  AppRegistry.runApplication(APP_NAME, { rootTag });
}
