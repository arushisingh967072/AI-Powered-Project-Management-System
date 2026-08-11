import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  role: z.enum(["admin", "project_manager", "employee"]),

  phone: z.string().optional(),

  department: z.string().optional(),

  experience: z
    .number()
    .min(0, "Experience cannot be negative"),

  skills: z.string().optional(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),

    defaultValues: {
      role: "employee",
      experience: 0,
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: SignupFormValues) => {
    try {
      await signup({
        ...data,
        skills: data.skills
          ? data.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
          : [],
      });

      toast.success("OTP sent to your email!");

      // Go to OTP verification page
      navigate("/verify-otp", {
        state: {
          email: data.email,
        },
      });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#070b15] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-[#3b82f6]/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg glass-card rounded-2xl p-8 z-10 animate-fade-in my-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600/20 items-center justify-center text-2xl mb-3">
            🚀
          </div>

          <h2 className="text-2xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Create Account
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Get started with our MERN project workflow
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Full Name
              </label>

              <input
                type="text"
                placeholder="John Doe"
                {...register("name")}
                className={`w-full px-4 py-2.5 bg-[#0d1425] border rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                  errors.name
                    ? "border-red-500"
                    : "border-[#1e2e4f]/30"
                }`}
              />

              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Email Address
              </label>

              <input
                type="email"
                placeholder="name@company.com"
                {...register("email")}
                className={`w-full px-4 py-2.5 bg-[#0d1425] border rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
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
          </div>

          {/* Password + Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full px-4 py-2.5 bg-[#0d1425] border rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                    errors.password
                      ? "border-red-500"
                      : "border-[#1e2e4f]/30"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs cursor-pointer"
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

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Select System Role
              </label>

              <select
                {...register("role")}
                className="w-full px-4 py-2.5 bg-[#0d1425] border border-[#1e2e4f]/30 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
              >
                <option value="employee">
                  Employee / Developer
                </option>

                <option value="project_manager">
                  Project Manager (PM)
                </option>

                <option value="admin">
                  System Administrator
                </option>
              </select>
            </div>
          </div>

          {/* PM / Employee Fields */}
          {selectedRole !== "admin" && (
            <div className="space-y-4 pt-2 border-t border-gray-800/40">
              {/* Phone + Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    placeholder="+1 (555) 019-2834"
                    {...register("phone")}
                    className="w-full px-4 py-2.5 bg-[#0d1425] border border-[#1e2e4f]/30 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Department
                  </label>

                  <input
                    type="text"
                    placeholder="Engineering / QA"
                    {...register("department")}
                    className="w-full px-4 py-2.5 bg-[#0d1425] border border-[#1e2e4f]/30 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Experience + Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Experience */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Years of Experience
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="3"
                    {...register("experience", {
                      valueAsNumber: true,
                    })}
                    className={`w-full px-4 py-2.5 bg-[#0d1425] border rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                      errors.experience
                        ? "border-red-500"
                        : "border-[#1e2e4f]/30"
                    }`}
                  />

                  {errors.experience && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.experience.message}
                    </p>
                  )}
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Skills (comma-separated)
                  </label>

                  <input
                    type="text"
                    placeholder="React, TypeScript, Node.js"
                    {...register("skills")}
                    className="w-full px-4 py-2.5 bg-[#0d1425] border border-[#1e2e4f]/30 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 mt-6 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:-translate-y-px flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Login */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-300 font-semibold transition-all"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;