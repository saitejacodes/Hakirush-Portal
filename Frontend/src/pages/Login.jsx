import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, Lock, Mail, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        { email, password }
      );

      localStorage.setItem("token", response.data.token);

      if (response.data.success) {
        login(response.data.user);
        // Directing to appropriate dashboard based on role
        if (response.data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else if (response.data.user.role === "client") {
            navigate("/client-dashboard")
        } else {
          navigate("/employee-dashboard");
        }
      }
    } catch (error) {
      setErr(error.response?.data?.message || "Access Denied: Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-4xl rounded-[2.5rem] bg-white/[0.03] backdrop-blur-2xl shadow-2xl border border-white/10 flex flex-col md:flex-row overflow-hidden"
      >
        {/* LEFT PANEL: BRANDING */}
        <div className="md:w-1/2 w-full bg-gradient-to-br from-red-950 via-black to-black p-12 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="relative z-10 mb-8"
          >
            <div className="p-4 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-2xl">
              <img src="/favicon.png" className="w-24 h-24 sm:w-38 sm:h-38 object-contain" alt="Logo" />
            </div>
          </motion.div>

          <div className="relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white leading-none">
              Haki<span className="text-red-600">rush</span>
            </h1>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-[1px] w-8 bg-red-800" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">
                Command Center
              </p>
              <div className="h-[1px] w-8 bg-red-800" />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: FORM */}
        <div className="md:w-1/2 w-full p-8 sm:p-14 bg-white flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">
              Portal Login
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
              Identity Verification Required
            </p>
          </div>

          <AnimatePresence>
            {err && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600"
              >
                <ShieldCheck size={18} />
                <p className="text-xs font-bold uppercase tracking-wide">{err}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Dossier</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-600 transition-colors" size={18} />
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="admin@hakirush.com"
                  className="w-full bg-slate-50 rounded-2xl border border-slate-100 px-12 py-4 text-sm font-bold focus:ring-4 focus:ring-red-500/5 focus:border-red-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-600 transition-colors" size={18} />
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 rounded-2xl border border-slate-100 px-12 py-4 text-sm font-bold focus:ring-4 focus:ring-red-500/5 focus:border-red-500 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-600 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-4 py-4 rounded-[2rem] bg-slate-900 hover:bg-rose-600 text-[11px] font-black uppercase tracking-[0.3em] text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale cursor-pointer group"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Authenticating...
                </>
              ) : (
                "Login"
              )}
            </motion.button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-center">
             <div className="flex items-center gap-2 text-slate-300 italic">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Global Encryption Active</span>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;