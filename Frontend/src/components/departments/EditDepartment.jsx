import axios from "axios";
import {
  ArrowLeft,
  Building2,
  FileText,
  Loader2,
  PlusCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditDepartment = () => {
  const { id } = useParams();
  const [department, setDepartment] = useState({
    dep_name: "",
    description: "",
  });

  const [depLoading, setDepLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartment((prev) => ({ ...prev, [name]: value }));
  };

  // -------- Fetch existing department ----------
  useEffect(() => {
    const fetchDepartment = async () => {
      setDepLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/department/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data?.success) {
          setDepartment(response.data.department);
        }
      } catch (error) {
        alert(error?.response?.data?.error || "Failed to load department");
      } finally {
        setDepLoading(false);
      }
    };

    fetchDepartment();
  }, [id]);

  // -------- Update department ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/department/${id}`,
        department,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        navigate("/admin-dashboard/departments");
      }
    } catch (error) {
      alert(error?.response?.data?.error || "Update failed");
    }
  };

  return (
    <>
      {depLoading ? (
        <div className="w-full h-screen flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50 px-4">
          <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto mb-3 w-12 h-12 flex items-center justify-center rounded-full bg-red-100 text-red-600">
                <Building2 size={26} />
              </div>

              <h2 className="text-3xl font-extrabold text-gray-800">
                Edit Department
              </h2>

              <p className="text-gray-500 mt-1">
                Update department details and description
              </p>
            </div>

            {/* Form */}
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
                    value={department.dep_name || ""}
                    placeholder="Ex: Human Resources"
                    className="w-full px-1 py-3 outline-none"
                    required
                  />
                </div>
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
                    value={department.description || ""}
                    placeholder="Write a short description..."
                    className="w-full px-1 py-3 outline-none resize-none"
                    required
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 flex gap-3">
                {/* Back */}
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
                  className="w-1/2 rounded-xl py-3 font-semibold flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 transition"
                >
                  <PlusCircle size={18} />
                  Update Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EditDepartment;
