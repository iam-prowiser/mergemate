import { getAuth, onAuthStateChanged } from "firebase/auth";

import { app } from "./config";

export const auth = getAuth(app);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const token = await user.getIdToken();

    console.log("FIREBASE USER:", user.email);
    console.log("FIREBASE UID:", user.uid);
    console.log("FIREBASE ID TOKEN:", token);
  } else {
    console.log("No Firebase user currently signed in.");
  }
});