import React, { useEffect } from "react";
import {
  useForm,
} from "react-hook-form";
import {
  zodResolver,
} from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useNavigate,
  Link,
} from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";
import { FiKey } from "react-icons/fi";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),

    confirmPassword: z
      .string()
      .min(6, "Confirm password is required"),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

type ResetFormValues = z.infer<typeof resetSchema>;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  /*
   * Check whether user came after
   * successful OTP verification.
   */
  useEffect(() => {
    const email = sessionStorage.getItem("resetEmail");
    const otpVerified =
      sessionStorage.getItem("resetOTPVerified");

    if (!email || otpVerified !== "true") {
      navigate("/forgot-password");
    }
  }, [navigate]);

  const onSubmit = async (
    data: ResetFormValues
  ) => {
    try {
      const email =
        sessionStorage.getItem("resetEmail");

      const otpVerified =
        sessionStorage.getItem("resetOTPVerified");

      if (!email || otpVerified !== "true") {
        toast.error(
          "Please verify the reset OTP first"
        );

        navigate("/forgot-password");
        return;
      }

      const response = await API.post(
        "/auth/resetpassword",
        {
          email,
          password: data.password,
        }
      );

      if (response.data.success) {
        toast.success(
          "Password reset successfully! Redirecting..."
        );

        // Clear reset-password session data
        sessionStorage.removeItem("resetEmail");
        sessionStorage.removeItem(
          "resetOTPVerified"
        );

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to reset password"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#070b15] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Decorative background */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card rounded-2xl p-8 z-10 animate-fade-in">

        {/* Header */}
        <div className="text-center mb-8">

          <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600/20 items-center justify-center text-blue-400 mb-3">
            <FiKey size={24} />
          </div>

          <h2 className="text-2xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Reset Password
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Create a new password for your account
          </p>
        </div>

        {/* Reset Password Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              New Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className={`w-full px-4 py-3 bg-[#0d1425] border rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.password
                  ? "border-red-500"
                  : "border-[#1e2e4f]/30"
              }`}
            />

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              className={`w-full px-4 py-3 bg-[#0d1425] border rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.confirmPassword
                  ? "border-red-500"
                  : "border-[#1e2e4f]/30"
              }`}
            />

            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:-translate-y-px flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        {/* Back to Login */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Back to{" "}
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-300 font-semibold transition-all"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;