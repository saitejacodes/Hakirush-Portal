import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

const EmployeeSetting = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [setting, setSetting] = useState({
    userId: user?._id,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSetting({ ...setting, [name]: value });
    setError("");
    setSuccess("");
  };

  const togglePassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!setting.oldPassword || !setting.newPassword || !setting.confirmPassword) {
      return setError("All fields are required");
    }

    if (setting.newPassword !== setting.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);

      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/setting/change-password`,
        setting,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        setSuccess("Password changed successfully 🎉");

        setSetting({
          ...setting,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          navigate("/admin-dashboard/employees");
        }, 1500);
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-3xl shadow-2xl border border-red-100 p-8">

        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-red-700">
            Change Password
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Keep your account secure
          </p>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-100 text-red-700 px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl bg-green-100 text-green-700 px-4 py-3 text-sm font-medium">
            {success}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* OLD PASSWORD */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Old Password
            </label>

            <div className="relative">
              <input
                type={showPassword.old ? "text" : "password"}
                name="oldPassword"
                value={setting.oldPassword}
                onChange={handleChange}
                placeholder="Enter old password"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <button
                type="button"
                onClick={() => togglePassword("old")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword.old ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* NEW PASSWORD */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              New Password
            </label>

            <div className="relative">
              <input
                type={showPassword.new ? "text" : "password"}
                name="newPassword"
                value={setting.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <button
                type="button"
                onClick={() => togglePassword("new")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showPassword.confirm ? "text" : "password"}
                name="confirmPassword"
                value={setting.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <button
                type="button"
                onClick={() => togglePassword("confirm")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-red-600 text-white py-3 font-semibold hover:bg-red-700 active:scale-95 transition-all shadow-md disabled:opacity-60"
          >
            {loading ? "Changing Password..." : "Change Password"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default EmployeeSetting;
