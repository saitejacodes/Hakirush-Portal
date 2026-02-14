import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Search, CalendarDays, FileText, ChevronLeft, ChevronRight, UserCheck, Clock, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import AttendanceHelper from "../../utils/AttendanceHelper";

const ITEMS_PER_PAGE = 6;

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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest">
              <UserCheck size={12} fill="currentColor" /> Live Operations
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-red-950 leading-none">
              Attendance <span className="text-red-600">Terminal</span>
            </h1>
          </div>
          
          <Link
            to="/admin-dashboard/attendance-report"
            className="group flex items-center gap-3 bg-red-950 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-xl shadow-red-900/20 active:scale-95"
          >
            <FileText size={16} className="text-red-400 group-hover:text-white transition-colors" />
            Archive Reports
          </Link>
        </div>

        {/* SEARCH & DATE BAR */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl p-4 md:p-6 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-red-50/50 border border-red-100 text-red-900 min-w-[240px]">
            <CalendarDays size={20} className="text-red-500" />
            <span className="text-xs font-black uppercase tracking-widest">{getTodayLabel()}</span>
          </div>

          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-red-300" size={20} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="ENCRYPTED SEARCH: ENTER EMPLOYEE NAME..."
              className="w-full bg-white border-2 border-transparent focus:border-red-500 rounded-2xl pl-14 pr-6 py-4 text-xs font-bold uppercase tracking-wider outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="relative bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white overflow-hidden min-h-[400px]">
          
          {loading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Syncing Bio-Data...</p>
             </div>
          ) : isSunday || isHoliday ? (
            <div className="p-20 flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-[2rem] bg-red-50 flex items-center justify-center text-red-600 shadow-inner">
                <ShieldAlert size={48} strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-red-950">
                  {isSunday ? "Weekend Protocol" : holidayName}
                </h2>
                <p className="text-xs font-bold text-red-400 uppercase tracking-[0.3em]">System Standby • No Active Attendance</p>
              </div>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-red-50">
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-red-400">Registry</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-red-400">Personnel Identity</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-red-400">Department / Unit</th>
                      <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-widest text-red-400">Operational Time</th>
                      <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-red-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-50/50">
                    {paginated.map((a, i) => (
                      <tr key={a.employeeMongoId} className="hover:bg-red-50/30 transition-colors group">
                        <td className="px-8 py-5">
                          <span className="text-xs font-black text-red-950/40 italic">#{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div>
                            <p className="text-sm font-black uppercase tracking-tight text-red-950">{a.name}</p>
                            <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest">ID: {a.employeeCode}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-red-50 shadow-sm">
                            <span className="text-[10px] font-black uppercase text-red-800">{a.department}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <div className="inline-flex items-center gap-2 font-mono font-black text-lg text-red-600 bg-red-50 px-4 py-1 rounded-xl">
                            <Clock size={14} />
                            {a.timer}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <AttendanceHelper employeeId={a.employeeMongoId} status={a.status} statusChange={fetchAttendance} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="md:hidden p-6 space-y-4">
                {paginated.map((a) => (
                  <div key={a.employeeMongoId} className="bg-white rounded-3xl p-6 border border-red-50 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black uppercase tracking-tight text-red-950">{a.name}</h4>
                        <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest">{a.employeeCode} • {a.department}</p>
                      </div>
                      <div className="bg-red-950 text-white font-mono font-black px-3 py-1 rounded-lg text-xs">
                        {a.timer}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-red-50 flex justify-center">
                      <AttendanceHelper employeeId={a.employeeMongoId} status={a.status} statusChange={fetchAttendance} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* FOOTER / PAGINATION */}
          {!isSunday && !isHoliday && totalPages > 1 && (
            <div className="p-8 bg-red-950 flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-[9px] font-bold text-red-400/50 uppercase tracking-[0.3em]">
                Authorized Terminal • Showing {paginated.length} Assets
              </p>
              
              <div className="flex items-center gap-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-3 rounded-xl bg-white/5 text-red-400 hover:bg-white/10 disabled:opacity-20 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">
                  Level <span className="text-red-500">{currentPage}</span> / {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-3 rounded-xl bg-white/5 text-red-400 hover:bg-white/10 disabled:opacity-20 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;