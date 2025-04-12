// src/services/firebase/index.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

import { ENV } from '../../constants/env'; // or however you load env variables

// Only initialize once
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: ENV.FIREBASE.apiKey,
    authDomain: ENV.FIREBASE.authDomain,
    projectId: ENV.FIREBASE.projectId,
    storageBucket: ENV.FIREBASE.storageBucket,
    messagingSenderId: ENV.FIREBASE.messagingSenderId,
    appId: ENV.FIREBASE.appId,
  });
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();

// Export storage
export const storage = firebase.storage(); 

export default firebase;
