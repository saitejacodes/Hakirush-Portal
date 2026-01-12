import axios from "axios";
import { ArrowLeft, Building2, FileText, Loader2, PlusCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditDepartment = () => {
  const { id } = useParams();
  const [department, setDepartment] = useState({ dep_name: "", description: "" });
  const [depLoading, setDepLoading] = useState(false);
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
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
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
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    navigate("/admin-dashboard/departments");
  };

  if (depLoading)
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader2 className="animate-spin" size={30} />
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50 px-4">
      <div className="w-full max-w-xl bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border p-5 sm:p-8">

        <div className="text-center mb-6">
          <div className="mx-auto mb-3 w-12 h-12 flex items-center justify-center rounded-full bg-red-100 text-red-600">
            <Building2 size={22} />
          </div>
          <h2 className="text-xl sm:text-3xl font-bold">Edit Department</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="text-sm font-semibold">Department Name</label>
            <div className="flex gap-2 border rounded-xl px-3">
              <Building2 className="text-gray-500 mt-3" size={18} />
              <input
                name="dep_name"
                value={department.dep_name}
                onChange={handleChange}
                className="w-full py-3 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">Description</label>
            <div className="flex gap-2 border rounded-xl px-3">
              <FileText className="text-gray-500 mt-3" size={18} />
              <textarea
                rows={4}
                name="description"
                value={department.description}
                onChange={handleChange}
                className="w-full py-3 outline-none resize-none"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-1/2 border rounded-xl py-3 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} /> Back
            </button>

            <button
              type="submit"
              className="w-1/2 bg-red-600 text-white rounded-xl py-3 flex items-center justify-center gap-2"
            >
              <PlusCircle size={18} /> Update
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditDepartment;