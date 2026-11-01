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
      flatSociety: "",
      locality: "",
      city: "Delhi",
      state: "Delhi",
      pincode: "",
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
        const road = addr.road || addr.street || addr.residential || "";

        const localityCandidates = [
          addr.suburb,
          addr.neighbourhood,
          addr.residential,
          addr.subdistrict,
          addr.quarter,
          addr.city_district,
          addr.road,
          addr.street,
          addr.hamlet,
          addr.village,
          addr.industrial,
          addr.commercial,
        ].filter(Boolean);

        let locality = localityCandidates.length > 0 ? localityCandidates[0] : "";
        if (!locality || locality === addr.city) {
          if (serviceability.franchise?.name) {
            locality = serviceability.franchise.name.replace(/Hub|\(.*?\)/gi, "").trim();
          } else if (lat >= 28.55 && lat <= 28.75 && lng >= 77.30 && lng <= 77.55) {
            locality = "Siddharth Vihar";
          } else {
            locality = "Sector 22, Rohini";
          }
        }

        const rawCity =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.state_district ||
          addr.county ||
          "Delhi";
        const city = rawCity.replace(/District|Tehsil/gi, "").trim() || "Delhi";

        // Detect State
        let state = addr.state || "";
        if (!state) {
          const lowerCity = city.toLowerCase();
          if (lowerCity.includes("ghaziabad") || lowerCity.includes("noida") || lowerCity.includes("meerut")) {
            state = "Uttar Pradesh";
          } else if (lowerCity.includes("gurgaon") || lowerCity.includes("faridabad")) {
            state = "Haryana";
          } else {
            state = "Delhi";
          }
        }

        // Clean 6-digit Indian pincode with smart regional fallback
        const rawPincode = String(addr.postcode || "").replace(/\D/g, "");
        let pincode = rawPincode.length >= 6 ? rawPincode.slice(0, 6) : rawPincode;
        if (!pincode) {
          if (lat >= 28.55 && lat <= 28.75 && lng >= 77.30 && lng <= 77.55) {
            pincode = "201009";
          } else if (lat >= 28.65 && lat <= 28.80 && lng >= 77.00 && lng <= 77.20) {
            pincode = "110086";
          }
        }

        const houseOrBuilding = [addr.house_number, addr.building, addr.flat, addr.commercial]
          .filter(Boolean)
          .join(" ");

        const lineParts = [houseOrBuilding, road, locality].filter(Boolean);
        const addressLine =
          lineParts.length > 0
            ? lineParts.join(", ")
            : locality
            ? `${locality}, ${city}`
            : data.name || data.display_name || "Detected Location";

        addressData = {
          addressLine,
          flatSociety: houseOrBuilding,
          locality,
          city,
          state,
          pincode,
          formatted: data.display_name || addressLine,
        };
      }
    } catch {
      // Fallback: If external geocoder is unreachable, provide accurate coordinates & regional defaults
      const isGhaziabadArea = lat >= 28.55 && lat <= 28.75 && lng >= 77.30 && lng <= 77.55;
      addressData = {
        addressLine: isGhaziabadArea ? "Siddharth Vihar, Ghaziabad" : "Sector 22, Rohini, Delhi",
        flatSociety: "",
        locality: isGhaziabadArea ? "Siddharth Vihar" : "Sector 22, Rohini",
        city: isGhaziabadArea ? "Ghaziabad" : "Delhi",
        state: isGhaziabadArea ? "Uttar Pradesh" : "Delhi",
        pincode: isGhaziabadArea ? "201009" : "110086",
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

