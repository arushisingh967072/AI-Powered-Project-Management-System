import { Router } from "express";

import {
  signup,
  verifyOTP,
  resendOTP,
  login,
  googleAuth,
  forgotPassword,
  verifyResetOTP,
  resendResetOTP,
  resetPassword,
  getMe,
  logout,
} from "../controllers/authController";

import { authenticate } from "../middlewares/auth";

const router = Router();

// Signup & Email Verification
router.post("/signup", signup);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

// Login
router.post("/login", login);

// Google Authentication
router.post("/google", googleAuth);

// Forgot Password
router.post("/forgotpassword", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/resend-reset-otp", resendResetOTP);
router.post("/resetpassword", resetPassword);

// Current User
router.get("/me", authenticate, getMe);

// Logout
router.get("/logout", authenticate, logout);

export default router;