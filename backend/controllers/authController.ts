import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { AuthRequest } from "../middlewares/auth";

// Helper to generate JWT token and send in cookie + json
const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  // Format the user response without password
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    department: user.department,
    experience: user.experience,
    skills: user.skills,
    profilePicture: user.profilePicture,
  };

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      token,
      user: userResponse,
    });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role, phone, department, experience, skills } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: "User already exists with this email" });
      return;
    }

    // Default first user to admin if no users exist, or respect requested role
    const usersCount = await User.countDocuments({});
    const finalRole = usersCount === 0 ? "admin" : role || "employee";

    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
      phone,
      department,
      experience,
      skills: Array.isArray(skills) ? skills : skills ? skills.split(",").map((s: string) => s.trim()) : [],
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Please provide email and password" });
      return;
    }

    // Find user in DB (must select password explicitly since it has select: false)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Google Authentication (Signup or Login)
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, name, googleId, profilePicture } = req.body;

    if (!email || !googleId) {
      res.status(400).json({ success: false, message: "Google account details are incomplete" });
      return;
    }

    let user = await User.findOne({ email });

    if (user) {
      // User exists, associate Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        if (profilePicture && !user.profilePicture) {
          user.profilePicture = profilePicture;
        }
        await user.save();
      }
    } else {
      // Create new user (Role defaults to employee)
      const usersCount = await User.countDocuments({});
      const finalRole = usersCount === 0 ? "admin" : "employee";

      user = await User.create({
        name: name || email.split("@")[0],
        email,
        googleId,
        role: finalRole,
        profilePicture: profilePicture || "",
        skills: [],
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot Password
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ success: false, message: "No user found with that email" });
      return;
    }

    // Generate reset token (simple hex string)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Save to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Log the token link in the server console for easy copying during developer testing
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    console.log(`\n🔑 PASSWORD RESET REQUESTED`);
    console.log(`User: ${user.email}`);
    console.log(`Reset Link: ${resetUrl}`);
    console.log(`=========================================\n`);

    res.status(200).json({
      success: true,
      message: "Password reset link generated. Check the server console logs.",
      // Return URL in response for testing convenience, since there is no SMTP configured
      resetUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset Password
 * @route   POST /api/auth/resetpassword/:resettoken
 * @access  Public
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resettoken } = req.params;
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ success: false, message: "Please provide a new password" });
      return;
    }

    // Find user with token and checking token expiry
    const user = await User.findOne({
      resetPasswordToken: resettoken,
      resetPasswordExpire: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      res.status(400).json({ success: false, message: "Invalid or expired password reset token" });
      return;
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // req.user is populated by authenticate middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log user out / clear cookie
 * @route   GET /api/auth/logout
 * @access  Private
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
