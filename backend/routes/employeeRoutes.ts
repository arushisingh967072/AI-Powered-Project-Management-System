import { Router } from "express";
import {
  getAdminStats,
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.get("/admin-stats", authorize("admin"), getAdminStats);
router.get("/", getEmployees);
router.post("/", authorize("admin"), addEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", authorize("admin"), deleteEmployee);

export default router;
