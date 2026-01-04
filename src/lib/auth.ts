import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

import { auth } from "@/lib/firebase";

export async function login() {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

export async function logout() {
  await signOut(auth);
}
