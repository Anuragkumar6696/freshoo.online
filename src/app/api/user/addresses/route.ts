import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { forbidden, jsonErr, jsonOk, methodNotAllowed, notFound, unauthorized } from "@/lib/response";
import { getAuthUser } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const ctx = await getAuthUser();
    if (!ctx) return unauthorized();
    return jsonOk({ addresses: ctx.user.addresses.map((a: any) => ({
      id: (a._id || a.id).toString(),
      tag: a.tag,
      addressLine: a.addressLine,
      city: a.city,
      pincode: a.pincode,
      geoLocation: a.geoLocation || null,
    })) });
  } catch (e: any) {
    return jsonErr(e?.message || "Failed to load addresses", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthUser();
    if (!ctx) return unauthorized();
    const body = await req.json();
    const tag = body?.tag || "Home";
    const addressLine = (body?.addressLine || "").trim();
    const city = (body?.city || "Delhi").trim();
    const pincode = String(body?.pincode || "").replace(/\D/g, "").slice(0, 6);
    const geoLocation = body?.geoLocation || null;

    if (addressLine.length < 5)
      return jsonErr("Street address is too short");
    if (pincode.length !== 6)
      return jsonErr("Please enter a valid 6-digit pincode");

    await connectDB();
    const newAddr: any = { tag, addressLine, city, pincode };
    if (geoLocation) newAddr.geoLocation = geoLocation;

    const user = await User.findById(ctx.user._id);
    if (!user) return notFound("Account not found");
    user.addresses.push(newAddr);
    await user.save();
    const last = user.addresses[user.addresses.length - 1];
    return jsonOk(
      {
        address: {
          id: (last._id || last.id).toString(),
          tag: last.tag,
          addressLine: last.addressLine,
          city: last.city,
          pincode: last.pincode,
          geoLocation: last.geoLocation || null,
        },
        addresses: user.addresses.map((a: any) => ({
          id: (a._id || a.id).toString(),
          tag: a.tag,
          addressLine: a.addressLine,
          city: a.city,
          pincode: a.pincode,
          geoLocation: a.geoLocation || null,
        })),
      },
      { status: 201 }
    );
  } catch (e: any) {
    return jsonErr(e?.message || "Failed to add address", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await getAuthUser();
    if (!ctx) return unauthorized();
    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const id = body?.id || searchParams.get("id");
    if (!id) return jsonErr("Address id is required");
    await connectDB();
    const user = await User.findById(ctx.user._id);
    if (!user) return notFound("Account not found");
    user.addresses = (user.addresses || []).filter(
      (a: any) => (a._id || a.id).toString() !== id
    );
    await user.save();
    return jsonOk({ deleted: true, addresses: user.addresses.map((a: any) => ({
      id: (a._id || a.id).toString(),
      tag: a.tag,
      addressLine: a.addressLine,
      city: a.city,
      pincode: a.pincode,
      geoLocation: a.geoLocation || null,
    })) });
  } catch (e: any) {
    return jsonErr(e?.message || "Failed to remove address", 500);
  }
}

export function PUT() {
  return methodNotAllowed(["GET", "POST", "DELETE"]);
}
