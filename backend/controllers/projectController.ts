import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import Project from "../models/Project";
import User from "../models/User";
import Sprint from "../models/Sprint";
import Task from "../models/Task";
import Bug from "../models/Bug";
import { generateSRS } from "../services/aiService";

/**
 * @desc    Register a new project
 * @route   POST /api/projects
 * @access  Private (Admin only)
 */
export const registerProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, techStack, methodology, priority, projectManager, assignedEmployees } = req.body;

    // Validate Project Manager
    if (projectManager) {
      const pm = await User.findById(projectManager);
      if (!pm || pm.role !== "project_manager") {
        res.status(400).json({ success: false, message: "Invalid Project Manager assignment" });
        return;
      }
    }

    const project = await Project.create({
      name,
      description,
      techStack: Array.isArray(techStack) ? techStack : techStack ? techStack.split(",").map((s: string) => s.trim()) : [],
      methodology,
      priority,
      projectManager,
      assignedEmployees: assignedEmployees || [],
      status: "planning",
    });

    res.status(201).json({
      success: true,
      message: "Project registered successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all projects (filtered by role)
 * @route   GET /api/projects
 * @access  Private
 */
export const getProjects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let projects;

    if (req.user?.role === "admin") {
      projects = await Project.find().populate("projectManager", "name email").populate("assignedEmployees", "name email role");
    } else if (req.user?.role === "project_manager") {
      projects = await Project.find({ projectManager: req.user._id })
        .populate("projectManager", "name email")
        .populate("assignedEmployees", "name email role");
    } else {
      // employee
      projects = await Project.find({ assignedEmployees: req.user?._id })
        .populate("projectManager", "name email")
        .populate("assignedEmployees", "name email role");
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get project details by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
export const getProjectById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("projectManager", "name email phone department")
      .populate("assignedEmployees", "name email role department skills experience phone");

    if (!project) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    // Access check: User must be admin, the assigned PM, or an assigned employee
    const isAdmin = req.user?.role === "admin";
    const isPM = req.user?.role === "project_manager" && project.projectManager && project.projectManager._id.toString() === req.user._id.toString();
    const isEmp = project.assignedEmployees.some((emp) => emp && emp._id && emp._id.toString() === req.user?._id.toString());

    if (!isAdmin && !isPM && !isEmp) {
      res.status(403).json({ success: false, message: "Not authorized to view this project" });
      return;
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private (Admin or assigned PM)
 */
export const updateProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, techStack, methodology, priority, status, projectManager, assignedEmployees, startDate, endDate } = req.body;

    let project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    // Auth check
    const isAdmin = req.user?.role === "admin";
    const isPM = req.user?.role === "project_manager" && project.projectManager?.toString() === req.user._id.toString();

    if (!isAdmin && !isPM) {
      res.status(403).json({ success: false, message: "Not authorized to update this project" });
      return;
    }

    if (name) project.name = name;
    if (description) project.description = description;
    if (techStack) {
      project.techStack = Array.isArray(techStack) ? techStack : techStack.split(",").map((s: string) => s.trim());
    }
    if (methodology) project.methodology = methodology;
    if (priority) project.priority = priority;
    if (status) project.status = status;
    if (startDate) project.startDate = new Date(startDate);
    if (endDate) project.endDate = new Date(endDate);

    if (isAdmin && projectManager) {
      const pm = await User.findById(projectManager);
      if (pm && pm.role === "project_manager") {
        project.projectManager = pm._id as any;
      }
    }

    if (assignedEmployees) {
      project.assignedEmployees = assignedEmployees;
    }

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("projectManager", "name email")
      .populate("assignedEmployees", "name email role");

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate Software Requirements Specification (SRS) using AI
 * @route   POST /api/projects/:id/generate-srs
 * @access  Private (Assigned PM only)
 */
export const generateProjectSRS = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    // PM Auth Check
    if (req.user?.role !== "project_manager" || project.projectManager?.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: "Only the assigned Project Manager can generate SRS using AI" });
      return;
    }

    // Call simulated AI service
    const srsDoc = await generateSRS(
      project.name,
      project.description,
      project.techStack,
      project.methodology
    );

    project.srsDocument = srsDoc;
    await project.save();

    res.status(200).json({
      success: true,
      message: "AI Software Requirements Specification (SRS) document generated successfully",
      srsDocument: srsDoc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate Project Final Report
 * @route   GET /api/projects/:id/report
 * @access  Private (Admin or assigned PM)
 */
export const generateFinalReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("projectManager", "name email")
      .populate("assignedEmployees", "name email role department");

    if (!project) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    // Auth Check
    const isAdmin = req.user?.role === "admin";
    const isPM = req.user?.role === "project_manager" && project.projectManager?._id.toString() === req.user._id.toString();

    if (!isAdmin && !isPM) {
      res.status(403).json({ success: false, message: "Not authorized to generate report" });
      return;
    }

    // Fetch related sprints, tasks, and bugs
    const sprints = await Sprint.find({ project: project._id });
    const tasks = await Task.find({ project: project._id }).populate("assignedEmployee", "name");
    const bugs = await Bug.find({ project: project._id }).populate("assignedEmployee", "name").populate("reportedBy", "name");

    // Metrics calculations
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const pendingTasks = totalTasks - completedTasks;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalBugs = bugs.length;
    const resolvedBugs = bugs.filter((b) => b.status === "done").length;
    const pendingBugs = totalBugs - resolvedBugs;
    const bugResolutionPercentage = totalBugs > 0 ? Math.round((resolvedBugs / totalBugs) * 100) : 0;

    // Team contributions
    const teamPerformance = (project.assignedEmployees as any[]).map((emp) => {
      const empTasks = tasks.filter((t) => t.assignedEmployee?._id.toString() === emp._id.toString());
      const empCompleted = empTasks.filter((t) => t.status === "done").length;
      
      const empBugs = bugs.filter((b) => b.assignedEmployee?._id.toString() === emp._id.toString());
      const empResolved = empBugs.filter((b) => b.status === "done").length;

      return {
        employeeName: emp.name,
        email: emp.email,
        role: emp.role,
        tasksAssigned: empTasks.length,
        tasksCompleted: empCompleted,
        bugsAssigned: empBugs.length,
        bugsResolved: empResolved,
      };
    });

    res.status(200).json({
      success: true,
      report: {
        project: {
          id: project._id,
          name: project.name,
          description: project.description,
          methodology: project.methodology,
          techStack: project.techStack,
          status: project.status,
          priority: project.priority,
          projectManagerName: project.projectManager ? (project.projectManager as any).name : "Unassigned",
          startDate: project.startDate,
          endDate: project.endDate,
        },
        metrics: {
          totalTasks,
          completedTasks,
          pendingTasks,
          completionPercentage,
          totalBugs,
          resolvedBugs,
          pendingBugs,
          bugResolutionPercentage,
        },
        sprints: sprints.map((s) => ({
          name: s.name,
          goal: s.goal,
          status: s.status,
          startDate: s.startDate,
          endDate: s.endDate,
        })),
        teamPerformance,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private (Admin only)
 */
export const deleteProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    if (req.user?.role !== "admin") {
      res.status(403).json({ success: false, message: "Only administrators can delete projects" });
      return;
    }

    await Project.findByIdAndDelete(req.params.id);
    
    // Cleanup related sprint, task, bug and discussion items
    await Sprint.deleteMany({ project: req.params.id });
    await Task.deleteMany({ project: req.params.id });
    await Bug.deleteMany({ project: req.params.id });

    res.status(200).json({
      success: true,
      message: "Project and all associated resources deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
