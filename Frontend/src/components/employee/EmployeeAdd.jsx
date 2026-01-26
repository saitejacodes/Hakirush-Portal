import React, { useEffect, useState } from "react";
import axios from "axios";
import { fetchDepartments } from "../../utils/EmployeeHelper";
import { useNavigate } from "react-router-dom";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const Add = () => {
  const [departments, setDepartments] = useState([]);
  const [loadingDept, setLoadingDept] = useState(false);
  const [formData, setFormData] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ================= LOAD DEPARTMENTS ================= */
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDept(true);
        const res = await fetchDepartments();
        setDepartments(res || []);
      } finally {
        setLoadingDept(false);
      }
    };
    loadDepartments();
  }, []);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // IMAGE
    if (name === "profileImage") {
      const file = files[0];
      if (!file) return;

      // ✅ Prevent Multer crash
      if (file.size > MAX_FILE_SIZE) {
        alert("Image must be less than 10MB");
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, profileImage: file }));
      setPreview(URL.createObjectURL(file));
      return;
    }

    // TEXT FIELDS
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      fd.append(key, formData[key]);
    });

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/employee/add`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        alert("Employee Added Successfully 🎉");

        // ✅ NO reload (important for Vercel + auth)
        navigate("/admin-dashboard/employees");
      }
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Failed to add employee. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
        <h2 className="text-3xl font-bold text-center text-red-700 mb-6">
          Add New Employee
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* IMAGE */}
          <div className="flex flex-col items-center gap-3">
            <img
              src={preview || "/default-avatar.png"}
              alt="profile"
              className="w-28 h-28 rounded-full object-cover border"
            />

            <label className="text-red-600 font-semibold cursor-pointer">
              Upload Photo
              <input
                type="file"
                name="profileImage"   // ✅ MATCH BACKEND
                accept="image/*"
                className="hidden"
                onChange={handleChange}
              />
            </label>
          </div>

          {/* FORM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="name"
              placeholder="Name"
              required
              onChange={handleChange}
              className="input"
            />

            <input
              name="email"
              placeholder="Email"
              type="email"
              required
              onChange={handleChange}
              className="input"
            />

            <input
              name="employeeId"
              placeholder="Employee ID"
              required
              onChange={handleChange}
              className="input"
            />

            <input
              type="date"
              name="dob"
              required
              onChange={handleChange}
              className="input"
            />

            <select
              name="gender"
              required
              onChange={handleChange}
              className="input"
            >
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <select
              name="department"
              required
              onChange={handleChange}
              className="input"
            >
              <option value="">
                {loadingDept ? "Loading..." : "Select Department"}
              </option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.dep_name}
                </option>
              ))}
            </select>

            <input
              name="designation"
              placeholder="Designation"
              required
              onChange={handleChange}
              className="input"
            />

            <input
              type="number"
              name="salary"
              placeholder="Salary"
              required
              onChange={handleChange}
              className="input"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              onChange={handleChange}
              className="input"
            />

            <select
              name="role"
              required
              onChange={handleChange}
              className="input"
            >
              <option value="">Role</option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <button
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold
              ${loading ? "bg-red-300" : "bg-red-600 hover:bg-red-700"}`}
          >
            {loading ? "Creating..." : "Create Employee"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add;