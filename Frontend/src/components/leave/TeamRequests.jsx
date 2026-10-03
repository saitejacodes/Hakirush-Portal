import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { Eye, ChevronLeft, ChevronRight, ChevronDown, Search, ClipboardList, Calendar, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ===== STYLES & HELPERS ===== */
const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#B8912E";
const HAIRLINE = "#E7E1D3";
const RUST = "#A24A32";

const STATUS_THEME = {
  approved: "text-[#3F6B52] bg-[#EEF3EE] border-[#D7E4D9] shadow-sm",
  pending: "text-[#9C7A22] bg-[#FBF3E3] border-[#EFE1BF] shadow-sm",
  rejected: "text-[#A24A32] bg-[#FAF1EA] border-[#EAD9CC] shadow-sm",
  default: "text-[#8A8478] bg-[#F1EFE8] border-[#E7E1D3]",
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
  });
};

/* ===== UPDATED NET DAYS CALCULATOR HELPER ===== */
const toLocalYMD = (dateInput) => {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const calculateNetDays = (startDate, endDate, holidays) => {
  if (!startDate || !endDate) return 0;
  let count = 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  let current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const holidayStrings = holidays.map(h => toLocalYMD(h.date));
  while (current <= last) {
    const dateStr = toLocalYMD(current);
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayStrings.includes(dateStr)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};

/* ===== MONTH HELPERS ===== */
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
const isCurrentMonth = (d) => {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};
const monthLabel = (d) => d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
/* Leave "belongs" to the selected month if its range overlaps that month at all */
const leaveOverlapsMonth = (leave, monthStart, monthEnd) => {
  if (!leave.startDate || !leave.endDate) return false;
  const s = new Date(leave.startDate);
  const e = new Date(leave.endDate);
  return s <= monthEnd && e >= monthStart;
};

/* Scoped scrollbar styling for the table viewport */
const ScrollbarStyle = () => (
  <style>{`
    .leave-table-scroll::-webkit-scrollbar {
      width: 10px;
    }
    .leave-table-scroll::-webkit-scrollbar-track {
      background: #FBFAF6;
      border-radius: 999px;
    }
    .leave-table-scroll::-webkit-scrollbar-thumb {
      background-color: ${GOLD};
      background-image: linear-gradient(180deg, ${GOLD}, ${RUST});
      background-clip: padding-box;
      border: 2.5px solid #FBFAF6;
      border-radius: 999px;
    }
    .leave-table-scroll::-webkit-scrollbar-thumb:hover {
      border-color: #F5EFE0;
    }
    .leave-table-scroll {
      scrollbar-width: thin;
      scrollbar-color: ${GOLD} #FBFAF6;
    }
  `}</style>
);

/* ===== MOBILE CARD ===== */
const MobileLeaveCard = ({ leave, index, handleView }) => {
  const statusKey = leave.status?.toLowerCase() || "default";
  const style = STATUS_THEME[statusKey] || STATUS_THEME.default;

  return (
    <div className="bg-white rounded-[1.5rem] shadow-sm border border-[#E7E1D3] p-6 transition-all active:scale-[0.98]">
      <div className="flex justify-between items-start mb-4">
        <div>
           <p className="text-[9px] font-black uppercase tracking-widest text-[#B8912E] mb-1">
             LOG #{index + 1}
           </p>
           <h4 className="font-black text-[#1C1A17] uppercase tracking-tighter text-xl">
             {leave.leaveType}
           </h4>
           <p className="text-[10px] font-bold text-[#8A8478] uppercase tracking-widest mt-1">
             {leave.name} ({leave.employeeId})
           </p>
        </div>
        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${style}`}>
          {leave.status}
        </span>
      </div>

      <div className="bg-[#FBFAF6] rounded-2xl p-4 mb-4 border border-[#E7E1D3]">
        <div className="flex items-center gap-2 text-[#8A8478] text-[10px] font-bold uppercase tracking-tight">
          <Calendar size={14} className="text-[#B8912E]" />
          {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
        </div>
      </div>

      <div className="flex justify-between items-end pt-4 border-t border-[#F1EFE8]">
        <div className="max-w-[60%]">
          <p className="text-[11px] font-medium text-[#8A8478] truncate">{leave.department || "No department"}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-[#1C1A17] leading-none">{leave.days}</p>
          <p className="text-[8px] font-black uppercase text-[#8A8478] tracking-widest mt-1">Days</p>
        </div>
      </div>

      <button
        onClick={() => handleView(leave._id)}
        className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1C1A17] text-[#F6F3EC] text-[10px] font-bold uppercase tracking-widest hover:bg-[#B8912E] hover:text-[#1C1A17] transition-all duration-300 active:scale-95 cursor-pointer"
      >
        <Eye size={14} /> Open Dossier
      </button>
    </div>
  );
};

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

const TeamRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));

  // Navigate to LeaveDetails component for manager
  const handleView = (id) => navigate(`/employee-dashboard/team-requests/${id}`);

  const goToPrevMonth = () => {
    setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const goToCurrentMonth = () => {
    setSelectedMonth(startOfMonth(new Date()));
  };

  const fetchLeavesAndHolidays = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

      // FETCH FROM /api/leave/team/requests for Manager
      const [leaveRes, holidayRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/leave/team/requests`, { headers }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/all`, { headers })
      ]);

      if (leaveRes.data.success) {
        const holidays = holidayRes.data.holidays || [];

        const data = (leaveRes.data.leaves || [])
          .filter((leave) => leave.employeeId)
          .map((leave) => {
            const displayDays = calculateNetDays(leave.startDate, leave.endDate, holidays);

            return {
              _id: leave._id,
              employeeId: leave.employeeId?.employeeId || "N/A",
              name: leave.employeeId?.userId?.name || "N/A",
              leaveType: leave.leaveType,
              department: leave.employeeId?.department?.dep_name || "N/A",
              days: displayDays,
              status: leave.status,
              startDate: leave.startDate,
              endDate: leave.endDate,
              reason: leave.reason
            };
          });
        setLeaves(data);
        setFilteredLeaves(data);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeavesAndHolidays(); }, []);

  const monthStart = useMemo(() => startOfMonth(selectedMonth), [selectedMonth]);
  const monthEnd = useMemo(() => endOfMonth(selectedMonth), [selectedMonth]);

  useEffect(() => {
    let result = leaves.filter((l) => leaveOverlapsMonth(l, monthStart, monthEnd));
    if (statusFilter !== "All") result = result.filter((l) => l.status === statusFilter);
    if (search.trim()) result = result.filter((l) => l.employeeId.toLowerCase().includes(search.toLowerCase()));
    setFilteredLeaves(result);
    setCurrentPage(1);
  }, [search, statusFilter, leaves, monthStart, monthEnd]);

  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const currentItems = filteredLeaves.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageSizeChange = (size) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const monthLeaves = useMemo(
    () => leaves.filter((l) => leaveOverlapsMonth(l, monthStart, monthEnd)),
    [leaves, monthStart, monthEnd]
  );

  const pendingCount = useMemo(
    () => monthLeaves.filter((l) => l.status === "Pending").length,
    [monthLeaves]
  );
  const approvedCount = useMemo(
    () => monthLeaves.filter((l) => l.status === "Approved").length,
    [monthLeaves]
  );
  const rejectedCount = useMemo(
    () => monthLeaves.filter((l) => l.status === "Rejected").length,
    [monthLeaves]
  );

  return (
    <div className="min-h-screen bg-[#F6F3EC] pb-12">
      <ScrollbarStyle />
      <div className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-6">

        {/* HEADER */}
        <header className="flex items-center gap-6 pt-2">
          <div
            className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-[#F6F3EC] shadow-xl shadow-black/10 ring-1 ring-[#B8912E]/20 shrink-0"
            style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
          >
            <ClipboardList size={30} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1C1A17] uppercase tracking-tighter sm:text-4xl leading-none">
              Team<span className="text-[#B8912E]"> Requests</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#8A8478] mt-3">
              Approve or Reject Leaves for Your Department
            </p>
          </div>
        </header>

        {/* MONTH COMMAND BAR */}
        <div
          className="relative overflow-hidden rounded-[2rem] p-6 shadow-[0_24px_48px_-20px_rgba(28,26,23,0.45)] sm:rounded-[2.5rem] sm:p-8"
          style={{ background: `linear-gradient(135deg, ${INK} 0%, ${GARNET} 78%)` }}
        >
          {/* decorative glow accents */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-30 blur-3xl" style={{ backgroundColor: GOLD }} />
          <div className="pointer-events-none absolute -bottom-28 -left-16 h-56 w-56 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: GOLD }} />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            {/* LEFT — month identity + navigation */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[#1C1A17] shadow-lg"
                style={{ background: `linear-gradient(155deg, ${GOLD} 0%, #E4C878 100%)` }}
              >
                <CalendarClock size={20} strokeWidth={2.25} />
              </div>

              <div>
                <p className="text-[7px] font-black uppercase tracking-[0.4em]" style={{ color: "#E4C878" }}>
                  Viewing Period
                </p>
                <p className="mt-1.5 text-xl font-black uppercase leading-none tracking-tight text-white sm:text-2xl">
                  {monthLabel(selectedMonth)}
                </p>
                <p className="mt-2 text-[8px] font-bold uppercase tracking-widest text-white/50">
                  {formatDate(monthStart)} — {formatDate(monthEnd)}
                </p>
              </div>

              {/* nav controls */}
              <div className="flex items-center gap-2 sm:ml-2">
                <button
                  onClick={goToPrevMonth}
                  aria-label="Previous month"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-all duration-200 hover:border-white/30 hover:bg-white/20 active:scale-90"
                >
                  <ChevronLeft size={15} strokeWidth={2.5} />
                </button>

                {!isCurrentMonth(selectedMonth) ? (
                  <button
                    onClick={goToCurrentMonth}
                    className="flex h-8 items-center justify-center whitespace-nowrap rounded-xl px-4 text-[7px] font-black uppercase tracking-widest text-[#1C1A17] shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                    style={{ background: `linear-gradient(155deg, ${GOLD} 0%, #E4C878 100%)` }}
                  >
                    Jump to Today
                  </button>
                ) : (
                  <span className="flex h-8 items-center gap-1.5 whitespace-nowrap rounded-xl border border-white/15 bg-white/10 px-4 text-[7px] font-black uppercase tracking-widest text-white/70">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: GOLD }} />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: GOLD }} />
                    </span>
                    Current
                  </span>
                )}

                <button
                  onClick={goToNextMonth}
                  aria-label="Next month"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-all duration-200 hover:border-white/30 hover:bg-white/20 active:scale-90"
                >
                  <ChevronRight size={15} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* RIGHT — quiet stat readout */}
            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-stretch sm:gap-3">
              <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-1 backdrop-blur-sm">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/45">Total Logs</p>
                <p className="text-xl font-black tracking-tight text-white">{monthLeaves.length}</p>
              </div>
              <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-1 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#F0C869" }} />
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/45">Pending</p>
                </div>
                <p className="text-xl font-black tracking-tight" style={{ color: "#F0C869" }}>{pendingCount}</p>
              </div>
              <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-1 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#7FC79A" }} />
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/45">Approved</p>
                </div>
                <p className="text-xl font-black tracking-tight" style={{ color: "#7FC79A" }}>{approvedCount}</p>
              </div>
              <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-1 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#E38268" }} />
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/45">Rejected</p>
                </div>
                <p className="text-xl font-black tracking-tight" style={{ color: "#E38268" }}>{rejectedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#E7E1D3] p-5">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C9C2AE] group-focus-within:text-[#B8912E] transition-colors" size={15} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH EMPLOYEE ID..."
                className="w-full bg-[#F6F3EC] border-2 border-transparent rounded-[1.5rem] pl-14 pr-6 py-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-[#B8912E]/30 focus:bg-white transition-all text-[#1C1A17] placeholder:text-[#C9C2AE]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 px-1">
              {["All", "Pending", "Approved", "Rejected"].map((item) => (
                <button
                  key={item}
                  onClick={() => setStatusFilter(item)}
                  style={statusFilter === item ? { background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` } : undefined}
                  className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                    statusFilter === item
                      ? "text-[#F6F3EC] border border-transparent shadow-lg"
                      : "bg-white text-[#8A8478] border border-[#E7E1D3] hover:border-[#B8912E]/40 hover:text-[#B8912E] cursor-pointer"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#E7E1D3] overflow-hidden mt-4">
          {loading ? (
            <div className="p-24 text-center">
              <div className="w-12 h-12 border-4 border-[#EFE9D8] border-t-[#B8912E] rounded-full animate-spin mx-auto mb-5"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8A8478]">Syncing Records...</p>
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="lg:hidden p-4 space-y-4">
                {currentItems.length > 0 ? (
                    currentItems.map((leave, i) => (
                        <MobileLeaveCard key={leave._id} leave={leave} index={(currentPage - 1) * itemsPerPage + i} handleView={handleView} />
                    ))
                ) : (
                    <p className="text-center py-10 text-[#8A8478] font-bold uppercase text-[10px]">No records match criteria</p>
                )}
              </div>

              {/* DESKTOP TABLE — scrollable viewport with sticky header */}
              <div className="hidden lg:block px-8 pt-6 pb-2">
                <div
                  className="relative overflow-hidden rounded-[1.75rem] border shadow-[inset_0_1px_2px_rgba(28,26,23,0.03)]"
                  style={{ borderColor: HAIRLINE, backgroundColor: "#FBFAF6" }}
                >
                  <div className="leave-table-scroll max-h-[30rem] overflow-y-auto overflow-x-auto px-3 pb-3 pt-1">
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
                            <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Duration</span>
                          </th>
                          <th className="px-5 py-4 pt-5 text-center font-black" style={{ backgroundColor: "#FBFAF6" }}>
                            <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Net Days</span>
                          </th>
                          <th className="px-5 py-4 pt-5 font-black" style={{ backgroundColor: "#FBFAF6" }}>
                            <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Department</span>
                          </th>
                          <th className="px-5 py-4 pt-5 text-right font-black" style={{ backgroundColor: "#FBFAF6" }}>
                            <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Status</span>
                          </th>
                          <th className="px-5 py-4 pt-5 text-right font-black" style={{ backgroundColor: "#FBFAF6" }}>
                            <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Dossier</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((leave, i) => {
                          const statusKey = leave.status?.toLowerCase() || "default";
                          return (
                            <tr
                              key={leave._id}
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
                                  <span className="font-black uppercase text-[#1C1A17] group-hover:text-[#B8912E] transition-colors text-base leading-tight">{leave.name}</span>
                                  <span className="text-[10px] font-bold text-[#8A8478] uppercase tracking-tight">ID: {leave.employeeId}</span>
                                </div>
                              </td>
                              <td className="px-5 py-6">
                                <span className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-[#8A8478] border border-[#E7E1D3] inline-block">
                                  {formatDate(leave.startDate)} <span className="mx-2 text-[#D9C79A]">→</span> {formatDate(leave.endDate)}
                                </span>
                              </td>
                              <td className="px-5 py-6 text-center">
                                <span className="text-2xl font-black text-[#1C1A17]">{leave.days}</span>
                              </td>
                              <td className="px-5 py-6 font-black uppercase text-[10px] text-[#8A8478] tracking-wider">
                                {leave.department}
                              </td>
                              <td className="px-5 py-6 text-right">
                                <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 inline-block ${STATUS_THEME[statusKey] || STATUS_THEME.default}`}>
                                  {leave.status}
                                </span>
                              </td>
                              <td className="rounded-r-[1.5rem] px-5 py-6 text-right">
                                <button
                                  onClick={() => handleView(leave._id)}
                                  className="group/btn p-2.5 rounded-full bg-white border border-[#E7E1D3] text-[#8A8478] hover:text-[#B8912E] hover:border-[#B8912E]/40 transition-all duration-300 active:scale-90 cursor-pointer"
                                >
                                  <Eye size={16} strokeWidth={3} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {currentItems.length === 0 && (
                      <p className="text-center py-10 text-[#8A8478] font-bold uppercase text-[10px]">No records match criteria</p>
                    )}
                  </div>

                  {/* bottom fade — hints there's more to scroll */}
                  {currentItems.length > 4 && (
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-[1.75rem]"
                      style={{ background: "linear-gradient(180deg, transparent, #FBFAF6)" }}
                    />
                  )}
                </div>
              </div>

              {/* PAGINATION */}
              {filteredLeaves.length > 0 && (
                <div className="flex flex-col items-center gap-6 p-6 sm:p-10 bg-[#FBFAF6] border-t border-[#E7E1D3] sm:flex-row sm:justify-between">
                  {/* Previous */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="order-2 flex h-11 w-full flex-1 items-center justify-center gap-3 rounded-[1.5rem] bg-white px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#8A8478] border border-[#E7E1D3] transition-all enabled:hover:text-[#B8912E] enabled:hover:border-[#B8912E]/40 enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed sm:order-1 sm:w-auto sm:flex-none"
                  >
                    <ChevronLeft size={16} strokeWidth={3} /> Prev
                  </button>

                  {/* Page Counter — middle */}
                  <div className="order-1 px-8 py-3 bg-white rounded-full border border-[#E7E1D3] sm:order-2">
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
                      className="flex h-11 flex-1 items-center justify-center gap-3 rounded-[1.5rem] bg-white px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#8A8478] border border-[#E7E1D3] transition-all enabled:hover:text-[#B8912E] enabled:hover:border-[#B8912E]/40 enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed sm:flex-none"
                    >
                      Next <ChevronRight size={16} strokeWidth={3} />
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
        </div>
      </div>
    </div>
  );
};

export default TeamRequests;
