/* Brevo backend mail helper — sends order notification to admin and customer */
const API_KEY = process.env.BREVO_API_KEY || "";
const SENDER = process.env.BREVO_SENDER_EMAIL || "freshoo.online@gmail.com";
const ADMIN_RECIPIENTS = Array.from(
  new Set(
    [
      "freshoo.online@gmail.com",
      process.env.STORE_OWNER_EMAIL,
      process.env.ADMIN_EMAIL,
    ]
      .map((e) => e?.trim().toLowerCase())
      .filter(Boolean) as string[]
  )
);

export async function notifyAdmin(order: any): Promise<{ ok: boolean; msg?: string }> {
  if (!API_KEY) return { ok: false, msg: "No BREVO_API_KEY" };
  try {
    const customerName = order.customerName || order.guestDetails?.name || "Customer";
    const customerEmail = order.customerEmail || order.guestEmail || "—";
    const customerPhone = order.customerPhone || order.guestPhone || "—";
    const addressLine = order.address?.addressLine || "—";
    const city = order.address?.city || "Delhi";
    const pincode = order.address?.pincode || "—";
    const tag = order.address?.tag || "Home";
    const fullAddress = `${addressLine}, ${city} - ${pincode}`;

    const geo = order.geoLocation || order.address?.geoLocation;
    const lat = geo?.latitude;
    const lng = geo?.longitude;
    const hasCoords = lat != null && lng != null;

    const mapsAddressUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    const directionsUrl = hasCoords
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      : mapsAddressUrl;
    const pinUrl = hasCoords
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : mapsAddressUrl;

    const cleanPhone = String(customerPhone).replace(/\D/g, "");
    const waLink = cleanPhone ? `https://wa.me/91${cleanPhone.length === 12 ? cleanPhone.slice(2) : cleanPhone}` : "";

    const itemsRows = Array.isArray(order.items)
      ? order.items.map((it: any) => {
          const name = it.name || it.product?.name || "Fresh Meat";
          const weight = it.selectedWeight || "500g";
          const qty = it.quantity || 1;
          const price = it.price || it.product?.price || 0;
          const total = price * qty;
          const img = it.product?.image || it.image || "/chicken1.png";
          const fullImg = img.startsWith("http") ? img : `https://freshoo.online${img.startsWith("/") ? "" : "/"}${img}`;

          return `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 8px; width: 44px; vertical-align: middle;">
                <img src="${fullImg}" width="40" height="40" style="border-radius: 8px; object-fit: cover; background: #f8fafc; border: 1px solid #e2e8f0; display: block;" alt="${name}" />
              </td>
              <td style="padding: 10px 8px; vertical-align: middle;">
                <div style="font-weight: 800; font-size: 13px; color: #0f172a;">${name}</div>
                <div style="font-size: 11px; color: #c81e25; font-weight: 700; margin-top: 2px;">${weight} × ${qty}</div>
              </td>
              <td style="padding: 10px 8px; text-align: right; font-weight: 800; font-size: 13px; color: #0f172a; vertical-align: middle;">
                ₹${total}
              </td>
            </tr>
          `;
        }).join("")
      : `<tr><td colspan="3" style="padding: 12px; text-align: center; color: #64748b;">No items</td></tr>`;

    const gpsBox = hasCoords
      ? `
        <div style="margin-top: 16px; padding: 16px; background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 12px;">
          <div style="font-weight: 900; color: #991b1b; font-size: 13px;">
            📍 Verified GPS Customer Coordinates
          </div>
          <div style="font-family: monospace; color: #7f1d1d; margin-top: 4px; font-size: 12px; font-weight: 700;">
            Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}
            ${geo?.accuracy ? ` • Accuracy: ±${Math.round(geo.accuracy)}m` : ""}
          </div>
          <div style="margin-top: 12px;">
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer"
              style="display: inline-block; background: #c81e25; color: #ffffff; font-weight: 800; font-size: 12px; padding: 10px 18px; border-radius: 8px; text-decoration: none; margin-right: 8px; margin-bottom: 6px;">
              🧭 Start Live Turn-by-Turn GPS Directions →
            </a>
            <a href="${pinUrl}" target="_blank" rel="noopener noreferrer"
              style="display: inline-block; background: #ffffff; color: #c81e25; font-weight: 800; font-size: 12px; padding: 10px 16px; border-radius: 8px; text-decoration: none; border: 1.5px solid #c81e25;">
              📍 View Exact Pin on Google Maps →
            </a>
          </div>
        </div>
      `
      : `
        <div style="margin-top: 16px; padding: 14px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px;">
          <div style="font-weight: 800; color: #1e40af; font-size: 13px;">📍 Customer Delivery Address</div>
          <div style="color: #1e3a8a; font-size: 12px; margin-top: 3px;">${fullAddress}</div>
          <div style="margin-top: 10px;">
            <a href="${mapsAddressUrl}" target="_blank" rel="noopener noreferrer"
              style="display: inline-block; background: #2563eb; color: #ffffff; font-weight: 800; font-size: 12px; padding: 8px 16px; border-radius: 8px; text-decoration: none;">
              🗺️ Open Address in Google Maps →
            </a>
          </div>
        </div>
      `;

    const htmlContent = `<!doctype html>
      <html>
        <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
        <body style="background:#f8fafc;margin:0;padding:0;font-family:Inter,Arial,sans-serif;color:#0f172a;">
          <div style="max-width:640px;margin:0 auto;padding:20px;">
            <!-- Brand Red Header -->
            <div style="background:linear-gradient(135deg,#c81e25,#991b1b);padding:22px 26px;border-top-left-radius:16px;border-top-right-radius:16px;color:white;">
              <div style="font-size:24px;font-weight:900;letter-spacing:-0.02em;">Fresh<span style="color:#fecaca;">oo</span></div>
              <div style="font-size:11px;letter-spacing:0.2em;font-weight:800;margin-top:2px;opacity:0.95;text-transform:uppercase;">NEW ORDER RECEIVED • STORE ALERT</div>
            </div>

            <div style="background:white;padding:26px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
              <h2 style="margin:0 0 8px 0;font-size:20px;font-weight:900;color:#0f172a;">🛒 Order ${order.id || order.friendlyId}</h2>
              <div style="font-size:13px;color:#64748b;margin-bottom:16px;">
                📅 ${order.date || new Date().toLocaleString("en-IN")} • Status: <span style="font-weight:800;color:#c81e25;background:#fee2e2;padding:2px 8px;border-radius:6px;">${order.status || "CONFIRMED"}</span> • Payment: <span style="font-weight:800;color:#0f172a;background:#f1f5f9;padding:2px 8px;border-radius:6px;">${(order.paymentMethod || "COD").toUpperCase()} (Collect ₹${order.total || 0})</span>
              </div>

              <!-- Customer Details & Address Table -->
              <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                <tr>
                  <td style="padding:14px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;vertical-align:top;width:50%;">
                    <div style="font-size:11px;font-weight:800;color:#64748b;letter-spacing:0.08em;text-transform:uppercase;">Customer Details</div>
                    <div style="margin-top:6px;font-weight:900;font-size:15px;color:#0f172a;">${customerName}</div>
                    <div style="font-size:13px;color:#334155;margin-top:6px;">
                      📞 <a href="tel:${customerPhone}" style="color:#c81e25;font-weight:800;text-decoration:none;">${customerPhone}</a>
                      ${waLink ? `&nbsp;•&nbsp;<a href="${waLink}" target="_blank" style="color:#059669;font-weight:700;text-decoration:none;">WhatsApp</a>` : ""}
                    </div>
                    <div style="font-size:12px;color:#334155;margin-top:4px;">
                      ✉️ <a href="mailto:${customerEmail}" style="color:#0f172a;font-weight:600;text-decoration:underline;">${customerEmail}</a>
                    </div>
                  </td>
                  <td style="width:12px;"></td>
                  <td style="padding:14px;background:#fef2f2;border-radius:12px;border:1px solid #fecaca;vertical-align:top;width:50%;">
                    <div style="font-size:11px;font-weight:800;color:#991b1b;letter-spacing:0.08em;text-transform:uppercase;">Delivery Address</div>
                    <div style="margin-top:6px;">
                      <span style="font-size:10px;font-weight:800;background:#ffffff;color:#c81e25;padding:2px 7px;border-radius:6px;text-transform:uppercase;border:1px solid #fca5a5;">${tag}</span>
                      <div style="margin-top:6px;font-size:13px;font-weight:700;color:#0f172a;line-height:1.5;">${fullAddress}</div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- GPS Navigation Section -->
              ${gpsBox}

              <!-- Ordered Catalogue Breakdown -->
              <div style="margin-top:22px;">
                <div style="font-weight:900;margin-bottom:8px;color:#0f172a;font-size:14px;">Ordered Catalogue (${(order.items || []).length} items)</div>
                <table style="width:100%;border-collapse:separate;border-spacing:0;background:#fafbfc;border:1px solid #eef2f7;border-radius:10px;overflow:hidden;">
                  <thead>
                    <tr style="background:#f1f5f9;">
                      <th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;" colspan="2">Item</th>
                      <th style="padding:10px 8px;text-align:right;font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>${itemsRows}</tbody>
                </table>
              </div>

              <!-- Bill Summary -->
              <div style="margin-top:16px;padding:16px;background:#fef2f2;border-radius:12px;border:1px solid #fecaca;">
                <div style="display:flex;justify-content:space-between;font-size:13px;color:#334155;margin-bottom:5px;">
                  <span>Subtotal</span><span style="font-weight:700;">₹${order.subtotal || 0}</span>
                </div>
                ${order.discount > 0 ? `<div style="display:flex;justify-content:space-between;font-size:13px;color:#059669;margin-bottom:5px;"><span>Discount</span><span style="font-weight:700;">-₹${order.discount}</span></div>` : ""}
                <div style="display:flex;justify-content:space-between;font-size:13px;color:#059669;margin-bottom:5px;">
                  <span>Delivery Fee</span><span style="font-weight:800;">FREE (₹0)</span>
                </div>
                <div style="border-top:1.5px dashed #fca5a5;margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-weight:900;font-size:18px;color:#c81e25;">
                  <span>Total To Collect</span><span>₹${order.total || 0}</span>
                </div>
              </div>

              ${order.instructions ? `<div style="margin-top:14px;padding:12px 14px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;"><div style="font-size:11px;font-weight:800;color:#92400e;text-transform:uppercase;">⚠️ Customer Instructions</div><div style="margin-top:4px;font-size:13px;color:#78350f;font-weight:700;">${order.instructions}</div></div>` : ""}
            </div>

            <div style="padding:18px 26px;background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-bottom-left-radius:16px;border-bottom-right-radius:16px;text-align:center;font-size:11px;color:#94a3b8;font-weight:600;">
              Freshoo Hyperlocal Order Notification System • Keep meats fresh & chilled.
            </div>
          </div>
        </body>
      </html>`;

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "Freshoo", email: SENDER },
        to: ADMIN_RECIPIENTS.map((email) => ({ email, name: "Freshoo Store Admin" })),
        subject: `🛒 NEW ORDER ${order.id || order.friendlyId} • ₹${order.total || 0} • ${customerName}`,
        htmlContent,
      }),
    });
    console.log("[Brevo] Admin email sent:", res.status);

    // Also send customer confirmation email
    await sendCustomerConfirmation(order);

    return { ok: res.ok };
  } catch (e: any) {
    console.error("[Brevo] admin error:", e.message);
    return { ok: false, msg: e.message };
  }
}

export async function sendCustomerConfirmation(order: any): Promise<{ ok: boolean; msg?: string }> {
  if (!API_KEY) return { ok: false, msg: "No BREVO_API_KEY" };
  const recipientEmail = (order.customerEmail || order.guestEmail || order.guestDetails?.email || "").toLowerCase().trim();
  if (!recipientEmail || !recipientEmail.includes("@")) {
    console.log("[Brevo] No customer email provided for confirmation:", order.id || order.friendlyId);
    return { ok: false, msg: "No recipient email" };
  }

  try {
    const customerName = order.customerName || order.guestDetails?.name || "Valued Customer";
    const addressLine = order.address?.addressLine || "Your registered address";
    const city = order.address?.city || "Delhi";
    const pincode = order.address?.pincode || "";
    const fullAddress = `${addressLine}, ${city} ${pincode}`.trim();

    const itemsRows = Array.isArray(order.items)
      ? order.items.map((it: any) => {
          const name = it.name || it.product?.name || "Fresh Cut Meat";
          const weight = it.selectedWeight || "500g";
          const qty = it.quantity || 1;
          const price = it.price || it.product?.price || 0;
          const total = price * qty;
          const img = it.product?.image || it.image || "/chicken1.png";
          const fullImg = img.startsWith("http") ? img : `https://freshoo.online${img.startsWith("/") ? "" : "/"}${img}`;

          return `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 8px; width: 44px; vertical-align: middle;">
                <img src="${fullImg}" width="40" height="40" style="border-radius: 8px; object-fit: cover; background: #f8fafc; border: 1px solid #e2e8f0; display: block;" alt="${name}" />
              </td>
              <td style="padding: 10px 8px; vertical-align: middle;">
                <div style="font-weight: 800; font-size: 13px; color: #0f172a;">${name}</div>
                <div style="font-size: 11px; color: #c81e25; font-weight: 700; margin-top: 2px;">${weight} × ${qty}</div>
              </td>
              <td style="padding: 10px 8px; text-align: right; font-weight: 800; font-size: 13px; color: #0f172a; vertical-align: middle;">
                ₹${total}
              </td>
            </tr>
          `;
        }).join("")
      : "";

    const trackingUrl = `https://freshoo.online/order/${order.id || order.friendlyId}`;

    const htmlContent = `<!doctype html>
      <html>
        <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
        <body style="background:#f8fafc;margin:0;padding:0;font-family:Inter,Arial,sans-serif;color:#0f172a;">
          <div style="max-width:640px;margin:0 auto;padding:20px;">
            <!-- Signature Header -->
            <div style="background:linear-gradient(135deg,#c81e25,#991b1b);padding:24px 28px;border-top-left-radius:16px;border-top-right-radius:16px;color:white;text-align:center;">
              <div style="font-size:26px;font-weight:900;letter-spacing:-0.02em;">Fresh<span style="color:#fecaca;">oo</span></div>
              <div style="font-size:11px;letter-spacing:0.18em;font-weight:800;margin-top:4px;text-transform:uppercase;">ORDER CONFIRMATION RECEIPT</div>
            </div>

            <div style="background:white;padding:26px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
              <h2 style="margin:0 0 6px 0;font-size:19px;font-weight:900;color:#0f172a;">Thank you, ${customerName}! 🎉</h2>
              <p style="margin:0 0 16px 0;font-size:13px;color:#475569;line-height:1.5;">
                Your order <strong style="color:#c81e25;">${order.id || order.friendlyId}</strong> has been received by our butchery hub. We are preparing your fresh cuts under hygienic temperature-controlled cold chain.
              </p>

              <div style="padding:12px 16px;background:#fef2f2;border-radius:10px;border:1px solid #fecaca;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-size:11px;font-weight:800;color:#991b1b;text-transform:uppercase;">Estimated Delivery</div>
                  <div style="font-size:14px;font-weight:900;color:#0f172a;margin-top:2px;">~20 Minutes Express Delivery</div>
                </div>
                <div style="font-size:12px;font-weight:800;color:#c81e25;background:#ffffff;padding:4px 10px;border-radius:6px;border:1px solid #fca5a5;">
                  ${order.status || "Order Received"}
                </div>
              </div>

              <!-- Itemized Catalogue -->
              <div style="font-weight:900;margin-bottom:8px;color:#0f172a;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">Your Items</div>
              <table style="width:100%;border-collapse:separate;border-spacing:0;background:#fafbfc;border:1px solid #eef2f7;border-radius:10px;overflow:hidden;">
                <tbody>${itemsRows}</tbody>
              </table>

              <!-- Bill Breakdown -->
              <div style="margin-top:16px;padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
                <div style="display:flex;justify-content:space-between;font-size:13px;color:#334155;margin-bottom:5px;">
                  <span>Subtotal</span><span style="font-weight:700;">₹${order.subtotal || 0}</span>
                </div>
                ${order.discount > 0 ? `<div style="display:flex;justify-content:space-between;font-size:13px;color:#059669;margin-bottom:5px;"><span>Discount</span><span style="font-weight:700;">-₹${order.discount}</span></div>` : ""}
                <div style="display:flex;justify-content:space-between;font-size:13px;color:#059669;margin-bottom:5px;">
                  <span>Express Delivery (20 Mins)</span><span style="font-weight:800;">FREE (₹0)</span>
                </div>
                <div style="border-top:1.5px dashed #cbd5e1;margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-weight:900;font-size:17px;color:#0f172a;">
                  <span>Total Amount</span><span style="color:#c81e25;">₹${order.total || 0}</span>
                </div>
                <div style="margin-top:6px;font-size:11px;color:#64748b;">
                  Payment Method: <strong style="color:#0f172a;">${(order.paymentMethod || "COD").toUpperCase()} (Pay on Delivery)</strong>
                </div>
              </div>

              <!-- Delivery Address -->
              <div style="margin-top:16px;padding:14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
                <div style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;">Delivery Destination</div>
                <div style="margin-top:4px;font-size:13px;font-weight:700;color:#0f172a;">${fullAddress}</div>
              </div>

              <!-- Live Tracking CTA -->
              <div style="margin-top:22px;text-align:center;">
                <a href="${trackingUrl}" target="_blank" rel="noopener noreferrer"
                  style="display:inline-block;background:#c81e25;color:#ffffff;font-weight:800;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;box-shadow:0 3px 6px rgba(200,30,37,0.35);">
                  Track Your Order Live →
                </a>
              </div>
            </div>

            <div style="padding:18px 26px;background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-bottom-left-radius:16px;border-bottom-right-radius:16px;text-align:center;font-size:11px;color:#94a3b8;font-weight:600;">
              Freshoo • Fresh Cut Chicken, Mutton, Fish & Eggs • Support: freshoo.online@gmail.com
            </div>
          </div>
        </body>
      </html>`;

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "Freshoo", email: SENDER },
        to: [{ email: recipientEmail, name: customerName }],
        subject: `🥩 Order Confirmation — ${order.id || order.friendlyId} • Freshoo`,
        htmlContent,
      }),
    });
    console.log("[Brevo] Customer confirmation email sent to:", recipientEmail, res.status);
    return { ok: res.ok };
  } catch (e: any) {
    console.error("[Brevo] customer email error:", e.message);
    return { ok: false, msg: e.message };
  }
}
