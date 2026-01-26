import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

/* ================= IMAGE URL HELPER ================= */
const getImageUrl = (url) => {
  if (!url) return "/default-avatar.png";
  if (url.startsWith("blob:")) return url;
  return `${url}?t=${Date.now()}`; // 🔥 cache bust
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const EmployeeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [employee, setEmployee] = useState({
    name: "",
    maritalStatus: "",
    designation: "",
    salary: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH EMPLOYEE ================= */
  const fetchEmployee = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const emp = res.data.employee;

      setEmployee({
        name: emp?.userId?.name || "",
        maritalStatus: emp?.maritalStatus || "",
        designation: emp?.designation || "",
        salary: emp?.salary || "",
      });

      setPreview(emp?.userId?.profileImage || null);
    } catch (error) {
      alert("Failed to load employee");
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // IMAGE
    if (name === "profileImage") {
      const file = files[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        alert("Image size must be less than 10MB");
        e.target.value = "";
        return;
      }

      setImage(file);
      setPreview(URL.createObjectURL(file));

      // allow re-select same file
      e.target.value = "";
      return;
    }

    // TEXT FIELDS
    setEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();

    Object.keys(employee).forEach((key) => {
      fd.append(key, employee[key]);
    });

    if (image) {
      fd.append("profileImage", image); // ✅ MATCH BACKEND
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        alert("Employee updated successfully 🎉");
        navigate("/admin-dashboard/employees");
      }
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Update failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-red-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
        <h2 className="text-3xl font-bold text-center text-red-700 mb-6">
          Edit Employee
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* IMAGE */}
          <div className="flex flex-col items-center gap-3">
            <img
              src={getImageUrl(preview)}
              alt="profile"
              onError={(e) => (e.target.src = "/default-avatar.png")}
              className="w-28 h-28 rounded-full object-cover border"
            />

            <label className="cursor-pointer text-red-600 font-semibold">
              Change Photo
              <input
                ref={fileInputRef}
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
              className="input"
              name="name"
              value={employee.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
            />

            <select
              className="input"
              name="maritalStatus"
              value={employee.maritalStatus}
              onChange={handleChange}
            >
              <option value="">Marital Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>

            <input
              className="input"
              name="designation"
              value={employee.designation}
              onChange={handleChange}
              placeholder="Designation"
            />

            <input
              type="number"
              className="input"
              name="salary"
              value={employee.salary}
              onChange={handleChange}
              placeholder="Salary"
            />
          </div>

          <button
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold
              ${loading ? "bg-red-300" : "bg-red-600 hover:bg-red-700"}`}
          >
            {loading ? "Updating..." : "Update Employee"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeEdit;