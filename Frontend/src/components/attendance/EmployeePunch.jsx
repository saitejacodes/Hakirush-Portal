import React, { useEffect, useState } from "react";
import axios from "axios";
import { Play, Square, Coffee, RotateCcw } from "lucide-react";

const statusConfig = {
  Present: {
    color: "bg-emerald-500",
    light: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
  },
  Absent: {
    color: "bg-red-500",
    light: "bg-red-50",
    text: "text-red-700",
    border: "border-red-100",
  },
  Leave: {
    color: "bg-amber-500",
    light: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
  },
  "Half Day": {
    color: "bg-blue-500",
    light: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
  },
};

const EmployeePunch = ({ onSuccess }) => {
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
  const [attendance, setAttendance] = useState(null);
  const [timer, setTimer] = useState("00:00:00");
  const [workedHours, setWorkedHours] = useState(0);

  const fetchTodayAttendance = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/today/me`, { headers });
      setAttendance(res.data.attendance);
    } catch (error) { console.error("Error fetching attendance", error); }
  };

  const handleAction = async (endpoint) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/${endpoint}`, {}, { headers });
      setAttendance(res.data.attendance);
      if (onSuccess) onSuccess();
    } catch (error) { console.error(`Error during ${endpoint}`, error); }
  };

  useEffect(() => {
    if (!attendance?.checkIn) {
      setTimer("00:00:00");
      setWorkedHours(0);
      return;
    }
    const calculateTime = () => {
      const checkInTime = new Date(attendance.checkIn).getTime();
      const totalPausedMs = attendance.totalPausedMs || 0;
      let currentTime = attendance.checkOut ? new Date(attendance.checkOut).getTime() : 
                        attendance.isPaused ? new Date(attendance.pauseStartedAt).getTime() : new Date().getTime();
      const diffMs = Math.max(0, currentTime - checkInTime - totalPausedMs);
      const sec = Math.floor(diffMs / 1000);
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      setWorkedHours(diffMs / (1000 * 60 * 60));
      setTimer(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    calculateTime();
    let interval;
    if (attendance.checkIn && !attendance.checkOut && !attendance.isPaused) {
      interval = setInterval(calculateTime, 1000);
    }
    return () => clearInterval(interval);
  }, [attendance]);

  useEffect(() => { fetchTodayAttendance(); }, []);

  const getFinalStatus = () => {
    if (!attendance?.checkOut) return null;
    if (workedHours >= 8) return "Present";
    if (workedHours >= 4) return "Half Day";
    return "Absent";
  };

  const finalStatus = getFinalStatus();

  const statusLabel = attendance?.checkOut ? finalStatus : attendance?.isPaused ? "On Break" : attendance?.checkIn ? "Working" : "Ready to Start";

  // Determine badge color using statusConfig
  let statusColor = "bg-slate-100 text-slate-400";
  if (attendance?.checkOut && statusConfig[finalStatus]) {
    statusColor = `${statusConfig[finalStatus].color} text-white`;
  } else if (attendance?.isPaused) {
    statusColor = `bg-amber-400 text-white`;
  } else if (attendance?.checkIn) {
    statusColor = `${statusConfig.Present.color} text-white`;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-2xl rounded-[3.5rem] shadow-[0_12px_48px_0_rgba(16,209,75,0.10)] border border-white/40 p-7 sm:p-8 text-center relative overflow-hidden transition-all duration-300">
        
        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          <span className={`px-4 py-1.5 rounded-full text-[9px] font-[1000] uppercase tracking-[0.2em] shadow-md transition-colors border border-white/40 ${statusColor}`}>
            {statusLabel}
          </span>
        </div>

        {/* Timer Hero */}
        <div className="relative inline-block mb-2">
          <div className="text-6xl font-[900] italic tabular-nums tracking-[-0.07em] text-slate-900 leading-none drop-shadow-[0_4px_16px_rgba(16,209,75,0.10)]">
            {timer}
          </div>
          {attendance?.checkIn && !attendance?.checkOut && !attendance.isPaused && (
             <div className="absolute inset-0 bg-emerald-400/20 blur-3xl -z-10 animate-pulse rounded-[2.5rem]" />
          )}
        </div>
        
        <p className="text-[10px] font-[1000] text-slate-400 uppercase tracking-[0.25em] mt-4 mb-10 italic">
          Total Worked Hours
        </p>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          {!attendance?.checkIn ? (
            <button
              onClick={() => handleAction("check-in")}
              className={`col-span-2 flex items-center justify-center gap-3 px-10 py-4 rounded-[2.5rem] font-[1000] text-xl uppercase italic tracking-tighter text-white ${statusConfig.Present.color} shadow-[0_10px_32px_-5px_rgba(16,209,75,0.25)] hover:scale-[1.03] hover:bg-emerald-600 active:scale-95 transition-all duration-200 cursor-pointer border-2 ${statusConfig.Present.border}`}
            >
              <Play fill="currentColor" size={24} /> Check In
            </button>
          ) : !attendance?.checkOut ? (
            <>
              <button
                onClick={() => handleAction(attendance.isPaused ? "resume" : "pause")}
                className={`flex flex-col items-center justify-center gap-1 py-4 rounded-[2rem] font-[1000] uppercase italic text-[10px] transition-all active:scale-95 cursor-pointer border-2 ${
                  attendance.isPaused 
                  ? `${statusConfig.Present.light} ${statusConfig.Present.text} ${statusConfig.Present.border} hover:bg-emerald-100` 
                  : `${statusConfig.Leave.light} ${statusConfig.Leave.text} ${statusConfig.Leave.border} hover:bg-amber-100`
                }`}
              >
                {attendance.isPaused ? <RotateCcw size={22} /> : <Coffee size={22} />}
                {attendance.isPaused ? "Resume" : "Break"}
              </button>

              <button
                onClick={() => handleAction("check-out")}
                className={`flex flex-col items-center justify-center gap-1 py-4 rounded-[2rem] font-[1000] uppercase italic text-[10px] ${statusConfig.Absent.color} text-white shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all cursor-pointer border-2 ${statusConfig.Absent.border}`}
              >
                <Square fill="currentColor" size={20} />
                Check Out
              </button>
            </>
          ) : (
            <div className="col-span-2 p-6 rounded-[2rem] bg-slate-50/80 border-2 border-dashed border-slate-200 shadow-inner">
               <span className="text-[13px] font-[1000] uppercase text-slate-400 italic">Shift Completed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePunch;