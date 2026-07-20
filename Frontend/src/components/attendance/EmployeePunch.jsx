import React, { useEffect, useState, useCallback, useMemo, useLayoutEffect } from "react";
// Confirmation popup for check-in
const ConfirmCheckInPopup = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md">
    <div className="bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.25)] p-8 max-w-xs w-full text-center border border-slate-100">
      <h2 className="text-lg font-semibold mb-3 text-slate-900 tracking-tight">Confirm check-in</h2>
      <p className="text-[13px] text-slate-500 mb-7 leading-relaxed">Are you sure you want to check in now? This will start your attendance timer.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-full bg-slate-50 text-slate-500 font-medium text-sm hover:bg-slate-100 transition-colors cursor-pointer">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-full bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-600 transition-colors cursor-pointer shadow-[0_10px_20px_-8px_rgba(16,185,129,0.5)]">Check in</button>
      </div>
    </div>
  </div>
);

// Confirmation popup for check-out
const ConfirmCheckOutPopup = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md">
    <div className="bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.25)] p-8 max-w-xs w-full text-center border border-slate-100">
      <h2 className="text-lg font-semibold mb-3 text-slate-900 tracking-tight">Confirm check-out</h2>
      <p className="text-[13px] text-slate-500 mb-7 leading-relaxed">Are you sure you want to check out now? This will end your attendance for today.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-full bg-slate-50 text-slate-500 font-medium text-sm hover:bg-slate-100 transition-colors cursor-pointer">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-full bg-rose-500 text-white font-medium text-sm hover:bg-rose-600 transition-colors cursor-pointer shadow-[0_10px_20px_-8px_rgba(244,63,94,0.5)]">Check out</button>
      </div>
    </div>
  </div>
);

// Holiday/weekend popup
const HolidayPopup = ({ holidayName, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md">
    <div className="bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.25)] p-8 max-w-xs w-full text-center border border-rose-100">
      <h2 className="text-lg font-semibold mb-3 text-rose-600 tracking-tight">No check-in allowed</h2>
      <p className="text-[13px] text-slate-500 mb-7 leading-relaxed">Check-in isn't available on <span className="font-semibold text-rose-500">{holidayName}</span>.</p>
      <button onClick={onClose} className="w-full py-2.5 rounded-full bg-rose-500 text-white font-medium text-sm hover:bg-rose-600 transition-colors cursor-pointer shadow-[0_10px_20px_-8px_rgba(244,63,94,0.5)]">Got it</button>
    </div>
  </div>
);
import axios from "axios";
import { Play, Square, Coffee, RotateCcw } from "lucide-react";

const statusConfig = {
  Present: { color: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
  Absent: { color: "bg-red-500", light: "bg-red-50", text: "text-red-700", border: "border-red-100" },
  "Half Day": { color: "bg-blue-500", light: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
};


const EmployeePunch = ({ onSuccess }) => {
  const headers = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem("token")}` }), []);
  const [attendance, setAttendance] = useState(null);
  const [timer, setTimer] = useState("00:00:00");
  const [workedHours, setWorkedHours] = useState(0);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [showCheckInPopup, setShowCheckInPopup] = useState(false);


  const fetchTodayAttendance = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/today/me`, { headers });
      if (res.data.success && res.data.attendance) {
        setAttendance(res.data.attendance);
      }
    } catch (error) { 
      console.error("Error fetching attendance", error); 
    }
  }, [headers]);

  // Check if today is a weekend or holiday
  const checkHolidayOrWeekend = useCallback(async () => {
    const today = new Date();
    const day = today.getDay();
    // 0 = Sunday, 6 = Saturday
    if (day === 0 || day === 6) {
      setIsHoliday(true);
      setHolidayName(day === 0 ? "Sunday" : "Saturday");
      return;
    }
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/upcoming`, { headers });
      if (res.data.success && Array.isArray(res.data.holidays)) {
        const todayStr = today.toISOString().split("T")[0];
        const found = res.data.holidays.find(h => {
          const hDate = new Date(h.date).toISOString().split("T")[0];
          return hDate === todayStr;
        });
        if (found) {
          setIsHoliday(true);
          setHolidayName(found.title || "Holiday");
        }
      }
    } catch (error) {
      // If error, do not block check-in, just log
      console.error("Error checking holidays", error);
    }
  }, [headers]);

  const handleAction = async (endpoint) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/${endpoint}`, {}, { headers });
      if (res.data.success) {
        setAttendance(res.data.attendance);
        if (onSuccess) onSuccess();
      }
    } catch (error) { 
      console.error(`Error during ${endpoint}:`, error.response?.data?.message || error.message);
    }
  };

  // Only for check-in, show popup first

  const [showHolidayPopup, setShowHolidayPopup] = useState(false);
  const [showCheckOutPopup, setShowCheckOutPopup] = useState(false);

  const handleCheckInClick = () => {
    if (isHoliday) {
      setShowHolidayPopup(true);
    } else {
      setShowCheckInPopup(true);
    }
  };

  const confirmCheckIn = () => {
    setShowCheckInPopup(false);
    handleAction("check-in");
  };
  const cancelCheckIn = () => {
    setShowCheckInPopup(false);
  };
  const closeHolidayPopup = () => {
    setShowHolidayPopup(false);
  };

  const handleCheckOutClick = () => {
    setShowCheckOutPopup(true);
  };
  const confirmCheckOut = () => {
    setShowCheckOutPopup(false);
    handleAction("check-out");
  };
  const cancelCheckOut = () => {
    setShowCheckOutPopup(false);
  };

  const calculateTime = useCallback(() => {
    if (!attendance?.checkIn) return;

    const checkInTime = new Date(attendance.checkIn).getTime();
    // totalPausedMs must be treated as 0 if undefined/null to avoid NaN
    const totalPausedMs = attendance.totalPausedMs || 0;
    
    let currentTime;
    if (attendance.checkOut) {
      currentTime = new Date(attendance.checkOut).getTime();
    } else if (attendance.isPaused && attendance.pauseStartedAt) {
      // FREEZE TIMER: Use the exact time the pause started
      currentTime = new Date(attendance.pauseStartedAt).getTime();
    } else {
      currentTime = new Date().getTime();
    }

    const diffMs = Math.max(0, currentTime - checkInTime - totalPausedMs);
    const sec = Math.floor(diffMs / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    setWorkedHours(diffMs / (1000 * 60 * 60));
    setTimer(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
  }, [attendance]);

  useEffect(() => {
    if (!attendance?.checkIn) {
      // No check-in: timer and workedHours are always zero
      if (timer !== "00:00:00") setTimer("00:00:00");
      if (workedHours !== 0) setWorkedHours(0);
      return;
    }
    calculateTime();
    let interval;
    // Only tick the timer if checked in, NOT checked out, and NOT on break
    if (attendance.checkIn && !attendance.checkOut && !attendance.isPaused) {
      interval = setInterval(calculateTime, 1000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendance, calculateTime]);


  useLayoutEffect(() => {
    fetchTodayAttendance();
    checkHolidayOrWeekend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getFinalStatus = () => {
    if (!attendance?.checkOut) return null;
    if (workedHours >= 8) return "Present";
    if (workedHours >= 4) return "Half Day";
    return "Absent";
  };

  const finalStatus = getFinalStatus();
  const statusLabel = attendance?.checkOut ? finalStatus : attendance?.isPaused ? "On Break" : attendance?.checkIn ? "Working" : "Ready to Start";

  let statusColor = "bg-slate-100 text-slate-400";
  if (attendance?.checkOut && statusConfig[finalStatus]) {
    statusColor = `${statusConfig[finalStatus].color} text-white`;
  } else if (attendance?.isPaused) {
    statusColor = `bg-amber-400 text-white shadow-[0_10px_20px_-8px_rgba(245,158,11,0.5)]`;
  } else if (attendance?.checkIn) {
    statusColor = `${statusConfig.Present.color} text-white`;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_55px_-20px_rgba(15,23,42,0.14)] border border-white/60 p-8 sm:p-9 text-center relative overflow-hidden transition-all duration-300">
        {/* Status Badge */}
        <div className="flex justify-center mb-7">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] shadow-sm transition-all border border-white/40 ${statusColor}`}>
            {statusLabel}
          </span>
        </div>

        {/* Timer Display */}
        <div className="relative inline-block mb-2">
          <div className="text-6xl font-semibold tabular-nums tracking-tight text-slate-900 leading-none">
            {timer}
          </div>
          {attendance?.checkIn && !attendance?.checkOut && !attendance.isPaused && (
             <div className="absolute inset-0 bg-emerald-400/15 blur-3xl -z-10 animate-pulse rounded-[2.5rem]" />
          )}
        </div>

        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em] mt-4 mb-10">
          Total worked hours
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          {/* Disable check-in on holidays/weekends */}
          {!attendance?.checkIn ? (
            <>
              <button
                onClick={handleCheckInClick}
                className="col-span-2 flex items-center justify-center gap-3 px-10 py-4 rounded-full font-semibold text-base text-white bg-emerald-500 shadow-[0_15px_30px_-10px_rgba(16,185,129,0.5)] hover:bg-emerald-600 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Play fill="currentColor" size={18} /> Check in
              </button>
              {/* Show popup overlays only after user clicks check-in */}
            </>
          ) : !attendance?.checkOut ? (
            <>
              {/* Pause / Resume Button */}
              <button
                onClick={() => handleAction(attendance.isPaused ? "resume" : "pause")}
                className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-[1.75rem] font-medium text-[11px] transition-all active:scale-[0.98] cursor-pointer border ${
                  attendance.isPaused 
                  ? `bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100` 
                  : `bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100`
                }`}
              >
                {attendance.isPaused ? <RotateCcw size={19} className="animate-spin-slow" /> : <Coffee size={19} />}
                {attendance.isPaused ? "Resume" : "Break"}
              </button>

              {/* Check Out Button */}
              <button
                onClick={handleCheckOutClick}
                className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-[1.75rem] font-medium text-[11px] bg-rose-500 text-white shadow-[0_15px_30px_-10px_rgba(244,63,94,0.5)] hover:bg-rose-600 active:scale-[0.98] transition-all cursor-pointer border border-rose-500"
              >
                <Square fill="currentColor" size={16} />
                Check out
              </button>
            </>
          ) : (
            <div className="col-span-2 p-6 rounded-[1.75rem] bg-slate-50/80 border border-dashed border-slate-200">
               <span className="text-[13px] font-medium text-slate-400">Shift completed</span>
            </div>
          )}
        </div>
        {/* Show popup overlays only when user clicks check-in and not already checked in */}
        {showCheckInPopup && !attendance?.checkIn && !isHoliday && (
          <ConfirmCheckInPopup onConfirm={confirmCheckIn} onCancel={cancelCheckIn} />
        )}
        {showHolidayPopup && !attendance?.checkIn && isHoliday && (
          <HolidayPopup holidayName={holidayName} onClose={closeHolidayPopup} />
        )}
        {showCheckOutPopup && attendance?.checkIn && !attendance?.checkOut && (
          <ConfirmCheckOutPopup onConfirm={confirmCheckOut} onCancel={cancelCheckOut} />
        )}
      </div>
    </div>
  );
};

export default EmployeePunch;