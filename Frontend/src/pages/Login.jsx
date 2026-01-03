import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from 'axios'
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";


const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const {login} = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        console.log("Email and password required", email, password);
        
         const response = await axios.post("http://localhost:5000/api/auth/login", 
          { email, password}
        );
        localStorage.setItem('token', response.data.token)
        // console.log("Response", response.data);
        
      if(response.data.success) {
        login(response.data.user)
        console.log(response.data.user)
        if(response.data.user.role === "admin") {
            navigate('/admin-dashboard')
        } else {
            navigate('/employee-dashboard')
        }
      }
      } catch (error) {
        console.log("AXIOS ERROR", error.response?.data);
      }
    }
    
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-red-100 via-white to-red-200 perspective-distant">
      
      {/* Main 3D Container */}
      <motion.div
        initial={{ rotateY: -15, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex w-225 rounded-3xl bg-white shadow-2xl transform-style-preserve-3d"
      >
        <motion.div
          initial={{ x: -50 }}
          animate={{ x: 0 }}
          transition={{ duration: 1 }}
          className="relative flex w-1/2 flex-col items-center justify-center rounded-l-3xl bg-linear-to-br from-red-500 to-red-700 text-white"
        >
          <h1 className="text-5xl font-extrabold tracking-wide">Hakirush</h1>

          <p className="mt-4 text-center text-red-100">Secure • Fast • Reliable Portal</p>

          {/* Glow */}
          <div className="absolute inset-0 rounded-l-3xl bg-white/10 blur-3xl"></div>
        </motion.div>

        {/* RIGHT – Login Form */}
        <div className="flex w-1/2 flex-col justify-center p-10">
          <h2 className="mb-6 text-3xl font-bold text-gray-800">
            Portal Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Email
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter Email"
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Password
              </label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                required
              />
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <a
                href="/forgot-password"
                className="text-sm font-medium text-red-500 hover:text-red-600 transition"
              >
                Forgot password?
              </a>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full rounded-xl bg-linear-to-r from-red-500 to-red-600 py-3 font-semibold text-white shadow-lg"
            >
              Login
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
