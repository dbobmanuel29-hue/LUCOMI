import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

type ApiRequest = { method?: string; headers: Record<string, string | undefined> };
type ApiResponse = { setHeader(name: string, value: string): void; status(code: number): ApiResponse; json(payload: unknown): ApiResponse };

function getAdminApp() {
  if (getApps().length) return getApps()[0];
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) throw new Error("Server credentials are not configured.");
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed." });
  }

  try {
    const header = request.headers.authorization || "";
    if (!header.startsWith("Bearer ")) return response.status(401).json({ error: "Missing authorization token." });

    const app = getAdminApp();
    const adminAuth = getAuth(app);
    const adminDb = getFirestore(app);
    const decoded = await adminAuth.verifyIdToken(header.slice("Bearer ".length).trim(), true);
    const adminProfile = await adminDb.collection("admins").doc(decoded.uid).get();

    if (!adminProfile.exists || adminProfile.data()?.role !== "admin") {
      return response.status(403).json({ error: "Admin access required." });
    }

    const users: Array<Record<string, unknown>> = [];
    let pageToken: string | undefined;

    do {
      const page = await adminAuth.listUsers(1000, pageToken);
      users.push(...page.users.map((user) => ({
        uid: user.uid,
        name: user.displayName || user.email?.split("@")[0] || "Unnamed user",
        email: user.email || "—",
        phone: user.phoneNumber || "",
        provider: user.providerData.some((item) => item.providerId === "google.com") ? "google" : "email",
        createdAt: user.metadata.creationTime,
        lastLoginAt: user.metadata.lastSignInTime || undefined,
      })));
      pageToken = page.pageToken;
    } while (pageToken);

    return response.status(200).json({ users });
  } catch (error) {
    console.error("LUCOMI admin list users error:", error);
    return response.status(500).json({ error: "Users could not be loaded." });
  }
}