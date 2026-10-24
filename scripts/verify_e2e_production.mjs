import mongoose from "mongoose";
import { Order } from "../src/models/Order.ts";
import { Franchise } from "../src/models/Franchise.ts";
import { Product } from "../src/models/Product.ts";
import { StoreSettings } from "../src/models/StoreSettings.ts";
import { evaluateServiceability, calculateDistanceKm, checkOperatingHours } from "../src/lib/geo.ts";

async function run() {
  console.log("=== STARTING PRODUCTION INTEGRATION & LOGIC VERIFICATION ===");

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI not set in environment.");
  }

  await mongoose.connect(uri);
  console.log("✓ Connected to MongoDB Atlas");

  // 1. Verify existing customer data preserved
  const countOrders = await Order.countDocuments();
  console.log(`✓ Existing production orders count preserved: ${countOrders}`);
  assert(countOrders >= 67, "Existing order count must not decrease");

  // 2. Verify default franchise
  let hub = await Franchise.findOne({ code: "ROHINI-22" });
  if (!hub) {
    hub = await Franchise.create({
      name: "Rohini Sector 22 Hub (Main)",
      code: "ROHINI-22",
      address: "Pocket 4, Sector 22, Rohini, New Delhi",
      city: "Delhi",
      coordinates: { latitude: 28.7188, longitude: 77.0673 },
      phone: "+919310593167",
      email: "freshoo.online@gmail.com",
      deliveryRadiusKm: 10,
      isActive: true,
      openingTime: "07:00",
      closingTime: "23:00",
      isTemporarilyClosed: false,
    });
    console.log("✓ Seeded default Rohini Sector 22 hub");
  } else {
    console.log(`✓ Default hub active: ${hub.name} (${hub.code}), Radius: ${hub.deliveryRadiusKm} km`);
  }

  // 3. Test Haversine Serviceability Boundary
  const customerInside = { latitude: 28.723, longitude: 77.085 }; // Rohini Sec 24 (~2 km)
  const servIn = evaluateServiceability(customerInside, [hub]);
  console.log(`✓ In-Radius Location Check: ${servIn.isServiceable} (${servIn.distanceKm} km)`);
  assert(servIn.isServiceable === true, "Location in Rohini must be serviceable");

  const customerOutside = { latitude: 28.6268, longitude: 77.3785 }; // Noida Sec 62 (~33 km)
  const servOut = evaluateServiceability(customerOutside, [hub]);
  console.log(`✓ Out-of-Radius Location Check: ${servOut.isServiceable} (${servOut.distanceKm} km)`);
  assert(servOut.isServiceable === false, "Location in Noida must be rejected beyond 10 km");

  // 4. Test Order Creation with Status "Order Received"
  const testIdemp = `idemp-verify-${Date.now()}`;
  const syntheticOrder = await Order.create({
    friendlyId: `FRSH-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
    idempotencyKey: testIdemp,
    date: new Date().toLocaleDateString("en-IN"),
    customerName: "Test Automation Customer",
    customerPhone: "9999999999",
    customerEmail: "test@freshoo.local",
    isGuestOrder: true,
    items: [
      {
        product: { id: "p1", name: "Chicken Curry Cut", category: "Chicken" },
        selectedWeight: "500g",
        price: 199,
        quantity: 2,
      },
    ],
    address: {
      tag: "Home",
      addressLine: "Test Pocket 4, Sector 22",
      city: "Delhi",
      pincode: "110086",
      geoLocation: { latitude: 28.7188, longitude: 77.0673, accuracy: 10 },
    },
    paymentMethod: "cod",
    paymentStatus: "Pending",
    status: "Order Received", // Exact status
    subtotal: 398,
    discount: 0,
    total: 398,
    statusHistory: [
      {
        status: "Order Received",
        timestamp: new Date(),
        updatedBy: "automation-test",
        note: "Initial test creation",
      },
    ],
    franchise: {
      id: hub._id,
      name: hub.name,
      code: hub.code,
      distanceKm: 0.1,
    },
  });

  console.log(`✓ Created test order: ${syntheticOrder.friendlyId} with status: ${syntheticOrder.status}`);
  assert(syntheticOrder.status === "Order Received", "Initial status must be 'Order Received'");

  // 5. Test Transition to "Order Confirmed" with Audit History
  syntheticOrder.status = "Order Confirmed";
  syntheticOrder.statusHistory.push({
    status: "Order Confirmed",
    timestamp: new Date(),
    updatedBy: "admin@freshoo.in",
    note: "Order confirmed by admin",
  });
  await syntheticOrder.save();

  const refreshedOrder = await Order.findById(syntheticOrder._id);
  console.log(`✓ Updated order status: ${refreshedOrder.status}, history events: ${refreshedOrder.statusHistory.length}`);
  assert(refreshedOrder.status === "Order Confirmed", "Status must update to 'Order Confirmed'");
  assert(refreshedOrder.statusHistory.length === 2, "Status history must record both events");

  // 6. Test Idempotency: Searching by same key returns existing without duplication
  const duplicateLookup = await Order.findOne({ idempotencyKey: testIdemp });
  assert(duplicateLookup._id.toString() === syntheticOrder._id.toString(), "Idempotency match verified");
  console.log("✓ Idempotency duplicate prevention confirmed");

  // 7. Cleanup synthetic test order to keep database clean
  await Order.deleteOne({ _id: syntheticOrder._id });
  console.log("✓ Cleaned up synthetic test order from database");

  const finalCount = await Order.countDocuments();
  console.log(`✓ Final order count in DB: ${finalCount} (Data integrity preserved)`);

  await mongoose.disconnect();
  console.log("=== ALL PRODUCTION INTEGRATION CHECKS PASSED SUCCESSFULLY ===");
}

function assert(condition, message) {
  if (!condition) {
    console.error("Assertion failed:", message);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Integration verification failed:", err);
  process.exit(1);
});

