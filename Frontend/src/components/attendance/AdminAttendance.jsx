import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Search, CalendarDays, FileText, ChevronLeft, ChevronRight, Clock, ShieldAlert, Activity, User, Hash, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import AttendanceHelper from "../../utils/AttendanceHelper";

const ITEMS_PER_PAGE = 8;

const formatTimer = (attendance) => {
  if (!attendance?.checkIn) return "00:00:00";
  const endTime = attendance.checkOut ? new Date(attendance.checkOut) : attendance.isPaused ? new Date(attendance.pauseStartedAt) : new Date();
  const diffMs = endTime - new Date(attendance.checkIn) - (attendance.totalPausedMs || 0);
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const getTodayLabel = () => new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [dayStatus, setDayStatus] = useState(""); 
  const [isOffDay, setIsOffDay] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        setIsOffDay(res.data.isOffDay || false);
        setDayStatus(res.data.reason || "");

        const incomingData = res.data.attendance || [];
        
        setAttendance((res.data.attendance || []).map((a) => ({
          ...a,
          employeeMongoId: a.employeeId?._id,
          employeeCode: a.employeeId?.employeeId || "N/A",
          name: a.employeeId?.userId?.name || "Unknown",
          department: a.employeeId?.department?.dep_name || "N/A",
          timer: formatTimer(a),
        })));
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
      setAttendance((prev) => prev.map((att) => {
        const key = att._id ?? att.employeeMongoId;
        if (!visibleIds.includes(key) || att.isPaused || att.checkOut) return att;
        return { ...att, timer: formatTimer(att) };
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [paginated]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 pb-20">
      <div className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-8">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-2xl shadow-red-200">
              <Activity size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-red-800 uppercase tracking-tighter sm:text-4xl leading-none italic">Live Ops</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mt-3">Attendance Intelligence</p>
            </div>
          </div>

          <Link
            to="/admin-dashboard/attendance-report"
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 font-black uppercase text-[10px] tracking-widest text-white shadow-xl hover:bg-red-600 transition-colors"
          >
            <FileText size={16} />
            <span>View Archive</span>
          </Link>
        </header>

        {/* SEARCH & DATE */}
        <div className="sticky top-4 z-20 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center px-4">
            <Search className="text-slate-300" size={18} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="SEARCH PERSONNEL..."
              className="w-full py-4 pl-3 outline-none text-[11px] font-bold uppercase tracking-widest text-slate-700"
            />
          </div>
          <div className="bg-white px-5 py-4 rounded-2xl shadow-md border border-slate-100 flex items-center gap-3 whitespace-nowrap">
            <CalendarDays size={18} className="text-red-600" />
            <span className="text-[11px] font-black uppercase text-slate-800 tracking-tighter">{getTodayLabel()}</span>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="min-h-[400px] bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Syncing Live Bio-Data...</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* --- SPECIAL DAY BANNER --- */}
              {isOffDay && (
                <div className="text-center pt-10 pb-2 px-6">
                  <div className="inline-flex items-center gap-3 bg-red-50 text-red-700 px-6 py-4 rounded-full border border-red-100 shadow-sm">
                    <ShieldAlert size={22} className="text-red-500" />
                    <span className="font-black uppercase tracking-widest text-sm italic">
                      {dayStatus} - System Inactive
                    </span>
                  </div>
                </div>
              )}

              {/* DESKTOP VIEW */}
              <div className="hidden md:block overflow-x-auto px-8 py-6">
                <table className="w-full border-separate border-spacing-y-5">
                  <thead>
                    <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                      <th className="px-8 py-4 text-left">Ref</th>
                      <th className="px-8 py-4 text-left">Personnel</th>
                      <th className="px-8 py-4 text-center">Timer</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length > 0 ? paginated.map((a, i) => (
                      <tr key={a.employeeMongoId} className="bg-slate-50/40 hover:bg-white transition-all group shadow-sm hover:shadow-xl hover:shadow-red-500/5">
                        <td className="px-8 py-6 first:rounded-l-[2rem] text-[11px] font-black text-slate-300 italic">
                            #{(currentPage-1)*ITEMS_PER_PAGE+i+1}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-black uppercase italic text-slate-800 group-hover:text-red-700 transition-colors text-base leading-tight">{a.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: {a.employeeCode} • {a.department}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="inline-flex items-center gap-2 font-mono font-black text-red-600 bg-white px-4 py-2 rounded-[1rem] border border-red-100 shadow-sm">
                            <Clock size={14} className="animate-pulse" /> {a.timer}
                          </div>
                        </td>
                        <td className="px-8 py-6 last:rounded-r-[2rem] text-right">
                          <div className="scale-100 origin-right transition-transform group-hover:scale-105 group-hover:translate-x-[-4px]">
                             <AttendanceHelper employeeId={a.employeeMongoId} status={a.status} statusChange={fetchAttendance} />
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="text-center py-10 text-red-600 font-black uppercase tracking-widest text-xs">
                          {isOffDay && dayStatus
                            ? dayStatus
                            : 'No records found for today.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE VIEW */}
              <div className="md:hidden p-4 space-y-4">
                {paginated.length > 0 ? paginated.map((a) => (
                  <div key={a.employeeMongoId} className="bg-white rounded-[1.8rem] p-5 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 h-full w-1.5 ${a.status === 'present' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <div className="flex justify-between items-start mb-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                          <User size={18} />
                        </div>
                        <div>
                          <h3 className="font-black uppercase italic text-slate-900 leading-tight tracking-tight">{a.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Hash size={8}/> {a.employeeCode}
                            </span>
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Briefcase size={8}/> {a.department}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-slate-300 uppercase mb-1">Live Timer</span>
                        <div className="font-mono font-black text-red-600 bg-red-50 px-2 py-1 rounded-lg text-xs border border-red-100">
                          {a.timer}
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                      <AttendanceHelper employeeId={a.employeeMongoId} status={a.status} statusChange={fetchAttendance} />
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 text-red-600 font-black uppercase tracking-widest text-xs bg-white rounded-2xl shadow-sm border border-slate-100">
                    {isOffDay && dayStatus
                      ? dayStatus
                      : 'No records found for today.'}
                  </div>
                )}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 bg-slate-50/50 border-t border-white gap-4 sm:gap-0">
                  <div className="order-1 sm:order-2 px-6 py-2 bg-white rounded-full border border-slate-100 shadow-inner">
                    <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Page <span className="text-red-600">{currentPage}</span> 
                        <span className="mx-2 text-slate-200">/</span> {totalPages}
                    </p>
                  </div>
                  <div className="order-2 sm:order-1 flex w-full sm:w-auto gap-3 items-center justify-between sm:contents">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-2xl bg-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 shadow-sm transition-all enabled:hover:text-red-600 enabled:hover:shadow-md enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={14} className="sm:w-4 sm:h-4" strokeWidth={3} /> 
                        <span>Prev</span>
                    </button>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex-1 sm:flex-none order-3 flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-2xl bg-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 shadow-sm transition-all enabled:hover:text-red-600 enabled:hover:shadow-md enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                        <span>Next</span>
                        <ChevronRight size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;