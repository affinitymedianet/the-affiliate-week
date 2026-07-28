/**
 * Firebase Auth + Storage (browser only).
 *
 * The admin area is client-rendered, so the Auth SDK is initialised lazily and
 * never touched during server rendering.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  type Auth,
  type User,
} from "firebase/auth";

import { assertFirebaseConfigured, firebaseConfig } from "./config";

export function firebaseApp(): FirebaseApp {
  assertFirebaseConfigured();
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function firebaseAuth(): Auth {
  return getAuth(firebaseApp());
}

export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(firebaseAuth(), email.trim().toLowerCase(), password);
}

export function signOut() {
  return fbSignOut(firebaseAuth());
}

export function sendReset(email: string) {
  return sendPasswordResetEmail(firebaseAuth(), email.trim().toLowerCase());
}

export function watchAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(firebaseAuth(), callback);
}

/** Resolves once Firebase has restored (or rejected) the persisted session. */
export function currentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(firebaseAuth(), (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

/** ID token for the signed-in user, used to authorise Firestore/Storage calls. */
export async function authToken(): Promise<string> {
  const user = firebaseAuth().currentUser ?? (await currentUser());
  if (!user) throw new Error("You are signed out. Sign in again to continue.");
  return user.getIdToken();
}

/** Uploads a file to Cloud Storage and returns its public download URL. */
export async function uploadToStorage(
  path: string,
  file: Blob,
  contentType: string,
): Promise<string> {
  const token = await authToken();
  const bucket = firebaseConfig.storageBucket;
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(
    path,
  )}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": contentType || "application/octet-stream", Authorization: `Bearer ${token}` },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`Upload failed (${response.status})`);
  }
  const result = (await response.json()) as { name: string; downloadTokens?: string };
  const downloadToken = result.downloadTokens?.split(",")[0] ?? "";
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
    result.name,
  )}?alt=media${downloadToken ? `&token=${downloadToken}` : ""}`;
}
