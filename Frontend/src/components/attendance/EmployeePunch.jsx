import React, { useEffect, useState, useCallback, useMemo, useLayoutEffect } from "react";
import axios from "axios";
import { apiErrorMessage } from "../../utils/apiError";
import { Play, Square, Coffee, RotateCcw, Timer } from "lucide-react";

const theme = {
  "--paper": "#FFFFFF",
  "--ink": "#1C1A17",
  "--muted": "#8A8478",
  "--line": "#E7E1D3",
  "--panel": "#F6F3EC",
  "--garnet": "#7A2233",
  "--gold": "#C6A15B",
  "--gold-light": "#FBF3E3",
  "--sage": "#3F6B52",
  "--sage-light": "#E9F1EC",
  "--rust": "#A24A32",
  "--rust-light": "#FBEEE9",
};

const statusConfig = {
  Present: { accent: "var(--sage)", light: "var(--sage-light)" },
  Absent: { accent: "var(--rust)", light: "var(--rust-light)" },
  "Half Day": { accent: "var(--gold)", light: "var(--gold-light)" },
};

const TARGET_HOURS = 8;

const formatClock = (dateStr) => {
  if (!dateStr) return "--:--";
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/* ---------- shared match-day modal ---------- */
const MatchModal = ({ accent, light, eyebrow, title, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1A17]/45 backdrop-blur-sm px-4">
    <div className="relative w-full max-w-xs rounded-xl bg-[var(--paper)] border border-[var(--line)] shadow-[0_30px_60px_-20px_rgba(28,26,23,0.35)] overflow-hidden" style={theme}>
      <div className="h-1.5 w-full" style={{ background: accent }} />
      <div className="px-7 pt-6 pb-7 text-center">
        {eyebrow && (
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full mb-3" style={{ background: light, color: accent }}>
            {eyebrow}
          </span>
        )}
        <h2 className="text-lg font-semibold text-[var(--ink)] tracking-tight mb-2">{title}</h2>
        {children}
      </div>
    </div>
  </div>
);

const ConfirmCheckInPopup = ({ onConfirm, onCancel }) => (
  <MatchModal accent="var(--sage)" light="var(--sage-light)" eyebrow="Kickoff" title="Start today's shift?">
    <p className="text-[13px] text-[var(--muted)] mb-6 leading-relaxed">The clock starts running the moment you confirm.</p>
    <div className="flex gap-2.5">
      <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg bg-[var(--panel)] text-[var(--muted)] font-semibold text-sm hover:bg-[var(--line)] transition-colors cursor-pointer">
        Not yet
      </button>
      <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg bg-[var(--sage)] text-white font-semibold text-sm hover:brightness-110 active:scale-[0.97] transition-all cursor-pointer shadow-[0_10px_20px_-10px_rgba(63,107,82,0.5)]">
        Kick off
      </button>
    </div>
  </MatchModal>
);

const ConfirmCheckOutPopup = ({ onConfirm, onCancel }) => (
  <MatchModal accent="var(--garnet)" light="var(--rust-light)" eyebrow="Full-time" title="End today's shift?">
    <p className="text-[13px] text-[var(--muted)] mb-6 leading-relaxed">The clock stops for good — you can't restart it after this.</p>
    <div className="flex gap-2.5">
      <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg bg-[var(--panel)] text-[var(--muted)] font-semibold text-sm hover:bg-[var(--line)] transition-colors cursor-pointer">
        Stay on
      </button>
      <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg bg-[var(--garnet)] text-white font-semibold text-sm hover:brightness-110 active:scale-[0.97] transition-all cursor-pointer shadow-[0_10px_20px_-10px_rgba(122,34,51,0.5)]">
        Blow the whistle
      </button>
    </div>
  </MatchModal>
);

const HolidayPopup = ({ holidayName, onClose }) => (
  <MatchModal accent="var(--rust)" light="var(--rust-light)" eyebrow="No match today" title="Check-in isn't available">
    <p className="text-[13px] text-[var(--muted)] mb-6 leading-relaxed">
      Today is <span className="font-semibold text-[var(--ink)]">{holidayName}</span>
    </p>
    <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-[var(--garnet)] text-white font-semibold text-sm hover:brightness-110 active:scale-[0.97] transition-all cursor-pointer shadow-[0_10px_20px_-10px_rgba(122,34,51,0.5)]">
      Got it
    </button>
  </MatchModal>
);

/* ---------- decorative pitch stripes — purely visual, mown-grass texture ---------- */
const PitchStripes = () => (
  <div
    className="h-3 w-full opacity-60"
    style={{
      backgroundImage:
        "repeating-linear-gradient(90deg, var(--sage-light) 0 18px, transparent 18px 36px)",
    }}
  />
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
      console.error(`Error during ${endpoint}:`, apiErrorMessage(error));
      // 409 INVALID_TRANSITION carries the authoritative record: resync the UI.
      const serverAttendance = error.response?.data?.details?.attendance;
      if (serverAttendance) setAttendance(serverAttendance);
      alert(apiErrorMessage(error, "Couldn't update attendance. Please try again."));
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
    ? "Half-time"
    : attendance?.checkIn
    ? "Live"
    : "Pre-match";

  let accent = "var(--muted)";
  let accentLight = "var(--panel)";
  let isLive = false;
  if (attendance?.checkOut && statusConfig[finalStatus]) {
    accent = statusConfig[finalStatus].accent;
    accentLight = statusConfig[finalStatus].light;
  } else if (attendance?.isPaused) {
    accent = "var(--gold)";
    accentLight = "var(--gold-light)";
  } else if (attendance?.checkIn) {
    accent = "var(--sage)";
    accentLight = "var(--sage-light)";
    isLive = true;
  }

  return (
    <div className="w-full max-w-md mx-auto" style={theme}>
      <div className="relative bg-[var(--paper)] rounded-2xl border border-[var(--line)] shadow-[0_30px_70px_-30px_rgba(28,26,23,0.25)] overflow-hidden">
        {/* accent header strip */}
        <div className="h-1.5 w-full" style={{ background: accent, transition: "background 0.3s ease" }} />

        {/* ---- top: fixture info ---- */}
        <div className="px-7 pt-5 pb-5">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--muted)]">Today's shift</span>
            <span
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full"
              style={{ background: accentLight, color: accent }}
            >
              {isLive && (
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
              )}
              {statusLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8 text-left">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] mb-1.5">Kickoff</p>
              <p className="text-lg font-semibold text-[var(--ink)] tabular-nums">{formatClock(attendance?.checkIn)}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] mb-1.5">Final whistle</p>
              <p className="text-lg font-semibold text-[var(--ink)] tabular-nums">{formatClock(attendance?.checkOut)}</p>
            </div>
          </div>
        </div>

        {/* ---- halfway line: pitch center marking ---- */}
        <div className="relative flex items-center px-7">
          <div className="flex-1 border-t border-dashed" style={{ borderColor: "var(--line)" }} />
          <span
            className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border-2"
            style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          />
        </div>

        {/* ---- scoreboard: the match clock ---- */}
        <div className="px-7 sm:px-9 pt-7 pb-7 text-center">
          <div className="rounded-xl py-6 mb-7" style={{ background: "var(--ink)" }}>
            <div
              className="text-5xl font-semibold tabular-nums tracking-tight leading-none"
              style={{ color: "var(--gold)", fontVariantNumeric: "tabular-nums" }}
            >
              {timer}
            </div>
            <p className="flex items-center justify-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] mt-3" style={{ color: "rgba(251,248,243,0.55)" }}>
              <Timer size={11} /> Match clock
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {!attendance?.checkIn ? (
              <button
                onClick={handleCheckInClick}
                className="col-span-2 flex items-center justify-center gap-2.5 px-10 py-4 rounded-lg font-semibold text-[15px] text-white bg-[var(--sage)] shadow-[0_16px_30px_-12px_rgba(63,107,82,0.5)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Play fill="currentColor" size={17} /> Kick off
              </button>
            ) : !attendance?.checkOut ? (
              <>
                <button
                  onClick={() => handleAction(attendance.isPaused ? "resume" : "pause")}
                  className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg font-semibold text-[11px] uppercase tracking-wide transition-all active:scale-[0.98] cursor-pointer border"
                  style={
                    attendance.isPaused
                      ? { background: "var(--sage-light)", color: "var(--sage)", borderColor: "var(--sage)" }
                      : { background: "var(--gold-light)", color: "var(--gold)", borderColor: "var(--gold)" }
                  }
                >
                  {attendance.isPaused ? <RotateCcw size={18} /> : <Coffee size={18} />}
                  {attendance.isPaused ? "Second half" : "Half-time"}
                </button>

                <button
                  onClick={handleCheckOutClick}
                  className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg font-semibold text-[11px] uppercase tracking-wide bg-[var(--garnet)] text-white shadow-[0_16px_30px_-12px_rgba(122,34,51,0.5)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Square fill="currentColor" size={15} />
                  Full-time
                </button>
              </>
            ) : (
              <div className="col-span-2 p-5 rounded-lg bg-[var(--panel)] border border-dashed" style={{ borderColor: "var(--line)" }}>
                <span className="text-[13px] font-medium text-[var(--muted)]">Shift completed</span>
              </div>
            )}
          </div>
        </div>

        <PitchStripes />

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
