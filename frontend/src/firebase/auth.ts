import { getAuth, onAuthStateChanged } from "firebase/auth";

import { app } from "./config";

export const auth = getAuth(app);

onAuthStateChanged(auth, async (user) => {
  if (user) {
  } else {
    console.log("No Firebase user currently signed in.");
  }
});