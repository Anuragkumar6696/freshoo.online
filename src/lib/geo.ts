export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface FranchiseLocationSummary {
  id: string;
  name: string;
  code: string;
  address: string;
  coordinates: Coordinates;
  deliveryRadiusKm: number;
  isActive: boolean;
  isTemporarilyClosed: boolean;
  openingTime: string;
  closingTime: string;
  holidays?: Array<{ date: string; description?: string }>;
}

export interface ServiceabilityResult {
  isServiceable: boolean;
  franchise: FranchiseLocationSummary | null;
  distanceKm: number | null;
  maxRadiusKm: number | null;
  message: string;
}

/**
 * Calculates distance in kilometers between two geographic coordinates using Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    lat1 == null ||
    lon1 == null ||
    lat2 == null ||
    lon2 == null ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return Infinity;
  }

  const R = 6371; // Earth's mean radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 100) / 100; // 2 decimal places
}

/**
 * Evaluates delivery serviceability for given coordinates against active franchises.
 * Picks the nearest active, non-closed franchise within its configured radius.
 */
export function evaluateServiceability(
  coords: Coordinates | null | undefined,
  franchises: FranchiseLocationSummary[]
): ServiceabilityResult {
  if (!coords || coords.latitude == null || coords.longitude == null) {
    return {
      isServiceable: false,
      franchise: null,
      distanceKm: null,
      maxRadiusKm: null,
      message: "Please select or provide a valid delivery location.",
    };
  }

  const activeFranchises = (franchises || []).filter(
    (f) => f.isActive && !f.isTemporarilyClosed
  );

  if (activeFranchises.length === 0) {
    return {
      isServiceable: false,
      franchise: null,
      distanceKm: null,
      maxRadiusKm: null,
      message: "Our delivery hubs are temporarily offline. Please check back shortly.",
    };
  }

  // Calculate distance to each active franchise
  const scored = activeFranchises.map((f) => {
    const dist = calculateDistanceKm(
      coords.latitude,
      coords.longitude,
      f.coordinates.latitude,
      f.coordinates.longitude
    );
    return { franchise: f, distanceKm: dist };
  });

  // Sort by nearest
  scored.sort((a, b) => a.distanceKm - b.distanceKm);
  const nearest = scored[0];

  const allowedRadius = nearest.franchise.deliveryRadiusKm || 10;
  // Use a slight floating point margin (0.05 km) for exact boundary tolerance
  const isInside = nearest.distanceKm <= allowedRadius + 0.05;

  if (isInside) {
    return {
      isServiceable: true,
      franchise: nearest.franchise,
      distanceKm: nearest.distanceKm,
      maxRadiusKm: allowedRadius,
      message: `Delivering from ${nearest.franchise.name} (~${nearest.distanceKm} km away). Target: ~20 mins.`,
    };
  }

  return {
    isServiceable: false,
    franchise: nearest.franchise,
    distanceKm: nearest.distanceKm,
    maxRadiusKm: allowedRadius,
    message: `Location is ${nearest.distanceKm} km away from nearest hub (${nearest.franchise.name}), which is beyond our current ${allowedRadius} km freshness delivery radius.`,
  };
}

/**
 * Verifies operating hours and holidays in Asia/Kolkata timezone.
 */
export function checkOperatingHours(
  openingTime: string = "07:00",
  closingTime: string = "23:00",
  holidays: Array<{ date: string; description?: string }> = [],
  isTemporarilyClosed: boolean = false
): { isOpen: boolean; reason?: string } {
  if (isTemporarilyClosed) {
    return {
      isOpen: false,
      reason: "Store is temporarily closed for maintenance. Please check back soon.",
    };
  }

  // Get current date/time in Asia/Kolkata
  const now = new Date();
  const kolkataFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = kolkataFormatter.formatToParts(now);
  const partMap: Record<string, string> = {};
  parts.forEach((p) => {
    partMap[p.type] = p.value;
  });

  const todayStr = `${partMap.year}-${partMap.month}-${partMap.day}`;
  const currentMinutes =
    parseInt(partMap.hour, 10) * 60 + parseInt(partMap.minute, 10);

  // Check holiday
  const holiday = holidays.find((h) => h.date === todayStr);
  if (holiday) {
    return {
      isOpen: false,
      reason: `Store closed today for ${holiday.description || "Holiday"}.`,
    };
  }

  // Parse open/close
  const [openH, openM] = (openingTime || "07:00").split(":").map(Number);
  const [closeH, closeM] = (closingTime || "23:00").split(":").map(Number);

  const openMinutes = (openH || 0) * 60 + (openM || 0);
  const closeMinutes = (closeH || 0) * 60 + (closeM || 0);

  if (openMinutes <= closeMinutes) {
    // Normal window within same calendar day (e.g. 07:00 to 23:00)
    if (currentMinutes < openMinutes || currentMinutes >= closeMinutes) {
      return {
        isOpen: false,
        reason: `Orders are accepted between ${openingTime} and ${closingTime} (IST). Current time: ${partMap.hour}:${partMap.minute}.`,
      };
    }
  } else {
    // Overnight window (e.g. 14:00 to 02:00 next day)
    if (currentMinutes < openMinutes && currentMinutes >= closeMinutes) {
      return {
        isOpen: false,
        reason: `Orders are accepted between ${openingTime} and ${closingTime} (IST).`,
      };
    }
  }

  return { isOpen: true };
}

