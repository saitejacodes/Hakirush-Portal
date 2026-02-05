import axios from "axios";
import { useState } from "react";

const statusTheme = {
  Present: { bg: "#16a34a", light: "#dcfce7", text: "#166534" },
  Absent: { bg: "#dc2626", light: "#fee2e2", text: "#991b1b" },
  Leave: { bg: "#eab308", light: "#fef9c3", text: "#ca8a04" },
};

const AttendanceHelper = ({ status, employeeId, statusChange, isHoliday, isWeekend }) => {
  const [selectedStatus, setSelectedStatus] = useState(null);

  if (isHoliday || isWeekend) {
    return (
      <span className="px-3 py-1 rounded-xl bg-gray-300 text-gray-700 text-sm">
        {isHoliday ? "Holiday" : "Sunday"}
      </span>
    );
  }

  const markEmployee = async (newStatus) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance/update/${employeeId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setSelectedStatus(newStatus);
      statusChange();
    } catch {
      alert("Attendance not allowed today");
    }
  };

  if (status) {
    const t = statusTheme[status];
    return (
      <span
        className="px-3 py-1 rounded-full text-sm font-semibold"
        style={{ backgroundColor: t.light, color: t.text }}
      >
        {status}
      </span>
    );
  }

  return (
    <div className="flex gap-2">
      {["Present", "Absent", "Leave"].map((s) => {
        const t = statusTheme[s];
        return (
          <button
            key={s}
            onClick={() => markEmployee(s)}
            className="px-3 py-1 text-xs rounded-lg font-semibold transition cursor-pointer"
            style={{
              backgroundColor: t.bg,
              color: "white",
              outline: selectedStatus === s ? "2px solid black" : "none",
              transform: selectedStatus === s ? "scale(1.05)" : "scale(1)",
            }}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
};

export default AttendanceHelper;