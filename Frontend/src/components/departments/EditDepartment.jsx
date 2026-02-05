import axios from "axios";
import {
  ArrowLeft,
  Building2,
  FileText,
  Loader2,
  PlusCircle
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* ================= PREMIUM ALERT ================= */
const SuccessAlert = ({ onClose }) => {
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />

      {/* Alert */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-red-100 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
          
          {/* Gradient top bar */}
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />

          <div className="p-6 flex gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <svg
                width="22"
                height="22"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.5 8.31V9a7.5 7.5 0 1 1-4.447-6.855M16.5 3 9 10.508l-2.25-2.25"
                  stroke="#DC2626"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-700">
                Department Updated
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Your changes have been saved successfully.
              </p>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-red-600 transition"
            >
              ✕
            </button>
          </div>

          {/* Footer */}
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

/* ================= MAIN COMPONENT ================= */
const EditDepartment = () => {
  const { id } = useParams();
  const [department, setDepartment] = useState({
    dep_name: "",
    description: ""
  });
  const [depLoading, setDepLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setDepartment({ ...department, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchDepartment = async () => {
      setDepLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/department/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        if (res.data.success) setDepartment(res.data.department);
      } finally {
        setDepLoading(false);
      }
    };
    fetchDepartment();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/department/${id}`,
      department,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    setShowAlert(true);

    setTimeout(() => {
      navigate("/admin-dashboard/departments");
    }, 1800);
  };

  if (depLoading)
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader2 className="animate-spin" size={30} />
      </div>
    );

  return (
    <>
      {showAlert && (
        <SuccessAlert onClose={() => setShowAlert(false)} />
      )}

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50 px-4">
        <div className="w-full max-w-xl bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-red-100 p-7 sm:p-10">
          <div className="text-center mb-7">
            <div className="mx-auto mb-4 w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-red-200 to-red-100 text-red-600 shadow-lg">
              <Building2 size={28} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-red-700">
              Edit Department
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-semibold mb-1 block">
                Department Name
              </label>
              <div className="flex gap-2 border rounded-xl px-3 focus-within:ring-2 focus-within:ring-red-500 bg-white/80">
                <Building2 className="text-red-500 mt-3" size={20} />
                <input
                  name="dep_name"
                  value={department.dep_name}
                  onChange={handleChange}
                  className="w-full py-3 outline-none bg-transparent text-base"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">
                Description
              </label>
              <div className="flex gap-2 border rounded-xl px-3 focus-within:ring-2 focus-within:ring-red-500 bg-white/80">
                <FileText className="text-red-500 mt-3" size={20} />
                <textarea
                  rows={4}
                  name="description"
                  value={department.description}
                  onChange={handleChange}
                  className="w-full py-3 outline-none bg-transparent resize-none text-base"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-1/2 border rounded-xl py-3 flex items-center justify-center gap-2 text-base hover:bg-red-50 transition cursor-pointer"
              >
                <ArrowLeft size={20} /> Back
              </button>

              <button
                type="submit"
                className="w-1/2 bg-gradient-to-br from-red-600 to-red-500 text-white rounded-xl py-3 flex items-center justify-center gap-2 hover:scale-105 transition text-base font-semibold cursor-pointer"
              >
                <PlusCircle size={20} /> Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditDepartment;