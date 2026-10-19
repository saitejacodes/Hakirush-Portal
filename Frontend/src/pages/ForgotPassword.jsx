import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { apiErrorMessage } from "../utils/apiError";

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#B8912E";
const SAGE = "#3F6B52";

const displayFont = { fontFamily: "'Playfair Display', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`,
        { email: email.trim() },
        { timeout: 15000 }
      );

      if (response.data?.success) {
        setSubmitted(true);
      } else {
        setError(response.data?.error || "Failed to process request. Please try again.");
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to request password reset. Please try again."));
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
              Password Recovery
            </p>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <Motion.div
                key="submitted-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center space-y-6"
              >
                <div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border"
                  style={{ borderColor: "#3F6B5240", color: SAGE, backgroundColor: "#3F6B520F" }}
                >
                  <CheckCircle2 size={32} strokeWidth={1.8} />
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-[#1C1A17]">
                    Check Your Inbox
                  </h2>
                  <p className="text-sm text-[#6B655B] leading-relaxed">
                    If an account with <strong className="text-[#1C1A17]">{email}</strong> exists, we've dispatched an email containing your secure password reset link.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E7E1D3] bg-[#FAF8F5] p-4 text-xs text-[#8A8478] space-y-1 text-left">
                  <p className="font-semibold text-[#1C1A17]">Next Steps:</p>
                  <p>1. Open the reset email from Hakirush Portal.</p>
                  <p>2. Click the button to choose your new password.</p>
                  <p>3. The link will expire in <strong>15 minutes</strong> for security.</p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => { setSubmitted(false); setEmail(""); }}
                    className="text-xs font-bold uppercase tracking-wider text-[#7A2233] hover:text-[#B8912E] py-2 px-4 transition-colors"
                  >
                    Try another email
                  </button>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1C1A17] hover:bg-[#7A2233] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all active:scale-95"
                  >
                    <ArrowLeft size={14} /> Back to Sign In
                  </Link>
                </div>
              </Motion.div>
            ) : (
              <Motion.div
                key="form-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-sm text-[#6B655B] text-center mb-6 leading-relaxed">
                  Enter your registered work email address and we'll send you a secure link to reset your password.
                </p>

                {error && (
                  <div className="mb-6 flex items-center gap-3 bg-[#FAF1EA] border border-[#EAD9CC] p-4 rounded-2xl text-[#A24A32]">
                    <ShieldCheck size={18} className="shrink-0" />
                    <p className="text-xs font-bold uppercase tracking-wide">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A8478] ml-1">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9C2AE] group-focus-within:text-[#B8912E] transition-colors" size={18} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        required
                        className="w-full bg-[#F6F3EC] rounded-2xl border border-[#E7E1D3] px-12 py-4 text-sm font-bold text-[#1C1A17] focus:ring-4 focus:ring-[#B8912E]/10 focus:border-[#B8912E] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <Motion.button
                    type="submit"
                    disabled={loading || !email.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-[2rem] bg-[#1C1A17] hover:bg-[#7A2233] text-[11px] font-black uppercase tracking-[0.25em] text-[#F6F3EC] shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Sending Link...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Motion.button>
                </form>

                <div className="mt-8 pt-6 border-t border-[#F1EFE8] text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#7A2233] hover:text-[#B8912E] uppercase tracking-wider transition-colors"
                  >
                    <ArrowLeft size={14} /> Back to Sign In
                  </Link>
                </div>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </Motion.div>
    </div>
  );
};

export default ForgotPassword;
