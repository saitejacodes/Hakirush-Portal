import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  FileText,
  ArrowLeft,
  PlusCircle,
  Loader2
} from "lucide-react";

const AddDepartments = () => {
  const [department, setDepartment] = useState({
    dep_name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartment({ ...department, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/department/add",
        department,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) navigate("/admin-dashboard/departments");
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50 px-4">
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 w-12 h-12 flex items-center justify-center rounded-full bg-red-100 text-red-600">
            <Building2 size={26} />
          </div>

          <h2 className="text-3xl font-extrabold text-gray-800">
            Add Department
          </h2>

          <p className="text-gray-500 mt-1">
            Create and manage departments in your organization
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Department Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Department Name
            </label>

            <div className="flex items-center gap-2 border rounded-xl px-3 focus-within:ring-2 focus-within:ring-red-500">
              <Building2 className="text-gray-500" size={18} />
              <input
                name="dep_name"
                type="text"
                onChange={handleChange}
                placeholder="Ex: Human Resources"
                className="w-full px-1 py-3 outline-none"
                required
              />
            </div>

            <span className="text-xs text-gray-400">
              Enter a unique department title
            </span>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>

            <div className="flex gap-2 border rounded-xl px-3 focus-within:ring-2 focus-within:ring-red-500">
              <FileText className="mt-3 text-gray-500" size={18} />
              <textarea
                name="description"
                rows={4}
                onChange={handleChange}
                placeholder="Write a short description..."
                className="w-full px-1 py-3 outline-none resize-none"
                required
              />
            </div>

            <span className="text-xs text-gray-400">
              Briefly explain what this department does
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex gap-3">
            
            {/* Back button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-1/2 rounded-xl py-3 font-medium border flex items-center justify-center gap-2 hover:bg-gray-50 transition"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 rounded-xl py-3 font-semibold flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Adding...
                </>
              ) : (
                <>
                  <PlusCircle size={18} />
                  Add Department
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
