import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;

  role: "admin" | "project_manager" | "employee";

  phone?: string;
  department?: string;
  experience?: number;
  skills: string[];
  profilePicture?: string;

  // Firebase Google Authentication
  googleId?: string;

  // Email verification
  isVerified: boolean;
  emailVerificationOTP?: string;
  emailVerificationOTPExpire?: Date;

  // Forgot password OTP
  resetPasswordOTP?: string;
  resetPasswordOTPExpire?: Date;
  resetPasswordVerified?: boolean;

  shouldChangePassword?: boolean;

  // Password comparison
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Password
    password: {
      type: String,
      select: false,
    },

    // User Role
    role: {
      type: String,
      enum: ["admin", "project_manager", "employee"],
      default: "employee",
    },

    // Employee Information
    phone: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    experience: {
      type: Number,
      default: 0,
    },

    skills: {
      type: [String],
      default: [],
    },

    profilePicture: {
      type: String,
      default: "",
    },

    // Firebase Google User ID
    googleId: {
      type: String,
      sparse: true,
    },

    // Email Verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationOTP: {
      type: String,
      select: false,
    },

    emailVerificationOTPExpire: {
      type: Date,
      select: false,
    },

    // Forgot Password OTP
    resetPasswordOTP: {
      type: String,
      select: false,
    },

    resetPasswordOTPExpire: {
      type: Date,
      select: false,
    },

    resetPasswordVerified: {
      type: Boolean,
      default: false,
    },

    shouldChangePassword: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Hash password before saving
 */
UserSchema.pre<IUser>("save", async function (next) {
  // Don't hash if password has not changed
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(
      this.password!,
      salt
    );

    next();
  } catch (error: any) {
    next(error);
  }
});

/*
 * Compare entered password with hashed password
 */
UserSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(
    password,
    this.password
  );
};

export default mongoose.model<IUser>(
  "User",
  UserSchema
);