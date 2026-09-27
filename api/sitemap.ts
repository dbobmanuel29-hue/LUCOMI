const STATIC_URLS = [
  "/",
  "/about",
  "/products",
  "/custom",
  "/projects",
  "/team",
  "/reviews",
  "/contact",
  "/terms",
  "/privacy",
];

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function firestoreString(value: any) {
  return typeof value?.stringValue === "string" ? value.stringValue : "";
}

function firestoreBoolean(value: any) {
  return value?.booleanValue === true;
}

export default async function handler(req: any, res: any) {
  if (req.method && req.method !== "GET" && req.method !== "HEAD") {
    res.status(405).setHeader("Allow", "GET, HEAD").send("Method Not Allowed");
    return;
  }

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = process.env.VITE_FIREBASE_API_KEY;

  if (!projectId || !apiKey) {
    res.status(500).send("Sitemap configuration is missing.");
    return;
  }

  const urls = new Set(STATIC_URLS.map((path) => `https://lucomi.name.ng${path}`));

  try {
    const endpoint =
      `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:runQuery?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "products" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "published" },
              op: "EQUAL",
              value: { booleanValue: true },
            },
          },
          orderBy: [{ field: { fieldPath: "slug" }, direction: "ASCENDING" }],
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Firestore sitemap query failed: ${response.status}`);
    }

    const rows = await response.json();

    for (const row of Array.isArray(rows) ? rows : []) {
      const fields = row?.document?.fields;
      const slug = firestoreString(fields?.slug);
      const published = firestoreBoolean(fields?.published);

      if (published && slug) {
        urls.add(`https://lucomi.name.ng/products/${encodeURIComponent(slug)}`);
      }
    }
  } catch (error) {
    console.error("LUCOMI sitemap product query failed:", error);
    // Keep the sitemap useful even if Firestore is temporarily unavailable.
    // The static public URLs will still be returned.
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...Array.from(urls)
      .sort()
      .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    "</urlset>",
  ].join("\n");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(body);
}
