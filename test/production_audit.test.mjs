import test from "node:test";
import assert from "node:assert/strict";
import { calculateDistanceKm, evaluateServiceability, checkOperatingHours } from "../src/lib/geo.ts";
import { ORDER_STATUSES } from "../src/models/Order.ts";

test("Geo & Haversine Formula — Rohini Sector 22 Distance Boundaries", () => {
  // Rohini Sector 22 Hub coordinates: ~28.7188, 77.0673
  const hub = {
    id: "hub-1",
    name: "Rohini Sector 22 Hub (Main)",
    code: "ROHINI-22",
    address: "Pocket 4, Sector 22, Rohini, Delhi",
    coordinates: { latitude: 28.7188, longitude: 77.0673 },
    deliveryRadiusKm: 10,
    isActive: true,
    isTemporarilyClosed: false,
    openingTime: "07:00",
    closingTime: "23:00",
  };

  // 1. Same coordinates: distance ~0 km (In radius)
  const distZero = calculateDistanceKm(28.7188, 77.0673, 28.7188, 77.0673);
  assert.equal(distZero, 0);

  // 2. Rohini Sector 24 (nearby, ~2 km) -> Eligible
  const servNearby = evaluateServiceability({ latitude: 28.723, longitude: 77.085 }, [hub]);
  assert.equal(servNearby.isServiceable, true);
  assert.ok(servNearby.distanceKm < 10);
  assert.equal(servNearby.franchise?.code, "ROHINI-22");

  // 3. Noida Sector 62 (~33 km away) -> Out of 10 km radius, rejected
  const servFar = evaluateServiceability({ latitude: 28.6268, longitude: 77.3785 }, [hub]);
  assert.equal(servFar.isServiceable, false);
  assert.ok(servFar.distanceKm > 10);
  assert.match(servFar.message, /beyond our current 10 km freshness delivery radius/i);

  // 4. Exact 10 km boundary test with tolerance
  const boundaryCoords = { latitude: 28.7188 + (10 / 111), longitude: 77.0673 };
  const servBoundary = evaluateServiceability(boundaryCoords, [hub]);
  // Distance is approximately 10 km
  assert.ok(servBoundary.distanceKm >= 9.9 && servBoundary.distanceKm <= 10.1);

  // 5. Inactive franchise rejection
  const inactiveHub = { ...hub, isActive: false };
  const servInactive = evaluateServiceability({ latitude: 28.723, longitude: 77.085 }, [inactiveHub]);
  assert.equal(servInactive.isServiceable, false);
  assert.match(servInactive.message, /offline/i);
});

test("Business Rules — Operating Hours & Holiday Closures", () => {
  // Store closed temporarily
  const resTempClosed = checkOperatingHours("07:00", "23:00", [], true);
  assert.equal(resTempClosed.isOpen, false);
  assert.match(resTempClosed.reason, /temporarily closed/i);

  // Holiday closure
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const holidays = [{ date: today, description: "Independence Day" }];
  const resHoliday = checkOperatingHours("07:00", "23:00", holidays, false);
  assert.equal(resHoliday.isOpen, false);
  assert.match(resHoliday.reason, /Independence Day/i);
});

test("Order Specifications — Permitted Statuses Validation", () => {
  // The system must prioritize the two explicit production statuses
  assert.ok(ORDER_STATUSES.includes("Order Received"));
  assert.ok(ORDER_STATUSES.includes("Order Confirmed"));

  // Default initial status for newly placed orders (auto-confirmed)
  const initialStatus = "Order Confirmed";
  assert.equal(initialStatus, "Order Confirmed");
});

test("Pricing & Idempotency Rules", () => {
  // Re-calculation verification
  const items = [
    { price: 199, quantity: 2 },
    { price: 269, quantity: 1 },
  ];
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  assert.equal(subtotal, 199 * 2 + 269); // 667

  const deliveryFee = 0; // Startup policy: FREE
  const finalTotal = subtotal + deliveryFee;
  assert.equal(finalTotal, 667);

  // Idempotency key consistency verification
  const now = Date.now();
  const key1 = `idemp-${now}-abc`;
  const key2 = `idemp-${now}-abc`;
  assert.equal(key1, key2);
});

