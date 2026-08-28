import bcrypt from "bcryptjs";
import User from "../models/User";

export const seedAdminUser = async (): Promise<void> => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@freshoo.in";
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "AdminPassword@123";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("[Seed] Admin user already exists");
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = await User.create({
      name: "Freshoo Admin",
      email: adminEmail,
      phone: "9999999999",
      passwordHash: hashedPassword,
      role: "ADMIN",
      isAdmin: true,
      isActive: true,
    });

    console.log(`[Seed] Admin user created successfully`);
    console.log(`[Seed] Email: ${adminEmail}`);
    console.log(`[Seed] Password: ${adminPassword}`);
    console.log(`[Seed] ⚠️  Change this password immediately after first login!`);
  } catch (err: any) {
    console.error("[Seed] Failed to create admin user:", err.message);
  }
};
