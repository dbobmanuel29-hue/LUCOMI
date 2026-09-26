import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, type Firestore } from "firebase-admin/firestore";

type ApiRequest = {
  method?: string;
  headers: Record<string, string | undefined>;
  body?: unknown;
};

type ApiResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  json(payload: unknown): ApiResponse;
};

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin server credentials are not configured.");
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

async function requireAdmin(
  request: ApiRequest,
): Promise<{
  adminAuth: ReturnType<typeof getAuth>;
  adminDb: Firestore;
  callerUid: string;
}> {
  const header = request.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    throw new Error("Missing authorization token.");
  }

  const idToken = header.slice("Bearer ".length).trim();
  const app = getAdminApp();
  const adminAuth = getAuth(app);
  const adminDb = getFirestore(app);

  const decoded = await adminAuth.verifyIdToken(idToken, true);
  const adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();

  if (!adminDoc.exists || adminDoc.data()?.role !== "admin") {
    throw new Error("Admin access required.");
  }

  return { adminAuth, adminDb, callerUid: decoded.uid };
}

async function deleteCustomerFirestoreData(adminDb: Firestore, uid: string): Promise<number> {
  let deletedRecords = 0;

  for (const collectionName of ["enquiries", "quotes", "testimonials"]) {
    const snapshot = await adminDb.collection(collectionName).where("userId", "==", uid).get();
    if (snapshot.empty) continue;

    let batch = adminDb.batch();
    let batchSize = 0;

    for (const item of snapshot.docs) {
      batch.delete(item.ref);
      batchSize += 1;
      deletedRecords += 1;

      if (batchSize === 400) {
        await batch.commit();
        batch = adminDb.batch();
        batchSize = 0;
      }
    }

    if (batchSize > 0) await batch.commit();
  }

  await adminDb.collection("users").doc(uid).delete();
  return deletedRecords + 1;
}

function getErrorDetails(error: unknown): { code: string; message: string } {
  if (typeof error === "object" && error !== null) {
    const candidate = error as { code?: unknown; message?: unknown };
    return {
      code: typeof candidate.code === "string" ? candidate.code : "",
      message:
        typeof candidate.message === "string"
          ? candidate.message
          : "The user could not be deleted.",
    };
  }

  return { code: "", message: "The user could not be deleted." };
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { adminAuth, adminDb, callerUid } = await requireAdmin(request);
    const body =
      typeof request.body === "object" && request.body !== null
        ? (request.body as { uid?: unknown })
        : {};
    const uid = typeof body.uid === "string" ? body.uid.trim() : "";

    if (!uid) return response.status(400).json({ error: "A user UID is required." });
    if (uid === callerUid) {
      return response.status(400).json({ error: "Your own admin account cannot be deleted here." });
    }

    const targetAdmin = await adminDb.collection("admins").doc(uid).get();
    if (targetAdmin.exists && targetAdmin.data()?.role === "admin") {
      return response.status(403).json({ error: "Admin accounts cannot be deleted from the customer user manager." });
    }

    const target = await adminAuth.getUser(uid);
    const deletedRecords = await deleteCustomerFirestoreData(adminDb, uid);

    await adminAuth.deleteUser(uid);

    await adminDb.collection("auditLogs").add({
      action: "delete_customer_account",
      targetUid: uid,
      targetEmail: target.email || "",
      performedBy: callerUid,
      deletedRecords,
      createdAt: FieldValue.serverTimestamp(),
    });

    return response.status(200).json({
      ok: true,
      uid,
      email: target.email || "",
      deletedRecords,
    });
  } catch (error: unknown) {
    const { code, message } = getErrorDetails(error);

    if (code === "auth/user-not-found") {
      return response.status(404).json({ error: "That Firebase Authentication user no longer exists." });
    }
    if (message === "Admin access required.") {
      return response.status(403).json({ error: message });
    }
    if (message === "Missing authorization token.") {
      return response.status(401).json({ error: message });
    }

    console.error("LUCOMI admin delete user error:", error);
    return response.status(500).json({
      error: "The user could not be deleted. Check the server configuration and Vercel logs.",
    });
  }
}
