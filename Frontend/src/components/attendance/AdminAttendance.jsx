import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Search, CalendarDays, FileText, ChevronLeft, ChevronRight, ChevronDown, Clock, ShieldAlert, Activity, User, Hash, Briefcase, MessageSquareText } from "lucide-react";
import { Link } from "react-router-dom";
import AttendanceHelper from "../../utils/AttendanceHelper";

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#B8912E";
const HAIRLINE = "#E7E1D3";
const SAGE = "#3F6B52";
const RUST = "#A24A32";

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

const normalizeStatus = (status) => {
  if (status === null || status === undefined || status === "") return "";
  return status.toString().toLowerCase().replace(/\s+/g, "");
};

const getTodayLabel = () => new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });

/* Scoped scrollbar styling for the table viewport */
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

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

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

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance-request`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { status: "Pending" },
      })
      .then((res) => { if (res.data?.success) setPendingRequestCount(res.data.requests.length); })
      .catch(() => {});
  }, []);

  // Manual status changes go through AttendanceHelper -> PUT /api/attendance/update/:employeeId
  // (the single admin manual-status contract; POST /api/attendance/admin-mark does not exist).

  useEffect(() => { fetchAttendance(); }, []);

  const sorted = useMemo(() => {
    return attendance
      .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.employeeCode.localeCompare(b.employeeCode, undefined, { numeric: true }));
  }, [attendance, search]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = useMemo(() => sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [sorted, currentPage, itemsPerPage]);

  const handlePageSizeChange = (size) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const presentCount = useMemo(
    () => attendance.filter((a) => normalizeStatus(a.status) === "present").length,
    [attendance]
  );

  const absentCount = useMemo(
    () => attendance.filter((a) => normalizeStatus(a.status) === "absent").length,
    [attendance]
  );

  const leaveCount = useMemo(
    () => attendance.filter((a) => normalizeStatus(a.status) === "leave").length,
    [attendance]
  );

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
    <div className="min-h-screen bg-[#F6F3EC] pb-20">
      <ScrollbarStyle />
      <div className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-8">

        {/* HEADER SECTION */}
        <header className="flex flex-col gap-6 pt-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-[#1C1A17] flex items-center justify-center text-[#B8912E] shadow-xl shadow-black/10 ring-1 ring-[#B8912E]/20">
              <Activity size={30} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl font-black text-[#1C1A17] uppercase tracking-tighter sm:text-4xl leading-none">Live Ops</h1>
                <span className="relative flex h-2.5 w-2.5 mt-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8912E] opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#B8912E]" />
                </span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#8A8478] mt-3">Attendance Intelligence</p>
            </div>
          </div>

          {/* SNAPSHOT — quiet stat strip */}
          {!loading && attendance.length > 0 && (
            <div className="grid grid-cols-2 gap-3 self-stretch lg:flex lg:items-stretch lg:self-auto">
              <div
                className="flex flex-col justify-center rounded-2xl border bg-white px-5 py-3 lg:px-6"
                style={{ borderColor: HAIRLINE }}
              >
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#C9C2AE]">Personnel</p>
                <p className="text-xl font-black tracking-tight text-[#1C1A17]">
                  {attendance.length}
                </p>
              </div>
              <div
                className="flex flex-col justify-center rounded-2xl border bg-white px-5 py-3 lg:px-6"
                style={{ borderColor: HAIRLINE }}
              >
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#C9C2AE]">Present Today</p>
                <p className="text-xl font-black tracking-tight" style={{ color: SAGE }}>
                  {presentCount}
                </p>
              </div>
              <div
                className="flex flex-col justify-center rounded-2xl border bg-white px-5 py-3 lg:px-6"
                style={{ borderColor: HAIRLINE }}
              >
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#C9C2AE]">Absent</p>
                <p className="text-xl font-black tracking-tight" style={{ color: RUST }}>
                  {absentCount}
                </p>
              </div>
              <div
                className="flex flex-col justify-center rounded-2xl border bg-white px-5 py-3 lg:px-6"
                style={{ borderColor: HAIRLINE }}
              >
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#C9C2AE]">On Leave</p>
                <p className="text-xl font-black tracking-tight" style={{ color: GOLD }}>
                  {leaveCount}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/admin-dashboard/attendance-requests"
              className="relative flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-black uppercase text-[10px] tracking-widest text-[#1C1A17] border border-[#E7E1D3] shadow-sm hover:border-[#B8912E]/40 transition-all"
            >
              <MessageSquareText size={16} />
              <span>Review Requests</span>
              {pendingRequestCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#A24A32] text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {pendingRequestCount}
                </span>
              )}
            </Link>

            <Link
              to="/admin-dashboard/attendance-report"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#1C1A17] px-6 py-4 font-black uppercase text-[10px] tracking-widest text-[#F6F3EC] shadow-md hover:bg-[#B8912E]"
              style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
            >
              <FileText size={16} />
              <span>View Archive</span>
            </Link>
          </div>
        </header>

        {/* SEARCH & DATE */}
        <div className="sticky top-4 z-20 flex flex-col sm:flex-row gap-3">
          <div 
          className="flex-1 bg-white rounded-2xl border border-[#E7E1D3] shadow-sm flex items-center px-4 focus-within:ring-1 focus-within:ring-[#B8912E]/50 transition-shadow">
            <Search className="text-[#C9C2AE]" size={18} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="SEARCH PERSONNEL..."
              className="w-full py-4 pl-3 outline-none bg-transparent text-[11px] font-bold uppercase tracking-widest text-[#1C1A17] placeholder:text-[#C9C2AE]"
            />
          </div>
          <div className="bg-white px-5 py-4 rounded-2xl border border-[#E7E1D3] shadow-sm flex items-center gap-3 whitespace-nowrap">
            <CalendarDays size={18} className="text-[#B8912E]" />
            <span className="text-[11px] font-black uppercase text-[#1C1A17] tracking-tighter">{getTodayLabel()}</span>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="min-h-[400px] bg-white rounded-[2.5rem] shadow-sm border border-[#E7E1D3] overflow-hidden">
          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-[#EFE9D8] border-t-[#B8912E] rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase text-[#8A8478] tracking-widest">Syncing Live Bio-Data...</p>
            </div>
          ) : (
            <div className="space-y-4">

              {/* --- SPECIAL DAY BANNER --- */}
              {isOffDay && (
                <div className="text-center pt-10 pb-2 px-6">
                  <div className="inline-flex items-center gap-3 bg-[#FAF1EA] text-[#A24A32] px-6 py-4 rounded-full border border-[#EAD9CC] shadow-sm">
                    <ShieldAlert size={22} className="text-[#A24A32]" />
                    <span className="font-black uppercase tracking-widest text-sm">
                      {dayStatus} - System Inactive
                    </span>
                  </div>
                </div>
              )}

              {/* DESKTOP VIEW — scrollable viewport with sticky header */}
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
                          <th className="px-5 py-4 pt-5 text-center font-black" style={{ backgroundColor: "#FBFAF6" }}>
                            <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Timer</span>
                          </th>
                          <th className="px-5 py-4 pt-5 text-right font-black" style={{ backgroundColor: "#FBFAF6" }}>
                            <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.length > 0 ? paginated.map((a, i) => (
                          <tr
                            key={a.employeeMongoId}
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
                                <span className="font-black uppercase text-[#1C1A17] group-hover:text-[#B8912E] transition-colors text-base leading-tight">{a.name}</span>
                                <span className="text-[10px] font-bold text-[#8A8478] uppercase tracking-tight">ID: {a.employeeCode} • {a.department}</span>
                              </div>
                            </td>
                            <td className="px-5 py-6 text-center">
                              <div className="inline-flex items-center gap-2 font-mono font-black text-[#1C1A17] bg-[#FBFAF6] px-4 py-2 rounded-[1rem] border border-[#E7E1D3]">
                                <Clock size={14} className="text-[#B8912E]" /> {a.timer}
                              </div>
                            </td>
                            <td className="rounded-r-[1.5rem] px-5 py-6 text-right">
                              <div className="origin-right scale-105 opacity-90 transition-all group-hover:opacity-100">
                                <AttendanceHelper
                                  employeeId={a.employeeMongoId}
                                  status={a.status}
                                  statusChange={fetchAttendance}
                                  checkIn={a.checkIn}
                                  checkOut={a.checkOut}
                                />
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="4" className="text-center py-10 text-[#8A8478] font-black uppercase tracking-widest text-xs">
                              {isOffDay && dayStatus
                                ? dayStatus
                                : 'No records found for today.'}
                            </td>
                          </tr>
                        )}
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

              {/* MOBILE VIEW */}
              <div className="md:hidden p-4 space-y-4">
                {paginated.length > 0 ? paginated.map((a) => (
                  <div key={a.employeeMongoId} className="bg-[#FBFAF6] rounded-[1.8rem] p-5 border border-[#E7E1D3] relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full w-1.5"
                      style={{
                        backgroundColor:
                          normalizeStatus(a.status) === "present"
                            ? SAGE
                            : normalizeStatus(a.status) === "leave"
                              ? GOLD
                              : RUST,
                      }}
                    />
                    <div className="flex justify-between items-start mb-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1C1A17] flex items-center justify-center text-[#B8912E]">
                          <User size={18} />
                        </div>
                        <div>
                          <h3 className="font-black uppercase text-[#1C1A17] leading-tight tracking-tight">{a.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold bg-white text-[#8A8478] px-1.5 py-0.5 rounded flex items-center gap-1 border border-[#E7E1D3]">
                                <Hash size={8}/> {a.employeeCode}
                            </span>
                            <span className="text-[9px] font-bold bg-white text-[#8A8478] px-1.5 py-0.5 rounded flex items-center gap-1 border border-[#E7E1D3]">
                                <Briefcase size={8}/> {a.department}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-[#C9C2AE] uppercase mb-1">Live Timer</span>
                        <div className="font-mono font-black text-[#1C1A17] bg-white px-2 py-1 rounded-lg text-xs border border-[#E7E1D3]">
                          {a.timer}
                        </div>
                      </div>
                    </div>
                    <AttendanceHelper
                      employeeId={a.employeeMongoId}
                      status={a.status}
                      statusChange={fetchAttendance}
                      checkIn={a.checkIn}
                      checkOut={a.checkOut}
                    />
                  </div>
                )) : (
                  <div className="text-center py-10 text-[#8A8478] font-black uppercase tracking-widest text-xs bg-[#FBFAF6] rounded-2xl border border-[#E7E1D3]">
                    {isOffDay && dayStatus
                      ? dayStatus
                      : 'No records found for today.'}
                  </div>
                )}
              </div>

              {/* PAGINATION */}
              {sorted.length > 0 && (
                <div className="flex flex-col items-center gap-4 p-6 sm:p-8 bg-[#FBFAF6] border-t border-[#E7E1D3] sm:flex-row sm:justify-between">
                  {/* Previous */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
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
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages || totalPages === 0}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;