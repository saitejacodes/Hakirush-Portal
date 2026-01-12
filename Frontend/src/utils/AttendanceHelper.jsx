import axios from "axios";

const AttendanceHelper = ({ status, employeeId, statusChange, isHoliday, isWeekend }) => {

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
      statusChange();
    } catch {
      alert("Attendance not allowed today");
    }
  };

  const badge = {
    Present: "bg-green-200 text-green-800",
    Absent: "bg-red-200 text-red-800",
    Sick: "bg-yellow-200 text-yellow-800",
    Leave: "bg-blue-200 text-blue-800"
  };

  if (status) {
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge[status]}`}>
        {status}
      </span>
    );
  }

  return (
    <div className="flex gap-2">
      {["Present","Absent","Sick","Leave"].map(s => (
        <button
          key={s}
          onClick={() => markEmployee(s)}
          className="px-3 py-1 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700"
        >
          {s}
        </button>
      ))}
    </div>
  );
};

export default AttendanceHelper;