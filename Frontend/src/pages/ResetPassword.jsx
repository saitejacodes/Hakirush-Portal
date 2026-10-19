import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import axios from "axios";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, CheckCircle2, ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";
import { apiErrorMessage } from "../utils/apiError";

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#B8912E";
const SAGE = "#3F6B52";

const displayFont = { fontFamily: "'Playfair Display', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!token) {
      setError("Invalid or missing reset token. Please check your email link or request a new one.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`,
        { token, password }
      );

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      } else {
        setError(res.data?.error || "Failed to reset password.");
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to reset password. The link may have expired or was already used."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F3EC] px-4 relative overflow-hidden" style={bodyFont}>
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#B8912E]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7A2233]/10 blur-[120px] rounded-full pointer-events-none" />

      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-2xl border border-[#E7E1D3] relative z-10"
      >
        <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${GARNET}, ${GOLD} 50%, ${GARNET})` }} />

        <div className="p-8 sm:p-12">
          {/* Header */}
          <div className="mb-8 text-center">
            <Motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="inline-block mb-4"
            >
              <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E7E1D3] inline-flex items-center justify-center">
                <img src="/favicon.png" className="w-12 h-12 object-contain" alt="Logo" />
              </div>
            </Motion.div>

            <h1 className="text-3xl font-black uppercase tracking-tight text-[#1C1A17]">
              Haki<span className="text-[#B8912E]">rush</span> Portal
            </h1>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#8A8478]">
              Set New Password
            </p>
          </div>

          {!token ? (
            <div className="text-center space-y-6">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border"
                style={{ borderColor: "#A24A3240", color: "#A24A32", backgroundColor: "#A24A320F" }}
              >
                <ShieldAlert size={32} strokeWidth={1.8} />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-[#1C1A17]">
                  Missing or Invalid Reset Link
                </h2>
                <p className="text-sm text-[#6B655B] leading-relaxed">
                  No password reset token was found in this link. Please request a new password reset email.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7A2233] hover:bg-[#1C1A17] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all active:scale-95"
                >
                  Request New Reset Link
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border"
                style={{ borderColor: "#3F6B5240", color: SAGE, backgroundColor: "#3F6B520F" }}
              >
                <CheckCircle2 size={32} strokeWidth={1.8} />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-[#1C1A17]">
                  Password Reset Successfully!
                </h2>
                <p className="text-sm text-[#6B655B]">
                  Your credentials have been updated and existing sessions invalidated. Redirecting you to sign in...
                </p>
              </div>

              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#1C1A17] hover:bg-[#7A2233] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all"
                >
                  Go to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-2xl border border-[#A24A32]/30 bg-[#FAF1EA] p-4 text-xs font-semibold text-[#A24A32] flex items-start gap-3">
                  <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <p>{error}</p>
                    <p className="mt-1 font-normal text-[#8A8478]">
                      Need a new link?{" "}
                      <Link to="/forgot-password" className="font-bold text-[#7A2233] hover:underline">
                        Request again here
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A8478] ml-1">
                  New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9C2AE] group-focus-within:text-[#B8912E] transition-colors" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className="w-full bg-[#F6F3EC] rounded-2xl border border-[#E7E1D3] px-12 py-4 text-sm font-bold text-[#1C1A17] focus:ring-4 focus:ring-[#B8912E]/10 focus:border-[#B8912E] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9C2AE] hover:text-[#1C1A17] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A8478] ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9C2AE] group-focus-within:text-[#B8912E] transition-colors" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    minLength={8}
                    className="w-full bg-[#F6F3EC] rounded-2xl border border-[#E7E1D3] px-12 py-4 text-sm font-bold text-[#1C1A17] focus:ring-4 focus:ring-[#B8912E]/10 focus:border-[#B8912E] outline-none transition-all"
                  />
                </div>
              </div>

              <Motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-[2rem] bg-[#1C1A17] hover:bg-[#7A2233] text-[11px] font-black uppercase tracking-[0.25em] text-[#F6F3EC] shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Updating Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Motion.button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-[#F1EFE8] text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#7A2233] hover:text-[#B8912E] uppercase tracking-wider transition-colors"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default ResetPassword;
