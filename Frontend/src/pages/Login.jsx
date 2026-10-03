import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { apiErrorCode, isNetworkError } from "../utils/apiError";
import { Eye, EyeOff, ShieldCheck, Lock, Mail, Loader2 } from "lucide-react";

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#B8912E";
const SAGE = "#3F6B52";
const RUST = "#A24A32";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const { login, sessionError, offline } = useAuth();
  const navigate = useNavigate();

  const loginErrorMessage = (error) => {
    if (isNetworkError(error)) {
      return "Can't reach the server. Check your connection and try again.";
    }
    const code = apiErrorCode(error);
    const serverMessage = error.response?.data?.error || error.response?.data?.message;
    if (code === "INVALID_CREDENTIALS") return serverMessage || "Invalid email or password.";
    if (code === "ACCOUNT_INACTIVE") return serverMessage || "This account is inactive. Contact your administrator.";
    if (code === "RATE_LIMITED" || error.response?.status === 429) {
      return serverMessage || "Too many attempts. Please wait a moment and try again.";
    }
    if (error.response?.status >= 500) {
      return serverMessage || "The server is having trouble. Please try again shortly.";
    }
    return serverMessage || "Access Denied: Invalid Credentials";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErr("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        { email, password },
        { timeout: 20000 }
      );

      if (response.data?.success && response.data.token && response.data.user) {
        login(response.data.user, response.data.token);
        // Directing to appropriate dashboard based on role
        const role = response.data.user.role;
        if (role === "admin") {
          navigate("/admin-dashboard");
        } else if (role === "client") {
          navigate("/client-dashboard");
        } else if (role === "employee") {
          navigate("/employee-dashboard");
        } else {
          setErr("This account has no portal access.");
        }
      } else {
        setErr(response.data?.error || "Login failed. Please try again.");
      }
    } catch (error) {
      setErr(loginErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Message carried over from a session that ended (revoked / inactive).
  const notice = !err && !offline ? sessionError : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F3EC] px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#B8912E]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7A2233]/10 blur-[120px] rounded-full" />

      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-4xl rounded-[2.5rem] bg-white shadow-2xl border border-[#E7E1D3] flex flex-col md:flex-row overflow-hidden relative z-10"
      >
        {/* LEFT PANEL: BRANDING */}
        <div
          className="md:w-1/2 w-full p-12 flex flex-col justify-center items-center relative overflow-hidden"
          style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 130%)` }}
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

          <Motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="relative z-10 mb-8"
          >
            <div className="p-4 bg-white/5 rounded-[2rem] border border-[#B8912E]/20 backdrop-blur-md shadow-2xl">
              <img src="/favicon.png" className="w-24 h-24 sm:w-38 sm:h-38 object-contain" alt="Logo" />
            </div>
          </Motion.div>

          <div className="relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-[#F6F3EC] leading-none">
              Haki<span className="text-[#B8912E]">rush</span>
            </h1>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-[1px] w-8 bg-[#B8912E]/40" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#B8912E]">
                Command Center
              </p>
              <div className="h-[1px] w-8 bg-[#B8912E]/40" />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: FORM */}
        <div className="md:w-1/2 w-full p-8 sm:p-14 bg-white flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1C1A17]">
              Portal Login
            </h2>
            <p className="text-[10px] font-bold text-[#8A8478] uppercase tracking-widest mt-2">
              Identity Verification Required
            </p>
          </div>

          <AnimatePresence>
            {err && (
              <Motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 flex items-center gap-3 bg-[#FAF1EA] border border-[#EAD9CC] p-4 rounded-2xl text-[#A24A32]"
              >
                <ShieldCheck size={18} />
                <p className="text-xs font-bold uppercase tracking-wide">{err}</p>
              </Motion.div>
            )}
          </AnimatePresence>

          {notice && (
            <div className="mb-6 flex items-center gap-3 bg-[#F6F3EC] border border-[#E7E1D3] p-4 rounded-2xl text-[#7A2233]">
              <ShieldCheck size={18} />
              <p className="text-xs font-bold uppercase tracking-wide">{notice}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A8478] ml-1">Email Dossier</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9C2AE] group-focus-within:text-[#B8912E] transition-colors" size={18} />
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="admin@hakirush.com"
                  className="w-full bg-[#F6F3EC] rounded-2xl border border-[#E7E1D3] px-12 py-4 text-sm font-bold text-[#1C1A17] focus:ring-4 focus:ring-[#B8912E]/10 focus:border-[#B8912E] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A8478] ml-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9C2AE] group-focus-within:text-[#B8912E] transition-colors" size={18} />
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-[#F6F3EC] rounded-2xl border border-[#E7E1D3] px-12 py-4 text-sm font-bold text-[#1C1A17] focus:ring-4 focus:ring-[#B8912E]/10 focus:border-[#B8912E] outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9C2AE] hover:text-[#B8912E] transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-4 py-4 rounded-[2rem] bg-[#1C1A17] hover:bg-[#B8912E] text-[11px] font-black uppercase tracking-[0.3em] text-[#F6F3EC] hover:text-[#1C1A17] shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale cursor-pointer group"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Authenticating...
                </>
              ) : (
                "Login"
              )}
            </Motion.button>
          </form>

          <div className="mt-10 pt-6 border-t border-[#F1EFE8] flex justify-center">
             <div className="flex items-center gap-2 text-[#C9C2AE]">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: SAGE }} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Global Encryption Active</span>
             </div>
          </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default Login;