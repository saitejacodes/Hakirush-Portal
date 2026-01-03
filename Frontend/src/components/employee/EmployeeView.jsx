import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const View = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/employee/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        
        if (response.data?.success) {
          setEmployee(response.data.employee);
        }
      } catch (error) {
        alert(error?.response?.data?.error || "Failed to load employee");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return `http://localhost:5000${imagePath}`;
    if (imagePath.startsWith("uploads/"))
      return `http://localhost:5000/${imagePath}`;
    return `http://localhost:5000/uploads/${imagePath}`;
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
      <div className="max-w-3xl mx-auto">

        {/* Title */}
        <h3 className="text-4xl font-extrabold text-center text-red-700 mb-8">
          Employee Profile
        </h3>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-red-100">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-full border-4 border-red-200 shadow-lg overflow-hidden hover:scale-105 transition">
              <img
                src={getImageUrl(employee?.userId?.profileImage)}
                alt="profile"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "/default-avatar.png")}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              {employee?.userId?.name}
            </h2>

            <span className="px-4 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
              {employee?.department?.dep_name || "No Department"}
            </span>
          </div>

          {/* Details */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">

            <Info label="Employee ID" value={employee?.employeeId} />
            <Info label="Email" value={employee?.userId?.email} />
            <Info label="Gender" value={employee?.gender} />
            <Info label="Blood Group" value={employee?.bloodGroup || "N/A"} />
            <Info label="Department" value={employee?.department?.dep_name || "N/A"}/>

            <Info
              label="Date of Birth"
              value={
                employee?.dob
                  ? new Date(employee.dob).toDateString()
                  : "N/A"
              }
            />
            <Info label="Marital Status" value={employee?.maritalStatus} />
            <Info label="Salary" value={`₹ ${employee?.salary || 0}`} />
            <Info
              label="Role"
              value={employee?.userId?.role?.toUpperCase() || "EMPLOYEE"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// small reusable field renderer
const Info = ({ label, value }) => (
  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
    <p className="text-xs uppercase tracking-wide text-red-500 font-semibold">
      {label}
    </p>
    <p className="text-gray-800 text-lg font-bold mt-1">{value || "—"}</p>
  </div>
);

export default View;
