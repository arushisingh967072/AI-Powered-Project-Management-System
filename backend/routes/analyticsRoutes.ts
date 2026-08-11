import { Router } from "express";
import { getRoleAnalytics } from "../controllers/analyticsController";
import { authenticate } from "../middlewares/auth";

const router = Router();

// Protect analytics endpoint so only logged in users can query it
router.get("/", authenticate, getRoleAnalytics);

export default router;
