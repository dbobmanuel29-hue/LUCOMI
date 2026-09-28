const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const clean = (value: unknown, max = 2000) =>
  String(value ?? "").trim().slice(0, max);

const validEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;
  const adminEmail = process.env.LUCOMI_ADMIN_EMAIL;

  if (!apiKey || !from || !adminEmail) {
    console.error("LUCOMI email service is missing required environment variables.");
    return json({ error: "Email service is not configured." }, 503);
  }

  try {
    const body = await request.json();

    const enquiry = {
      id: clean(body.id, 100),
      fullName: clean(body.fullName, 120),
      companyName: clean(body.companyName, 160),
      phone: clean(body.phone, 60),
      email: clean(body.email, 254).toLowerCase(),
      furnitureType: clean(body.furnitureType, 160),
      quantity: clean(body.quantity, 100),
      description: clean(body.description, 5000),
      preferredContact: clean(body.preferredContact, 30),
      source: clean(body.source, 80),
      images: Array.isArray(body.images)
        ? body.images.filter((item: unknown) => typeof item === "string").slice(0, 10)
        : [],
    };

    if (!enquiry.id || !enquiry.fullName || !enquiry.email || !validEmail(enquiry.email) || !enquiry.description) {
      return json({ error: "Please provide the required enquiry details." }, 400);
    }

    const kind = enquiry.source === "Custom Furniture" ? "custom project request" : "enquiry";
    const subject = enquiry.source === "Custom Furniture"
      ? "We received your LUCOMI custom project request"
      : "We received your LUCOMI enquiry";

    const customerHtml = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#10233f;line-height:1.6">
        <h1 style="font-size:28px;margin-bottom:8px">LUCOMI ENTERPRISE</h1>
        <p>Hi ${escapeHtml(enquiry.fullName)},</p>
        <p>Thank you for contacting LUCOMI. We've received your ${kind} and our team will review the details.</p>
        <div style="background:#f5f6f8;padding:20px;border-radius:12px;margin:24px 0">
          <strong>Your request</strong>
          <p style="margin:10px 0 4px"><strong>Furniture:</strong> ${escapeHtml(enquiry.furnitureType)}</p>
          ${enquiry.quantity ? `<p style="margin:4px 0"><strong>Quantity:</strong> ${escapeHtml(enquiry.quantity)}</p>` : ""}
          <p style="margin:4px 0"><strong>Request ID:</strong> ${escapeHtml(enquiry.id)}</p>
        </div>
        <p>A LUCOMI representative will contact you using your preferred contact method: <strong>${escapeHtml(enquiry.preferredContact)}</strong>.</p>
        <p>Thank you,<br><strong>LUCOMI ENTERPRISE</strong><br>Port Harcourt, Rivers State, Nigeria</p>
      </div>
    `;

    const adminHtml = `
      <div style="font-family:Arial,sans-serif;max-width:720px;margin:auto;color:#10233f;line-height:1.6">
        <h1 style="font-size:26px">New LUCOMI ${escapeHtml(kind)}</h1>
        <div style="background:#f5f6f8;padding:20px;border-radius:12px">
          <p><strong>Request ID:</strong> ${escapeHtml(enquiry.id)}</p>
          <p><strong>Name:</strong> ${escapeHtml(enquiry.fullName)}</p>
          ${enquiry.companyName ? `<p><strong>Company:</strong> ${escapeHtml(enquiry.companyName)}</p>` : ""}
          <p><strong>Email:</strong> ${escapeHtml(enquiry.email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(enquiry.phone)}</p>
          <p><strong>Furniture:</strong> ${escapeHtml(enquiry.furnitureType)}</p>
          ${enquiry.quantity ? `<p><strong>Quantity:</strong> ${escapeHtml(enquiry.quantity)}</p>` : ""}
          <p><strong>Preferred contact:</strong> ${escapeHtml(enquiry.preferredContact)}</p>
          <p><strong>Source:</strong> ${escapeHtml(enquiry.source)}</p>
          <p><strong>Description:</strong></p>
          <p style="white-space:pre-wrap">${escapeHtml(enquiry.description)}</p>
          ${enquiry.images.length ? `<p><strong>Reference images:</strong> ${enquiry.images.map((url: string, index: number) => `<a href="${escapeHtml(url)}">Image ${index + 1}</a>`).join(" · ")}</p>` : ""}
        </div>
      </div>
    `;

    const send = async (to: string[], subject: string, html: string, replyTo?: string, key?: string) => {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...(key ? { "Idempotency-Key": key } : {}),
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html,
          reply_to: replyTo,
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Resend rejected the email: ${response.status} ${details.slice(0, 500)}`);
      }

      return response.json() as Promise<{ id?: string }>;
    };

    const [customer, admin] = await Promise.all([
      send([enquiry.email], subject, customerHtml, from, `enquiry-customer-${enquiry.id}`),
      send([adminEmail], `New LUCOMI ${kind} — ${enquiry.fullName}`, adminHtml, enquiry.email, `enquiry-admin-${enquiry.id}`),
    ]);

    return json({ success: true, customerEmailId: customer.id, adminEmailId: admin.id });
  } catch (error) {
    console.error("LUCOMI enquiry email failed:", error);
    return json({ error: "The enquiry was saved, but confirmation emails could not be sent." }, 502);
  }
}
