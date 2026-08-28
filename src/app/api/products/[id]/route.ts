import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { forbidden, jsonErr, jsonOk, methodNotAllowed, notFound } from "@/lib/response";
import { requireAdminUser, getAuthUser } from "@/lib/withAuth";
import { sendProductAdminAlert } from "@/lib/brevo";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const p = await Product.findById(id);
    if (!p) return notFound("Product not found");
    return jsonOk({ product: p.toJSON() });
  } catch (e: any) {
    return jsonErr(e?.message || "Failed to load product", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser();
  } catch (e: any) {
    return e?.status === 403 ? forbidden() : jsonErr(e?.message || "Unauthorized", e?.status || 401);
  }
  try {
    const { id } = await params;
    const body = await req.json();
    await connectDB();
    const updated = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return notFound("Product not found");

    // Non-blocking admin alert for product update
    void (async () => {
      try {
        const ctx = await getAuthUser().catch(() => null);
        const firstPrice =
          Array.isArray(updated.weights) && updated.weights[0]?.price
            ? `₹${updated.weights[0].price}`
            : undefined;
        await sendProductAdminAlert({
          action: "Updated",
          productName: updated.name,
          productId: updated._id.toString(),
          category: updated.category,
          price: firstPrice,
          changedBy: ctx?.user?.name || ctx?.user?.email || "Admin",
        });
      } catch (e) {
        console.warn("[Brevo] product updated alert skipped:", e);
      }
    })();

    return jsonOk({ product: updated.toJSON() });
  } catch (e: any) {
    return jsonErr(e?.message || "Failed to update product", 500);
  }
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return PATCH(req, ctx);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser();
  } catch (e: any) {
    return e?.status === 403 ? forbidden() : jsonErr(e?.message || "Unauthorized", e?.status || 401);
  }
  try {
    const { id } = await params;
    await connectDB();
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return notFound("Product not found");

    void (async () => {
      try {
        const ctx = await getAuthUser().catch(() => null);
        await sendProductAdminAlert({
          action: "Deleted",
          productName: deleted.name || "Unknown Product",
          productId: deleted._id.toString(),
          category: deleted.category,
          changedBy: ctx?.user?.name || ctx?.user?.email || "Admin",
        });
      } catch (e) {
        console.warn("[Brevo] product deleted alert skipped:", e);
      }
    })();

    return jsonOk({ deleted: true, id });
  } catch (e: any) {
    return jsonErr(e?.message || "Failed to delete product", 500);
  }
}
