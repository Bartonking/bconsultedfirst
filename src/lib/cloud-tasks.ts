import { CloudTasksClient } from "@google-cloud/tasks";

export async function enqueueAuditJob(jobId: string): Promise<void> {
  const workerUrl = process.env.WORKER_BASE_URL || "http://localhost:3750";
  const secret = process.env.WORKER_SECRET || "dev-secret-change-in-prod";

  if (process.env.NODE_ENV === "development" || !process.env.CLOUD_TASKS_QUEUE) {
    // Dev mode: call worker endpoint directly
    const url = `${workerUrl}/api/worker/audit`;
    // Fire-and-forget — don't await so the API response returns immediately
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Worker-Secret": secret,
      },
      body: JSON.stringify({ jobId }),
    }).catch((err) => {
      console.error("Dev worker call failed:", err);
    });
    return;
  }

  // Production: use Cloud Tasks
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const client =
    clientEmail && privateKey
      ? new CloudTasksClient({
          credentials: {
            client_email: clientEmail,
            private_key: privateKey.replace(/\\n/g, "\n"),
          },
          projectId: process.env.FIREBASE_PROJECT_ID,
        })
      : new CloudTasksClient();

  const projectId = process.env.FIREBASE_PROJECT_ID!;
  const location = process.env.CLOUD_TASKS_LOCATION || "us-central1";
  const queue = process.env.CLOUD_TASKS_QUEUE!;

  const parent = client.queuePath(projectId, location, queue);
  const url = `${workerUrl}/api/worker/audit`;

  await client.createTask({
    parent,
    task: {
      httpRequest: {
        httpMethod: "POST",
        url,
        headers: {
          "Content-Type": "application/json",
          "X-Worker-Secret": secret,
        },
        body: Buffer.from(JSON.stringify({ jobId })).toString("base64"),
      },
      scheduleTime: {
        seconds: Math.floor(Date.now() / 1000),
      },
    },
  });
}
