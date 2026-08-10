import { Router } from "express";
import {
  createSprint,
  getSprintsByProject,
  updateSprint,
  deleteSprint,
} from "../controllers/sprintController";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.post("/", createSprint);
router.get("/project/:projectId", getSprintsByProject);
router.put("/:id", updateSprint);
router.delete("/:id", deleteSprint);

export default router;
