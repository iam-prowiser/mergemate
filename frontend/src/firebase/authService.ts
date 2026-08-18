import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GithubAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

import { auth } from "./auth";

export async function login(
  email: string,
  password: string
) {
  try {
    return await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function register(
  name: string,
  email: string,
  password: string
) {
  try {
    const credential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    await updateProfile(credential.user, {
      displayName: name,
    });

    return credential;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

export async function logout() {
  await signOut(auth);
}

const githubProvider = new GithubAuthProvider();

export async function githubLogin() {
  try {
    return await signInWithPopup(
      auth,
      githubProvider
    );
  } catch (error) {
    console.error("GitHub login error:", error);
    throw error;
  }
}