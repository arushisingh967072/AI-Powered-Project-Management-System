import { Router } from "express";
import {
  registerProject,
  getProjects,
  getProjectById,
  updateProject,
  generateProjectSRS,
  generateFinalReport,
  deleteProject,
} from "../controllers/projectController";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.post("/", authorize("admin"), registerProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.post("/:id/generate-srs", generateProjectSRS);
router.get("/:id/report", generateFinalReport);
router.delete("/:id", authorize("admin"), deleteProject);

export default router;
