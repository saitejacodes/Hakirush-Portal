import React, { useEffect, useState, useCallback, useMemo, useLayoutEffect } from "react";
import axios from "axios";
import { Play, Square, Coffee, RotateCcw } from "lucide-react";

const theme = {
  "--paper": "#FFFFFF",
  "--ink": "#14213D",
  "--muted": "#6B7686",
  "--line": "#E2E5EA",
  "--panel": "#F6F7F9",
  "--blue": "#2F5FD1",
  "--blue-light": "#EAF0FD",
  "--green": "#1F8A5F",
  "--green-light": "#E7F5EE",
  "--red": "#D64545",
  "--red-light": "#FBEAEA",
  "--amber": "#D98B1F",
  "--amber-light": "#FBF0DE",
};

const statusConfig = {
  Present: { accent: "var(--green)", light: "var(--green-light)" },
  Absent: { accent: "var(--red)", light: "var(--red-light)" },
  "Half Day": { accent: "var(--amber)", light: "var(--amber-light)" },
};

const TARGET_HOURS = 8;

const formatClock = (dateStr) => {
  if (!dateStr) return "--:--";
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/* ---------- shared ticket-style modal ---------- */
const TicketModal = ({ accent, light, eyebrow, title, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14213D]/45 backdrop-blur-sm px-4">
    <div className="relative w-full max-w-xs rounded-xl bg-[var(--paper)] border border-[var(--line)] shadow-[0_30px_60px_-20px_rgba(20,33,61,0.35)] overflow-hidden" style={theme}>
      <div className="h-1.5 w-full" style={{ background: accent }} />
      <div className="px-7 pt-6 pb-7 text-center">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full mb-3" style={{ background: light, color: accent }}>
          {eyebrow}
        </span>
        <h2 className="text-lg font-semibold text-[var(--ink)] tracking-tight mb-2">{title}</h2>
        {children}
      </div>
    </div>
  </div>
);

const ConfirmCheckInPopup = ({ onConfirm, onCancel }) => (
  <TicketModal accent="var(--blue)" light="var(--blue-light)" title="Confirm check-in">
    <p className="text-[13px] text-[var(--muted)] mb-6 leading-relaxed">This starts your attendance timer for today.</p>
    <div className="flex gap-2.5">
      <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg bg-[var(--panel)] text-[var(--muted)] font-semibold text-sm hover:bg-[var(--line)] transition-colors cursor-pointer">
        Cancel
      </button>
      <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg bg-[var(--green)] text-white font-semibold text-sm hover:brightness-110 active:scale-[0.97] transition-all cursor-pointer shadow-[0_10px_20px_-10px_rgba(47,95,209,0.6)]">
        Check in
      </button>
    </div>
  </TicketModal>
);

const ConfirmCheckOutPopup = ({ onConfirm, onCancel }) => (
  <TicketModal accent="var(--red)" light="var(--red-light)" title="Confirm check-out">
    <p className="text-[13px] text-[var(--muted)] mb-6 leading-relaxed">This ends your attendance for today — the timer stops for good.</p>
    <div className="flex gap-2.5">
      <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg bg-[var(--panel)] text-[var(--muted)] font-semibold text-sm hover:bg-[var(--line)] transition-colors cursor-pointer">
        Cancel
      </button>
      <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg bg-[var(--red)] text-white font-semibold text-sm hover:brightness-110 active:scale-[0.97] transition-all cursor-pointer shadow-[0_10px_20px_-10px_rgba(214,69,69,0.6)]">
        Check out
      </button>
    </div>
  </TicketModal>
);

const HolidayPopup = ({ holidayName, onClose }) => (
  <TicketModal accent="var(--red)" light="var(--red-light)" eyebrow="Weekend" title="Check-in isn't available">
    <p className="text-[13px] text-[var(--muted)] mb-6 leading-relaxed">
      Today is <span className="font-semibold text-[var(--ink)]">{holidayName}</span>
    </p>
    <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-[var(--red)] text-white font-semibold text-sm hover:brightness-110 active:scale-[0.97] transition-all cursor-pointer shadow-[0_10px_20px_-10px_rgba(214,69,69,0.6)]">
      Got it
    </button>
  </TicketModal>
);

/* ---------- decorative barcode — purely visual, ticket-stub texture ---------- */
const BARCODE_PATTERN = [3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2];
const Barcode = () => (
  <div className="flex items-end gap-[2px] h-6 opacity-70">
    {BARCODE_PATTERN.map((w, i) => (
      <div key={i} style={{ width: w, height: "100%", background: "var(--ink)" }} />
    ))}
  </div>
);

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
        const found = res.data.holidays.find((h) => {
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
  const statusLabel = attendance?.checkOut
    ? finalStatus
    : attendance?.isPaused
    ? "On break"
    : attendance?.checkIn
    ? "Working"
    : "Ready to Checkin";


  let accent = "var(--muted)";
  let accentLight = "var(--panel)";
  if (attendance?.checkOut && statusConfig[finalStatus]) {
    accent = statusConfig[finalStatus].accent;
    accentLight = statusConfig[finalStatus].light;
  } else if (attendance?.isPaused) {
    accent = "var(--amber)";
    accentLight = "var(--amber-light)";
  } else if (attendance?.checkIn) {
    accent = "var(--green)";
    accentLight = "var(--green-light)";
  }

  return (
    <div className="w-full max-w-md mx-auto" style={theme}>
      <div className="relative bg-[var(--paper)] rounded-2xl border border-[var(--line)] shadow-[0_30px_70px_-30px_rgba(20,33,61,0.3)] overflow-hidden">
        {/* accent header strip */}
        <div className="h-1.5 w-full" style={{ background: accent, transition: "background 0.3s ease" }} />

        {/* ---- top stub: ticket info fields ---- */}
        <div className="px-7 pt-5 pb-5">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--muted)]">Today</span>
            <span
              className="text-[10px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full"
              style={{ background: accentLight, color: accent }}
            >
              {statusLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8 text-left">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] mb-1.5">Check-in</p>
              <p className="text-lg font-semibold text-[var(--ink)] tabular-nums">{formatClock(attendance?.checkIn)}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] mb-1.5">Check-out</p>
              <p className="text-lg font-semibold text-[var(--ink)] tabular-nums">{formatClock(attendance?.checkOut)}</p>
            </div>
          </div>
        </div>

        {/* ---- torn perforation line ---- */}
        <div className="relative flex items-center gap-1.5 px-7">
          <div className="flex-1 border-t border-dashed border-[var(--line)]" />
        </div>

        {/* ---- bottom stub: timer + actions ---- */}
        <div className="px-7 sm:px-9 pt-6 pb-7 text-center">
          <div className="text-5xl font-semibold tabular-nums tracking-tight text-[var(--ink)] leading-none">{timer}</div>
          <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-[0.18em] mt-3 mb-7">Total Worked Hours</p>

          <div className="grid grid-cols-2 gap-3">
            {!attendance?.checkIn ? (
              <button
                onClick={handleCheckInClick}
                className="col-span-2 flex items-center justify-center gap-2.5 px-10 py-4 rounded-lg font-semibold text-[15px] text-white bg-[var(--green)] shadow-[0_16px_30px_-12px_rgba(47,95,209,0.5)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Play fill="currentColor" size={17} /> Check in
              </button>
            ) : !attendance?.checkOut ? (
              <>
                <button
                  onClick={() => handleAction(attendance.isPaused ? "resume" : "pause")}
                  className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg font-semibold text-[11px] uppercase tracking-wide transition-all active:scale-[0.98] cursor-pointer border"
                  style={
                    attendance.isPaused
                      ? { background: "var(--blue-light)", color: "var(--blue)", borderColor: "var(--blue)33" }
                      : { background: "var(--amber-light)", color: "var(--amber)", borderColor: "var(--amber)33" }
                  }
                >
                  {attendance.isPaused ? <RotateCcw size={18} /> : <Coffee size={18} />}
                  {attendance.isPaused ? "Resume" : "Break"}
                </button>

                <button
                  onClick={handleCheckOutClick}
                  className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg font-semibold text-[11px] uppercase tracking-wide bg-[var(--red)] text-white shadow-[0_16px_30px_-12px_rgba(214,69,69,0.5)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Square fill="currentColor" size={15} />
                  Check out
                </button>
              </>
            ) : (
              <div className="col-span-2 p-5 rounded-lg bg-[var(--panel)] border border-dashed border-[var(--line)]">
                <span className="text-[13px] font-medium text-[var(--muted)]">Shift completed</span>
              </div>
            )}
          </div>
        </div>

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
