import React, { useEffect, useState, useMemo } from "react";
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
  User
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

  const fetchReport = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, [dataFilter, search]);

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
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-rose-50 pb-12">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-white shadow-xl">
              <FileSpreadsheet size={30} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-red-700 uppercase tracking-tighter sm:text-5xl leading-none italic">
                Attendance Report
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">Operational Archive Registry</p>
            </div>
          </div>
        </header>

        {/* FILTER BAR */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[1.8rem] shadow-xl border border-white p-2 sm:p-3">
          <form
            onSubmit={(e) => { e.preventDefault(); setSearch(searchInput.trim()); }}
            className="flex flex-col md:flex-row gap-2"
          >
            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-red-50/50 border border-red-100 flex-1 md:max-w-[280px]">
              <CalendarDays size={20} className="text-red-500" />
              <input
                type="date"
                value={dataFilter}
                onChange={(e) => setDataFilter(e.target.value)}
                className="bg-transparent text-[11px] font-black uppercase tracking-widest outline-none w-full text-red-900"
              />
            </div>

            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="AUTHENTICATE PERSONNEL IDENTITY..."
                className="w-full bg-white border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-red-500 shadow-sm transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="px-8 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all active:scale-95 shadow-lg">
                Query
              </button>
              {search && (
                <button onClick={clearSearch} type="button" className="p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-red-600 transition-all">
                  <RotateCcw size={20} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* REPORT CONTENT */}
        <div className="space-y-10">
          {Object.entries(report).map(([date, records]) => {
            const selectedDate = new Date(date);
            const isSunday = selectedDate.getDay() === 0;
            const holidayName = holidayMap[date];
            const isHoliday = !!holidayName;

            const currentPage = currentPageByDate[date] || 1;
            const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
            const paginated = records.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

            return (
              <section key={date} className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
                {/* DATE STRIP */}
                <div className="bg-slate-900 px-8 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                      Registry Log: {selectedDate.toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  {isHoliday && <span className="bg-red-600 text-[9px] font-black px-3 py-1 rounded-full text-white uppercase tracking-widest">{holidayName}</span>}
                </div>

                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-300">
                    <Activity className="animate-spin" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Retrieving Encrypted Logs...</p>
                  </div>
                ) : isSunday || isHoliday ? (
                  <div className="py-24 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                      <ShieldAlert size={40} />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-800">
                      {isSunday ? "Weekend Protocol" : "Holiday Standby"}
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Registry Inactive • No Data Ingested</p>
                  </div>
                ) : (
                  <>
                    {/* TABLE VIEW */}
                    <div className="overflow-x-auto p-6">
                      <table className="w-full border-separate border-spacing-y-3">
                        <thead>
                          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <th className="px-6 py-2 text-left">Ref</th>
                            <th className="px-6 py-2 text-left">Personnel</th>
                            <th className="px-6 py-2 text-left">Department</th>
                            <th className="px-6 py-2 text-center">Duty Duration</th>
                            <th className="px-6 py-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginated.map((r, i) => {
                            const status = normalizeStatus(r.status);
                            return (
                              <tr key={r.employeeId + i} className="bg-slate-50/50 hover:bg-red-50/50 transition-all group">
                                <td className="px-6 py-5 first:rounded-l-[1.5rem] text-[10px] font-black text-slate-300 italic">
                                  #{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                </td>
                                <td className="px-6 py-5">
                                  <div className="flex flex-col">
                                    <span className="font-black uppercase italic tracking-tighter text-slate-800 group-hover:text-red-700 transition-colors">
                                      {r.employeeName}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {r.employeeId}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-5 font-black uppercase text-[10px] text-slate-500 tracking-tight">
                                  {r.departmentName}
                                </td>
                                <td className="px-6 py-5 text-center">
                                  <div className="inline-flex items-center gap-2 font-mono font-black text-sm text-red-600 bg-white px-3 py-1 rounded-lg border border-red-50 shadow-sm">
                                    <Clock size={12} className={r.isLive ? "animate-pulse" : ""} />
                                    {r.runningTime || hoursToHHMMSS(r.workedHours)}
                                  </div>
                                </td>
                                <td className="px-6 py-5 last:rounded-r-[1.5rem] text-right">
                                  <span className={`inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusStyles[status] || statusStyles.Unmarked}`}>
                                    {status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* PAGINATION STRIP */}
                    {totalPages > 1 && (
                      <div className="px-8 py-6 bg-slate-50/50 border-t border-white flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Viewing Section <span className="text-red-600">{currentPage}</span> of {totalPages}
                        </p>
                        <div className="flex gap-2">
                          <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPageByDate(prev => ({ ...prev, [date]: prev[date] - 1 }))}
                            className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-600 disabled:opacity-20 transition-all shadow-sm"
                          >
                            <ChevronLeft size={18} strokeWidth={3} />
                          </button>
                          <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPageByDate(prev => ({ ...prev, [date]: prev[date] + 1 }))}
                            className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-red-600 disabled:opacity-20 transition-all shadow-lg"
                          >
                            <ChevronRight size={18} strokeWidth={3} />
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