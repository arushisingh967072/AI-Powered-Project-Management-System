import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import Bug from "../models/Bug";
import Project from "../models/Project";

/**
 * @desc    Create a new bug report
 * @route   POST /api/bugs
 * @access  Private
 */
export const createBug = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { project, sprint, name, description, severity, priority, assignedEmployee, deadline } = req.body;

    const proj = await Project.findById(project);
    if (!proj) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    // Access Check: user must be assigned to this project
    const isAdmin = req.user?.role === "admin";
    const isPM = req.user?.role === "project_manager" && proj.projectManager.toString() === req.user._id.toString();
    const isAssignedEmp = proj.assignedEmployees.some((empId) => empId.toString() === req.user?._id.toString());

    if (!isAdmin && !isPM && !isAssignedEmp) {
      res.status(403).json({ success: false, message: "Not authorized to report bugs for this project" });
      return;
    }

    const bug = await Bug.create({
      project,
      sprint: sprint || undefined,
      name,
      description,
      severity: severity || "medium",
      priority: priority || "medium",
      assignedEmployee: assignedEmployee || undefined,
      deadline: new Date(deadline),
      status: "todo",
      reportedBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: "Bug logged successfully",
      bug,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bugs for a project
 * @route   GET /api/bugs/project/:projectId
 * @access  Private
 */
export const getBugsByProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { sprintId, assignedToMe } = req.query;

    const proj = await Project.findById(projectId);
    if (!proj) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    const query: any = { project: projectId };

    if (sprintId) {
      query.sprint = sprintId;
    }

    if (assignedToMe === "true" && req.user) {
      query.assignedEmployee = req.user._id;
    }

    const bugs = await Bug.find(query)
      .populate("assignedEmployee", "name email role")
      .populate("reportedBy", "name email role")
      .populate("sprint", "name")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: bugs.length,
      bugs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update bug details
 * @route   PUT /api/bugs/:id
 * @access  Private
 */
export const updateBug = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, severity, priority, assignedEmployee, deadline, sprint } = req.body;
    let bug = await Bug.findById(req.params.id);

    if (!bug) {
      res.status(404).json({ success: false, message: "Bug not found" });
      return;
    }

    const proj = await Project.findById(bug.project);
    if (!proj) {
      res.status(404).json({ success: false, message: "Associated project not found" });
      return;
    }

    // PM or Admin or Reporter Auth Check
    const isAdmin = req.user?.role === "admin";
    const isPM = req.user?.role === "project_manager" && proj.projectManager.toString() === req.user._id.toString();
    const isReporter = bug.reportedBy.toString() === req.user?._id.toString();

    if (!isAdmin && !isPM && !isReporter) {
      res.status(403).json({ success: false, message: "Not authorized to update bug details" });
      return;
    }

    if (name) bug.name = name;
    if (description) bug.description = description;
    if (severity) bug.severity = severity;
    if (priority) bug.priority = priority;
    if (assignedEmployee !== undefined) bug.assignedEmployee = assignedEmployee || undefined;
    if (deadline) bug.deadline = new Date(deadline);
    if (sprint !== undefined) bug.sprint = sprint || undefined;

    await bug.save();

    const updatedBug = await Bug.findById(bug._id)
      .populate("assignedEmployee", "name email role")
      .populate("reportedBy", "name email role")
      .populate("sprint", "name");

    res.status(200).json({
      success: true,
      message: "Bug details updated successfully",
      bug: updatedBug,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update bug status
 * @route   PATCH /api/bugs/:id/status
 * @access  Private
 */
export const updateBugStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;

    if (!["todo", "in_progress", "testing", "done"].includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status value" });
      return;
    }

    let bug = await Bug.findById(req.params.id);
    if (!bug) {
      res.status(404).json({ success: false, message: "Bug not found" });
      return;
    }

    const proj = await Project.findById(bug.project);
    if (!proj) {
      res.status(404).json({ success: false, message: "Associated project not found" });
      return;
    }

    // Access Check: Admin, PM, the assigned employee, or the reported user can update status
    const isAdmin = req.user?.role === "admin";
    const isPM = req.user?.role === "project_manager" && proj.projectManager.toString() === req.user._id.toString();
    const isAssigned = bug.assignedEmployee?.toString() === req.user?._id.toString();
    const isReporter = bug.reportedBy.toString() === req.user?._id.toString();

    if (!isAdmin && !isPM && !isAssigned && !isReporter) {
      res.status(403).json({ success: false, message: "Not authorized to update this bug status" });
      return;
    }

    bug.status = status;
    await bug.save();

    const updatedBug = await Bug.findById(bug._id)
      .populate("assignedEmployee", "name email role")
      .populate("reportedBy", "name email role")
      .populate("sprint", "name");

    res.status(200).json({
      success: true,
      message: `Bug status updated to ${status}`,
      bug: updatedBug,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete bug
 * @route   DELETE /api/bugs/:id
 * @access  Private (PM only)
 */
export const deleteBug = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      res.status(404).json({ success: false, message: "Bug not found" });
      return;
    }

    const proj = await Project.findById(bug.project);
    if (!proj) {
      res.status(404).json({ success: false, message: "Associated project not found" });
      return;
    }

    // PM Auth Check
    if (req.user?.role !== "project_manager" || proj.projectManager.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: "Only the assigned Project Manager can delete bugs" });
      return;
    }

    await Bug.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Bug deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
