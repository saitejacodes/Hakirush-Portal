import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Search, CalendarDays, ChevronLeft, ChevronRight, FileSpreadsheet, Clock, UserCheck, ShieldAlert, RotateCcw } from "lucide-react";

const ITEMS_PER_PAGE = 10;

/* ================= STATUS COLOR HELPERS ================= */
const normalizeStatus = (status) => {
  if (!status) return null;
  const s = status.toString().toLowerCase().replace(/\s+/g, "");
  if (s === "halfday") return "Half Day";
  if (s === "present") return "Present";
  if (s === "leave") return "Leave";
  if (s === "absent") return "Absent";
  return null;
};

const statusConfig = {
  Present: { light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
  Absent: { light: "bg-red-50", text: "text-red-700", border: "border-red-100" },
  Leave: { light: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
  "Half Day": { light: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
};

/* ================= UTILS ================= */
const formatLiveTimer = (row) => {
  if (!row?.checkIn) return "00:00:00";
  const endTime = row.checkOut ? new Date(row.checkOut) : row.isPaused ? new Date(row.pauseStartedAt) : new Date();
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

      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/report?${query.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.success) {
        const updated = {};
        const pageState = {};
        Object.entries(res.data.groupData || {}).forEach(([date, rows]) => {
          updated[date] = rows.sort((a, b) => a.employeeId.localeCompare(b.employeeId, undefined, { numeric: true }))
            .map(r => ({
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
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, [dataFilter, search]);

  useEffect(() => {
    const interval = setInterval(() => {
      setReport(prev => {
        const updated = { ...prev };
        if (updated[today]) {
          updated[today] = updated[today].map(r => r.isLive ? { ...r, runningTime: formatLiveTimer(r) } : r);
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest">
              <FileSpreadsheet size={12} fill="currentColor" /> Intelligence Archive
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-red-950 leading-none">
              Operational <span className="text-red-600">Report</span>
            </h1>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl p-6 mb-8">
          <form 
            onSubmit={(e) => { e.preventDefault(); setSearch(searchInput.trim()); }}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-red-50/50 border border-red-100 text-red-900 min-w-[240px]">
              <CalendarDays size={20} className="text-red-500" />
              <input 
                type="date" 
                value={dataFilter} 
                onChange={(e) => setDataFilter(e.target.value)}
                className="bg-transparent text-xs font-black uppercase tracking-widest outline-none cursor-pointer w-full" 
              />
            </div>

            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-red-300" size={20} />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="SEARCH PERSONNEL BY NAME OR IDENTITY..."
                className="w-full bg-white border-2 border-transparent focus:border-red-500 rounded-2xl pl-14 pr-6 py-4 text-xs font-bold uppercase tracking-wider outline-none transition-all shadow-inner"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95 cursor-pointer">
                Execute Search
              </button>
              {search && (
                <button onClick={clearSearch} type="button" className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200 cursor-pointer">
                  <RotateCcw size={18} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* DATA TABLES */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-md rounded-[3rem] border border-white">
            <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Retrieving Datasets...</p>
          </div>
        ) : Object.keys(report).length === 0 ? (
          <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-20 text-center border border-white">
            <ShieldAlert size={48} className="mx-auto text-red-200 mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">No Operational Records Found For This Parameter</p>
          </div>
        ) : (
          Object.entries(report).map(([date, records]) => {
            const currentPage = currentPageByDate[date] || 1;
            const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
            const paginated = records.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
            const isSunday = new Date(`${date}T00:00:00`).getDay() === 0;
            const holidayName = holidayMap[date];

            return (
              <div key={date} className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white overflow-hidden mb-10">
                {/* DATE STRIP */}
                <div className="bg-red-950 px-8 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-3 text-red-400">
                    <CalendarDays size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                  {holidayName && <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest italic">{holidayName}</span>}
                </div>

                {isSunday || holidayName ? (
                  <div className="p-16 text-center">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-red-950 opacity-20">System Inactive</h3>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">No Logs Recorded On This Cycle</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-red-50">
                            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-red-400">Registry</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-red-400">Personnel Identity</th>
                            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-red-400">Department / Unit</th>
                            <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-widest text-red-400">Time Allocation</th>
                            <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-red-400">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-50/50">
                          {paginated.map((r, i) => {
                            const status = normalizeStatus(r.status);
                            const config = statusConfig[status] || { light: "bg-slate-50", text: "text-slate-400", border: "border-slate-100" };
                            return (
                              <tr key={r.employeeId + i} className="hover:bg-red-50/30 transition-colors">
                                <td className="px-8 py-5 text-xs font-black text-red-950/30 italic">#{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                                <td className="px-8 py-5">
                                  <div>
                                    <p className="text-sm font-black uppercase tracking-tight text-red-950">{r.employeeName}</p>
                                    <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest">ID: {r.employeeId}</p>
                                  </div>
                                </td>
                                <td className="px-8 py-5">
                                  <span className="text-[10px] font-black uppercase text-red-800 bg-white border border-red-50 px-3 py-1 rounded-lg shadow-sm">
                                    {r.departmentName}
                                  </span>
                                </td>
                                <td className="px-8 py-5 text-center">
                                  <div className="inline-flex items-center gap-2 font-mono font-black text-md text-red-600 bg-red-50/50 px-4 py-1.5 rounded-xl border border-red-100">
                                    <Clock size={14} />
                                    {r.runningTime || hoursToHHMMSS(r.workedHours)}
                                  </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                  <span className={`inline-flex px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest italic ${config.light} ${config.text} ${config.border}`}>
                                    {status || "Unmarked"}
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
                      <div className="bg-red-50/50 px-8 py-4 flex items-center justify-between border-t border-red-100">
                         <span className="text-[9px] font-black uppercase tracking-widest text-red-400 italic">Page {currentPage} of {totalPages}</span>
                         <div className="flex gap-2">
                            <button 
                              onClick={() => setCurrentPageByDate(prev => ({ ...prev, [date]: Math.max(currentPage - 1, 1) }))}
                              disabled={currentPage === 1}
                              className="p-2 rounded-xl bg-white border border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all disabled:opacity-30 cursor-pointer shadow-sm"
                            >
                              <ChevronLeft size={18} />
                            </button>
                            <button 
                              onClick={() => setCurrentPageByDate(prev => ({ ...prev, [date]: Math.min(currentPage + 1, totalPages) }))}
                              disabled={currentPage === totalPages}
                              className="p-2 rounded-xl bg-white border border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all disabled:opacity-30 cursor-pointer shadow-sm"
                            >
                              <ChevronRight size={18} />
                            </button>
                         </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminAttendanceReport;