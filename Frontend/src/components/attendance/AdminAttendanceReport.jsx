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
  ArrowLeft,
  Download,
  ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#B8912E";
const HAIRLINE = "#E7E1D3";
const RUST = "#A24A32";

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
  Present: "bg-[#EEF3EE] text-[#3F6B52] border-[#D7E4D9]",
  Absent: "bg-[#FAF1EA] text-[#A24A32] border-[#EAD9CC]",
  Leave: "bg-[#FBF3E3] text-[#9C7A22] border-[#EFE1BF]",
  "Half Day": "bg-[#EFF1F6] text-[#3E5279] border-[#DCE1EE]",
  Unmarked: "bg-[#F1EFE8] text-[#8A8478] border-[#E7E1D3]",
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

/* Scoped scrollbar styling for the table viewport — matches Live Ops */
const ScrollbarStyle = () => (
  <style>{`
    .attendance-table-scroll::-webkit-scrollbar {
      width: 10px;
    }
    .attendance-table-scroll::-webkit-scrollbar-track {
      background: #FBFAF6;
      border-radius: 999px;
    }
    .attendance-table-scroll::-webkit-scrollbar-thumb {
      background-color: ${GOLD};
      background-image: linear-gradient(180deg, ${GOLD}, ${RUST});
      background-clip: padding-box;
      border: 2.5px solid #FBFAF6;
      border-radius: 999px;
    }
    .attendance-table-scroll::-webkit-scrollbar-thumb:hover {
      border-color: #F5EFE0;
    }
    .attendance-table-scroll {
      scrollbar-width: thin;
      scrollbar-color: ${GOLD} #FBFAF6;
    }
  `}</style>
);

const AdminAttendanceReport = () => {
  const today = new Date().toISOString().split("T")[0];
  const currentMonthStr = today.slice(0, 7); // "YYYY-MM"

  const [report, setReport] = useState({});
  const [holidayMap, setHolidayMap] = useState({});
  const [dataFilter, setDataFilter] = useState(today);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPageByDate, setCurrentPageByDate] = useState({});
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Excel export state
  const [monthFilter, setMonthFilter] = useState(currentMonthStr);
  const [exporting, setExporting] = useState(false);

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

  const handlePageSizeChange = (size) => {
    setItemsPerPage(size);
    // reset every date's page back to 1 so the new page size doesn't strand anyone mid-list
    setCurrentPageByDate((prev) => {
      const reset = {};
      Object.keys(prev).forEach((d) => { reset[d] = 1; });
      return reset;
    });
  };

  /* ================= EXCEL EXPORT (FULL MONTH) ================= */
  const exportMonthToExcel = async () => {
    if (!monthFilter) return;
    try {
      setExporting(true);
      const [year, month] = monthFilter.split("-");

      const query = new URLSearchParams();
      query.append("month", month);
      query.append("year", year);
      if (search) query.append("search", search);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance/report?${query.toString()}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (!res.data.success) {
        console.error("Export failed: server returned success=false");
        return;
      }

      const holidays = res.data.holidayMap || {};
      const rows = [];

      // Sort dates chronologically so the sheet reads top-to-bottom by day
      const sortedDates = Object.keys(res.data.groupData || {}).sort();

      sortedDates.forEach((date) => {
        const records = res.data.groupData[date] || [];
        const d = new Date(date);
        const dayOfWeek = d.getDay();
        const isHoliday = !!holidays[date];
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        let offDayLabel = "";
        if (isHoliday) offDayLabel = holidays[date];
        else if (dayOfWeek === 0) offDayLabel = "Sunday (Weekend)";
        else if (dayOfWeek === 6) offDayLabel = "Saturday (Weekend)";

        if (isWeekend || isHoliday) {
          // Still list employees for the off-day, marked clearly, so the
          // sheet has one row per employee per day for the whole month.
          records
            .slice()
            .sort((a, b) => a.employeeId.localeCompare(b.employeeId, undefined, { numeric: true }))
            .forEach((r) => {
              rows.push({
                Date: date,
                "Employee ID": r.employeeId,
                Name: r.employeeName,
                Department: r.departmentName,
                Status: offDayLabel || "Holiday",
                "Worked Hours": 0,
                "Check In": "",
                "Check Out": "",
              });
            });
          return;
        }

        records
          .slice()
          .sort((a, b) => a.employeeId.localeCompare(b.employeeId, undefined, { numeric: true }))
          .forEach((r) => {
            rows.push({
              Date: date,
              "Employee ID": r.employeeId,
              Name: r.employeeName,
              Department: r.departmentName,
              Status: normalizeStatus(r.status),
              "Worked Hours": r.workedHours ?? 0,
              "Check In": r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "",
              "Check Out": r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "",
            });
          });
      });

      if (rows.length === 0) {
        console.warn("No attendance rows found for the selected month.");
      }

      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Reasonable column widths so it's readable without manual resizing
      worksheet["!cols"] = [
        { wch: 12 }, // Date
        { wch: 14 }, // Employee ID
        { wch: 22 }, // Name
        { wch: 18 }, // Department
        { wch: 14 }, // Status
        { wch: 14 }, // Worked Hours
        { wch: 12 }, // Check In
        { wch: 12 }, // Check Out
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
      XLSX.writeFile(workbook, `Attendance_${monthFilter}.xlsx`);
    } catch (error) {
      console.error("Error exporting Excel report:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] pb-20">
      <ScrollbarStyle />
      <div className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-8">

        {/* HEADER */}
        <header className="flex flex-col gap-6 pt-2">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[#8A8478] hover:text-[#B8912E] group w-fit cursor-pointer transition-colors"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-xs uppercase tracking-widest">Go Back</span>
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                    <div
                      className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-[#F6F3EC] shadow-xl shadow-black/10 ring-1 ring-[#B8912E]/20"
                      style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
                    >
                      <FileSpreadsheet size={30} strokeWidth={2} />
                    </div>
                    <div>
                    <h1 className="text-3xl font-black text-[#1C1A17] uppercase tracking-tighter sm:text-4xl leading-none">
                        Report <span className="text-[#B8912E]">Archive</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#8A8478] mt-3">Operational Registry</p>
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
            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white border border-[#E7E1D3] flex-1 md:max-w-[280px] shadow-sm">
              <CalendarDays size={18} className="text-[#B8912E]" />
              <input
                type="date"
                value={dataFilter}
                onChange={(e) => setDataFilter(e.target.value)}
                className="bg-transparent text-[11px] font-black uppercase tracking-widest outline-none w-full text-[#1C1A17]"
              />
            </div>

            <div className="relative flex-1 group shadow-sm">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C9C2AE] group-focus-within:text-[#B8912E] transition-colors" size={18} />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="SEARCH PERSONNEL..."
                className="w-full bg-white border border-[#E7E1D3] rounded-2xl pl-14 pr-6 py-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-[#B8912E] transition-all text-[#1C1A17] placeholder:text-[#C9C2AE]"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 md:px-8 bg-[#1C1A17] text-[#F6F3EC] rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#B8912E] hover:text-[#1C1A17] transition-all py-4 md:py-0 shadow-sm">
                Query
              </button>
              {search && (
                <button onClick={clearSearch} type="button" className="p-4 bg-white border border-[#E7E1D3] text-[#8A8478] rounded-2xl hover:text-[#B8912E] transition-colors shadow-sm">
                  <RotateCcw size={20} />
                </button>
              )}
            </div>
          </form>

          {/* MONTHLY EXCEL EXPORT */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white border border-[#E7E1D3] shadow-sm">
              <CalendarDays size={18} className="text-[#3F6B52]" />
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="bg-transparent text-[11px] font-black uppercase tracking-widest outline-none text-[#1C1A17]"
              />
            </div>
            <button
              type="button"
              onClick={exportMonthToExcel}
              disabled={exporting}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-[#3F6B52] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <Activity size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {exporting ? "Exporting..." : "Download Excel"}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="space-y-6">
          {Object.entries(report).length === 0 && !loading && (
             <div className="py-20 text-center bg-white rounded-[2.5rem] border border-[#E7E1D3] shadow-sm">
                <p className="text-[#8A8478] font-black uppercase tracking-widest text-xs">No records found for the selection</p>
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
            const totalPages = Math.ceil(records.length / itemsPerPage);
            const paginated = records.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

            return (
              <section key={date} className="bg-white rounded-[2.5rem] shadow-sm border border-[#E7E1D3] overflow-hidden">
                {/* DATE STRIP */}
                <div className="bg-[#1C1A17] px-6 sm:px-8 py-4 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8912E] opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B8912E]" />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F6F3EC]">
                      {selectedDate.toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  {isOffDay && (
                    <span className="bg-[#B8912E] text-[9px] font-black px-3 py-1 rounded-lg text-[#1C1A17] uppercase tracking-widest">
                      {offDayLabel}
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4 text-[#D6D0BF]">
                    <Activity className="animate-spin" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#8A8478]">Syncing encrypted logs...</p>
                  </div>
                ) : isOffDay ? (
                  <div className="py-16 flex flex-col items-center text-center px-6">
                    <ShieldAlert size={32} className="text-[#EFE9D8] mb-4" />
                    <h2 className="text-xl font-black uppercase tracking-tighter text-[#1C1A17]">
                      {offDayLabel}
                    </h2>
                    <p className="text-[9px] font-black text-[#8A8478] uppercase tracking-widest mt-1">Registry Inactive for this date</p>
                  </div>
                ) : (
                  <>
                    {/* DESKTOP TABLE — scrollable viewport with sticky header, matches Live Ops */}
                    <div className="hidden md:block px-8 pt-6 pb-2">
                      <div
                        className="relative overflow-hidden rounded-[1.75rem] border shadow-[inset_0_1px_2px_rgba(28,26,23,0.03)]"
                        style={{ borderColor: HAIRLINE, backgroundColor: "#FBFAF6" }}
                      >
                        <div className="attendance-table-scroll max-h-[30rem] overflow-y-auto overflow-x-auto px-3 pb-3 pt-1">
                          <table className="w-full border-separate" style={{ borderSpacing: "0 0.875rem" }}>
                            <thead className="sticky top-0 z-10">
                              <tr className="text-left text-[10.5px] font-black text-[#8A8478] uppercase tracking-[0.28em]">
                                <th className="px-5 py-4 pt-5 font-black" style={{ backgroundColor: "#FBFAF6" }}>
                                  <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Ref</span>
                                </th>
                                <th className="px-5 py-4 pt-5 font-black" style={{ backgroundColor: "#FBFAF6" }}>
                                  <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Personnel</span>
                                </th>
                                <th className="px-5 py-4 pt-5 font-black" style={{ backgroundColor: "#FBFAF6" }}>
                                  <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Department</span>
                                </th>
                                <th className="px-5 py-4 pt-5 text-center font-black" style={{ backgroundColor: "#FBFAF6" }}>
                                  <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Duration</span>
                                </th>
                                <th className="px-5 py-4 pt-5 text-right font-black" style={{ backgroundColor: "#FBFAF6" }}>
                                  <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Status</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginated.map((r, i) => {
                                let status = normalizeStatus(r.status);
                                return (
                                  <tr
                                    key={r.employeeId + i}
                                    className="group relative animate-in fade-in border transition-all duration-300 hover:-translate-y-[3px] hover:border-[#B8912E]/40 hover:shadow-[0_20px_36px_-18px_rgba(28,26,23,0.2)]"
                                    style={{ backgroundColor: "#fff", borderColor: HAIRLINE, animationDelay: `${i * 40}ms`, animationFillMode: "backwards" }}
                                  >
                                    <td className="relative rounded-l-[1.5rem] px-5 py-6 text-[11px] font-black text-[#D6D0BF] transition-colors duration-300 group-hover:text-[#B8912E]">
                                      {/* left accent bar — reveals on hover */}
                                      <span
                                        className="absolute left-0 top-1/2 h-2/3 w-[3px] -translate-y-1/2 rounded-r-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                        style={{ background: `linear-gradient(180deg, ${GOLD}, ${RUST})` }}
                                      />
                                      #{(currentPage - 1) * itemsPerPage + i + 1}
                                    </td>
                                    <td className="px-5 py-6">
                                      <div className="flex flex-col">
                                        <span className="font-black uppercase text-[#1C1A17] group-hover:text-[#B8912E] transition-colors text-base leading-tight">{r.employeeName}</span>
                                        <span className="text-[10px] font-bold text-[#8A8478] uppercase tracking-tight">ID: {r.employeeId}</span>
                                      </div>
                                    </td>
                                    <td className="px-5 py-6 font-black uppercase text-[10px] text-[#8A8478] tracking-wider">
                                      {r.departmentName}
                                    </td>
                                    <td className="px-5 py-6 text-center">
                                      <div className="inline-flex items-center gap-2 font-mono font-black text-[#1C1A17] bg-[#FBFAF6] px-4 py-2 rounded-[1rem] border border-[#E7E1D3]">
                                        <Clock size={14} className="text-[#B8912E]" />
                                        {r.runningTime || hoursToHHMMSS(r.workedHours)}
                                      </div>
                                    </td>
                                    <td className="rounded-r-[1.5rem] px-5 py-6 text-right">
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

                        {/* bottom fade — hints there's more to scroll */}
                        {paginated.length > 4 && (
                          <div
                            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-[1.75rem]"
                            style={{ background: "linear-gradient(180deg, transparent, #FBFAF6)" }}
                          />
                        )}
                      </div>
                    </div>

                    {/* MOBILE CARD VIEW */}
                    <div className="md:hidden p-4 space-y-4">
                      {paginated.map((r, i) => {
                        let status = normalizeStatus(r.status);

                        return (
                          <div key={r.employeeId + i} className="bg-[#FBFAF6] rounded-[1.8rem] p-5 border border-[#E7E1D3] relative overflow-hidden">
                              <div className="flex justify-between items-start mb-4 pl-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-[#1C1A17] flex items-center justify-center text-[#B8912E]">
                                    <User size={18} />
                                  </div>
                                  <div>
                                    <h4 className="font-black uppercase text-[#1C1A17] leading-tight tracking-tight">{r.employeeName}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[9px] font-bold bg-white text-[#8A8478] px-1.5 py-0.5 rounded flex items-center gap-1 border border-[#E7E1D3]">
                                          <Hash size={8}/> {r.employeeId}
                                      </span>
                                      <span className="text-[9px] font-bold bg-white text-[#8A8478] px-1.5 py-0.5 rounded flex items-center gap-1 border border-[#E7E1D3]">
                                          <Briefcase size={8}/> {r.departmentName}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${statusStyles[status] || statusStyles.Unmarked}`}>
                                  {status}
                                </span>
                              </div>

                              <div className="pt-4 border-t border-[#E7E1D3]">
                                  <div className="font-mono font-black text-[#1C1A17] bg-white px-2 py-1 rounded-lg text-xs border border-[#E7E1D3] text-center">
                                      {r.runningTime || hoursToHHMMSS(r.workedHours)}
                                  </div>
                              </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* PAGINATION */}
                    {records.length > 0 && (
                      <div className="flex flex-col items-center gap-4 p-6 sm:p-8 bg-[#FBFAF6] border-t border-[#E7E1D3] sm:flex-row sm:justify-between">
                        {/* Previous */}
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPageByDate(prev => ({ ...prev, [date]: prev[date] - 1 }))}
                            className="order-2 flex h-11 w-full flex-1 items-center justify-center gap-2 sm:gap-3 rounded-2xl bg-white px-4 sm:px-6 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#8A8478] border border-[#E7E1D3] transition-all enabled:hover:text-[#B8912E] enabled:hover:border-[#B8912E]/40 enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed sm:order-1 sm:w-auto sm:flex-none"
                        >
                            <ChevronLeft size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
                            <span>Prev</span>
                        </button>

                        {/* Page Counter — middle */}
                        <div className="order-1 px-7 py-2.5 bg-white rounded-full border border-[#E7E1D3] sm:order-2">
                            <p className="text-[10px] sm:text-[11px] font-black text-[#8A8478] uppercase tracking-widest text-center">
                                Page <span className="text-[#B8912E]">{currentPage}</span>
                                <span className="mx-2 text-[#D6D0BF]">/</span> {totalPages || 1}
                            </p>
                        </div>

                        {/* Right cluster — Next + per-page, grouped as one unit */}
                        <div className="order-3 flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                            <button
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPageByDate(prev => ({ ...prev, [date]: prev[date] + 1 }))}
                                className="flex h-11 flex-1 items-center justify-center gap-2 sm:gap-3 rounded-2xl bg-white px-4 sm:px-6 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#8A8478] border border-[#E7E1D3] transition-all enabled:hover:text-[#B8912E] enabled:hover:border-[#B8912E]/40 enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed sm:flex-none"
                            >
                                <span>Next</span>
                                <ChevronRight size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
                            </button>

                            {/* divider */}
                            <div className="hidden h-6 w-px sm:block" style={{ backgroundColor: HAIRLINE }} />

                            {/* PAGE SIZE SELECTOR */}
                            <div
                                className="flex h-11 shrink-0 items-center gap-2.5 rounded-2xl border bg-white px-3"
                                style={{ borderColor: HAIRLINE }}
                            >
                                <span className="whitespace-nowrap text-[9px] font-black uppercase tracking-widest text-[#C9C2AE]">
                                    Per page
                                </span>
                                <div className="relative">
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                        className="cursor-pointer appearance-none rounded-lg border bg-white py-1.5 pl-3 pr-7 text-[12px] font-black text-[#1C1A17] outline-none transition-all hover:border-[#B8912E]/40 focus:border-[#B8912E]/60"
                                        style={{ borderColor: HAIRLINE }}
                                    >
                                        {PAGE_SIZE_OPTIONS.map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={12}
                                        strokeWidth={2.5}
                                        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#8A8478]"
                                    />
                                </div>
                            </div>
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