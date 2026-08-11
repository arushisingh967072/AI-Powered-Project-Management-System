import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";
import { FiKey } from "react-icons/fi";

const VerifyResetOTP: React.FC = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetEmail");

    if (!storedEmail) {
      navigate("/forgot-password");
      return;
    }

    setEmail(storedEmail);
  }, [navigate]);

  const handleVerifyOTP = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await API.post("/auth/verify-reset-otp", {
        email,
        otp,
      });

      if (response.data.success) {
        toast.success("OTP verified successfully");

        // OTP verification complete
        sessionStorage.setItem("resetOTPVerified", "true");

        // Go to new password page
        navigate("/reset-password");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Invalid or expired OTP"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsResending(true);

      const response = await API.post("/auth/resend-reset-otp", {
        email,
      });

      if (response.data.success) {
        toast.success("A new password reset OTP has been sent to your email");
        setOtp("");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to resend OTP"
      );
    } finally {
      setIsResending(false);
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
            Verify OTP
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Enter the OTP sent to your email
          </p>

          <p className="text-sm text-blue-400 mt-2 break-all">
            {email}
          </p>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleVerifyOTP} className="space-y-5">

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Verification OTP
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setOtp(value);
              }}
              className="w-full px-4 py-3 bg-[#0d1425] border border-[#1e2e4f]/30 rounded-xl text-gray-200 text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:-translate-y-px flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Didn't receive the OTP?
          </p>

          <button
            type="button"
            onClick={handleResendOTP}
            disabled={isResending}
            className="mt-2 text-blue-400 hover:text-blue-300 font-semibold transition-all disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Resend OTP"}
          </button>
        </div>

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

export default VerifyResetOTP;