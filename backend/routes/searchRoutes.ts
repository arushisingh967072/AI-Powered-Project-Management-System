import { Router } from "express";
import { globalSearch } from "../controllers/searchController";
import { authenticate } from "../middlewares/auth";

const router = Router();

// Protect search endpoint so only logged in users can search
router.get("/", authenticate, globalSearch);

export default router;
