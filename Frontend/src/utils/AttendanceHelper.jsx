import axios from "axios";
import React from "react";

const AttendanceHelper = ({ status, employeeId, statusChange }) => {
  const markEmployee = async (newStatus) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/attendance/update/${employeeId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        statusChange();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update attendance");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-700";
      case "Absent":
        return "bg-red-100 text-red-700";
      case "Sick":
        return "bg-yellow-100 text-yellow-700";
      case "Leave":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // show pill ONLY if attendance marked
  if (status && status !== null) {
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(
          status
        )}`}
      >
        {status}
      </span>
    );
  }

  // show action buttons when not marked
  return (
    <div className="flex gap-2 justify-center">

      <button
        onClick={() => markEmployee("Present")}
        className="px-3 py-1 rounded-lg bg-green-500 text-white text-sm"
      >
        Present
      </button>

      <button
        onClick={() => markEmployee("Absent")}
        className="px-3 py-1 rounded-lg bg-red-500 text-white text-sm"
      >
        Absent
      </button>

      <button
        onClick={() => markEmployee("Sick")}
        className="px-3 py-1 rounded-lg bg-yellow-500 text-white text-sm"
      >
        Sick
      </button>

      <button
        onClick={() => markEmployee("Leave")}
        className="px-3 py-1 rounded-lg bg-blue-500 text-white text-sm"
      >
        Leave
      </button>

    </div>
  );
};

export default AttendanceHelper;
