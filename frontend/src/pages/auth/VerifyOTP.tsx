import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";
import { FiMail } from "react-icons/fi";

interface LocationState {
  email?: string;
}

const VerifyOTP: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as LocationState | null;

  const [email, setEmail] = useState(state?.email || "");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // If user directly opens /verify-otp without email
  useEffect(() => {
    if (!state?.email) {
      toast.error("Email information is missing");
      navigate("/signup", { replace: true });
    }
  }, [state?.email, navigate]);

  // Resend OTP countdown
  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleVerifyOTP = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await API.post("/auth/verify-otp", {
        email,
        otp,
      });

      if (response.data.success) {
        // Backend sends JWT after successful verification
        if (response.data.token) {
          localStorage.setItem(
            "token",
            response.data.token
          );
        }

        if (response.data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
          );
        }

        toast.success("Email verified successfully!");

        // After verification go to login
        navigate("/login", { replace: true });
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "OTP verification failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    if (resendTimer > 0) {
      return;
    }

    try {
      setIsResending(true);

      const response = await API.post("/auth/resend-otp", {
        email,
      });

      if (response.data.success) {
        toast.success(
          response.data.message ||
            "A new OTP has been sent to your email"
        );

        setOtp("");
        setResendTimer(60);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to resend OTP"
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b15] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-2xl p-8 z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600/20 items-center justify-center text-blue-400 mb-3">
            <FiMail size={24} />
          </div>

          <h2 className="text-2xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Verify Your Email
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Enter the 6-digit OTP sent to your email
          </p>
        </div>

        {/* Email */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#0d1425] border border-[#1e2e4f]/30 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="name@company.com"
          />
        </div>

        {/* OTP Form */}
        <form
          onSubmit={handleVerifyOTP}
          className="space-y-5"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Verification OTP
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                const value = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6);

                setOtp(value);
              }}
              placeholder="Enter 6-digit OTP"
              className="w-full px-4 py-3 bg-[#0d1425] border border-[#1e2e4f]/30 rounded-xl text-gray-200 text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !email ||
              otp.length !== 6
            }
            className="w-full py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
            disabled={
              isResending || resendTimer > 0
            }
            className="mt-2 text-blue-400 hover:text-blue-300 font-semibold text-sm transition-all disabled:text-gray-600 disabled:cursor-not-allowed"
          >
            {isResending
              ? "Sending..."
              : resendTimer > 0
              ? `Resend OTP in ${resendTimer}s`
              : "Resend OTP"}
          </button>
        </div>

        {/* Back to Signup */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Want to use a different email?{" "}
          <Link
            to="/signup"
            className="text-blue-400 hover:text-blue-300 font-semibold transition-all"
          >
            Back to Signup
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;