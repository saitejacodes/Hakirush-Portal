import React, { useEffect, useState } from "react";
import axios from "axios";
import { Play, Square, Coffee, RotateCcw } from "lucide-react";

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
  
  const statusColor = attendance?.checkOut
    ? finalStatus === "Present" ? "bg-[#10D14B] text-white" : "bg-[#3B82F6] text-white"
    : attendance?.isPaused ? "bg-amber-400 text-white" : attendance?.checkIn ? "bg-[#10D14B] text-white" : "bg-slate-100 text-slate-400";

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-5 text-center relative overflow-hidden">
        
        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          <span className={`px-3 py-1 rounded-full text-[7px] font-[1000] uppercase tracking-[0.2em] shadow-sm transition-colors ${statusColor}`}>
            {statusLabel}
          </span>
        </div>

        {/* Timer Hero */}
        <div className="relative inline-block">
          <div className="text-5xl font-[800] italic tabular-nums tracking-[-0.05em] text-slate-900 leading-none">
            {timer}
          </div>
          {attendance?.checkIn && !attendance?.checkOut && !attendance.isPaused && (
             <div className="absolute inset-0 bg-emerald-400/20 blur-3xl -z-10 animate-pulse" />
          )}
        </div>
        
        <p className="text-[8px] font-[1000] text-slate-300 uppercase tracking-[0.25em] mt-4 mb-10 italic">
          Total Worked Hours
        </p>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          {!attendance?.checkIn ? (
            <button
              onClick={() => handleAction("check-in")}
              className="col-span-2 flex items-center justify-center gap-3 px-8 p-3 rounded-[2rem] font-[1000] text-lg uppercase italic tracking-tighter text-white bg-[#10D14B] shadow-[0_10px_20px_-5px_rgba(16,209,75,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Play fill="currentColor" size={20} /> Punch In
            </button>
          ) : !attendance?.checkOut ? (
            <>
              <button
                onClick={() => handleAction(attendance.isPaused ? "resume" : "pause")}
                className={`flex flex-col items-center justify-center gap-1 p-3 rounded-[2rem] font-[1000] uppercase italic text-[8px] transition-all active:scale-95 cursor-pointer ${
                  attendance.isPaused 
                  ? "bg-emerald-50 text-[#10D14B] border-2 border-[#10D14B]" 
                  : "bg-amber-50 text-amber-600 border-2 border-amber-200"
                }`}
              >
                {attendance.isPaused ? <RotateCcw size={20} /> : <Coffee size={20} />}
                {attendance.isPaused ? "Resume" : "Break"}
              </button>

              <button
                onClick={() => handleAction("check-out")}
                className="flex flex-col items-center justify-center gap-1 p-3 rounded-[2rem] font-[1000] uppercase italic text-[8px] bg-red-600 text-white shadow-lg shadow-slate-200 hover:bg-red-500 active:scale-95 transition-all cursor-pointer"
              >
                <Square fill="currentColor" size={18} />
                Check Out
              </button>
            </>
          ) : (
            <div className="col-span-2 p-6 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200">
               <span className="text-[11px] font-[1000] uppercase text-slate-400 italic">Shift Completed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePunch;