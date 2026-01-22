import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

/* ================= IMAGE URL HELPER ================= */
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/default-avatar.png";
  if (imagePath.startsWith("blob:")) return imagePath;
  if (imagePath.startsWith("http")) return imagePath;
  return imagePath;
};

const Edit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [employee, setEmployee] = useState({
    name: "",
    maritalStatus: "",
    designation: "",
    salary: "",
  });

  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD EMPLOYEE ================= */
  useEffect(() => {
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

        if (res.data.success) {
          const emp = res.data.employee;

          setEmployee({
            name: emp?.userId?.name || "",
            maritalStatus: emp?.maritalStatus || "",
            designation: emp?.designation || "",
            salary: emp?.salary || "",
          });

          if (emp?.userId?.profileImage) {
            setPreview(emp.userId.profileImage);
          }
        }
      } catch (err) {
        alert("Failed to load employee");
      }
    };

    fetchEmployee();
  }, [id]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files?.[0];
      if (!file) return;

      setImage(file);
      setPreview(URL.createObjectURL(file));

      // 🔥 IMPORTANT: allow selecting SAME image again
      e.target.value = "";
      return;
    }

    setEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= SUBMIT UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", employee.name);
    formData.append("maritalStatus", employee.maritalStatus);
    formData.append("designation", employee.designation);
    formData.append("salary", employee.salary);

    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}`,
        formData,
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
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-4xl font-extrabold text-red-700 text-center mb-6">
          Edit Employee
        </h3>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* IMAGE */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-red-200 shadow">
                <img
                  src={getImageUrl(preview)}
                  alt="avatar"
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                  className="w-full h-full object-cover"
                />
              </div>

              <label className="cursor-pointer text-red-600 font-semibold">
                Change Photo
                <input
                  ref={fileInputRef}
                  type="file"
                  name="image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleChange}
                />
              </label>
            </div>

            {/* FORM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input
                className="border border-red-200 p-3 rounded-xl"
                name="name"
                value={employee.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
              />

              <select
                name="maritalStatus"
                className="border border-red-200 p-3 rounded-xl"
                value={employee.maritalStatus}
                onChange={handleChange}
              >
                <option value="">Marital Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>

              <input
                className="border border-red-200 p-3 rounded-xl"
                name="designation"
                value={employee.designation}
                onChange={handleChange}
                placeholder="Designation"
              />

              <input
                type="number"
                name="salary"
                className="border border-red-200 p-3 rounded-xl"
                value={employee.salary}
                onChange={handleChange}
                placeholder="Salary"
              />
            </div>

            <div className="text-center">
              <button
                disabled={loading}
                className={`px-10 py-3 rounded-xl font-semibold text-white
                ${loading ? "bg-red-300" : "bg-red-600 hover:bg-red-700"}`}
              >
                {loading ? "Updating..." : "Update Employee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Edit;