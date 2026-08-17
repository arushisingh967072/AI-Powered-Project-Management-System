import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { AuthRequest } from "../middlewares/auth";
import { sendOTPEmail } from "../config/brevo";
import { firebaseAuth } from "../config/firebaseAdmin";

/*
|--------------------------------------------------------------------------
| Generate JWT + Send Response
|--------------------------------------------------------------------------
*/

const sendTokenResponse = (
  user: IUser,
  statusCode: number,
  res: Response
): void => {
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "30d",
    }
  );

  const cookieOptions = {
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

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
    shouldChangePassword: user.shouldChangePassword,
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

/*
 Signup
 POST /api/auth/signup
*/

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      department,
      experience,
      skills,
    } = req.body;

    // Check existing user
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
      return;
    }

    // Public signup is only allowed for System Administrators (admin role)
    const finalRole = "admin";

    // Generate signup OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
      phone,
      department,
      experience,

      skills: Array.isArray(skills)
        ? skills
        : skills
          ? skills
              .split(",")
              .map((skill: string) => skill.trim())
          : [],

      isVerified: false,
      emailVerificationOTP: otp,
      emailVerificationOTPExpire: new Date(
        Date.now() + 10 * 60 * 1000
      ),
    });

    // Send OTP
    await sendOTPEmail(
      user.email,
      otp,
      "signup"
    );

    // Don't generate JWT before verification
    res.status(201).json({
      success: true,
      message: "Account created. OTP sent to your email.",
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Verify Signup OTP
| POST /api/auth/verify-otp
|--------------------------------------------------------------------------
*/

export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
      return;
    }

    const user = await User.findOne({ email }).select(
      "+emailVerificationOTP +emailVerificationOTPExpire"
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
      return;
    }

    if (
      !user.emailVerificationOTP ||
      !user.emailVerificationOTPExpire
    ) {
      res.status(400).json({
        success: false,
        message:
          "OTP not found. Please request a new OTP",
      });
      return;
    }

    if (
      user.emailVerificationOTPExpire < new Date()
    ) {
      res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP",
      });
      return;
    }

    if (user.emailVerificationOTP !== otp) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
      return;
    }

    // Verify email
    user.isVerified = true;

    // Remove OTP
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpire = undefined;

    await user.save();

    // Generate JWT after successful verification
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Resend Signup OTP
| POST /api/auth/resend-otp
|--------------------------------------------------------------------------
*/

export const resendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    const user = await User.findOne({ email }).select(
      "+emailVerificationOTP +emailVerificationOTPExpire"
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
      return;
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpire = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    await sendOTPEmail(
      user.email,
      otp,
      "signup"
    );

    res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Login
| POST /api/auth/login
|--------------------------------------------------------------------------
*/

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message:
          "Please provide email and password",
      });
      return;
    }

    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const isMatch = await user.comparePassword(
      password
    );

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Normal email/password users must verify email
    if (!user.isVerified) {
      res.status(403).json({
        success: false,
        message:
          "Please verify your email before logging in",
      });
      return;
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/*
| Google Authentication
| POST /api/auth/google
*/

export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({
        success: false,
        message: "Firebase ID token is required",
      });
      return;
    }

    // Verify Firebase ID token
    const decodedToken =
      await firebaseAuth.verifyIdToken(idToken);

    const {
      uid,
      email,
      name,
      picture,
    } = decodedToken;

    if (!email) {
      res.status(400).json({
        success: false,
        message:
          "Google account email is not available",
      });
      return;
    }

    // Find existing account
    let user = await User.findOne({ email });

    if (user) {
      // Connect Firebase account
      if (!user.googleId) {
        user.googleId = uid;
      }

      // Firebase verified Google account
      user.isVerified = true;

      // Add Google profile picture if missing
      if (
        picture &&
        !user.profilePicture
      ) {
        user.profilePicture = picture;
      }

      await user.save();
    } else {
      // Create new Google user
      const usersCount =
        await User.countDocuments({});

      const finalRole =
        usersCount === 0
          ? "admin"
          : "employee";

      user = await User.create({
        name:
          name ||
          email.split("@")[0],

        email,

        googleId: uid,

        role: finalRole,

        profilePicture:
          picture || "",

        skills: [],

        isVerified: true,
      });
    }

    // Generate application JWT
    sendTokenResponse(
      user,
      200,
      res
    );
  } catch (error) {
    console.error(
      "Google authentication error:",
      error
    );

    res.status(401).json({
      success: false,
      message:
        "Invalid or expired Firebase authentication token",
    });
  }
};

/*
| Forgot Password
| POST /api/auth/forgotpassword
*/

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message:
          "No user found with that email",
      });
      return;
    }

    // Generate reset OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.resetPasswordOTP = otp;

    user.resetPasswordOTPExpire =
      new Date(
        Date.now() + 10 * 60 * 1000
      );

    // New reset request requires fresh verification
    user.resetPasswordVerified = false;

    await user.save();

    // Send reset OTP
    await sendOTPEmail(
      user.email,
      otp,
      "reset"
    );

    res.status(200).json({
      success: true,
      message:
        "Password reset OTP has been sent to your email",
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Verify Reset Password OTP
| POST /api/auth/verify-reset-otp
|--------------------------------------------------------------------------
*/

export const verifyResetOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({
        success: false,
        message:
          "Email and OTP are required",
      });
      return;
    }

    const user = await User.findOne({
      email,
    }).select(
      "+resetPasswordOTP +resetPasswordOTPExpire"
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (
      !user.resetPasswordOTP ||
      !user.resetPasswordOTPExpire
    ) {
      res.status(400).json({
        success: false,
        message:
          "Reset OTP not found. Please request a new OTP",
      });
      return;
    }

    if (
      user.resetPasswordOTPExpire < new Date()
    ) {
      res.status(400).json({
        success: false,
        message:
          "Reset OTP has expired. Please request a new OTP",
      });
      return;
    }

    if (
      user.resetPasswordOTP !== otp
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
      return;
    }

    // Mark OTP as verified
    user.resetPasswordVerified = true;

    // Remove OTP
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "OTP verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Resend Reset Password OTP
| POST /api/auth/resend-reset-otp
|--------------------------------------------------------------------------
*/

export const resendResetOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message:
          "No user found with that email",
      });
      return;
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.resetPasswordOTP = otp;

    user.resetPasswordOTPExpire =
      new Date(
        Date.now() + 10 * 60 * 1000
      );

    user.resetPasswordVerified = false;

    await user.save();

    await sendOTPEmail(
      user.email,
      otp,
      "reset"
    );

    res.status(200).json({
      success: true,
      message:
        "A new password reset OTP has been sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Reset Password
| POST /api/auth/resetpassword
|--------------------------------------------------------------------------
*/

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } =
      req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message:
          "Email and new password are required",
      });
      return;
    }

    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (!user.resetPasswordVerified) {
      res.status(403).json({
        success: false,
        message:
          "Please verify the reset OTP first",
      });
      return;
    }

    // Set new password
    user.password = password;

    // Reset verification status
    user.resetPasswordVerified = false;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login.",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Current User
| GET /api/auth/me
|--------------------------------------------------------------------------
*/

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Logout
| GET /api/auth/logout
|--------------------------------------------------------------------------
*/

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.cookie("token", "none", {
      expires: new Date(
        Date.now() + 10 * 1000
      ),
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