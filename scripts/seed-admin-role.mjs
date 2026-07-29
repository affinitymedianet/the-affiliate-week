#!/usr/bin/env node
/**
 * Seed the first admin role document in Firestore.
 *
 * Usage:
 *   FIREBASE_SERVICE_ACCOUNT_JSON='{...}' \
 *     node scripts/seed-admin-role.mjs <UID> <email> <display_name>
 *
 * The service account JSON can be copied from Firebase console:
 *   Project settings → Service accounts → Generate new private key
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const [uid, email, displayName] = process.argv.slice(2);

if (!uid || !email || !displayName) {
  console.error("Usage: node scripts/seed-admin-role.mjs <UID> <email> <display_name>");
  process.exit(1);
}

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!serviceAccountJson) {
  console.error(
    "Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable. " +
      "Generate a private key in Firebase console → Project settings → Service accounts.",
  );
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountJson);
} catch {
  console.error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.");
  process.exit(1);
}

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = getFirestore(app);

await db.collection("roles").doc(uid).set({
  role: "admin",
  active: true,
  email,
  display_name: displayName,
});

console.log(`Created admin role for UID ${uid} (${email}).`);
console.log("You can now sign in at /a6b8 with the corresponding Firebase Auth user.");

process.exit(0);
