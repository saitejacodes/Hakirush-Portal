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
      <div className="w-full max-w-xl bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl p-5 sm:p-8 border">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-red-200 flex items-center justify-center text-red-600 shadow">
            <Building2 size={24} />
          </div>
          <h2 className="text-xl sm:text-3xl font-bold mt-3">Add Department</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="text-sm font-semibold">Department Name</label>
            <div className="flex gap-2 border rounded-xl px-3 focus-within:ring-2 focus-within:ring-red-500">
              <Building2 className="text-red-500 mt-3" size={18} />
              <input
                name="dep_name"
                required
                placeholder="Ex: Accounts"
                onChange={handleChange}
                className="w-full py-3 outline-none bg-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold">Description</label>
            <div className="flex gap-2 border rounded-xl px-3 focus-within:ring-2 focus-within:ring-red-500">
              <FileText className="text-red-500 mt-3" size={18} />
              <textarea
                rows={4}
                name="description"
                required
                placeholder="Department responsibilities..."
                onChange={handleChange}
                className="w-full py-3 outline-none bg-transparent resize-none text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-1/2 border rounded-xl py-3 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <ArrowLeft size={18} /> Back
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-red-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-red-700 transition disabled:opacity-60 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Adding…
                </>
              ) : (
                <>
                  <PlusCircle size={18} />
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