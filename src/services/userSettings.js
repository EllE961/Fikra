// src/services/userSettings.js
import { firestore, auth } from "./firebase";

export const getUserThemeFromServer = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    const docRef = firestore.collection("users").doc(user.uid);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      return docSnap.data().theme || "light";
    }
    return "light";
  } catch (error) {
    console.error("Error fetching user theme:", error);
    return "light";
  }
};

export const saveUserThemeToServer = async (newTheme) => {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const docRef = firestore.collection("users").doc(user.uid);
    await docRef.update({ theme: newTheme });
  } catch (error) {
    console.error("Error saving user theme:", error);
  }
};
