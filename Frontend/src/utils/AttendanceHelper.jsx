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
    color: "bg-emerald-500", 
    light: "bg-emerald-50", 
    text: "text-emerald-700", 
    border: "border-emerald-100",
    icon: CheckCircle2 
  },
  Absent: { 
    color: "bg-red-500", 
    light: "bg-red-50", 
    text: "text-red-700", 
    border: "border-red-100",
    icon: XCircle 
  },
  Leave: { 
    color: "bg-amber-500", 
    light: "bg-amber-50", 
    text: "text-amber-700", 
    border: "border-amber-100",
    icon: CalendarDays 
  },
  "Half Day": { 
    color: "bg-blue-500", 
    light: "bg-blue-50", 
    text: "text-blue-700", 
    border: "border-blue-100",
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
      <div className="flex items-center gap-2 px-4 py-2 text-slate-400">
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
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${config.border} ${config.light} ${config.text} shadow-sm animate-in fade-in zoom-in duration-300 focus:outline-none`}
        onClick={() => setEditMode(true)}
        title="Click to change status"
        style={{ cursor: 'pointer' }}
      >
        <Icon size={14} strokeWidth={3} />
        <span className="text-[10px] font-black uppercase tracking-[0.15em] italic">
          {localStatus}
        </span>
        <span className="ml-2 text-[9px] text-slate-400">(Edit)</span>
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
            className={`group relative p-2 rounded-full border border-slate-100 bg-white hover:border-transparent transition-all duration-300 active:scale-90 cursor-pointer overflow-hidden shadow-sm`}
          >
            {/* Hover Background Slide */}
            <div className={`absolute inset-0 translate-y-full group-hover:translate-y-0 ${config.color} transition-transform duration-300`} />
            {/* Icon */}
            <div className="relative z-10 text-slate-400 group-hover:text-white">
              <config.icon size={16} strokeWidth={2.5} />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default AttendanceHelper;