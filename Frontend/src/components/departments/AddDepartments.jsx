import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Building2, FileText, ArrowLeft, PlusCircle, Loader2 } from "lucide-react";

const AddDepartments = () => {
  const [department, setDepartment] = useState({ dep_name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setDepartment({ ...department, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/department/add`,
        department,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.data.success) navigate("/admin-dashboard/departments");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-red-50 flex justify-center items-center px-4">
      <div className="w-full max-w-xl bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-7 sm:p-10 border border-red-100">
        {/* Header */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-200 to-red-100 flex items-center justify-center text-red-600 shadow-lg">
            <Building2 size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-4 text-red-700 drop-shadow-sm">Add Department</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="text-sm font-semibold mb-1 block">Department Name</label>
            <div className="flex gap-2 border rounded-xl px-3 focus-within:ring-2 focus-within:ring-red-500 bg-white/80">
              <Building2 className="text-red-500 mt-3" size={20} />
              <input
                name="dep_name"
                required
                placeholder="Ex: Accounts"
                onChange={handleChange}
                className="w-full py-3 outline-none bg-transparent text-base"
              />
            </div>
          </div>
          {/* Description */}
          <div>
            <label className="text-sm font-semibold mb-1 block">Description</label>
            <div className="flex gap-2 border rounded-xl px-3 focus-within:ring-2 focus-within:ring-red-500 bg-white/80">
              <FileText className="text-red-500 mt-3" size={20} />
              <textarea
                rows={4}
                name="description"
                required
                placeholder="Department responsibilities..."
                onChange={handleChange}
                className="w-full py-3 outline-none bg-transparent resize-none text-base"
              />
            </div>
          </div>
          {/* Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-1/2 border rounded-xl py-3 flex items-center justify-center gap-2 text-base hover:bg-red-50 transition"
            >
              <ArrowLeft size={20} /> Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-gradient-to-br from-red-600 to-red-500 text-white rounded-xl py-3 flex items-center justify-center gap-2 hover:scale-105 hover:bg-red-700 transition disabled:opacity-60 text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Adding…
                </>
              ) : (
                <>
                  <PlusCircle size={20} />
                  Add
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartments;