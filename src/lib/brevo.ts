import type { Order } from "@/context/AppContext";

const API_BASE = "https://api.brevo.com/v3";
const API_KEY = process.env.BREVO_API_KEY || "";
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "freshoo.online@gmail.com";
const SENDER_NAME = process.env.BREVO_SENDER_NAME || "freshoo";
const NOTIFY_EMAIL =
  process.env.STORE_OWNER_EMAIL || process.env.ADMIN_EMAIL || "";
const NOTIFY_ENABLED = !!API_KEY;
const ORDER_NOTIFY_ENABLED =
  process.env.BREVO_ORDER_NOTIFY_ENABLED === "true" && NOTIFY_ENABLED && !!NOTIFY_EMAIL;
const WELCOME_TEMPLATE_ID = Number(process.env.BREVO_WELCOME_TEMPLATE_ID || "0") || 0;
const CUSTOMER_ORDER_CONFIRM_TEMPLATE_ID =
  Number(process.env.BREVO_CUSTOMER_ORDER_CONFIRM_TEMPLATE_ID || "0") || 0;

export interface BrevoSendResult {
  ok: boolean;
  error?: string;
  messageId?: string;
}

async function brevoSendRaw(
  payload: Record<string, any>
): Promise<{ ok: boolean; status: number; text: string }> {
  if (!API_KEY) {
    return { ok: false, status: 0, text: "BREVO_API_KEY missing in env" };
  }
  try {
    const res = await fetch(`${API_BASE}/smtp/email`, {
      method: "POST",
      headers: {
        "api-key": API_KEY,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } catch (e: any) {
    return { ok: false, status: 0, text: e?.message || "Network error" };
  }
}

async function sendTemplate(
  templateId: number,
  toEmail: string,
  toName: string,
  params: Record<string, any>,
  opts?: { replyTo?: { name: string; email: string }; cc?: string; bcc?: string }
): Promise<BrevoSendResult> {
  if (!templateId || !toEmail) {
    return {
      ok: false,
      error: !templateId ? "Template ID not configured" : "Recipient missing",
    };
  }
  const to = [{ email: toEmail, name: toName || toEmail }];
  const payload: any = {
    templateId,
    to,
    params,
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
  };
  if (opts?.replyTo) payload.replyTo = opts.replyTo;
  if (opts?.cc) payload.cc = [{ email: opts.cc }];
  if (opts?.bcc) payload.bcc = [{ email: opts.bcc }];
  const r = await brevoSendRaw(payload);
  if (!r.ok) {
    console.error("[Brevo] template send failed:", r.status, r.text);
    return { ok: false, error: r.text };
  }
  try {
    const j = JSON.parse(r.text);
    return { ok: true, messageId: j?.messageId };
  } catch {
    return { ok: true, messageId: r.text };
  }
}

async function sendHtml(
  toEmail: string,
  toName: string,
  subject: string,
  html: string,
  opts?: { ccToAdmin?: boolean }
): Promise<BrevoSendResult> {
  if (!toEmail) return { ok: false, error: "Recipient missing" };
  const to = [{ email: toEmail, name: toName || toEmail }];
  const payload: any = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to,
    subject,
    htmlContent: html,
    tags: ["freshoo"],
  };
  if (opts?.ccToAdmin && NOTIFY_EMAIL && NOTIFY_EMAIL !== toEmail) {
    payload.bcc = [{ email: NOTIFY_EMAIL, name: "Freshoo Admin" }];
  }
  const r = await brevoSendRaw(payload);
  if (!r.ok) {
    console.error("[Brevo] html send failed:", r.status, r.text);
    return { ok: false, error: r.text };
  }
  try {
    const j = JSON.parse(r.text);
    return { ok: true, messageId: j?.messageId };
  } catch {
    return { ok: true, messageId: r.text };
  }
}

// ---------------- ADMIN NEW ORDER NOTIFICATION ----------------

export function buildNewOrderAdminEmailHtml(order: Order): string {
  const itemsRows = (order.items || [])
    .map((it) => {
      return `<tr style="border-bottom:1px solid #eef2f7">
        <td style="padding:10px 12px;vertical-align:top">
          <img src="${it.product.image}" alt="" width="48" height="48" style="border-radius:8px;object-fit:cover;background:#f8fafc;border:1px solid #e2e8f0" />
        </td>
        <td style="padding:10px 12px;vertical-align:top;font-family:Inter,Arial,sans-serif">
          <div style="font-weight:700;color:#0f172a">${it.product.name}</div>
          <div style="font-size:12px;color:#64748b;margin-top:2px">${it.selectedWeight} × ${it.quantity}</div>
        </td>
        <td style="padding:10px 12px;vertical-align:top;font-weight:700;color:#0f172a;text-align:right;font-family:Inter,Arial,sans-serif">₹${
          it.price * it.quantity
        }</td>
      </tr>`;
    })
    .join("");

  const gps =
    order.geoLocation && order.geoLocation.latitude != null
      ? `<div style="padding:10px 14px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;margin-top:10px">
          <div style="font-weight:700;color:#065f46;font-size:13px">📍 GPS Attached</div>
          <div style="font-family:ui-monospace,Menlo,monospace;color:#064e3b;margin-top:4px;font-size:12px">
            ${order.geoLocation.latitude.toFixed(6)}, ${
          order.geoLocation.longitude?.toFixed(6)
        }
            ${
              order.geoLocation.accuracy
                ? ` • ±${Math.round(order.geoLocation.accuracy)}m`
                : ""
            }
          </div>
          <a href="https://www.google.com/maps?q=${encodeURIComponent(
            `${order.geoLocation.latitude},${order.geoLocation.longitude}`
          )}" target="_blank" rel="noopener noreferrer"
            style="display:inline-block;margin-top:6px;font-size:12px;color:#059669;text-decoration:underline">Open in Google Maps →</a>
        </div>`
      : `<div style="padding:10px 14px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;margin-top:10px;color:#92400e;font-size:12px">No GPS coordinates attached.</div>`;

  const customerBlock = order.isGuestOrder
    ? `<span style="background:#fef3c7;color:#92400e;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:700;margin-left:8px">GUEST</span>`
    : `<span style="background:#dbeafe;color:#1e40af;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:700;margin-left:8px">REGISTERED</span>`;

  return `<!doctype html><html>
  <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
  <body style="background:#f1f5f9;margin:0;padding:0;font-family:Inter,system-ui,Arial,sans-serif;color:#0f172a">
    <div style="max-width:640px;margin:0 auto;padding:20px">
      <div style="background:linear-gradient(135deg,#c81e25,#991b1b);padding:22px 26px;border-top-left-radius:16px;border-top-right-radius:16px;color:white">
        <div style="font-size:20px;font-weight:900;letter-spacing:-0.02em">Fresh<span style="color:#fecaca">oo</span></div>
        <div style="font-size:11px;letter-spacing:0.22em;font-weight:700;margin-top:2px;opacity:0.85">NEW ORDER RECEIVED</div>
      </div>
      <div style="background:white;padding:26px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">
        <h2 style="margin:0 0 10px 0;font-size:18px;font-weight:800">🛒 Order ${order.id}</h2>
        <div style="font-size:13px;color:#64748b">${order.date} • Status: <span style="font-weight:700;color:#c81e25">${
    order.status
  }</span> • Payment: <span style="font-weight:700">${order.paymentMethod.toUpperCase()}</span></div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0 6px 0">
          <div style="padding:14px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0">
            <div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:0.08em;text-transform:uppercase">Customer ${customerBlock}</div>
            <div style="margin-top:6px;font-weight:700;color:#0f172a">${
              order.customerName || "—"
            }</div>
            <div style="font-size:13px;color:#334155;margin-top:2px">📞 ${
              order.customerPhone || "—"
            }</div>
            <div style="font-size:13px;color:#334155;margin-top:2px">✉️ ${
              order.customerEmail || "—"
            }</div>
          </div>
          <div style="padding:14px;background:#fef2f2;border-radius:12px;border:1px solid #fecaca">
            <div style="font-size:11px;font-weight:700;color:#991b1b;letter-spacing:0.08em;text-transform:uppercase">Delivery Address</div>
            <div style="margin-top:6px">
              <span style="font-size:10px;font-weight:800;background:hsl(354,84%,96%);color:#c81e25;padding:2px 7px;border-radius:6px">${
                order.address.tag
              }</span>
              <div style="margin-top:6px;font-size:13px;font-weight:600;color:#0f172a;line-height:1.5">${
                order.address.addressLine
              }, ${order.address.city} - ${order.address.pincode}</div>
            </div>
          </div>
        </div>

        ${gps}

        <div style="margin-top:20px">
          <div style="font-weight:800;margin-bottom:8px;color:#0f172a">Items (${
            (order.items || []).length
          })</div>
          <table style="width:100%;border-collapse:separate;border-spacing:0;background:#fafbfc;border:1px solid #eef2f7;border-radius:10px;overflow:hidden">
            <thead>
              <tr style="background:#f1f5f9">
                <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:800;color:#64748b;letter-spacing:0.08em;text-transform:uppercase"></th>
                <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:800;color:#64748b;letter-spacing:0.08em;text-transform:uppercase">Product</th>
                <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:800;color:#64748b;letter-spacing:0.08em;text-transform:uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>
        </div>

        <div style="margin-top:16px;padding:16px;background:#fef2f2;border-radius:12px;border:1px solid #fecaca">
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#334155;margin-bottom:4px">
            <span>Subtotal</span><span>₹${order.subtotal}</span>
          </div>
          ${
            order.discount > 0
              ? `<div style="display:flex;justify-content:space-between;font-size:13px;color:#059669;margin-bottom:4px"><span>Discount</span><span>-₹${order.discount}</span></div>`
              : ""
          }
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#059669;margin-bottom:4px">
            <span>Delivery</span><span>FREE</span>
          </div>
          <div style="border-top:1px dashed #fca5a5;margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-weight:800;font-size:15px;color:#c81e25">
            <span>Grand Total</span><span>₹${order.total}</span>
          </div>
        </div>

        ${
          order.instructions
            ? `<div style="margin-top:14px;padding:12px 14px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px">
              <div style="font-size:11px;font-weight:800;letter-spacing:0.08em;color:#92400e;text-transform:uppercase">Special Instructions</div>
              <div style="margin-top:4px;font-size:13px;color:#78350f;font-weight:600">${order.instructions}</div>
            </div>`
            : ""
        }
      </div>
      <div style="padding:18px 26px;background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-bottom-left-radius:16px;border-bottom-right-radius:16px;text-align:center;font-size:11px;color:#94a3b8;font-weight:600">
        Please start cutting. Delivery boy will be assigned once preparation begins.
      </div>
    </div>
  </body></html>`;
}

export async function sendNewOrderAdminNotification(
  order: Order
): Promise<BrevoSendResult> {
  if (!ORDER_NOTIFY_ENABLED) {
    console.log(
      "[Brevo] Admin notify SKIPPED: set BREVO_ORDER_NOTIFY_ENABLED=true + STORE_OWNER_EMAIL + BREVO_API_KEY to enable."
    );
    return { ok: false, error: "Brevo admin notify not configured" };
  }
  const html = buildNewOrderAdminEmailHtml(order);
  return sendHtml(
    NOTIFY_EMAIL,
    "Freshoo Store Admin",
    `🛒 NEW ORDER ${order.id} • ₹${order.total} • ${
      order.customerName || "Guest"
    }`,
    html
  );
}

// ---------------- CUSTOMER ORDER CONFIRMATION ----------------

export function buildOrderCustomerConfirmHtml(order: Order): string {
  const itemsRows = (order.items || [])
    .map((it) => {
      const unit = `₹${it.price}`;
      const lineTotal = `₹${it.price * it.quantity}`;
      return `<tr style="border-bottom:1px solid #eef2f7">
        <td style="padding:10px 8px">
          <div style="font-weight:700;color:#0f172a;font-size:13px">${it.product.name}</div>
          <div style="font-size:11px;color:#64748b;margin-top:2px">${it.selectedWeight} × ${it.quantity}</div>
        </td>
        <td style="padding:10px 8px;text-align:right;font-size:12px;color:#64748b">${unit}</td>
        <td style="padding:10px 8px;text-align:right;font-weight:700;color:#0f172a;font-size:13px">${lineTotal}</td>
      </tr>`;
    })
    .join("");

  return `<!doctype html><html>
  <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
  <body style="background:#f1f5f9;margin:0;padding:0;font-family:Inter,system-ui,Arial,sans-serif;color:#0f172a">
    <div style="max-width:600px;margin:0 auto;padding:20px">
      <div style="background:linear-gradient(135deg,#c81e25,#991b1b);padding:24px;border-radius:16px 16px 0 0;color:white;text-align:center">
        <div style="font-size:22px;font-weight:900;letter-spacing:-0.02em">Fresh<span style="color:#fecaca">oo</span></div>
        <div style="font-size:11px;letter-spacing:0.3em;font-weight:800;margin-top:4px;opacity:0.9;text-transform:uppercase">Order Confirmed</div>
      </div>
      <div style="background:white;padding:28px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">
        <div style="text-align:center;margin-bottom:22px">
          <div style="display:inline-block;padding:6px 14px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:999px;color:#065f46;font-size:12px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase">✅ ${order.status}</div>
        </div>
        <h2 style="margin:0 0 4px 0;font-size:18px;font-weight:900;color:#0f172a">Hi, ${(order.customerName || "there").split(" ")[0]}! 👋</h2>
        <p style="margin:0;font-size:13px;color:#64748b">Thank you for choosing Freshoo. Your order is confirmed and our butchers will start preparing it shortly.</p>
        <div style="margin-top:18px;padding:16px;background:#fef2f2;border-radius:12px;border:1px solid #fecaca">
          <div style="display:flex;justify-content:space-between;font-size:12px;color:#64748b;margin-bottom:6px">
            <span>Order ID</span><span style="font-weight:800;color:#c81e25">${order.id}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:#64748b;margin-bottom:6px">
            <span>Order Date</span><span style="font-weight:700;color:#334155">${order.date}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:#64748b">
            <span>Payment</span><span style="font-weight:800;color:#334155;text-transform:uppercase">${order.paymentMethod}</span>
          </div>
        </div>
        <div style="margin-top:20px">
          <div style="font-weight:800;font-size:13px;color:#0f172a;margin-bottom:10px">Your Order Items</div>
          <table style="width:100%;border-collapse:collapse;background:#fafbfc;border:1px solid #eef2f7;border-radius:10px;overflow:hidden">
            <thead>
              <tr style="background:#f1f5f9">
                <th style="padding:10px 8px;text-align:left;font-size:10px;font-weight:800;color:#64748b;letter-spacing:0.08em;text-transform:uppercase">Item</th>
                <th style="padding:10px 8px;text-align:right;font-size:10px;font-weight:800;color:#64748b;letter-spacing:0.08em;text-transform:uppercase">Unit</th>
                <th style="padding:10px 8px;text-align:right;font-size:10px;font-weight:800;color:#64748b;letter-spacing:0.08em;text-transform:uppercase">Total</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>
        </div>
        <div style="margin-top:14px;padding:14px 16px;background:#fafbfc;border-radius:12px;border:1px solid #e2e8f0">
          <div style="display:flex;justify-content:space-between;font-size:12px;color:#64748b;margin-bottom:5px">
            <span>Subtotal</span><span style="font-weight:700;color:#334155">₹${order.subtotal}</span>
          </div>
          ${order.discount > 0 ? `<div style="display:flex;justify-content:space-between;font-size:12px;color:#059669;margin-bottom:5px"><span>Discount</span><span style="font-weight:700">-₹${order.discount}</span></div>` : ""}
          <div style="display:flex;justify-content:space-between;font-size:12px;color:#059669;margin-bottom:5px">
            <span>Delivery</span><span style="font-weight:700">FREE</span>
          </div>
          <div style="border-top:1px dashed #cbd5e1;margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-weight:900;font-size:15px;color:#c81e25">
            <span>Grand Total</span><span>₹${order.total}</span>
          </div>
        </div>
        <div style="margin-top:18px;padding:14px;background:#eff6ff;border-radius:12px;border:1px solid #bfdbfe">
          <div style="font-size:11px;font-weight:800;color:#1d4ed8;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px">📍 Delivery Address</div>
          <div style="font-size:13px;font-weight:600;color:#0f172a;line-height:1.5">
            <span style="font-size:10px;font-weight:800;background:#dbeafe;color:#1d4ed8;padding:2px 7px;border-radius:6px;margin-right:6px;text-transform:uppercase">${order.address.tag}</span>
            ${order.address.addressLine}, ${order.address.city} - ${order.address.pincode}
          </div>
          ${order.geoLocation?.latitude != null ? `<div style="margin-top:8px"><a href="https://www.google.com/maps?q=${encodeURIComponent(
            `${order.geoLocation.latitude},${order.geoLocation.longitude}`
          )}" target="_blank" rel="noopener" style="font-size:12px;color:#2563eb;font-weight:700">📌 Open delivery location in Google Maps</a></div>` : ""}
        </div>
        ${order.instructions ? `<div style="margin-top:14px;padding:12px 14px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px"><div style="font-size:11px;font-weight:800;letter-spacing:0.08em;color:#92400e;text-transform:uppercase">Your Instructions</div><div style="margin-top:4px;font-size:12px;color:#78350f;font-weight:600">${order.instructions}</div></div>` : ""}
      </div>
      <div style="padding:18px 26px;background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;text-align:center;font-size:11px;color:#94a3b8;font-weight:600">
        Fresh cuts, delivered cold & sealed. Need help? Call <span style="color:#c81e25;font-weight:800">+919999999999</span>
      </div>
    </div>
  </body></html>`;
}

export async function sendOrderCustomerConfirmation(
  order: Order
): Promise<BrevoSendResult> {
  if (!NOTIFY_ENABLED) {
    return { ok: false, error: "Brevo not configured" };
  }
  const toEmail = order.customerEmail;
  if (!toEmail) return { ok: false, error: "Customer has no email" };
  const toName = order.customerName || "Valued Customer";

  if (CUSTOMER_ORDER_CONFIRM_TEMPLATE_ID) {
    const params = {
      ORDER_ID: order.id,
      ORDER_DATE: order.date,
      STATUS: order.status,
      PAYMENT: order.paymentMethod.toUpperCase(),
      CUSTOMER_NAME: toName,
      ITEMS_COUNT: (order.items || []).length,
      SUBTOTAL: order.subtotal,
      DISCOUNT: order.discount,
      TOTAL: order.total,
      DELIVERY: "FREE",
      ADDRESS_TAG: order.address.tag,
      ADDRESS_LINE: `${order.address.addressLine}, ${order.address.city} - ${order.address.pincode}`,
      HAS_GPS: order.geoLocation?.latitude != null,
      GPS_LINK:
        order.geoLocation?.latitude != null
          ? `https://www.google.com/maps?q=${encodeURIComponent(
              `${order.geoLocation.latitude},${order.geoLocation.longitude}`
            )}`
          : "",
      INSTRUCTIONS: order.instructions || "",
    };
    return sendTemplate(
      CUSTOMER_ORDER_CONFIRM_TEMPLATE_ID,
      toEmail,
      toName,
      params
    );
  }

  const subject = `🧾 Order Confirmed ${order.id} • Freshoo`;
  return sendHtml(
    toEmail,
    toName,
    subject,
    buildOrderCustomerConfirmHtml(order)
  );
}

// ---------------- WELCOME EMAIL ----------------

export function buildWelcomeHtml(user: {
  name: string;
  email: string;
  phone?: string;
}): string {
  const firstName = (user.name || "there").split(" ")[0];
  return `<!doctype html><html>
  <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
  <body style="background:#f1f5f9;margin:0;padding:0;font-family:Inter,system-ui,Arial,sans-serif;color:#0f172a">
    <div style="max-width:560px;margin:0 auto;padding:20px">
      <div style="background:linear-gradient(135deg,#c81e25,#991b1b);padding:26px;border-radius:16px 16px 0 0;color:white;text-align:center">
        <div style="font-size:24px;font-weight:900;letter-spacing:-0.02em">Fresh<span style="color:#fecaca">oo</span></div>
        <div style="font-size:11px;letter-spacing:0.3em;font-weight:800;margin-top:4px;opacity:0.9;text-transform:uppercase">Welcome Onboard</div>
      </div>
      <div style="background:white;padding:28px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px">
        <h2 style="margin:0 0 6px 0;font-size:20px;font-weight:900">Hi ${firstName}! 🎉</h2>
        <p style="margin:0 0 14px 0;font-size:13px;color:#64748b;line-height:1.6">
          Thank you for creating your Freshoo account. You are all set to order farm-fresh chicken, mutton, fish, and eggs — delivered straight from the butcher to your doorstep.
        </p>
        <div style="padding:16px;background:#fef2f2;border-radius:12px;border:1px solid #fecaca;margin-top:6px">
          <div style="font-size:11px;font-weight:800;color:#991b1b;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px">🎁 Welcome Offer for You</div>
          <div style="padding:10px 14px;background:white;border-radius:10px;border:1px dashed #fca5a5;display:flex;align-items:center;justify-content:space-between">
            <div>
              <div style="font-weight:900;color:#c81e25;letter-spacing:0.05em">WELCOME20</div>
              <div style="font-size:11px;color:#64748b;margin-top:2px">20% OFF on your first order (up to ₹200)</div>
            </div>
            <div style="padding:6px 10px;background:#fef2f2;border-radius:8px;color:#c81e25;font-size:11px;font-weight:800;text-transform:uppercase">APPLY</div>
          </div>
        </div>
        <div style="margin-top:18px;padding:14px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0">
          <div style="font-size:11px;font-weight:800;color:#475569;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px">Account Snapshot</div>
          <div style="font-size:12px;color:#334155">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#64748b">Name</span><span style="font-weight:700">${user.name}</span></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#64748b">Email</span><span style="font-weight:700">${user.email}</span></div>
            ${user.phone ? `<div style="display:flex;justify-content:space-between"><span style="color:#64748b">Phone</span><span style="font-weight:700">+91 ${user.phone}</span></div>` : ""}
          </div>
        </div>
        <div style="margin-top:22px;text-align:center">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/shop" style="display:inline-block;padding:12px 26px;background:#c81e25;color:white;border-radius:12px;font-size:12px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;box-shadow:0 4px 12px rgba(200,30,37,0.25)">🛒 Start Shopping Now</a>
        </div>
        <div style="margin-top:20px;padding-top:18px;border-top:1px dashed #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;font-weight:600">
          If you have any questions, reply to this email or call us at <span style="color:#c81e25;font-weight:800">+919999999999</span>
        </div>
      </div>
    </div>
  </body></html>`;
}

export async function sendWelcomeEmail(user: {
  name: string;
  email: string;
  phone?: string;
}): Promise<BrevoSendResult> {
  if (!NOTIFY_ENABLED) return { ok: false, error: "Brevo not configured" };
  if (!user?.email) return { ok: false, error: "Missing user email" };

  if (WELCOME_TEMPLATE_ID) {
    return sendTemplate(WELCOME_TEMPLATE_ID, user.email, user.name, {
      NAME: user.name,
      FIRST_NAME: (user.name || "there").split(" ")[0],
      EMAIL: user.email,
      PHONE: user.phone || "",
      COUPON_CODE: "WELCOME20",
      COUPON_DESC: "20% OFF on your first order (up to ₹200)",
    });
  }
  return sendHtml(
    user.email,
    user.name,
    "🎉 Welcome to Freshoo! Your account is ready",
    buildWelcomeHtml(user)
  );
}

// ---------------- LOGIN ALERT EMAIL ----------------

export function buildLoginAlertHtml(details: {
  name: string;
  email: string;
  ip?: string;
  userAgent?: string;
  loginAt: string;
}): string {
  const firstName = (details.name || "there").split(" ")[0];
  return `<!doctype html><html>
  <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
  <body style="background:#f1f5f9;margin:0;padding:0;font-family:Inter,system-ui,Arial,sans-serif;color:#0f172a">
    <div style="max-width:520px;margin:0 auto;padding:20px">
      <div style="background:white;padding:26px;border-radius:16px;border:1px solid #e2e8f0">
        <div style="display:flex;align-items:center;gap:14px;padding-bottom:16px;border-bottom:1px solid #f1f5f9">
          <div style="padding:10px;background:#fef2f2;border-radius:12px"><span style="font-size:20px">🔐</span></div>
          <div>
            <div style="font-size:16px;font-weight:900">New Login to your Freshoo Account</div>
            <div style="font-size:11px;color:#64748b;margin-top:2px;font-weight:600">Security Alert — ${details.loginAt}</div>
          </div>
        </div>
        <div style="padding:18px 0 0 0">
          <p style="margin:0 0 14px 0;font-size:13px;color:#334155;line-height:1.6">
            Hi <b style="font-weight:800">${firstName}</b>, we just received a new login to your Freshoo account. If this was you, you can safely ignore this message.
          </p>
          <div style="padding:14px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;font-size:12px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#64748b">Email</span><span style="font-weight:800;color:#0f172a">${details.email}</span></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#64748b">Time</span><span style="font-weight:700;color:#334155">${details.loginAt}</span></div>
            ${details.ip ? `<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#64748b">IP Address</span><span style="font-weight:700;color:#334155;font-family:ui-monospace,monospace">${details.ip}</span></div>` : ""}
            ${details.userAgent ? `<div style="display:flex;justify-content:space-between;align-items:start;gap:14px"><span style="color:#64748b;flex-shrink:0">Device</span><span style="font-weight:700;color:#334155;font-size:11px;text-align:right;line-height:1.4;max-width:300px;word-break:break-word">${details.userAgent}</span></div>` : ""}
          </div>
          <div style="margin-top:16px;padding:14px;background:#fff7ed;border-radius:12px;border:1px solid #fed7aa">
            <div style="font-size:11px;font-weight:800;color:#9a3412;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px">⚠️ Not you?</div>
            <div style="font-size:12px;color:#7c2d12;font-weight:600;line-height:1.5">
              If this login was NOT made by you, reply to this email immediately or call <b style="font-weight:900;color:#c81e25">+919999999999</b>. We will freeze your account and help you reset your password.
            </div>
          </div>
        </div>
      </div>
      <div style="margin-top:14px;text-align:center;font-size:10px;color:#94a3b8;font-weight:600">
        Freshoo Security Team • freshoo.online@gmail.com
      </div>
    </div>
  </body></html>`;
}

export async function sendLoginAlertEmail(details: {
  name: string;
  email: string;
  ip?: string;
  userAgent?: string;
  loginAt?: string;
}): Promise<BrevoSendResult> {
  if (!NOTIFY_ENABLED) return { ok: false, error: "Brevo not configured" };
  if (!details?.email) return { ok: false, error: "Missing email" };
  const loginAt =
    details.loginAt ||
    new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  return sendHtml(
    details.email,
    details.name || "Customer",
    "🔐 New Login to your Freshoo Account",
    buildLoginAlertHtml({ ...details, loginAt })
  );
}

// ---------------- PRODUCT CHANGED ADMIN ALERT ----------------

export async function sendProductAdminAlert(details: {
  action: "Created" | "Updated" | "Deleted";
  productName: string;
  productId: string;
  category?: string;
  changedBy?: string;
  price?: string;
}): Promise<BrevoSendResult> {
  if (!NOTIFY_ENABLED || !NOTIFY_EMAIL) {
    return { ok: false, error: "Brevo admin notify not configured" };
  }
  const emoji =
    details.action === "Created"
      ? "➕"
      : details.action === "Updated"
      ? "✏️"
      : "🗑️";
  const html = `<!doctype html><html>
  <head><meta charset="utf-8"/></head>
  <body style="background:#f1f5f9;margin:0;padding:0;font-family:Inter,system-ui,Arial,sans-serif">
    <div style="max-width:520px;margin:0 auto;padding:20px">
      <div style="background:white;border:1px solid #e2e8f0;border-radius:16px;padding:24px">
        <div style="display:flex;align-items:center;gap:12px;padding-bottom:14px;border-bottom:1px solid #f1f5f9">
          <div style="padding:10px;background:#f8fafc;border-radius:12px;font-size:20px">${emoji}</div>
          <div>
            <div style="font-size:15px;font-weight:900">Product ${details.action}</div>
            <div style="font-size:11px;color:#64748b;margin-top:2px;font-weight:600">${new Date().toLocaleString("en-IN")} ${
    details.changedBy ? `• by ${details.changedBy}` : ""
  }</div>
          </div>
        </div>
        <div style="padding:14px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-top:16px;font-size:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#64748b">Name</span><span style="font-weight:800;color:#0f172a">${details.productName}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#64748b">Category</span><span style="font-weight:700;color:#334155">${details.category || "—"}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#64748b">ID</span><span style="font-family:ui-monospace,monospace;font-size:11px;font-weight:700;color:#334155">${details.productId}</span></div>
          ${details.price ? `<div style="display:flex;justify-content:space-between"><span style="color:#64748b">Price</span><span style="font-weight:800;color:#c81e25">${details.price}</span></div>` : ""}
        </div>
      </div>
    </div>
  </body></html>`;
  return sendHtml(
    NOTIFY_EMAIL,
    "Freshoo Store Admin",
    `${emoji} Product ${details.action}: ${details.productName}`,
    html
  );
}

export const brevoConfig = {
  enabled: NOTIFY_ENABLED,
  orderNotifyEnabled: ORDER_NOTIFY_ENABLED,
  sender: { name: SENDER_NAME, email: SENDER_EMAIL },
  adminEmail: NOTIFY_EMAIL,
  welcomeTemplateId: WELCOME_TEMPLATE_ID,
  customerConfirmTemplateId: CUSTOMER_ORDER_CONFIRM_TEMPLATE_ID,
};
