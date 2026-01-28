import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const EditEmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [name, setName] = useState("");
  const [experience, setExperience] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("/default-avatar.png");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (url) => {
    if (!url) return "/default-avatar.png";
    if (url.startsWith("http")) return `${url}?t=${Date.now()}`;
    return "/default-avatar.png";
  };

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

        const emp = res.data.employee;
        setEmployee(emp);
        setName(emp?.userId?.name || "");
        setExperience(emp?.experience || "");
        setPreview(getImageUrl(emp?.userId?.profileImage));
      } catch {
        alert("Failed to load employee");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("Image must be under 10MB");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("name", name);
      fd.append("experience", experience);
      if (image) fd.append("profileImage", image);

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/employee/update-profile/${id}`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Profile updated successfully 🎉");
      navigate(`/employee-dashboard/profile/${employee._id}`);
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Loading…
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto">

        <h3 className="text-4xl font-extrabold text-center text-red-700 mb-10 drop-shadow-sm">
          Edit Profile
        </h3>

        <div className="bg-white/95 rounded-3xl shadow-2xl p-10 border border-red-100">

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2 rounded-xl border border-red-300 text-red-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          {/* HEADER */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full border-4 border-red-200 shadow-lg overflow-hidden">
              <img
                src={preview}
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>

            <label className="text-sm text-red-600 font-semibold cursor-pointer">
              Change Photo
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-2xl font-bold text-center border-b border-red-300 outline-none"
            />

            <span className="px-4 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold mt-1">
              {employee.designation}
            </span>
          </div>

          {/* INFO GRID */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-7">
            <Info label="Employee ID" value={employee.employeeId} />
            <Info label="Email" value={employee.userId?.email} />
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
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
    <p className="text-xs uppercase tracking-wide text-red-500 font-semibold">
      {label}
    </p>
    <p className="text-gray-800 text-lg font-bold mt-1">
      {value || "—"}
    </p>
  </div>
);

const Editable = ({ label, ...props }) => (
  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
    <p className="text-xs uppercase tracking-wide text-red-500 font-semibold mb-1">
      {label}
    </p>
    <input
      {...props}
      className="w-full bg-transparent outline-none text-lg font-bold"
    />
  </div>
);

export default EditEmployeeProfile;