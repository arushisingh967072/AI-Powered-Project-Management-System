import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import Project from "../models/Project";
import User from "../models/User";
import Task from "../models/Task";
import Bug from "../models/Bug";

/**
 * @desc    Get role-based analytics data matching the dashboard logic exactly
 * @route   GET /api/analytics
 * @access  Private
 */
export const getRoleAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    if (userRole === "admin") {
      // Get Admin Stats matching getAdminStats in employeeController.ts
      const totalEmployees = await User.countDocuments({ role: "employee" });
      const totalManagers = await User.countDocuments({ role: "project_manager" });
      const totalProjects = await Project.countDocuments({});
      const activeProjectsCount = await Project.countDocuments({ status: { $in: ["planning", "active"] } });
      const activeProjects = await Project.countDocuments({ status: "active" });
      const completedProjects = await Project.countDocuments({ status: "completed" });
      const planningProjects = await Project.countDocuments({ status: "planning" });

      // Available Employees Calculation (exactly matching dashboard)
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

      // Department distribution of employees
      const employees = await User.find({ role: "employee" });
      const deptMap: Record<string, number> = {};
      employees.forEach((u) => {
        const dept = u.department || "Unassigned";
        deptMap[dept] = (deptMap[dept] || 0) + 1;
      });

      const departmentStats = Object.keys(deptMap).map((name) => ({
        name,
        value: deptMap[name],
      }));

      // Task status breakdown
      const taskStats = { todo: 0, in_progress: 0, testing: 0, done: 0 };
      const tasksList = await Task.find().select("status");
      tasksList.forEach((t) => {
        if (t.status in taskStats) {
          taskStats[t.status as keyof typeof taskStats]++;
        }
      });

      res.status(200).json({
        success: true,
        role: "admin",
        data: {
          projectStats: [
            { name: "Planning", value: planningProjects },
            { name: "Active", value: activeProjects },
            { name: "Completed", value: completedProjects },
          ],
          roleStats: [
            { name: "Project Managers", value: totalManagers },
            { name: "Employees", value: totalEmployees },
          ],
          departmentStats,
          taskStats: [
            { name: "To Do", value: taskStats.todo },
            { name: "In Progress", value: taskStats.in_progress },
            { name: "Testing", value: taskStats.testing },
            { name: "Done", value: taskStats.done },
          ],
          summary: {
            totalEmployees,
            totalManagers,
            totalProjects,
            activeProjects: activeProjectsCount,
            completedProjects,
            availableEmployees,
          },
        },
      });
      return;
    } else if (userRole === "project_manager") {
      // Find PM's managed projects (matching dashboard)
      const pmProjects = await Project.find({ projectManager: userId });
      const pmProjectIds = pmProjects.map((p) => p._id);

      // Tasks for managed projects
      const tasks = await Task.find({ project: { $in: pmProjectIds } });
      const taskStats = { todo: 0, in_progress: 0, testing: 0, done: 0 };
      const priorityStats = { low: 0, medium: 0, high: 0 };

      tasks.forEach((t) => {
        if (t.status in taskStats) {
          taskStats[t.status as keyof typeof taskStats]++;
        }
        if (t.priority in priorityStats) {
          priorityStats[t.priority as keyof typeof priorityStats]++;
        }
      });

      // Bugs for managed projects
      const bugs = await Bug.find({ project: { $in: pmProjectIds } });
      const bugStats = { todo: 0, in_progress: 0, testing: 0, done: 0 };
      const severityStats = { low: 0, medium: 0, high: 0, critical: 0 };

      bugs.forEach((b) => {
        if (b.status in bugStats) {
          bugStats[b.status as keyof typeof bugStats]++;
        }
        if (b.severity in severityStats) {
          severityStats[b.severity as keyof typeof severityStats]++;
        }
      });

      res.status(200).json({
        success: true,
        role: "project_manager",
        data: {
          projectStats: pmProjects.map((p) => ({
            name: p.name,
            status: p.status,
            priority: p.priority,
          })),
          taskStats: [
            { name: "To Do", value: taskStats.todo },
            { name: "In Progress", value: taskStats.in_progress },
            { name: "Testing", value: taskStats.testing },
            { name: "Done", value: taskStats.done },
          ],
          taskPriorityStats: [
            { name: "Low", value: priorityStats.low },
            { name: "Medium", value: priorityStats.medium },
            { name: "High", value: priorityStats.high },
          ],
          bugStats: [
            { name: "To Do", value: bugStats.todo },
            { name: "In Progress", value: bugStats.in_progress },
            { name: "Testing", value: bugStats.testing },
            { name: "Done", value: bugStats.done },
          ],
          bugSeverityStats: [
            { name: "Low", value: severityStats.low },
            { name: "Medium", value: severityStats.medium },
            { name: "High", value: severityStats.high },
            { name: "Critical", value: severityStats.critical },
          ],
          summary: {
            projectsManaged: pmProjects.length,
            totalTasks: tasks.length,
            totalBugs: bugs.length,
            resolvedBugs: bugStats.done,
            completedTasks: taskStats.done,
          },
        },
      });
      return;
    } else {
      // Employee role analytics matching dashboard fetch logic
      const empProjects = await Project.find({ assignedEmployees: userId });
      const empProjectIds = empProjects.map((p) => p._id);

      // Tasks and bugs filtered by assignedProjects (matching loop logic in dashboard)
      const tasks = await Task.find({ assignedEmployee: userId, project: { $in: empProjectIds } }).populate("project", "name");
      const bugs = await Bug.find({ assignedEmployee: userId, project: { $in: empProjectIds } }).populate("project", "name");

      const taskStats = { todo: 0, in_progress: 0, testing: 0, done: 0 };
      const priorityStats = { low: 0, medium: 0, high: 0 };

      tasks.forEach((t) => {
        if (t.status in taskStats) {
          taskStats[t.status as keyof typeof taskStats]++;
        }
        if (t.priority in priorityStats) {
          priorityStats[t.priority as keyof typeof priorityStats]++;
        }
      });

      const bugStats = { todo: 0, in_progress: 0, testing: 0, done: 0 };
      bugs.forEach((b) => {
        if (b.status in bugStats) {
          bugStats[b.status as keyof typeof bugStats]++;
        }
      });

      // Workload by projects
      const projectWorkloadMap: Record<string, { tasks: number; bugs: number }> = {};
      tasks.forEach((t) => {
        const projName = (t.project as any)?.name || "Unknown Project";
        if (!projectWorkloadMap[projName]) {
          projectWorkloadMap[projName] = { tasks: 0, bugs: 0 };
        }
        projectWorkloadMap[projName].tasks++;
      });
      bugs.forEach((b) => {
        const projName = (b.project as any)?.name || "Unknown Project";
        if (!projectWorkloadMap[projName]) {
          projectWorkloadMap[projName] = { tasks: 0, bugs: 0 };
        }
        projectWorkloadMap[projName].bugs++;
      });

      const projectWorkloadStats = Object.keys(projectWorkloadMap).map((name) => ({
        name,
        Tasks: projectWorkloadMap[name].tasks,
        Bugs: projectWorkloadMap[name].bugs,
      }));

      // Counts matching exactly the calculations on EmployeeDashboard:
      // tasksCount: totalTasks (tasks.length)
      // bugsCount: totalBugs (bugs.length)
      // pendingTasks: t.status !== "done"
      // pendingBugs: b.status !== "done"
      const pendingTasks = tasks.filter((t) => t.status !== "done").length;
      const pendingBugs = bugs.filter((b) => b.status !== "done").length;

      res.status(200).json({
        success: true,
        role: "employee",
        data: {
          taskStats: [
            { name: "To Do", value: taskStats.todo },
            { name: "In Progress", value: taskStats.in_progress },
            { name: "Testing", value: taskStats.testing },
            { name: "Done", value: taskStats.done },
          ],
          taskPriorityStats: [
            { name: "Low", value: priorityStats.low },
            { name: "Medium", value: priorityStats.medium },
            { name: "High", value: priorityStats.high },
          ],
          bugStats: [
            { name: "To Do", value: bugStats.todo },
            { name: "In Progress", value: bugStats.in_progress },
            { name: "Testing", value: bugStats.testing },
            { name: "Done", value: bugStats.done },
          ],
          projectWorkloadStats,
          summary: {
            assignedTasks: tasks.length,
            completedTasks: taskStats.done,
            pendingTasks,
            assignedBugs: bugs.length,
            pendingBugs,
            resolvedBugs: bugStats.done,
          },
        },
      });
      return;
    }
  } catch (error) {
    next(error);
  }
};
