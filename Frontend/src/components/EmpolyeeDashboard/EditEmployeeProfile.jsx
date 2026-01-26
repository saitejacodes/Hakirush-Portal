import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const EditEmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [name, setName] = useState("");
  const [experience, setExperience] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("/default-avatar.png");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= IMAGE URL HELPER ================= */
  const getImageUrl = (url) => {
    if (!url) return "/default-avatar.png";
    if (url.startsWith("blob:")) return url;
    if (url.startsWith("http")) return `${url}?t=${Date.now()}`;
    return "/default-avatar.png";
  };

  /* ================= LOAD EMPLOYEE ================= */
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const emp = res.data.employee;
        setEmployee(emp);
        setName(emp?.userId?.name || "");
        setExperience(emp?.experience || "");
        setPreview(getImageUrl(emp?.userId?.profileImage));
      } catch {
        alert("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  /* ================= IMAGE CHANGE ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("Image must be less than 10MB");
      e.target.value = "";
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  /* ================= ROLE-BASED REDIRECT ================= */
  const redirectAfterSave = () => {
    const role = employee?.userId?.role;

    if (role === "admin") {
      navigate("/admin-dashboard/employees");
    } else if (role === "employee") {
      // ✅ EXACT ROUTE YOU ASKED FOR
      navigate(`/employee-dashboard/profile/${employee._id}`);
    } else {
      navigate("/client-dashboard");
    }
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("experience", experience);
      if (image) formData.append("profileImage", image);

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/employee/update-profile/${id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Profile updated successfully 🎉");

      // ✅ CORRECT REDIRECT
      redirectAfterSave();
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50 px-3 py-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-4 sm:p-6">

        {/* Header */}
        <h3 className="text-xl sm:text-3xl font-extrabold text-center text-red-700 mb-5">
          Edit Profile
        </h3>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mb-6">
          <button
            onClick={redirectAfterSave}
            className="w-full sm:w-auto px-4 py-2 border border-red-300 rounded-lg text-red-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-red-200">
            <img
              src={preview}
              alt="profile"
              onError={(e) => (e.target.src = "/default-avatar.png")}
              className="w-full h-full object-cover"
            />
          </div>

          <label className="text-sm text-red-600 font-semibold cursor-pointer">
            Change Photo
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-lg sm:text-2xl font-bold text-center border-b border-red-300 outline-none"
          />

          <span className="text-xs sm:text-sm px-3 py-1 bg-red-100 rounded-full text-red-700">
            {employee.designation}
          </span>
        </div>

        {/* Info Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Info label="Employee ID" value={employee.employeeId} />
          <Info label="Email" value={employee.userId.email} />
          <Info label="Department" value={employee.department?.dep_name} />
          <Info label="Gender" value={employee.gender} />

          <Editable
            label="Experience (Years)"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />

          <Info label="Salary" value={`₹ ${employee.salary}`} />
        </div>
      </div>
    </div>
  );
};

/* ================= UI COMPONENTS ================= */

const Info = ({ label, value }) => (
  <div className="bg-red-50 rounded-lg p-3">
    <p className="text-xs text-red-500 font-semibold">{label}</p>
    <p className="font-bold text-gray-800">{value || "—"}</p>
  </div>
);

const Editable = ({ label, value, ...props }) => (
  <div className="bg-red-50 rounded-lg p-3">
    <p className="text-xs text-red-500 font-semibold mb-1">{label}</p>
    <input
      value={value}
      {...props}
      className="w-full bg-transparent outline-none font-bold"
    />
  </div>
);

export default EditEmployeeProfile;
