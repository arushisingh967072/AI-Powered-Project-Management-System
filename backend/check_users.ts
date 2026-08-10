import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User";

dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ Successfully connected to MongoDB Atlas");
    const users = await User.find({}).select("+password");
    console.log(`📊 Registered Users Count: ${users.length}`);
    users.forEach((u) => {
      console.log(`👤 Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | PasswordHash: ${u.password || 'MISSING'} | GoogleId: ${u.googleId || 'None'}`);
    });
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Database query error:", error);
  }
};

check();
