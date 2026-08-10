import { Router } from "express";
import {
  signup,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
} from "../controllers/authController";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword/:resettoken", resetPassword);
router.get("/me", authenticate, getMe);
router.get("/logout", authenticate, logout);

export default router;
