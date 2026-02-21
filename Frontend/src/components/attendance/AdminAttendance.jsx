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
  const [isSunday, setIsSunday] = useState(false);
  const [isSaturday, setIsSaturday] = useState(false); // NEW STATE
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState("");

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        // Updated to catch the new backend logic
        setIsSunday(res.data.reason === "Sunday"); 
        setIsSaturday(res.data.reason === "Saturday"); // NEW LOGIC
        setIsHoliday(res.data.isOffDay && !["Sunday", "Saturday"].includes(res.data.reason));
        setHolidayName(res.data.reason || "");
        
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
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-6">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-200">
              <Activity size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Live Ops</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Attendance Intelligence</p>
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
        <div className="min-h-[400px]">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Syncing Live Bio-Data...</p>
            </div>
          ) : isSunday || isSaturday || isHoliday ? ( // UPDATED CONDITION
            <div className="py-20 flex flex-col items-center text-center">
              <ShieldAlert size={48} className="text-slate-200 mb-4" />
              <h2 className="text-2xl font-black uppercase text-slate-800 italic">
                {(isSunday || isSaturday) ? "Week OFF" : holidayName}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                Registry Inactive for {holidayName || "Weekend Off"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* DESKTOP VIEW */}
              <div className="hidden md:block bg-white rounded-[2rem] shadow-xl border border-white overflow-hidden">
                <table className="w-full border-separate border-spacing-y-2 px-4">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4 text-left">Ref</th>
                      <th className="px-6 py-4 text-left">Personnel</th>
                      <th className="px-6 py-4 text-center">Timer</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((a, i) => (
                      <tr key={a.employeeMongoId} className="bg-slate-50/50 hover:bg-red-50/30 transition-all group">
                        <td className="px-6 py-4 first:rounded-l-2xl text-[10px] font-bold text-slate-300">#{(currentPage-1)*ITEMS_PER_PAGE+i+1}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-black uppercase italic text-slate-800">{a.name}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">ID: {a.employeeCode} • {a.department}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-2 font-mono font-black text-red-600 bg-white px-3 py-1 rounded-lg border border-red-100">
                            <Clock size={12} className="animate-pulse" /> {a.timer}
                          </div>
                        </td>
                        <td className="px-6 py-4 last:rounded-r-2xl text-right">
                          <AttendanceHelper employeeId={a.employeeMongoId} status={a.status} statusChange={fetchAttendance} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE VIEW */}
              <div className="md:hidden grid grid-cols-1 gap-4">
                {paginated.map((a) => (
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
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="flex-1 flex items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 text-slate-400 disabled:opacity-30 active:scale-95 transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    {currentPage} / {totalPages}
                  </div>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="flex-1 flex items-center justify-center p-4 rounded-2xl bg-slate-900 text-white disabled:opacity-30 active:scale-95 transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>
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