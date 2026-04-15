import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";

let app: App | undefined;
let db: Firestore | undefined;

export function getDb(): Firestore {
  if (db) return db;

  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (clientEmail && privateKey) {
      // Production: use individual env vars (Vercel, serverless)
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
        projectId,
      });
    } else if (credPath) {
      // Local dev: read from service account JSON file
      const absPath = resolve(credPath);
      const serviceAccount = JSON.parse(readFileSync(absPath, "utf-8"));
      app = initializeApp({ credential: cert(serviceAccount), projectId });
    } else if (projectId) {
      // Cloud Run, etc.: use Application Default Credentials
      app = initializeApp({ projectId });
    } else {
      throw new Error(
        "Missing Firebase credentials. Set FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY, or GOOGLE_APPLICATION_CREDENTIALS"
      );
    }
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app!);
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // settings() can only be called once per Firestore instance; ignore if already set
  }
  return db;
}

// Collection names
export const COLLECTIONS = {
  leads: "leads",
  auditJobs: "auditJobs",
  auditReports: "auditReports",
  consultations: "consultations",
  auditEngagements: "auditEngagements",
  calendlyWebhookLogs: "calendlyWebhookLogs",
  calndlybucket: "calndlybucket",
  workflowEvents: "workflowEvents",
  eventAutomationRuns: "eventAutomationRuns",
  eventDeadLetters: "eventDeadLetters",
  serviceIntakeConfigs: "serviceIntakeConfigs",
  contactMessages: "contactMessages",
} as const;
