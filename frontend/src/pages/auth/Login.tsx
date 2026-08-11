import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Normal Email/Password Login
  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);

      toast.success("Welcome back!");

      const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      if (storedUser.role === "admin") {
        navigate("/admin");
      } else if (storedUser.role === "project_manager") {
        navigate("/pm");
      } else {
        navigate("/employee");
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    }
  };

  // Firebase Google Login
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);

      await googleLogin();

      toast.success("Google Sign-In Successful!");

      const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      if (storedUser.role === "admin") {
        navigate("/admin");
      } else if (storedUser.role === "project_manager") {
        navigate("/pm");
      } else {
        navigate("/employee");
      }
    } catch (error: any) {
      toast.error(
        error.message || "Google authentication failed"
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b15] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Decorative Background */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md glass-card rounded-2xl p-8 z-10 animate-fade-in">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600/20 items-center justify-center text-2xl mb-3">
            ⚡
          </div>

          <h2 className="text-2xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Sign in to manage your AI projects
          </p>
        </div>

        {/* Email / Password Login */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Email Address
            </label>

            <input
              type="email"
              placeholder="name@company.com"
              {...register("email")}
              className={`w-full px-4 py-3 bg-[#0d1425] border rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.email
                  ? "border-red-500"
                  : "border-[#1e2e4f]/30"
              }`}
            />

            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-all"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className={`w-full px-4 py-3 bg-[#0d1425] border rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.password
                    ? "border-red-500"
                    : "border-[#1e2e4f]/30"
                }`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer text-xs"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting || googleLoading}
            className="w-full py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:-translate-y-px flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6 flex items-center justify-between">
          <span className="w-1/5 border-b border-gray-800" />

          <span className="text-xs text-gray-500 uppercase tracking-wider">
            or sign in with
          </span>

          <span className="w-1/5 border-b border-gray-800" />
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || isSubmitting}
          className="w-full mt-4 py-3 bg-[#0d1425] hover:bg-[#131d35] text-gray-300 border border-[#1e2e4f]/30 font-medium rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
        >
          {googleLoading ? (
            <div className="h-5 w-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>🌐</span>
              Continue with Google
            </>
          )}
        </button>

        {/* Signup */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-400 hover:text-blue-300 font-semibold transition-all"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;