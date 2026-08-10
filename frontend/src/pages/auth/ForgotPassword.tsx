import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";
import {
  FiKey,
} from "react-icons/fi";

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

const ForgotPassword: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormValues) => {
    try {
      const response = await API.post("/auth/forgotpassword", { email: data.email });
      if (response.data.success) {
        setSuccess(true);
        if (response.data.resetUrl) {
          setResetLink(response.data.resetUrl);
        }
        toast.success("Reset link generated!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong. Please check your email.");
    }
  };

  return (
    <div className="min-h-screen bg-[#070b15] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card rounded-2xl p-8 z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600/20 items-center justify-center text-blue-400 mb-3">
            <FiKey size={24} />
          </div>
          <h2 className="text-2xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Forgot Password
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {success ? "Check your recovery link" : "Enter your email to receive a recovery token"}
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Registered Email
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                {...register("email")}
                className={`w-full px-4 py-3 bg-[#0d1425] border rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.email ? "border-red-500" : "border-[#1e2e4f]/30"
                  }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:-translate-y-px flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Request Reset Link"
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-5 text-center">
            <div className="p-4 bg-blue-950/20 border border-blue-900/40 rounded-xl text-center">
              <a
                href={resetLink}
                className="block w-full text-blue-400 hover:text-blue-300 transition-all text-center font-medium no-underline"
              >
                Click here to reset password
              </a>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-8">
          Back to{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-all">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
