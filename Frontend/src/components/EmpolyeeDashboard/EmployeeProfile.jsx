import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

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
        if (res.data?.success) {
          setEmployee(res.data.employee);
        }
      } catch {
        alert("Failed to load employee");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    return "/default-avatar.png";
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        Loading profile…
      </div>
    );

  if (!employee)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        Employee not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto">

        <h3 className="text-4xl font-extrabold text-center text-red-700 mb-10 drop-shadow-sm">
          Employee Profile
        </h3>

        <div className="bg-white/95 rounded-3xl shadow-2xl p-10 border border-red-100">

          {/* EDIT BUTTON */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() =>
                navigate(`/employee-dashboard/profile/${employee._id}/edit`)
              }
              className="px-5 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              Edit Profile
            </button>
          </div>

          {/* HEADER */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full border-4 border-red-200 shadow-lg overflow-hidden">
              <img
                src={getImageUrl(employee?.userId?.profileImage)}
                alt="profile"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "/default-avatar.png")}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mt-2">
              {employee?.userId?.name}
            </h2>

            <span className="px-4 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold mt-1">
              {employee?.designation || "No Designation"}
            </span>
          </div>

          {/* INFO GRID */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-7">
            <Info label="Employee ID" value={employee.employeeId} />
            <Info label="Email" value={employee.userId?.email} />
            <Info label="Gender" value={employee.gender} />
            <Info label="Blood Group" value={employee.bloodGroup || "N/A"} />
            <Info label="Department" value={employee.department?.dep_name || "N/A"} />
            <Info label="Designation" value={employee.designation || "N/A"} />
            <Info label="Marital Status" value={employee.maritalStatus} />
            <Info label="Experience (Years)" value={employee.experience} />
            <Info label="Salary" value={`₹ ${employee.salary || 0}`} />
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

export default EmployeeProfile;