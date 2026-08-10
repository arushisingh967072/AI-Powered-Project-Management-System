import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import Task from "../models/Task";
import Project from "../models/Project";
import Sprint from "../models/Sprint";
import { generateTaskDescription } from "../services/aiService";

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private (PM only)
 */
export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { project, sprint, name, description, techStack, priority, assignedEmployee, deadline, generateWithAI } = req.body;

    const proj = await Project.findById(project);
    if (!proj) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    // PM Auth Check
    if (req.user?.role !== "project_manager" || proj.projectManager.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: "Only the assigned Project Manager can create tasks" });
      return;
    }

    // Optional AI description generation
    let finalDescription = description;
    if (generateWithAI) {
      finalDescription = await generateTaskDescription(name, proj.techStack);
    }

    const task = await Task.create({
      project,
      sprint: sprint || undefined,
      name,
      description: finalDescription,
      techStack: Array.isArray(techStack) ? techStack : techStack ? techStack.split(",").map((s: string) => s.trim()) : [],
      priority: priority || "medium",
      assignedEmployee: assignedEmployee || undefined,
      deadline: new Date(deadline),
      status: "todo",
      statusHistory: [
        {
          status: "todo",
          updatedAt: new Date(),
          updatedBy: req.user._id as any,
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tasks for a project
 * @route   GET /api/tasks/project/:projectId
 * @access  Private
 */
export const getTasksByProject = async (
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

    const tasks = await Task.find(query)
      .populate("assignedEmployee", "name email role department")
      .populate("sprint", "name")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task details
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, techStack, priority, assignedEmployee, deadline, sprint } = req.body;
    let task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }

    const proj = await Project.findById(task.project);
    if (!proj) {
      res.status(404).json({ success: false, message: "Associated project not found" });
      return;
    }

    // PM or Admin Auth Check
    const isAdmin = req.user?.role === "admin";
    const isPM = req.user?.role === "project_manager" && proj.projectManager.toString() === req.user._id.toString();

    if (!isAdmin && !isPM) {
      res.status(403).json({ success: false, message: "Not authorized to update task details" });
      return;
    }

    if (name) task.name = name;
    if (description) task.description = description;
    if (techStack) {
      task.techStack = Array.isArray(techStack) ? techStack : techStack.split(",").map((s: string) => s.trim());
    }
    if (priority) task.priority = priority;
    if (assignedEmployee !== undefined) task.assignedEmployee = assignedEmployee || undefined;
    if (deadline) task.deadline = new Date(deadline);
    if (sprint !== undefined) task.sprint = sprint || undefined;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignedEmployee", "name email role")
      .populate("sprint", "name");

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task status
 * @route   PATCH /api/tasks/:id/status
 * @access  Private
 */
export const updateTaskStatus = async (
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

    let task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }

    const proj = await Project.findById(task.project);
    if (!proj) {
      res.status(404).json({ success: false, message: "Associated project not found" });
      return;
    }

    // Access Check: Admin, PM, or the assigned Developer can change status
    const isAdmin = req.user?.role === "admin";
    const isPM = req.user?.role === "project_manager" && proj.projectManager.toString() === req.user._id.toString();
    const isAssignedDev = task.assignedEmployee?.toString() === req.user?._id.toString();

    if (!isAdmin && !isPM && !isAssignedDev) {
      res.status(403).json({ success: false, message: "Not authorized to change this task's status" });
      return;
    }

    task.status = status;
    task.statusHistory.push({
      status,
      updatedAt: new Date(),
      updatedBy: req.user?._id as any,
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignedEmployee", "name email role")
      .populate("sprint", "name");

    res.status(200).json({
      success: true,
      message: `Task status updated to ${status}`,
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private (PM only)
 */
export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }

    const proj = await Project.findById(task.project);
    if (!proj) {
      res.status(404).json({ success: false, message: "Associated project not found" });
      return;
    }

    // PM Auth Check
    if (req.user?.role !== "project_manager" || proj.projectManager.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: "Only the assigned Project Manager can delete tasks" });
      return;
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
