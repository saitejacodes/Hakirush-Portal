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
  Hash
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

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
    <div className="min-h-screen bg-white pb-12">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white shadow-xl">
              <FileSpreadsheet size={30} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter sm:text-5xl leading-none italic">
                Report <span className="text-red-600">Archive</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">Operational Registry</p>
            </div>
          </div>
        </header>

        {/* FILTER BAR */}
        <div className="bg-slate-50 rounded-[2rem] border border-slate-100 p-3 shadow-sm">
          <form
            onSubmit={(e) => { e.preventDefault(); setSearch(searchInput.trim()); }}
            className="flex flex-col md:flex-row gap-3"
          >
            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white border border-slate-100 flex-1 md:max-w-[280px]">
              <CalendarDays size={18} className="text-red-600" />
              <input
                type="date"
                value={dataFilter}
                onChange={(e) => setDataFilter(e.target.value)}
                className="bg-transparent text-[11px] font-black uppercase tracking-widest outline-none w-full text-slate-900"
              />
            </div>

            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-600 transition-colors" size={18} />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="SEARCH PERSONNEL..."
                className="w-full bg-white border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-red-500 transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 md:px-8 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all py-4 md:py-0">
                Query
              </button>
              {search && (
                <button onClick={clearSearch} type="button" className="p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-red-600 transition-colors">
                  <RotateCcw size={20} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* CONTENT */}
        <div className="space-y-6">
          {Object.entries(report).length === 0 && !loading && (
             <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No records found for the selection</p>
             </div>
          )}

          {Object.entries(report).map(([date, records]) => {
            const selectedDate = new Date(date);
            const dayOfWeek = selectedDate.getDay();
            
            // LOGIC FOR SATURDAY AND SUNDAY
            const isSunday = dayOfWeek === 0;
            const isSaturday = dayOfWeek === 6;
            const holidayName = holidayMap[date];
            const isHoliday = !!holidayName;

            // COMBINED OFF-DAY CHECK
            const isOffDay = isSunday || isSaturday || isHoliday;
            const offDayLabel = holidayName || (isSunday ? "Sunday" : isSaturday ? "Saturday" : "");

            const currentPage = currentPageByDate[date] || 1;
            const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
            const paginated = records.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

            return (
              <section key={date} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
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
                      {offDayLabel} Registry Idle
                    </h2>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Registry Inactive for this date</p>
                  </div>
                ) : (
                  <>
                    {/* DESKTOP TABLE */}
                    <div className="hidden md:block overflow-x-auto p-6">
                      <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                          <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <th className="px-6 py-2 text-left">Ref</th>
                            <th className="px-6 py-2 text-left">Personnel</th>
                            <th className="px-6 py-2 text-left">Dept</th>
                            <th className="px-6 py-2 text-center">Duration</th>
                            <th className="px-6 py-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginated.map((r, i) => {
                            let status = normalizeStatus(r.status);
                            const isToday = date === today;
                            if (r.checkIn && !r.checkOut && !isToday) {
                              status = "Absent";
                            }
                            return (
                              <tr key={r.employeeId + i} className="bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all group">
                                <td className="px-6 py-4 first:rounded-l-[1.2rem] text-[9px] font-black text-slate-300 italic">
                                  #{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="font-black uppercase italic tracking-tighter text-slate-800 group-hover:text-red-600 transition-colors">{r.employeeName}</span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">ID: {r.employeeId}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-black uppercase text-[9px] text-slate-500">{r.departmentName}</td>
                                <td className="px-6 py-4 text-center">
                                  <div className="inline-flex items-center gap-2 font-mono font-black text-xs text-red-600 bg-white px-3 py-1 rounded-lg border border-slate-100">
                                    <Clock size={10} className={r.isLive ? "animate-pulse" : ""} />
                                    {r.runningTime || hoursToHHMMSS(r.workedHours)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 last:rounded-r-[1.2rem] text-right">
                                  <span className={`inline-block px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${statusStyles[status] || statusStyles.Unmarked}`}>
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
                        const isToday = date === today;
                        if (r.checkIn && !r.checkOut && !isToday) status = "Absent";

                        return (
                          <div key={r.employeeId + i} className="bg-slate-50 rounded-[1.5rem] p-5 border border-slate-100 space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-300 border border-slate-100">
                                  <User size={20} />
                                </div>
                                <div>
                                  <h4 className="font-black uppercase italic text-slate-900 tracking-tighter leading-none">{r.employeeName}</h4>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{r.departmentName}</p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${statusStyles[status] || statusStyles.Unmarked}`}>
                                {status}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-1">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Hash size={8}/> ID</span>
                                <span className="text-[10px] font-black text-slate-900">{r.employeeId}</span>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-1">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={8}/> TIME</span>
                                <span className="text-[10px] font-black text-red-600">{r.runningTime || hoursToHHMMSS(r.workedHours)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                      <div className="px-6 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 hidden sm:block">
                          Section <span className="text-red-600">{currentPage}</span> of {totalPages}
                        </p>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPageByDate(prev => ({ ...prev, [date]: prev[date] - 1 }))}
                            className="flex-1 sm:flex-none p-3 rounded-xl bg-white border border-slate-100 text-slate-400 disabled:opacity-20 shadow-sm transition-all active:scale-95"
                          >
                            <ChevronLeft size={18} className="mx-auto" />
                          </button>
                          <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPageByDate(prev => ({ ...prev, [date]: prev[date] + 1 }))}
                            className="flex-1 sm:flex-none p-3 rounded-xl bg-slate-900 text-white disabled:opacity-20 shadow-lg transition-all active:scale-95"
                          >
                            <ChevronRight size={18} className="mx-auto" />
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