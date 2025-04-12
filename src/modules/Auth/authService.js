import { auth, firestore } from '../../services/firebase';

// Register user and store profile
export const registerUser = async (email, password, username) => {
  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  const user = userCredential.user;

  // Send email verification
  await user.sendEmailVerification();

  // Save user profile in Firestore
  await firestore.collection('users').doc(user.uid).set({
    uid: user.uid,
    email: email.trim(),
    username: username.trim(),
    createdAt: new Date(),
  });

  return user;
};

// Sign in
export const loginUser = async (email, password) => {
  const userCredential = await auth.signInWithEmailAndPassword(email, password);
  return userCredential.user;
};

// Logout
export const logoutUser = async () => {
  await auth.signOut();
};

// Check email verification
export const isEmailVerified = () => {
  return auth.currentUser?.emailVerified;
};
