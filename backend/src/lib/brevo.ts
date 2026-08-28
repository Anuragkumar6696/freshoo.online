/* Brevo backend mail helper — sends order notification to admin */
const API_KEY = process.env.BREVO_API_KEY || "";
const SENDER = process.env.BREVO_SENDER_EMAIL || "freshoo.online@gmail.com";
const ADMIN = process.env.STORE_OWNER_EMAIL || process.env.ADMIN_EMAIL || "freshoo.online@gmail.com";

export async function notifyAdmin(order: any): Promise<{ ok: boolean; msg?: string }> {
  if (!API_KEY) return { ok: false, msg: "No BREVO_API_KEY" };
  try {
    // Build item list for email
    const itemLines = Array.isArray(order.items)
      ? order.items.map((it: any) =>
          `<li><strong>${it.name || it.product?.name || "Item"}</strong> × ${it.quantity || 1} — ₹${(it.price || it.product?.price || 0) * (it.quantity || 1)}</li>`
        ).join("")
      : "<li>No items</li>";

    const customerName = order.customerName || order.guestDetails?.name || "Guest";
    const customerEmail = order.customerEmail || order.guestEmail || "—";
    const customerPhone = order.customerPhone || order.guestPhone || "—";
    const addressLine = order.address?.addressLine || "—";
    const city = order.address?.city || "—";
    const pincode = order.address?.pincode || "—";
    const fullAddress = `${addressLine}, ${city} - ${pincode}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #222; max-width: 640px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h1 style="font-size: 22px; color: #b91c1c; margin-bottom: 4px;">🍽️ New Order Received — Freshoo</h1>
        <p style="font-size: 12px; color: #6b7280; margin-top: 0;">Order placed just now</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0;"/>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 0; color: #6b7280; width: 120px;">Order ID</td><td style="padding: 6px 0; font-weight: 700; color: #111827;">${order.id || order.friendlyId || "—"}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Status</td><td style="padding: 6px 0; font-weight: 700; color: #b91c1c;">${order.status || "CONFIRMED"}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Date & Time</td><td style="padding: 6px 0; font-weight: 700;">${order.date || new Date().toLocaleString("en-IN")}</td></tr>
        </table>

        <h2 style="font-size: 16px; margin-top: 20px; margin-bottom: 8px; color: #111827;">👤 Customer Details</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 0; color: #6b7280; width: 120px;">Name</td><td style="padding: 6px 0; font-weight: 700;">${customerName}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Email</td><td style="padding: 6px 0;">${customerEmail}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Phone</td><td style="padding: 6px 0;">${customerPhone}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280; vertical-align: top;">Address</td><td style="padding: 6px 0; font-weight: 700;">${fullAddress}</td></tr>
        </table>

        <h2 style="font-size: 16px; margin-top: 20px; margin-bottom: 8px; color: #111827;">📦 Order Details</h2>
        <ul style="font-size: 14px; padding-left: 18px; margin: 0 0 12px 0; line-height: 1.6;">${itemLines}</ul>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 12px;">
          <tr style="border-top: 1px solid #e5e7eb;"><td style="padding: 6px 0; color: #6b7280;">Subtotal</td><td style="padding: 6px 0; text-align: right;">₹${order.subtotal || 0}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Delivery Fee</td><td style="padding: 6px 0; text-align: right;">₹${order.deliveryFee || 0}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Packaging</td><td style="padding: 6px 0; text-align: right;">₹${order.packagingFee || 0}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Tax (5%)</td><td style="padding: 6px 0; text-align: right;">₹${order.tax || 0}</td></tr>
          <tr style="border-top: 2px solid #b91c1c; font-weight: 800; color: #b91c1c; font-size: 16px;"><td style="padding: 8px 0;">Total</td><td style="padding: 8px 0; text-align: right;">₹${order.total || 0}</td></tr>
        </table>

        <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">Payment Method: <strong style="color: #111827;">${(order.paymentMethod || "COD").toUpperCase()}</strong></p>
        <p style="font-size: 12px; color: #9ca3af;">Instructions: ${order.instructions || "—"}</p>

        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0 8px 0;"/>
        <p style="font-size: 11px; color: #9ca3af;">This is an automated notification from Freshoo. Please prepare the order and coordinate collection/delivery.</p>
      </div>
    `;

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "Freshoo", email: SENDER },
        to: [{ email: ADMIN, name: "Freshoo Admin" }],
        subject: `🍽️ New Freshoo Order — ${order.id || order.friendlyId} — ${customerName}`,
        htmlContent,
      }),
    });
    console.log("[Brevo] admin:", res.status);
    return { ok: res.ok };
  } catch (e: any) {
    console.error("[Brevo] admin error:", e.message);
    return { ok: false, msg: e.message };
  }
}
