import axios from "axios";
import { useState, useEffect } from "react";

const normalizeStatus = (status) => {
  if (status === null || status === undefined || status === "") return null;

  const s = status.toString().toLowerCase().replace(/\s+/g, "");
  if (s === "halfday") return "Half Day";
  if (s === "present") return "Present";
  if (s === "leave") return "Leave";
  if (s === "absent") return "Absent";
  return null;
};

const statusTheme = {
  Present: { bg: "#16a34a", light: "#dcfce7", text: "#166534" },
  Absent: { bg: "#dc2626", light: "#fee2e2", text: "#991b1b" },
  Leave: { bg: "#eab308", light: "#fef9c3", text: "#ca8a04" },
  "Half Day": { bg: "#2563eb", light: "#dbeafe", text: "#1e40af" },
};

const AttendanceHelper = ({ status, employeeId, statusChange }) => {
  const finalStatus = normalizeStatus(status);
  const [selectedStatus, setSelectedStatus] = useState(finalStatus);

  useEffect(() => {
    setSelectedStatus(finalStatus);
  }, [finalStatus]);

  const markEmployee = async (newStatus) => {
    await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/attendance/update/${employeeId}`,
      { status: newStatus === "Half Day" ? "Halfday" : newStatus },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    statusChange();
  };

  if (finalStatus) {
    const t = statusTheme[finalStatus];
    return (
      <span
        className="px-3 py-1 rounded-full text-sm font-semibold"
        style={{ backgroundColor: t.light, color: t.text }}
      >
        {finalStatus}
      </span>
    );
  }

  return (
    <div className="flex gap-2 justify-center">
      {["Present", "Half Day", "Absent", "Leave"].map((s) => (
        <button
          key={s}
          onClick={() => markEmployee(s)}
          className="px-3 py-1 text-xs rounded-lg font-semibold text-white cursor-pointer"
          style={{ backgroundColor: statusTheme[s].bg }}
        >
          {s}
        </button>
      ))}
    </div>
  );
};

export default AttendanceHelper;