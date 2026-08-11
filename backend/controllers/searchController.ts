import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import Project from "../models/Project";
import User from "../models/User";
import Task from "../models/Task";
import Bug from "../models/Bug";

/**
 * @desc    Global search across projects, employees, tasks, and bugs
 * @route   GET /api/search
 * @access  Private
 */
export const globalSearch = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query.q ? String(req.query.q).trim() : "";
    if (!query) {
      res.status(200).json({
        success: true,
        projects: [],
        employees: [],
        tasks: [],
        bugs: [],
      });
      return;
    }

    const regex = new RegExp(query, "i");
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    // Determine project filter based on role
    let projectFilter: any = {
      $or: [
        { name: regex },
        { description: regex },
        { techStack: regex },
      ],
    };

    if (userRole === "project_manager") {
      projectFilter.projectManager = userId;
    } else if (userRole === "employee") {
      projectFilter.assignedEmployees = userId;
    }

    // Search Projects
    const projects = await Project.find(projectFilter)
      .limit(10)
      .populate("projectManager", "name email");

    // Gather accessible project IDs to scope task and bug search
    let accessibleProjectIds: any[] = [];
    if (userRole !== "admin") {
      const userProjects = await Project.find(
        userRole === "project_manager"
          ? { projectManager: userId }
          : { assignedEmployees: userId }
      ).select("_id");
      accessibleProjectIds = userProjects.map((p) => p._id);
    }

    // Search Employees (Users)
    let userFilter: any = {
      $and: [
        { role: { $ne: "admin" } },
        {
          $or: [
            { name: regex },
            { email: regex },
            { department: regex },
            { skills: regex },
          ],
        },
      ],
    };

    // If admin is searching, allow finding admin users as well
    if (userRole === "admin") {
      userFilter = {
        $or: [
          { name: regex },
          { email: regex },
          { role: regex },
          { department: regex },
        ],
      };
    }

    const employees = await User.find(userFilter)
      .select("name email role department skills profilePicture")
      .limit(10);

    // Search Tasks scoped by user role
    let taskFilter: any = {
      $or: [
        { name: regex },
        { description: regex },
        { techStack: regex },
      ],
    };

    if (userRole !== "admin") {
      taskFilter.project = { $in: accessibleProjectIds };
    }

    const tasks = await Task.find(taskFilter)
      .populate("project", "name")
      .populate("assignedEmployee", "name email profilePicture")
      .limit(10);

    // Search Bugs scoped by user role
    let bugFilter: any = {
      $or: [
        { name: regex },
        { description: regex },
      ],
    };

    if (userRole !== "admin") {
      bugFilter.project = { $in: accessibleProjectIds };
    }

    const bugs = await Bug.find(bugFilter)
      .populate("project", "name")
      .populate("assignedEmployee", "name email profilePicture")
      .limit(10);

    res.status(200).json({
      success: true,
      projects,
      employees,
      tasks,
      bugs,
    });
  } catch (error) {
    next(error);
  }
};
