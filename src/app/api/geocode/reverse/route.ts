import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Franchise } from "@/models/Franchise";
import { evaluateServiceability } from "@/lib/geo";
import { jsonErr, jsonOk } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");

    if (!latStr || !lngStr) {
      return jsonErr("Latitude (lat) and Longitude (lng) are required.");
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return jsonErr("Invalid geographical coordinates.");
    }

    await connectDB();

    // Ensure at least default franchise exists
    const count = await Franchise.countDocuments();
    if (count === 0) {
      await Franchise.create({
        name: "Rohini Sector 22 Hub (Main)",
        code: "ROHINI-22",
        address: "Pocket 4, Sector 22, Rohini, New Delhi",
        city: "Delhi",
        coordinates: {
          latitude: 28.7188,
          longitude: 77.0673,
        },
        phone: "+919310593167",
        email: "freshoo.online@gmail.com",
        deliveryRadiusKm: 10,
        isActive: true,
        openingTime: "07:00",
        closingTime: "23:00",
        isTemporarilyClosed: false,
        holidays: [],
      });
    }

    const franchises = await Franchise.find({ isActive: true }).lean();
    const serviceability = evaluateServiceability(
      { latitude: lat, longitude: lng },
      franchises.map((f: any) => ({
        id: f._id.toString(),
        name: f.name,
        code: f.code,
        address: f.address,
        coordinates: f.coordinates,
        deliveryRadiusKm: f.deliveryRadiusKm,
        isActive: f.isActive,
        isTemporarilyClosed: f.isTemporarilyClosed,
        openingTime: f.openingTime,
        closingTime: f.closingTime,
        holidays: f.holidays,
      }))
    );

    // Reverse geocode via OpenStreetMap Nominatim with safe timeout
    let addressData = {
      addressLine: "",
      city: "Delhi",
      pincode: "",
      locality: "",
      formatted: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`,
    };

    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const res = await fetch(nominatimUrl, {
        headers: {
          "User-Agent": "FreshooECommerce/2.0 (contact@freshoo.online)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.street || addr.suburb || addr.neighbourhood || "";
        const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.city_district || "";
        const city = addr.city || addr.state_district || addr.county || "Delhi";
        const pincode = addr.postcode || "";

        const lineParts = [addr.house_number, road, locality].filter(Boolean);
        const addressLine = lineParts.length > 0 ? lineParts.join(", ") : data.name || "Detected Location";

        addressData = {
          addressLine,
          city,
          pincode,
          locality,
          formatted: data.display_name || addressLine,
        };
      }
    } catch {
      // Fallback: If external geocoder is unreachable, provide clean coordinates without crashing
      addressData = {
        addressLine: `GPS Pin: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        city: "Delhi",
        pincode: "",
        locality: serviceability.franchise ? `Near ${serviceability.franchise.name}` : "",
        formatted: `GPS Pin: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      };
    }

    return jsonOk({
      coordinates: { latitude: lat, longitude: lng },
      address: addressData,
      serviceability,
    });
  } catch (e: any) {
    console.error("Geocode reverse error:", e);
    return jsonErr(e?.message || "Failed to reverse geocode coordinates", 500);
  }
}

