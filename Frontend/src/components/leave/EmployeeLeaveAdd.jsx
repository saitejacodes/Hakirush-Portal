import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Calendar, FileText, ArrowRight, Check,
  AlertTriangle, Clock, Briefcase, ShieldCheck, TrendingUp
} from "lucide-react";

const PAGE_BG = "bg-gradient-to-br from-white via-red-50 to-pink-50";

const CHARCOAL = "#1A1A1D";
const GOLD = "#AD8A56";
const IVORY = "#F6F2EA";
const SLATE = "#7A756C";
const GARNET = "#722F37";
const HAIRLINE = "rgba(26,26,29,0.12)";
const GOLD_HAIRLINE = "rgba(173,138,86,0.4)";

const displayFont = { fontFamily: "'Cormorant Garamond', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

/* ================= CONFIRMATION DIALOG ================= */
const SuccessAlert = ({ onClose }) => (
  <>
    <div className="fixed inset-0 z-50 bg-[#1A1A1D]/30 backdrop-blur-md" />
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div
        className="w-full max-w-sm overflow-hidden rounded-[1.25rem] border bg-white/95 text-center shadow-[0_40px_90px_-32px_rgba(26,26,29,0.4)] backdrop-blur-md"
        style={{ borderColor: HAIRLINE }}
      >
        <div className="px-10 pb-10 pt-12">
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
            style={{ borderColor: GOLD_HAIRLINE, color: GOLD }}
          >
            <Check size={26} strokeWidth={1.75} />
          </div>
          <h3 className="text-2xl leading-none" style={{ ...displayFont, fontWeight: 500, color: CHARCOAL }}>
            Application Logged
          </h3>
          <p className="mt-3 text-xs leading-relaxed" style={{ color: SLATE }}>
            Your request has been synchronized with the leave register.
          </p>
          <button
            onClick={onClose}
            className="mt-8 w-full cursor-pointer rounded-full py-3.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white transition-colors"
            style={{ backgroundColor: CHARCOAL }}
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  </>
);

const EmployeeLeaveAdd = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [leave, setLeave] = useState({ leaveType: "", startDate: "", endDate: "", reason: "" });
  const [balance, setBalance] = useState({ casual: 12, sick: 12 });
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [daysCount, setDaysCount] = useState(0);

  // Helper: Format to YYYY-MM-DD using Local Time
  const toLocalYMD = (dateInput) => {
    const d = new Date(dateInput);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // Logic to calculate working days (Excluding Weekends & Holidays)
  const calculateWorkingDays = useCallback((start, end, holidayList) => {
    if (!start || !end) return 0;
    let count = 0;
    let cur = new Date(start);
    const stop = new Date(end);

    // Normalize to midnight local time
    cur.setHours(0,0,0,0);
    stop.setHours(0,0,0,0);

    // Memoize holiday strings for faster lookup
    const holidayStrings = new Set(holidayList.map(h =>
      typeof h === 'string' ? h : toLocalYMD(h.date || h)
    ));

    while (cur <= stop) {
      const dayOfWeek = cur.getDay(); // 0 = Sunday, 6 = Saturday
      const dateStr = toLocalYMD(cur);

      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayStrings.has(dateStr)) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      try {
        setFetchingData(true);
        const [holidayRes, leaveHistoryRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/all`, { headers }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/leave/${user._id}/employee`, { headers })
        ]);

        const hData = holidayRes?.data?.holidays || [];
        setHolidays(hData);

        const approvedLeaves = leaveHistoryRes?.data?.leaves || [];

        const casualUsed = approvedLeaves
          .filter(l => l.status === "Approved" && l.leaveType === "Casual Leave")
          .reduce((total, l) => total + calculateWorkingDays(l.startDate, l.endDate, hData), 0);

        const sickUsed = approvedLeaves
          .filter(l => l.status === "Approved" && l.leaveType === "Sick Leave")
          .reduce((total, l) => total + calculateWorkingDays(l.startDate, l.endDate, hData), 0);

        setBalance({
          casual: Math.max(0, 12 - casualUsed),
          sick: Math.max(0, 12 - sickUsed)
        });
      } catch (e) {
        console.error("Data Fetch Error:", e);
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, [user?._id, calculateWorkingDays]);

  // Real-time days counter
  useEffect(() => {
    if (leave.startDate && leave.endDate) {
      const count = calculateWorkingDays(leave.startDate, leave.endDate, holidays);
      setDaysCount(count);
    } else {
      setDaysCount(0);
    }
  }, [leave.startDate, leave.endDate, holidays, calculateWorkingDays]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentBalance = leave.leaveType === "Sick Leave" ? balance.sick : balance.casual;
    if (daysCount > currentBalance) {
      alert("Insufficient leave balance.");
      return;
    }

    try {
      setLoading(true);
      // Ensure startDate and endDate are sent as YYYY-MM-DD (local)
      const payload = {
        ...leave,
        startDate: toLocalYMD(leave.startDate),
        endDate: toLocalYMD(leave.endDate),
        days: daysCount,
        userId: user._id
      };
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/leave/add`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.data?.success) {
        setShowAlert(true);
        setTimeout(() => navigate(`/employee-dashboard/leaves/${user._id}`), 2000);
      }
    } catch (err) {
      alert(err?.response?.data?.error || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isInsufficient = (leave.leaveType === "Sick Leave" && daysCount > balance.sick) ||
                         (leave.leaveType === "Casual Leave" && daysCount > balance.casual);

  return (
    <div className={`min-h-screen w-full ${PAGE_BG} p-4 text-[#1A1A1D] lg:p-12`} style={bodyFont}>
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}

      <div className="mx-auto max-w-5xl">
        <div className="mb-10 px-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>Registry</p>
          <h1 className="mt-2 text-4xl leading-none" style={{ ...displayFont, fontWeight: 500 }}>
            New Leave <span className="italic" style={{ color: GARNET }}>Application</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

          {/* LEFT PANEL: STATS */}
          <div className="space-y-6 lg:col-span-4">
            <div
              className="relative overflow-hidden rounded-[1.25rem] border p-7 text-white"
              style={{ backgroundColor: CHARCOAL, borderColor: HAIRLINE }}
            >
              <div className="relative z-10">
                <ShieldCheck style={{ color: GOLD }} className="mb-4" size={20} strokeWidth={1.5} />
                <h2 className="text-xl leading-none" style={{ ...displayFont, fontWeight: 500 }}>Registry Terminal</h2>
                <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.28em]" style={{ color: "rgba(246,242,234,0.5)" }}>
                  Active session · {user?.name || "Verified"}
                </p>
              </div>
              <TrendingUp size={140} className="absolute -bottom-8 -right-8 opacity-10" style={{ color: GOLD }} />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Casual Leave Card */}
              <div
                className="rounded-[1.25rem] border bg-white/85 p-6 shadow-[0_1px_2px_rgba(26,26,29,0.04),0_20px_45px_-24px_rgba(26,26,29,0.28)] backdrop-blur-md transition-all duration-300"
                style={{ borderColor: leave.leaveType === "Casual Leave" ? GOLD_HAIRLINE : HAIRLINE }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: SLATE }}>Casual Balance</span>
                  <div className={`h-1.5 w-1.5 rounded-full ${fetchingData ? 'animate-pulse bg-slate-200' : balance.casual > 0 ? '' : 'bg-rose-400'}`} style={!fetchingData && balance.casual > 0 ? { backgroundColor: GOLD } : {}} />
                </div>
                <div className="text-3xl leading-none" style={{ ...displayFont, fontWeight: 500, color: CHARCOAL }}>
                  {fetchingData ? "…" : balance.casual}
                </div>
                <p className="mt-1 text-[9px] font-medium uppercase tracking-wide" style={{ color: SLATE }}>Working days available</p>
              </div>

              {/* Sick Leave Card */}
              <div
                className="rounded-[1.25rem] border bg-white/85 p-6 shadow-[0_1px_2px_rgba(26,26,29,0.04),0_20px_45px_-24px_rgba(26,26,29,0.28)] backdrop-blur-md transition-all duration-300"
                style={{ borderColor: leave.leaveType === "Sick Leave" ? GOLD_HAIRLINE : HAIRLINE }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: SLATE }}>Sick Balance</span>
                  <div className={`h-1.5 w-1.5 rounded-full ${fetchingData ? 'animate-pulse bg-slate-200' : balance.sick > 0 ? '' : 'bg-rose-400'}`} style={!fetchingData && balance.sick > 0 ? { backgroundColor: GOLD } : {}} />
                </div>
                <div className="text-3xl leading-none" style={{ ...displayFont, fontWeight: 500, color: CHARCOAL }}>
                  {fetchingData ? "…" : balance.sick}
                </div>
                <p className="mt-1 text-[9px] font-medium uppercase tracking-wide" style={{ color: SLATE }}>Medical credit available</p>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: FORM */}
          <div
            className="rounded-[1.25rem] border bg-white/80 shadow-[0_1px_2px_rgba(26,26,29,0.04),0_40px_90px_-32px_rgba(26,26,29,0.24)] backdrop-blur-md lg:col-span-8"
            style={{ borderColor: HAIRLINE }}
          >
            <div className="p-8 sm:p-12">
              <div className="mb-10 flex items-end justify-between">
                <h3 className="text-2xl leading-none" style={{ ...displayFont, fontWeight: 500 }}>Application Details</h3>
                <div className="text-right">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: SLATE }}>Total Working Days</p>
                  <p
                    className="text-xl leading-none"
                    style={{ ...displayFont, fontWeight: 500, color: isInsufficient ? "#B4443B" : GOLD }}
                  >
                    {daysCount} Days
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Category Select */}
                <div>
                  <FieldLabel icon={<Briefcase size={13} strokeWidth={1.5} />} label="Leave Category" />
                  <select
                    name="leaveType"
                    value={leave.leaveType}
                    onChange={(e) => setLeave(p => ({...p, leaveType: e.target.value}))}
                    required
                    className="mt-2 w-full cursor-pointer border-b bg-transparent pb-2 text-base outline-none transition-colors"
                    style={{ ...displayFont, fontWeight: 500, borderColor: HAIRLINE, color: CHARCOAL }}
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
                  >
                    <option value="">Select category</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <div>
                    <FieldLabel icon={<Calendar size={13} strokeWidth={1.5} />} label="Start Date" />
                    <input
                      type="date"
                      min={toLocalYMD(new Date())}
                      value={leave.startDate}
                      onChange={(e) => setLeave(p => ({...p, startDate: e.target.value}))}
                      required
                      className="mt-2 w-full border-b bg-transparent pb-2 text-base outline-none transition-colors"
                      style={{ ...displayFont, fontWeight: 500, borderColor: HAIRLINE, color: CHARCOAL }}
                      onFocus={(e) => (e.target.style.borderColor = GOLD)}
                      onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
                    />
                  </div>
                  <div>
                    <FieldLabel icon={<Calendar size={13} strokeWidth={1.5} />} label="End Date" />
                    <input
                      type="date"
                      min={leave.startDate || toLocalYMD(new Date())}
                      value={leave.endDate}
                      onChange={(e) => setLeave(p => ({...p, endDate: e.target.value}))}
                      required
                      className="mt-2 w-full border-b bg-transparent pb-2 text-base outline-none transition-colors"
                      style={{ ...displayFont, fontWeight: 500, borderColor: HAIRLINE, color: CHARCOAL }}
                      onFocus={(e) => (e.target.style.borderColor = GOLD)}
                      onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <FieldLabel icon={<FileText size={13} strokeWidth={1.5} />} label="Justification" />
                  <textarea
                    rows="3"
                    value={leave.reason}
                    onChange={(e) => setLeave(p => ({...p, reason: e.target.value}))}
                    required
                    className="mt-2 w-full resize-none border-b bg-transparent pb-2 text-sm outline-none transition-colors placeholder:italic"
                    style={{ borderColor: HAIRLINE, color: CHARCOAL }}
                    placeholder="Provide context for your leave request…"
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
                  />
                </div>

                {/* Conditional Alerts */}
                {leave.startDate && leave.endDate && (
                  <div className="space-y-3">
                    {daysCount === 0 && (
                      <div
                        className="flex items-center gap-3 rounded-xl border p-4"
                        style={{ borderColor: GOLD_HAIRLINE, backgroundColor: IVORY }}
                      >
                        <AlertTriangle size={16} strokeWidth={1.75} style={{ color: GOLD }} />
                        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#8A6A2E" }}>
                          Range only contains non-working days.
                        </p>
                      </div>
                    )}
                    {isInsufficient && (
                      <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4">
                        <AlertTriangle size={16} strokeWidth={1.75} className="text-rose-500" />
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-700">
                          Requested days exceed available balance.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || daysCount <= 0 || isInsufficient || !leave.leaveType}
                  className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: CHARCOAL }}
                >
                  {loading ? "Transmitting…" : "Submit Application"}
                  <ArrowRight size={16} strokeWidth={1.75} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== SUPPORTING COMPONENTS ===== */

const FieldLabel = ({ icon, label }) => (
  <div className="flex items-center gap-2" style={{ color: GOLD }}>
    {icon}
    <span className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#7A756C" }}>{label}</span>
  </div>
);

export default EmployeeLeaveAdd;