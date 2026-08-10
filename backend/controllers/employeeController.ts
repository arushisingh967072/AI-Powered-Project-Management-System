import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import User from "../models/User";
import Project from "../models/Project";

/**
 * @desc    Get dashboard metrics for Administrator
 * @route   GET /api/employees/admin-stats
 * @access  Private (Admin only)
 */
export const getAdminStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalEmployees = await User.countDocuments({ role: "employee" });
    const totalManagers = await User.countDocuments({ role: "project_manager" });
    const totalProjects = await Project.countDocuments({});
    const activeProjects = await Project.countDocuments({ status: "active" });
    const completedProjects = await Project.countDocuments({ status: "completed" });

    // Available employees = employees not assigned to any 'active' or 'planning' project
    // Let's find all assigned employee IDs
    const projects = await Project.find({ status: { $in: ["planning", "active"] } }).select("assignedEmployees");
    const assignedIds = new Set<string>();
    projects.forEach((proj) => {
      proj.assignedEmployees.forEach((id) => assignedIds.add(id.toString()));
    });

    const allEmployees = await User.find({ role: "employee" }).select("_id");
    let availableEmployees = 0;
    allEmployees.forEach((emp) => {
      if (!assignedIds.has(emp._id.toString())) {
        availableEmployees++;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        totalManagers,
        totalProjects,
        activeProjects,
        completedProjects,
        availableEmployees,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users with role 'employee' or 'project_manager'
 * @route   GET /api/employees
 * @access  Private (Admin and PM)
 */
export const getEmployees = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role } = req.query;
    const filter: any = {};
    
    if (role && (role === "employee" || role === "project_manager")) {
      filter.role = role;
    } else {
      filter.role = { $in: ["employee", "project_manager"] };
    }

    const employees = await User.find(filter).sort("-createdAt");
    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new employee / PM
 * @route   POST /api/employees
 * @access  Private (Admin only)
 */
export const addEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role, phone, department, experience, skills } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: "User already exists with this email" });
      return;
    }

    const employee = await User.create({
      name,
      email,
      password: password || "password123", // default password
      role: role || "employee",
      phone,
      department,
      experience: Number(experience) || 0,
      skills: Array.isArray(skills) ? skills : skills ? skills.split(",").map((s: string) => s.trim()) : [],
    });

    res.status(201).json({
      success: true,
      message: `${role === "project_manager" ? "Project Manager" : "Employee"} created successfully`,
      employee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee details
 * @route   PUT /api/employees/:id
 * @access  Private (Admin only or User updating their own profile)
 */
export const updateEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, department, experience, skills, role, password } = req.body;

    let user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Authorization: Admin can update any employee. Others can only update their own profile.
    if (req.user?.role !== "admin" && req.user?._id.toString() !== id) {
      res.status(403).json({ success: false, message: "Not authorized to update this profile" });
      return;
    }

    // Set fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (experience !== undefined) user.experience = Number(experience);
    if (skills) {
      user.skills = Array.isArray(skills) ? skills : skills.split(",").map((s: string) => s.trim());
    }
    if (role && req.user?.role === "admin") user.role = role;
    if (password) user.password = password;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      employee: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete employee
 * @route   DELETE /api/employees/:id
 * @access  Private (Admin only)
 */
export const deleteEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    await User.findByIdAndDelete(id);

    // Also remove from any assigned projects
    await Project.updateMany(
      { assignedEmployees: id },
      { $pull: { assignedEmployees: id } }
    );
    // Also remove from projectManager assignment if they were a PM
    await Project.updateMany(
      { projectManager: id },
      { $unset: { projectManager: "" } }
    );

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
