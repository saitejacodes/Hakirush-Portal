import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import axios from "axios";

const EmployeeSetting = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [setting, setSetting] = useState({
    userId: user?._id,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
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
        `${import.meta.env.VITE_BACKEND_URL}/setting/change-password`,
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

        setTimeout(() => navigate("/admin-dashboard/employees"), 1500);
      }
    } catch (err) {
      setError(
        err?.response?.data?.error || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-red-600">
          Change Password
        </h2>

        {error && (
          <p className="mb-3 text-sm text-red-600 bg-red-100 p-2 rounded-lg">
            {error}
          </p>
        )}

        {success && (
          <p className="mb-3 text-sm text-green-700 bg-green-100 p-2 rounded-lg">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Old Password
            </label>
            <input
              type="password"
              name="oldPassword"
              value={setting.oldPassword}
              onChange={handleChange}
              placeholder="Enter old password"
              className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={setting.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={setting.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-semibold shadow-md transition disabled:opacity-60"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeSetting;
