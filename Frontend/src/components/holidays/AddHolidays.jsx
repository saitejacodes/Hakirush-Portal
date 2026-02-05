import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => {
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />

      {/* Alert */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-red-100 overflow-hidden">
          {/* Gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />

          <div className="p-6 flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              ✓
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-700">
                Holiday Added
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                The holiday has been created successfully.
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-red-600 transition"
            >
              ✕
            </button>
          </div>

          <div className="px-6 pb-5">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-medium hover:opacity-90 transition"
            >
              Okay, got it
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const AddHoliday = () => {
  const [holiday, setHoliday] = useState({
    title: "",
    date: "",
  });

  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setHoliday((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/holiday/add`,
        holiday,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data?.success) {
        setShowAlert(true);

        setTimeout(() => {
          navigate("/admin-dashboard/holidays");
        }, 1800);
      }
    } catch (error) {
      alert(error.response?.data?.error || "Failed to add holiday");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showAlert && (
        <SuccessAlert onClose={() => setShowAlert(false)} />
      )}

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6 flex items-center justify-center">
        <div className="w-full max-w-3xl bg-white/95 p-10 rounded-3xl shadow-2xl border border-red-100">
          {/* HEADER */}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-red-700 mb-8 drop-shadow-sm">
            Add New Holiday
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* FORM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input
                name="title"
                placeholder="Holiday Title"
                required
                onChange={handleChange}
                className="input bg-white/80"
              />

              <input
                type="date"
                name="date"
                required
                onChange={handleChange}
                className="input bg-white/80"
              />
            </div>

            {/* SUBMIT */}
            <button
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold text-lg shadow transition-all duration-200 cursor-pointer
                ${
                  loading
                    ? "bg-red-300"
                    : "bg-gradient-to-br from-red-600 to-red-500 hover:scale-105 hover:bg-red-700"
                }`}
            >
              {loading ? "Creating..." : "Create Holiday"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddHoliday;