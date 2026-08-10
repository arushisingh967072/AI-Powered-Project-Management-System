import { Router } from "express";
import {
  createTask,
  getTasksByProject,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../controllers/taskController";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.post("/", createTask);
router.get("/project/:projectId", getTasksByProject);
router.put("/:id", updateTask);
router.patch("/:id/status", updateTaskStatus);
router.delete("/:id", deleteTask);

export default router;
