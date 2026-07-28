/**
 * Firebase project configuration.
 *
 * These values are publishable — Firebase security rules (firestore.rules /
 * storage.rules), not secrecy, are what protect the data.
 *
 * Set them in `.env` as VITE_FIREBASE_*; the process.env fallbacks let the
 * same values be supplied by the host when the app is server-rendered.
 */
function read(key: string, fallback = ""): string {
  const viteEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const fromVite = viteEnv?.[`VITE_${key}`];
  if (fromVite) return fromVite;
  if (typeof process !== "undefined" && process.env) {
    return process.env[`VITE_${key}`] ?? process.env[key] ?? fallback;
  }
  return fallback;
}

export const firebaseConfig = {
  apiKey: read("FIREBASE_API_KEY"),
  authDomain: read("FIREBASE_AUTH_DOMAIN", "the-affiliate-week.firebaseapp.com"),
  projectId: read("FIREBASE_PROJECT_ID", "the-affiliate-week"),
  storageBucket: read("FIREBASE_STORAGE_BUCKET", "the-affiliate-week.firebasestorage.app"),
  messagingSenderId: read("FIREBASE_MESSAGING_SENDER_ID", "808833159041"),
  appId: read("FIREBASE_APP_ID", "1:808833159041:web:d53fc2c7fd0ce2175da280"),
  measurementId: read("FIREBASE_MEASUREMENT_ID", "G-CJBJTDNTGS"),
};


export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

export function assertFirebaseConfigured() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(
      "Firebase is not configured. Add VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID and the other VITE_FIREBASE_* values to your environment.",
    );
  }
}

/** Collection names in Firestore (one per former table). */
export const COLLECTIONS = {
  jobs: "jobs",
  deals: "deals",
  events: "events",
  issues: "issues",
  submissions: "submissions",
  sponsor_enquiries: "sponsor_enquiries",
  subscribers: "subscribers",
  audit_log: "audit_log",
  roles: "roles",
  settings: "settings",
} as const;

/** The single settings document. */
export const SETTINGS_DOC = "settings/site";
