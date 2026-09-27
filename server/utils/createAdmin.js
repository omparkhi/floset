const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const connectDB = require("../config/db");
const User = require("../models/User");

const createOrUpdateAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || "altraverse@floset.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Ronit@200518";
  const adminName = process.env.ADMIN_NAME || "FloSet Master Admin";
  const adminPhone = process.env.ADMIN_PHONE || "+91 98765 43210";

  try {
    console.log("Connecting to database...");
    await connectDB();

    console.log(`Searching for existing user with email: ${adminEmail}...`);
    let user = await User.findOne({ email: adminEmail.toLowerCase() });

    if (user) {
      console.log(`User found (ID: ${user._id}). Updating credentials and admin role...`);
      user.name = adminName;
      user.password = adminPassword; // Triggers mongoose pre-save bcrypt hash
      user.role = "admin";
      user.phone = user.phone || adminPhone;
      await user.save();
      console.log("✅ Admin account successfully updated!");
    } else {
      console.log("No existing user found with this email. Creating new admin user...");
      user = await User.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        phone: adminPhone,
        role: "admin",
      });
      console.log("✅ New admin account successfully created!");
    }

    console.log("-----------------------------------------");
    console.log("🎉 FLOSET ADMIN CREDENTIALS CONFIGURED:");
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role:     ${user.role}`);
    console.log(`   User ID:  ${user._id}`);
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating/updating admin:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  createOrUpdateAdmin();
}

module.exports = createOrUpdateAdmin;
