import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User";
import Project from "./models/Project";

dotenv.config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ Database Connected successfully");

    // Find the first developer (employee)
    const employee = await User.findOne({ role: "employee" });
    if (!employee) {
      console.log("❌ Diagnostic Error: No developer accounts found in database.");
      await mongoose.disconnect();
      return;
    }
    console.log(`👤 Testing permissions for Developer: ${employee.name} (ID: ${employee._id})`);

    // Find projects assigned to this developer
    const projects = await Project.find({ assignedEmployees: employee._id });
    console.log(`📊 Assigned projects count in DB for this dev: ${projects.length}`);

    if (projects.length === 0) {
      console.log("❌ No projects assigned to this developer in database.");
      await mongoose.disconnect();
      return;
    }

    const proj = projects[0];
    console.log(`📁 Project Name: "${proj.name}" (ID: ${proj._id})`);

    // Run the PM/Emp check checks
    const isPM = proj.projectManager.toString() === employee._id.toString();
    const isEmp = proj.assignedEmployees.some((empId) => empId.toString() === employee._id.toString());
    console.log(`🔍 ProjectManager matching check: ${isPM}`);
    console.log(`🔍 AssignedEmployee matching check (Sprint/Tasks/Bugs check): ${isEmp}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Diagnostic execution error:", error);
  }
};

test();
