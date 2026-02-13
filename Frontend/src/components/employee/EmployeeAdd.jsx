import React, { useEffect, useState } from "react";
import axios from "axios";
import { fetchDepartments } from "../../utils/EmployeeHelper";
import { useNavigate } from "react-router-dom";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => {
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />

      {/* Alert */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-red-100 overflow-hidden">
          
          {/* Gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />

          <div className="p-6 flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              ✓
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-700">
                Employee Added
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                The employee has been created successfully.
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

const Add = () => {
  const [departments, setDepartments] = useState([]);
  const [loadingDept, setLoadingDept] = useState(false);
  const [formData, setFormData] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  /* ================= FETCH DEPARTMENTS ================= */
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDept(true);
        const data = await fetchDepartments();
        setDepartments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch departments", error);
      } finally {
        setLoadingDept(false);
      }
    };

    loadDepartments();
  }, []);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profileImage") {
      const file = files[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        alert("Image must be less than 10MB");
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, profileImage: file }));
      setPreview(URL.createObjectURL(file));
      return;
    }

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
        setShowAlert(true);

        setTimeout(() => {
          navigate("/admin-dashboard/employees");
        }, 1800);
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

  /* ================= UI ================= */
  return (
    <>
      {showAlert && (
        <SuccessAlert onClose={() => setShowAlert(false)} />
      )}

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6 flex items-center justify-center">
        <div className="w-full max-w-3xl bg-white/95 p-10 rounded-3xl shadow-2xl border border-red-100">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-red-700 mb-8 drop-shadow-sm">
            Add New Employee
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* IMAGE */}
            <div className="flex flex-col items-center gap-4">
              <img
                src={preview || "/default-avatar.png"}
                alt="profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-red-200 shadow"
              />
              <label className="text-red-600 font-semibold cursor-pointer hover:underline">
                Upload Photo
                <input
                  type="file"
                  name="profileImage"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChange}
                />
              </label>
            </div>

            {/* FORM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input name="name" placeholder="Name" required onChange={handleChange} className="input bg-white/80" />
              <input name="email" placeholder="Email" type="email" required onChange={handleChange} className="input bg-white/80" />
              <input name="employeeId" placeholder="Employee ID" required onChange={handleChange} className="input bg-white/80" />
              <input type="date" name="dob" required onChange={handleChange} className="input bg-white/80" />

              <select name="gender" required onChange={handleChange} className="input bg-white/80">
                <option value="">Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>

              <select name="department" required onChange={handleChange} className="input bg-white/80">
                <option value="">
                  {loadingDept ? "Loading..." : "Select Department"}
                </option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.dep_name}</option>
                ))}
              </select>

              <input name="designation" placeholder="Designation" required onChange={handleChange} className="input bg-white/80" />

              <select name="bloodGroup" required onChange={handleChange} className="input bg-white/80">
                <option value="">Blood Group</option>
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
              </select>

              <select name="maritalStatus" required onChange={handleChange} className="input bg-white/80">
                <option value="">Marital Status</option>
                <option>Single</option>
                <option>Married</option>
                <option>Widowed</option>
              </select>

              <input type="number" name="experience" placeholder="Experience (Years)" min="0" required onChange={handleChange} className="input bg-white/80" />
              <input type="number" name="salary" placeholder="Salary" required onChange={handleChange} className="input bg-white/80" />
              <input type="password" name="password" placeholder="Password" required onChange={handleChange} className="input bg-white/80" />

              <select name="role" required onChange={handleChange} className="input bg-white/80">
                <option value="">Role</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
                <option value="client">Client</option>
              </select> 
            </div>

            <button
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold text-lg shadow transition-all cursor-pointer ${
                loading
                  ? "bg-red-300"
                  : "bg-gradient-to-br from-red-600 to-red-500 hover:scale-105"
              }`}
            >
              {loading ? "Creating..." : "Create Employee"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Add;