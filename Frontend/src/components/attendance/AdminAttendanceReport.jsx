import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Search,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Clock,
  ShieldAlert,
  RotateCcw,
  Activity,
  User,
  Hash,
  Briefcase,
  ArrowLeft 
} from "lucide-react";
import { useNavigate } from "react-router-dom"; 

const ITEMS_PER_PAGE = 8;

/* ================= STATUS CONFIGURATION ================= */
const normalizeStatus = (status) => {
  if (!status) return "Unmarked";
  const s = status.toString().toLowerCase().replace(/\s+/g, "");
  if (s === "halfday") return "Half Day";
  if (s === "present") return "Present";
  if (s === "leave") return "Leave";
  if (s === "absent") return "Absent";
  return status;
};

const statusStyles = {
  Present: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Absent: "bg-rose-50 text-rose-600 border-rose-100",
  Leave: "bg-amber-50 text-amber-600 border-amber-100",
  "Half Day": "bg-blue-50 text-blue-600 border-blue-100",
  Unmarked: "bg-slate-50 text-slate-400 border-slate-100",
};

/* ================= UTILS ================= */
const formatLiveTimer = (row) => {
  if (!row?.checkIn) return "00:00:00";
  const endTime = row.checkOut
    ? new Date(row.checkOut)
    : row.isPaused
    ? new Date(row.pauseStartedAt)
    : new Date();

  const diffMs = endTime - new Date(row.checkIn) - (row.totalPausedMs || 0);
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const hoursToHHMMSS = (hours) => {
  if (hours == null || isNaN(hours)) return "00:00:00";
  const totalSeconds = Math.floor(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const AdminAttendanceReport = () => {
  const today = new Date().toISOString().split("T")[0];
  const [report, setReport] = useState({});
  const [holidayMap, setHolidayMap] = useState({});
  const [dataFilter, setDataFilter] = useState(today);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPageByDate, setCurrentPageByDate] = useState({});
  
  const navigate = useNavigate(); 

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (dataFilter) query.append("date", dataFilter);
      if (search) query.append("search", search);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance/report?${query.toString()}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (res.data.success) {
        const updated = {};
        const pageState = {};

        Object.entries(res.data.groupData || {}).forEach(([date, rows]) => {
          updated[date] = rows
            .sort((a, b) => a.employeeId.localeCompare(b.employeeId, undefined, { numeric: true }))
            .map((r) => ({
              ...r,
              isLive: date === today && !r.checkOut && r.checkIn,
              runningTime: date === today && r.checkIn ? formatLiveTimer(r) : null,
            }));
          pageState[date] = 1;
        });

        setHolidayMap(res.data.holidayMap || {});
        setCurrentPageByDate(pageState);
        setReport(updated);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  }, [dataFilter, search, today]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Live timer interval
  useEffect(() => {
    const interval = setInterval(() => {
      setReport((prev) => {
        const updated = { ...prev };
        if (updated[today]) {
          updated[today] = updated[today].map((r) =>
            r.isLive ? { ...r, runningTime: formatLiveTimer(r) } : r
          );
        }
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [today]);

  const clearSearch = () => {
    setSearch("");
    setSearchInput("");
    setDataFilter(today);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 pb-20">
      <div className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col gap-6 pt-2">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-red-600 group w-fit cursor-pointer transition-colors"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-xs uppercase tracking-widest">Go Back</span>
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-2xl shadow-red-200">
                    <FileSpreadsheet size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                    <h1 className="text-3xl font-black text-red-800 uppercase tracking-tighter sm:text-4xl leading-none italic">
                        Report <span className="text-slate-900">Archive</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mt-3">Operational Registry</p>
                    </div>
                </div>
            </div>
        </header>

        {/* FILTER BAR */}
        <div className="sticky top-4 z-20 flex flex-col sm:flex-row gap-3">
          <form
            onSubmit={(e) => { e.preventDefault(); setSearch(searchInput.trim()); }}
            className="flex flex-col md:flex-row gap-3 w-full"
          >
            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white border border-slate-100 flex-1 md:max-w-[280px] shadow-md">
              <CalendarDays size={18} className="text-red-600" />
              <input
                type="date"
                value={dataFilter}
                onChange={(e) => setDataFilter(e.target.value)}
                className="bg-transparent text-[11px] font-black uppercase tracking-widest outline-none w-full text-slate-900"
              />
            </div>

            <div className="relative flex-1 group shadow-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-600 transition-colors" size={18} />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="SEARCH PERSONNEL..."
                className="w-full bg-white border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-red-500 transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 md:px-8 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all py-4 md:py-0 shadow-md">
                Query
              </button>
              {search && (
                <button onClick={clearSearch} type="button" className="p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-red-600 transition-colors shadow-md">
                  <RotateCcw size={20} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* CONTENT */}
        <div className="space-y-6">
          {Object.entries(report).length === 0 && !loading && (
             <div className="py-20 text-center bg-white/80 backdrop-blur-3xl rounded-[2.5rem] border border-white shadow-2xl">
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No records found for the selection</p>
             </div>
          )}

          {Object.entries(report).map(([date, records]) => {
            const selectedDate = new Date(date);
            const dayOfWeek = selectedDate.getDay();
            const isSunday = dayOfWeek === 0;
            const isSaturday = dayOfWeek === 6;
            const holidayName = holidayMap[date];
            const isHoliday = !!holidayName;
            const isOffDay = isSunday || isSaturday || isHoliday;
            
            let offDayLabel = "";
            if (isHoliday) offDayLabel = holidayName;
            else if (isSunday) offDayLabel = "Sunday (Weekend)";
            else if (isSaturday) offDayLabel = "Saturday (Weekend)";

            const currentPage = currentPageByDate[date] || 1;
            const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
            const paginated = records.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

            return (
              <section key={date} className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
                {/* DATE STRIP */}
                <div className="bg-slate-900 px-6 sm:px-8 py-4 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                      {selectedDate.toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  {isOffDay && (
                    <span className="bg-red-600 text-[9px] font-black px-3 py-1 rounded-lg text-white uppercase tracking-widest">
                      {offDayLabel}
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-300">
                    <Activity className="animate-spin" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing encrypted logs...</p>
                  </div>
                ) : isOffDay ? (
                  <div className="py-16 flex flex-col items-center text-center px-6">
                    <ShieldAlert size={32} className="text-slate-100 mb-4" />
                    <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">
                      {offDayLabel} 
                    </h2>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Registry Inactive for this date</p>
                  </div>
                ) : (
                  <>
                    {/* DESKTOP TABLE - Styled to match AdminAttendance */}
                    <div className="hidden md:block overflow-x-auto px-8 py-6">
                      <table className="w-full border-separate border-spacing-y-5">
                        <thead>
                          <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                            <th className="px-8 py-4 text-left">Ref</th>
                            <th className="px-8 py-4 text-left">Personnel</th>
                            <th className="px-8 py-4 text-left">Department</th>
                            <th className="px-8 py-4 text-center">Duration</th>
                            <th className="px-8 py-4 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginated.map((r, i) => {
                            let status = normalizeStatus(r.status);
                            return (
                              <tr key={r.employeeId + i} className="bg-slate-50/40 hover:bg-white transition-all group shadow-sm hover:shadow-xl hover:shadow-red-500/5">
                                <td className="px-8 py-6 first:rounded-l-[2rem] text-[11px] font-black text-slate-300 italic">
                                  #{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                </td>
                                <td className="px-8 py-6">
                                  <div className="flex flex-col">
                                    <span className="font-black uppercase italic text-slate-800 group-hover:text-red-700 transition-colors text-base leading-tight">{r.employeeName}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: {r.employeeId}</span>
                                  </div>
                                </td>
                                <td className="px-8 py-6 font-black uppercase text-[10px] text-slate-500 tracking-wider">
                                    {r.departmentName}
                                </td>
                                <td className="px-8 py-6 text-center">
                                  <div className="inline-flex items-center gap-2 font-mono font-black text-red-600 bg-white px-4 py-2 rounded-[1rem] border border-red-100 shadow-sm">
                                    <Clock size={14} className={r.isLive ? "animate-pulse" : ""} />
                                    {r.runningTime || hoursToHHMMSS(r.workedHours)}
                                  </div>
                                </td>
                                <td className="px-8 py-6 last:rounded-r-[2rem] text-right">
                                  <span className={`inline-block px-4 py-2 rounded-[1rem] text-[9px] font-black uppercase tracking-widest border ${statusStyles[status] || statusStyles.Unmarked}`}>
                                    {status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* MOBILE CARD VIEW */}
                    <div className="md:hidden p-4 space-y-4">
                      {paginated.map((r, i) => {
                        let status = normalizeStatus(r.status);

                        return (
                          <div key={r.employeeId + i} className="bg-white rounded-[1.8rem] p-5 shadow-sm border border-slate-100 relative overflow-hidden">
                              <div className="flex justify-between items-start mb-4 pl-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                                    <User size={18} />
                                  </div>
                                  <div>
                                    <h4 className="font-black uppercase italic text-slate-900 leading-tight tracking-tight">{r.employeeName}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                                          <Hash size={8}/> {r.employeeId}
                                      </span>
                                      <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                                          <Briefcase size={8}/> {r.departmentName}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${statusStyles[status] || statusStyles.Unmarked}`}>
                                  {status}
                                </span>
                              </div>
                              
                              <div className="pt-4 border-t border-slate-50">
                                  <div className="font-mono font-black text-red-600 bg-red-50 px-2 py-1 rounded-lg text-xs border border-red-100 text-center">
                                      {r.runningTime || hoursToHHMMSS(r.workedHours)}
                                  </div>
                              </div>
                          </div>
                        );
                      })}
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
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPageByDate(prev => ({ ...prev, [date]: prev[date] - 1 }))}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-2xl bg-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 shadow-sm transition-all enabled:hover:text-red-600 enabled:hover:shadow-md enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
                                <span>Prev</span>
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPageByDate(prev => ({ ...prev, [date]: prev[date] + 1 }))}
                                className="flex-1 sm:flex-none order-3 flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-2xl bg-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 shadow-sm transition-all enabled:hover:text-red-600 enabled:hover:shadow-md enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            >
                                <span>Next</span>
                                <ChevronRight size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
                            </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminAttendanceReport;