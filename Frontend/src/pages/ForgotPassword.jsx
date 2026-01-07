import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/forgot-password`,
        { email }
      );

      setMsg(res.data.message || "Password reset link sent to your email");
    } catch (error) {
      setErr(error.response?.data?.message || "Email not found");
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
        {/* LEFT PANEL */}
        <div className="md:w-1/2 w-full bg-black text-red-500 rounded-l-3xl flex flex-col justify-center items-center p-10 relative">
          <motion.img
            src="/favicon.png"
            className="w-60 h-60"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          />

          <h1 className="text-5xl font-extrabold tracking-wide">Hakirush</h1>
          <p className="mt-3 text-red-400">Password Recovery Portal</p>

          <div className="absolute inset-0 bg-red-500/10 blur-3xl"></div>
        </div>

        {/* RIGHT FORM */}
        <div className="md:w-1/2 w-full p-10">
          <a href="/forgot-password" className="text-3xl font-bold text-red-700 mb-6">
            Forgot Password
          </a>

          {msg && (
            <p className="mb-3 text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
              {msg}
            </p>
          )}

          {err && (
            <p className="mb-3 text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
              {err}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Enter your registered email
              </label>

              <input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 shadow focus:ring-2 focus:ring-red-200 outline-none"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="w-full rounded-xl bg-gradient-to-r from-red-500 to-red-600 py-3 font-semibold text-white shadow-lg disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </motion.button>

            <div className="text-sm text-center mt-2">
              <a
                href="/login"
                className="text-red-500 hover:text-red-700 transition"
              >
                ← Back to Login
              </a>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
