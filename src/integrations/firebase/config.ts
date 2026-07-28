/**
 * Firebase project configuration.
 *
 * These values are publishable — Firebase security rules (firestore.rules /
 * storage.rules), not secrecy, are what protect the data.
 *
 * Set them in `.env` as VITE_FIREBASE_*; the process.env fallbacks let the
 * same values be supplied by the host when the app is server-rendered.
 */
function read(key: string): string {
  const viteEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const fromVite = viteEnv?.[`VITE_${key}`];
  if (fromVite) return fromVite;
  if (typeof process !== "undefined" && process.env) {
    return process.env[`VITE_${key}`] ?? process.env[key] ?? "";
  }
  return "";
}

export const firebaseConfig = {
  apiKey: read("FIREBASE_API_KEY"),
  authDomain: read("FIREBASE_AUTH_DOMAIN"),
  projectId: read("FIREBASE_PROJECT_ID"),
  storageBucket: read("FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: read("FIREBASE_MESSAGING_SENDER_ID"),
  appId: read("FIREBASE_APP_ID"),
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
