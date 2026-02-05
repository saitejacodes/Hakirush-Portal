import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />

    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />

        <div className="p-6 flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
            ✓
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-700">
              Profile Updated
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Your profile has been updated successfully.
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
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90 transition"
          >
            Okay, got it
          </button>
        </div>
      </div>
    </div>
  </>
);

const EditEmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [name, setName] = useState("");
  const [experience, setExperience] = useState("");
  const [dob, setDob] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("/default-avatar.png");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

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
        setDob(emp?.dob ? emp.dob.split("T")[0] : "");
        setBloodGroup(emp?.bloodGroup || "");
        setMaritalStatus(emp?.maritalStatus || "");
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
      fd.append("dob", dob);
      fd.append("bloodGroup", bloodGroup);
      fd.append("maritalStatus", maritalStatus);
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

      setShowAlert(true);

      setTimeout(() => {
        navigate(`/employee-dashboard/profile/${employee._id}`);
      }, 1800);
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Loading…
      </div>
    );
  }

  return (
    <>
      {showAlert && (
        <SuccessAlert onClose={() => setShowAlert(false)} />
      )}

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 px-3 py-6 md:p-6">
        <div className="w-full max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-4xl font-extrabold text-center text-red-700 mb-4 md:mb-6">
            Edit Profile
          </h3>

          <div className="bg-white/95 rounded-3xl shadow-xl p-4 md:p-10 border border-red-100">
            {/* PROFILE HEADER */}
            <div className="flex flex-col items-center gap-3 md:gap-4">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-red-200 shadow-lg overflow-hidden">
                <img
                  src={preview}
                  alt="profile"
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
                className="w-full max-w-xs text-xl md:text-2xl font-bold text-center border-b border-red-300 outline-none"
              />

              <span className="px-4 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                {employee.designation}
              </span>
            </div>

            {/* INFO GRID */}
            <div className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-7">
              <Info label="Employee ID" value={employee.employeeId} />
              <Info label="Email" value={employee.userId?.email} />
              <Info label="Gender" value={employee.gender} />

              <Editable label="DOB" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />

              <SelectEditable
                label="Blood Group"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
              />

              <Info label="Department" value={employee.department?.dep_name} />
              <Info label="Designation" value={employee.designation || "N/A"} />

              <SelectEditable
                label="Marital Status"
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                options={["Single", "Married"]}
              />

              <Editable label="Experience (Years)" value={experience} onChange={(e) => setExperience(e.target.value)} />
              <Info label="Salary" value={`₹ ${employee.salary}`} />
              <Info label="Date Of Joining" value={formatDate(employee?.dateOfJoining)} />
            </div>

            {/* ACTIONS */}
            <div className="mt-8 md:mt-10 flex justify-end gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2 rounded-xl border border-red-300 text-red-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 cursor-pointer"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ===== INFO CARD ===== */
const Info = ({ label, value }) => (
  <div className="bg-red-50 rounded-xl p-3 md:p-4 border border-red-100">
    <p className="text-xs uppercase tracking-wide text-red-500 font-semibold">
      {label}
    </p>
    <p className="text-gray-800 text-base md:text-lg font-bold mt-1 truncate">
      {value || "—"}
    </p>
  </div>
);

/* ===== EDITABLE INPUT ===== */
const Editable = ({ label, ...props }) => (
  <div className="bg-red-50 rounded-xl p-3 md:p-4 border border-red-100">
    <p className="text-xs uppercase tracking-wide text-red-500 font-semibold mb-1">
      {label}
    </p>
    <input
      {...props}
      className="w-full bg-transparent outline-none text-base md:text-lg font-bold"
    />
  </div>
);

/* ===== SELECT EDITABLE ===== */
const SelectEditable = ({ label, options, ...props }) => (
  <div className="bg-red-50 rounded-xl p-3 md:p-4 border border-red-100">
    <p className="text-xs uppercase tracking-wide text-red-500 font-semibold mb-1">
      {label}
    </p>
    <select
      {...props}
      className="w-full bg-transparent outline-none text-base md:text-lg font-bold"
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default EditEmployeeProfile;