import React, { useEffect, useState } from "react";
import axios from "axios";

const EmployeePunch = ({ onSuccess }) => {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const [attendance, setAttendance] = useState(null);
  const [timer, setTimer] = useState("00:00:00");

  const fetchTodayAttendance = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance/today/me`,
        { headers }
      );
      setAttendance(res.data.attendance);
    } catch (error) {
      console.error("Error fetching attendance", error);
    }
  };

  const handleAction = async (endpoint) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance/${endpoint}`,
        {},
        { headers }
      );
      setAttendance(res.data.attendance);
      if (onSuccess) onSuccess(); 
    } catch (error) {
      console.error(`Error during ${endpoint}`, error);
    }
  };

  useEffect(() => {
    if (!attendance?.checkIn) {
      setTimer("00:00:00");
      return;
    }

    const calculateTime = () => {
      const checkInTime = new Date(attendance.checkIn).getTime();
      const totalPausedMs = attendance.totalPausedMs || 0;
      
      let currentTime;
      if (attendance.checkOut) {
        currentTime = new Date(attendance.checkOut).getTime();
      } else if (attendance.isPaused) {
        currentTime = new Date(attendance.pauseStartedAt).getTime();
      } else {
        currentTime = new Date().getTime();
      }

      const diffMs = Math.max(0, currentTime - checkInTime - totalPausedMs);

      const sec = Math.floor(diffMs / 1000);
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;

      setTimer(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    };

    calculateTime();

    let interval;
    if (attendance.checkIn && !attendance.checkOut && !attendance.isPaused) {
      interval = setInterval(calculateTime, 1000);
    }

    return () => clearInterval(interval);
  }, [attendance]);

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const statusLabel = attendance?.checkOut
    ? "Shift Completed"
    : attendance?.isPaused
    ? "On Break"
    : attendance?.checkIn
    ? "Working"
    : "Ready to Start";

  const statusColor = attendance?.checkOut
    ? "bg-slate-100 text-slate-600 border-slate-200"
    : attendance?.isPaused
    ? "bg-amber-100 text-amber-700 border-amber-200"
    : attendance?.checkIn
    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
    : "bg-blue-50 text-blue-600 border-blue-100";

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 text-center transition-all">
        
        <div className="flex flex-col items-center">
          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColor}`}>
            {statusLabel}
          </span>

          <div className="mt-6 text-6xl font-black tabular-nums tracking-tighter text-slate-900">
            {timer}
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
            Total Worked Time
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3">
          {/* CHECK IN */}
          <button
            onClick={() => handleAction("check-in")}
            disabled={!!attendance?.checkIn}
            className="flex items-center justify-center px-6 py-3 rounded-2xl font-bold text-sm text-white bg-green-800 hover:bg-green-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            Check In
          </button>

          <button
            onClick={() => handleAction("check-out")}
            disabled={!attendance?.checkIn || !!attendance?.checkOut}
            className="flex items-center justify-center px-6 py-3 rounded-2xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            Check Out
          </button>

          {attendance?.checkIn && !attendance?.checkOut && (
            <button
              onClick={() => handleAction(attendance.isPaused ? "resume" : "pause")}
              className={`col-span-2 flex items-center justify-center px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                attendance.isPaused 
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" 
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              {attendance.isPaused ? "Resume Work" : "Take a Break"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePunch;