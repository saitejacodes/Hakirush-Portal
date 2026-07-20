import axios from "axios";
import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, CalendarDays, Loader2 } from "lucide-react";

const normalizeStatus = (status) => {
  if (status === null || status === undefined || status === "") return null;
  const s = status.toString().toLowerCase().replace(/\s+/g, "");
  if (s === "halfday") return "Half Day";
  if (s === "present") return "Present";
  if (s === "leave") return "Leave";
  if (s === "absent") return "Absent";
  return null;
};

/* ================= THEME CONFIGURATION ================= */
const statusConfig = {
  Present: {
    color: "bg-[#3F6B52]",
    light: "bg-[#EEF3EE]",
    text: "text-[#3F6B52]",
    border: "border-[#D7E4D9]",
    icon: CheckCircle2
  },
  Absent: {
    color: "bg-[#A24A32]",
    light: "bg-[#FAF1EA]",
    text: "text-[#A24A32]",
    border: "border-[#EAD9CC]",
    icon: XCircle
  },
  Leave: {
    color: "bg-[#B8912E]",
    light: "bg-[#FBF3E3]",
    text: "text-[#9C7A22]",
    border: "border-[#EFE1BF]",
    icon: CalendarDays
  },
  "Half Day": {
    color: "bg-[#3E5279]",
    light: "bg-[#EFF1F6]",
    text: "text-[#3E5279]",
    border: "border-[#DCE1EE]",
    icon: Clock
  },
};

const AttendanceHelper = ({ status, employeeId, statusChange, checkIn, checkOut }) => {
  const finalStatus = normalizeStatus(status);
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(finalStatus);
  const [editMode, setEditMode] = useState(false);

  const markEmployee = async (newStatus) => {
    try {
      setLoading(true);
      // Map button label to backend status value
      let backendStatus = newStatus;
      if (newStatus === "Half Day") backendStatus = "Halfday";
      else if (newStatus === "Present") backendStatus = "Present";
      else if (newStatus === "Absent") backendStatus = "Absent";
      else if (newStatus === "Leave") backendStatus = "Leave";
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance/update/${employeeId}`,
        { status: backendStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setLocalStatus(normalizeStatus(backendStatus));
      statusChange();
    } catch (err) {
      console.error("Attendance Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update localStatus if status prop changes
  useEffect(() => {
    setLocalStatus(normalizeStatus(status));
    setEditMode(false);
  }, [status]);

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-[#8A8478]">
        <Loader2 size={14} className="animate-spin" />
        <span className="text-[9px] font-bold uppercase tracking-widest">Updating...</span>
      </div>
    );
  }

  // Show status badge if status is set and not in edit mode
  if (localStatus && !editMode) {
    const config = statusConfig[localStatus];
    const Icon = config.icon;
    return (
      <button
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${config.border} ${config.light} ${config.text} shadow-sm animate-in fade-in zoom-in duration-300 focus:outline-none hover:brightness-95 transition-all`}
        onClick={() => setEditMode(true)}
        title="Click to change status"
        style={{ cursor: 'pointer' }}
      >
        <Icon size={14} strokeWidth={3} />
        <span className="text-[10px] font-black uppercase tracking-[0.15em]">
          {localStatus}
        </span>
        <span className="ml-2 text-[9px] text-[#C9C2AE]">(Edit)</span>
      </button>
    );
  }

  // Show action buttons if no status
  // Show action buttons if no status or in edit mode
  return (
    <div className="flex items-center gap-1.5 justify-end">
      {["Present", "Half Day", "Absent", "Leave"].map((s) => {
        const config = statusConfig[s];
        return (
          <button
            key={s}
            onClick={() => {
              markEmployee(s);
              setEditMode(false);
            }}
            title={`Mark as ${s}`}
            className={`group relative p-2 rounded-full border border-[#E7E1D3] bg-white hover:border-transparent transition-all duration-300 active:scale-90 cursor-pointer overflow-hidden shadow-sm`}
          >
            {/* Hover Background Slide */}
            <div className={`absolute inset-0 translate-y-full group-hover:translate-y-0 ${config.color} transition-transform duration-300`} />
            {/* Icon */}
            <div className="relative z-10 text-[#C9C2AE] group-hover:text-white transition-colors">
              <config.icon size={16} strokeWidth={2.5} />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default AttendanceHelper;