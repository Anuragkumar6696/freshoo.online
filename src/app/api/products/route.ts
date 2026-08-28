import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { forbidden, jsonErr, jsonOk, methodNotAllowed } from "@/lib/response";
import { requireAdminUser, getAuthUser } from "@/lib/withAuth";
import { sendProductAdminAlert } from "@/lib/brevo";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.trim();
    const id = searchParams.get("id");
    const best = searchParams.get("best");

    const q: any = {};
    if (category && ["Chicken", "Mutton", "Fish", "Eggs"].includes(category))
      q.category = category;
    if (best) q.isBestSeller = true;
    if (id) {
      const p = await Product.findById(id);
      if (!p) return jsonErr("Product not found", 404);
      return jsonOk({ product: p.toJSON() });
    }

    let query = Product.find(q).sort({ isBestSeller: -1, createdAt: -1 });

    if (search) {
      const rx = { $regex: search, $options: "i" };
      query = Product.find({
        $or: [{ name: rx }, { description: rx }, { category: rx }],
      }).sort({ isBestSeller: -1, createdAt: -1 });
    }

    const list = await query.lean().exec();
    const products = list.map((p: any) => ({
      ...p,
      id: (p._id || p.id).toString(),
      _id: undefined,
      __v: undefined,
    }));
    return jsonOk({ products, count: products.length });
  } catch (e: any) {
    console.error("products GET error:", e);
    return jsonErr(e?.message || "Failed to load products", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminUser();
  } catch (e: any) {
    const s = e?.status || 401;
    return s === 403 ? forbidden() : jsonErr(e?.message || "Unauthorized", s);
  }
  try {
    await connectDB();
    const body = await req.json();
    if (!body.name || !body.category || !body.weights?.length)
      return jsonErr("Name, category, and at least one weight option are required.");
    const p = await Product.create(body);

    // Admin alert for product creation (non-blocking)
    void (async () => {
      try {
        const ctx = await getAuthUser().catch(() => null);
        const firstPrice =
          Array.isArray(body.weights) && body.weights[0]?.price
            ? `₹${body.weights[0].price}`
            : undefined;
        await sendProductAdminAlert({
          action: "Created",
          productName: p.name,
          productId: p._id.toString(),
          category: p.category || body.category,
          price: firstPrice,
          changedBy: ctx?.user?.name || ctx?.user?.email || "Admin",
        });
      } catch (e) {
        console.warn("[Brevo] product created alert skipped:", e);
      }
    })();

    return jsonOk({ product: p.toJSON() }, { status: 201 });
  } catch (e: any) {
    console.error("products POST error:", e);
    return jsonErr(e?.message || "Failed to create product", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdminUser();
  } catch (e: any) {
    const s = e?.status || 401;
    return s === 403 ? forbidden() : jsonErr(e?.message || "Unauthorized", s);
  }
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    let body: any = {};
    try { body = await req.json().catch(() => ({})); } catch { /* noop */ }
    const idsRaw = id || body?.id || body?.ids;
    if (!idsRaw) return jsonErr("Product id(s) required");
    const ids = String(idsRaw).split(",").map((s) => s.trim()).filter(Boolean);
    const before = await Product.find({ _id: { $in: ids } }).lean().exec();
    const deleted = await Product.deleteMany({ _id: { $in: ids } });

    // Non-blocking admin alert(s)
    void (async () => {
      try {
        const ctx = await getAuthUser().catch(() => null);
        const by = ctx?.user?.name || ctx?.user?.email || "Admin";
        for (const p of before) {
          const pid = p._id?.toString() || ids[0];
          try {
            await sendProductAdminAlert({
              action: "Deleted",
              productName: p.name || "Unknown Product",
              productId: pid,
              category: p.category,
              changedBy: by,
            });
          } catch { /* noop */ }
        }
      } catch (e) {
        console.warn("[Brevo] product deleted alert skipped:", e);
      }
    })();

    return jsonOk({ deleted: deleted.deletedCount || 0, ids });
  } catch (e: any) {
    console.error("products DELETE error:", e);
    return jsonErr(e?.message || "Failed to delete product(s)", 500);
  }
}

export function PUT() {
  return methodNotAllowed(["GET", "POST", "DELETE"]);
}
