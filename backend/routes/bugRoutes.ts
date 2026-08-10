import { Router } from "express";
import {
  createBug,
  getBugsByProject,
  updateBug,
  updateBugStatus,
  deleteBug,
} from "../controllers/bugController";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.post("/", createBug);
router.get("/project/:projectId", getBugsByProject);
router.put("/:id", updateBug);
router.patch("/:id/status", updateBugStatus);
router.delete("/:id", deleteBug);

export default router;
