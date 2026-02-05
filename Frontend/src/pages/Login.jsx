import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

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

        if (response.data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/employee-dashboard");
        }
      }
    } catch (error) {
      setErr(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-white to-red-200 px-3 sm:px-6">
      <motion.div
        initial={{ rotateY: -15, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full max-w-4xl rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/40 flex flex-col md:flex-row overflow-hidden"
      >
        {/* LEFT LOGO PANEL */}
        <motion.div
          initial={{ y: -30 }}
          animate={{ y: 0 }}
          transition={{ duration: 1 }}
          className="md:w-1/2 w-full bg-black text-red-500 flex flex-col justify-center items-center p-6 sm:p-10 relative"
        >
          <motion.img
            src="/favicon.png"
            className="w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          />

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-wide uppercase">
            Hakirush
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-red-400 text-center">
            Secure • Fast • Reliable Portal
          </p>

          <div className="absolute inset-0 bg-red-500/10 blur-3xl"></div>
        </motion.div>

        {/* RIGHT FORM */}
        <div className="md:w-1/2 w-full p-6 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-red-700 mb-6 text-center md:text-left">
            Portal Login
          </h2>

          {err && (
            <p className="mb-4 text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl text-sm">
              {err}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter Email"
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 shadow focus:ring-2 focus:ring-red-200 outline-none text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Password
              </label>

              <div className="relative">
               <input
                 onChange={(e) => setPassword(e.target.value)}
                 type={showPass ? "text" : "password"}
                 placeholder="••••••••"
                 className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 shadow focus:ring-2 focus:ring-red-200 outline-none text-sm sm:text-base"
                 required
               />

               <button
                 type="button"
                 onClick={() => setShowPass(!showPass)}
                 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 transition"
               >
                 {showPass ? (
                   <EyeOff size={20} />
                 ) : (
                   <Eye size={20} />
                 )}
               </button>
             </div>
            </div>
            
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="w-full rounded-xl bg-gradient-to-r from-red-500 to-red-600 py-3 font-semibold text-white shadow-lg disabled:opacity-60 text-sm sm:text-base cursor-pointer"
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;