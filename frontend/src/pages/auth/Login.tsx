import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

// Schema definition
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [googleModal, setGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      // Redirect to correct dashboard based on role
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser.role === "admin") navigate("/admin");
      else if (storedUser.role === "project_manager") navigate("/pm");
      else navigate("/employee");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    }
  };

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail || !googleName) {
      toast.error("Please enter email and name");
      return;
    }
    try {
      const mockGoogleId = "google_" + Math.random().toString(36).substring(2, 11);
      const mockProfilePicture = `https://api.dicebear.com/7.x/initials/svg?seed=${googleName}`;
      await googleLogin(googleEmail, googleName, mockGoogleId, mockProfilePicture);
      toast.success("Google Sign-In Successful!");
      setGoogleModal(false);
      
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser.role === "admin") navigate("/admin");
      else if (storedUser.role === "project_manager") navigate("/pm");
      else navigate("/employee");
    } catch (error: any) {
      toast.error(error.message || "Google auth failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#070b15] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card rounded-2xl p-8 z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600/20 items-center justify-center text-2xl mb-3">
            ⚡
          </div>
          <h2 className="text-2xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage your AI projects</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                errors.email ? "border-red-500" : "border-[#1e2e4f]/30"
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
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
                  errors.password ? "border-red-500" : "border-[#1e2e4f]/30"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer text-xs"
              >
                {showPassword ? "👁️ Hide" : "👁️ Show"}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
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
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="w-1/5 border-b border-gray-800"></span>
          <span className="text-xs text-gray-500 uppercase tracking-wider">or sign in with</span>
          <span className="w-1/5 border-b border-gray-800"></span>
        </div>

        {/* Google Signup Option */}
        <button
          onClick={() => setGoogleModal(true)}
          className="w-full mt-4 py-3 bg-[#0d1425] hover:bg-[#131d35] text-gray-300 border border-[#1e2e4f]/30 font-medium rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer"
        >
          <span>🌐</span> Google Account
        </button>

        <p className="text-center text-sm text-gray-500 mt-8">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-all">
            Sign Up
          </Link>
        </p>
      </div>

      {/* Simulated Google Sign-In Dialog Modal */}
      {googleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm glass-card rounded-2xl p-6 relative border border-[#1e2e4f]/50">
            <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
              <span>🌐</span> Google Authentication
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Enter your Google account profile information to simulate standard Google Sign-In.
            </p>
            <form onSubmit={handleGoogleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="jane.doe@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setGoogleModal(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-xs hover:bg-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-500 cursor-pointer font-semibold"
                >
                  Authorize Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
