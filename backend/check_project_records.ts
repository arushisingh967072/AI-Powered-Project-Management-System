import mongoose from "mongoose";
import dotenv from "dotenv";
import Sprint from "./models/Sprint";
import Task from "./models/Task";
import Bug from "./models/Bug";

dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ Connected to MongoDB");

    const projectId = "6a771f60226ef5c47614a4a3";
    console.log(`📁 Diagnostics for Project ID: ${projectId}`);

    // Sprints
    const sprintsCount = await Sprint.countDocuments({ project: projectId });
    console.log(`🏃 Sprints Count in DB: ${sprintsCount}`);

    // Tasks
    const tasksCount = await Task.countDocuments({ project: projectId });
    console.log(`📋 Tasks Count in DB: ${tasksCount}`);

    // Bugs
    const bugsCount = await Bug.countDocuments({ project: projectId });
    console.log(`🐛 Bugs Count in DB: ${bugsCount}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Diagnostic query error:", error);
  }
};

check();
