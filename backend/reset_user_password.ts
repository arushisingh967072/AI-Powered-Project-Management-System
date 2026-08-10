import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User";

dotenv.config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ Connected to MongoDB");

    const email = "arushisingh20dec@gmail.com";
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
      await mongoose.disconnect();
      return;
    }

    // Set new password
    user.password = "Arushi12345";
    await user.save();

    console.log(`🔑 Password for ${email} has been successfully reset to: Arushi12345`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Reset error:", error);
  }
};

resetPassword();
