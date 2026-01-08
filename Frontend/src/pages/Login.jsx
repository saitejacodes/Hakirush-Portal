import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-white to-red-200">
      <motion.div
        initial={{ rotateY: -15, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-[900px] max-w-full rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/40 flex flex-col md:flex-row"
      >
        {/* LEFT LOGO PANEL */}
        <motion.div
          initial={{ y: -30 }}
          animate={{ y: 0 }}
          transition={{ duration: 1 }}
          className="md:w-1/2 w-full bg-black text-red-500 rounded-l-3xl flex flex-col justify-center items-center p-10 relative overflow-hidden"
        >
          <motion.img
            src="/favicon.png"
            className="w-60 h-60"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          />

          <h1 className="text-5xl font-extrabold tracking-wide">Hakirush</h1>
          <p className="mt-3 text-red-400">Secure • Fast • Reliable Portal</p>

          <div className="absolute inset-0 bg-red-500/10 blur-3xl"></div>
        </motion.div>

        {/* RIGHT FORM */}
        <div className="md:w-1/2 w-full p-10">
          <h2 className="text-3xl font-bold text-red-700 mb-6">Portal Login</h2>

          {err && (
            <p className="mb-3 text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
              {err}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter Email"
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 shadow focus:ring-2 focus:ring-red-200 outline-none"
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
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 shadow focus:ring-2 focus:ring-red-200 outline-none"
                  required
                />

                <span
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-4 cursor-pointer text-gray-500 text-sm"
                >
                  {showPass ? "Hide" : "Show"}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <a
                href="/forgot-password"
                className="text-red-500 hover:text-red-700"
              >
                Forgot password?
              </a>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="w-full rounded-xl bg-gradient-to-r from-red-500 to-red-600 py-3 font-semibold text-white shadow-lg disabled:opacity-60"
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
