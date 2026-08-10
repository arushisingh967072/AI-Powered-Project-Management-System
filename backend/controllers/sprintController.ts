import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import Sprint from "../models/Sprint";
import Project from "../models/Project";

/**
 * @desc    Create a new sprint for a project
 * @route   POST /api/sprints
 * @access  Private (PM of the project only)
 */
export const createSprint = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { project, name, goal, startDate, endDate, assignedEmployees } = req.body;

    const proj = await Project.findById(project);
    if (!proj) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    // Auth Check: must be project manager of this project
    if (req.user?.role !== "project_manager" || proj.projectManager.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: "Only the assigned Project Manager can create sprints" });
      return;
    }

    const sprint = await Sprint.create({
      project,
      name,
      goal,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      assignedEmployees: assignedEmployees || [],
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "Sprint created successfully",
      sprint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get sprints for a specific project
 * @route   GET /api/sprints/project/:projectId
 * @access  Private
 */
export const getSprintsByProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;

    const proj = await Project.findById(projectId);
    if (!proj) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    // Access check: User must be admin, project manager, or assigned employee
    const isAdmin = req.user?.role === "admin";
    const isPM = req.user?.role === "project_manager" && proj.projectManager.toString() === req.user._id.toString();
    const isEmp = proj.assignedEmployees.some((empId) => empId.toString() === req.user?._id.toString());

    if (!isAdmin && !isPM && !isEmp) {
      res.status(403).json({ success: false, message: "Not authorized to access sprints for this project" });
      return;
    }

    const sprints = await Sprint.find({ project: projectId }).populate("assignedEmployees", "name email role department").sort("startDate");

    res.status(200).json({
      success: true,
      count: sprints.length,
      sprints,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update sprint details
 * @route   PUT /api/sprints/:id
 * @access  Private (PM only)
 */
export const updateSprint = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, goal, startDate, endDate, status, assignedEmployees } = req.body;
    let sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      res.status(404).json({ success: false, message: "Sprint not found" });
      return;
    }

    const proj = await Project.findById(sprint.project);
    if (!proj) {
      res.status(404).json({ success: false, message: "Associated project not found" });
      return;
    }

    // PM Auth Check
    if (req.user?.role !== "project_manager" || proj.projectManager.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: "Only the assigned Project Manager can update sprints" });
      return;
    }

    if (name) sprint.name = name;
    if (goal) sprint.goal = goal;
    if (startDate) sprint.startDate = new Date(startDate);
    if (endDate) sprint.endDate = new Date(endDate);
    if (status) sprint.status = status;
    if (assignedEmployees) sprint.assignedEmployees = assignedEmployees;

    await sprint.save();

    const updatedSprint = await Sprint.findById(sprint._id).populate("assignedEmployees", "name email role department");

    res.status(200).json({
      success: true,
      message: "Sprint updated successfully",
      sprint: updatedSprint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete sprint
 * @route   DELETE /api/sprints/:id
 * @access  Private (PM only)
 */
export const deleteSprint = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      res.status(404).json({ success: false, message: "Sprint not found" });
      return;
    }

    const proj = await Project.findById(sprint.project);
    if (!proj) {
      res.status(404).json({ success: false, message: "Associated project not found" });
      return;
    }

    // PM Auth Check
    if (req.user?.role !== "project_manager" || proj.projectManager.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: "Only the assigned Project Manager can delete sprints" });
      return;
    }

    await Sprint.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Sprint deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
