import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Search, CalendarDays, FileText, ChevronLeft, ChevronRight, UserCheck, Clock, ShieldAlert, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import AttendanceHelper from "../../utils/AttendanceHelper";

const ITEMS_PER_PAGE = 8; // Increased for a fuller dashboard feel

/* ===== TIMER FORMAT ===== */
const formatTimer = (attendance) => {
  if (!attendance?.checkIn) return "00:00:00";
  const endTime = attendance.checkOut
    ? new Date(attendance.checkOut)
    : attendance.isPaused
    ? new Date(attendance.pauseStartedAt)
    : new Date();

  const diffMs = endTime - new Date(attendance.checkIn) - (attendance.totalPausedMs || 0);
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const getTodayLabel = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSunday, setIsSunday] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState("");

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.success) {
        setIsSunday(res.data.isSunday || false);
        setIsHoliday(res.data.isHoliday || false);
        setHolidayName(res.data.holidayName || "");
        setAttendance(
          res.data.attendance.map((a) => ({
            ...a,
            employeeMongoId: a.employeeId?._id,
            employeeCode: a.employeeId?.employeeId || "N/A",
            name: a.employeeId?.userId?.name || "Unknown",
            department: a.employeeId?.department?.dep_name || "N/A",
            designation: a.employeeId?.designation || "N/A",
            timer: formatTimer(a),
          }))
        );
        setCurrentPage(1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

  const sorted = useMemo(() => {
    return attendance
      .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.employeeCode.localeCompare(b.employeeCode, undefined, { numeric: true }));
  }, [attendance, search]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [sorted, currentPage]);

  useEffect(() => {
    const visibleIds = paginated.map((p) => p._id ?? p.employeeMongoId);
    const interval = setInterval(() => {
      setAttendance((prev) =>
        prev.map((att) => {
          const key = att._id ?? att.employeeMongoId;
          if (!visibleIds.includes(key) || att.isPaused || att.checkOut) return att;
          return { ...att, timer: formatTimer(att) };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [paginated]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 pb-12">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-red-100">
              <Activity size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-red-700 uppercase tracking-tighter sm:text-5xl leading-none italic">
                Attendance
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">
                Live Attendance Intelligence
              </p>
            </div>
          </div>

          <Link
            to="/admin-dashboard/attendance-report"
            className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-[1.5rem] bg-slate-900 px-8 py-5 font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-slate-200 transition-all hover:bg-red-700 active:scale-95 whitespace-nowrap"
          >
            <FileText size={18} strokeWidth={2.5} />
            <span>Archive Reports</span>
          </Link>
        </header>

        {/* SEARCH & DATE BAR */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 bg-white p-5 rounded-[1.5rem] shadow-lg border border-white flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <CalendarDays size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Shift</p>
              <p className="text-[11px] font-black uppercase text-slate-800 truncate">{getTodayLabel()}</p>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white/70 backdrop-blur-2xl rounded-[1.5rem] shadow-lg border border-white flex items-center px-5 focus-within:ring-2 focus-within:ring-red-500/10 transition-all">
            <Search className="text-slate-300" size={20} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="SEARCH PERSONNEL BY NAME..."
              className="w-full py-5 pl-4 outline-none bg-transparent text-[11px] font-black uppercase tracking-widest text-slate-700 placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white overflow-hidden min-h-[500px]">
          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Syncing Live Bio-Data...</p>
            </div>
          ) : isSunday || isHoliday ? (
            <div className="py-40 flex flex-col items-center text-center px-6">
              <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-300 mb-6">
                <ShieldAlert size={40} />
              </div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-800 mb-2">
                {isSunday ? "System Offline" : holidayName}
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Protocol: Weekend Standby</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto px-6 pb-6">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-6 py-4 text-left">Registry</th>
                      <th className="px-6 py-4 text-left">Personnel Identity</th>
                      <th className="px-6 py-4 text-left">Department</th>
                      <th className="px-6 py-4 text-center">Operational Timer</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((a, i) => (
                      <tr key={a.employeeMongoId} className="bg-slate-50/50 hover:bg-red-50/50 transition-all group">
                        <td className="px-6 py-5 first:rounded-l-[1.5rem] text-xs font-black text-slate-300 italic">
                          #{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-black uppercase italic tracking-tighter text-slate-800 leading-none group-hover:text-red-700 transition-colors">
                              {a.name}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">
                              ID: {a.employeeCode}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white border border-slate-100 text-slate-600 rounded-lg shadow-sm">
                            {a.department}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="inline-flex items-center gap-2 font-mono font-black text-lg text-red-600 bg-white px-4 py-1.5 rounded-xl border border-red-50 shadow-sm">
                            <Clock size={14} className="animate-pulse" />
                            {a.timer}
                          </div>
                        </td>
                        <td className="px-6 py-5 last:rounded-r-[1.5rem] text-right">
                          <AttendanceHelper employeeId={a.employeeMongoId} status={a.status} statusChange={fetchAttendance} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE VIEW */}
              <div className="md:hidden p-4 space-y-4">
                {paginated.map((a) => (
                  <div key={a.employeeMongoId} className="bg-white rounded-[2rem] p-6 border border-white shadow-lg space-y-5">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <h4 className="font-black uppercase tracking-tight text-slate-800 italic truncate">{a.name}</h4>
                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1">{a.employeeCode} • {a.department}</p>
                      </div>
                      <div className="bg-slate-900 text-white font-mono font-black px-3 py-1.5 rounded-xl text-xs shadow-lg">
                        {a.timer}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-50 flex justify-center">
                      <AttendanceHelper employeeId={a.employeeMongoId} status={a.status} statusChange={fetchAttendance} />
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="px-8 py-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Live Registry <span className="text-red-600">{currentPage}</span> of {totalPages}
                  </p>
                  
                  <div className="flex gap-3">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 transition-all shadow-sm 
                                 disabled:opacity-20 hover:enabled:text-red-600"
                    >
                      <ChevronLeft size={20} strokeWidth={3} />
                    </button>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="p-3 rounded-xl bg-red-600 text-white transition-all shadow-xl shadow-red-100 
                                 disabled:opacity-20 hover:enabled:bg-red-700"
                    >
                      <ChevronRight size={20} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;