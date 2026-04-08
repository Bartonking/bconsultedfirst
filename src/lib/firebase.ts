import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App | undefined;
let db: Firestore | undefined;

export function getDb(): Firestore {
  if (db) return db;

  if (getApps().length === 0) {
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (credPath) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const serviceAccount = require(credPath);
      app = initializeApp({ credential: cert(serviceAccount), projectId });
    } else if (projectId) {
      // Use Application Default Credentials (Cloud Run, etc.)
      app = initializeApp({ projectId });
    } else {
      throw new Error(
        "Missing FIREBASE_PROJECT_ID or GOOGLE_APPLICATION_CREDENTIALS"
      );
    }
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app!);
  return db;
}

// Collection names
export const COLLECTIONS = {
  leads: "leads",
  auditJobs: "auditJobs",
  auditReports: "auditReports",
  consultations: "consultations",
  contactMessages: "contactMessages",
} as const;
