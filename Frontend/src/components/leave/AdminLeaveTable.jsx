import axios from "axios";
import React, { useEffect, useState } from "react";
import { Eye, ChevronLeft, ChevronRight, Search, ClipboardList, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ===== STYLES & HELPERS ===== */
const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#B8912E";

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

const AdminLeaveTable = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleView = (id) => navigate(`/admin-dashboard/leaves/${id}`);

  const fetchLeavesAndHolidays = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

      const [leaveRes, holidayRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/leave`, { headers }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/all`, { headers })
      ]);

      if (leaveRes.data.success) {
        const holidays = holidayRes.data.holidays || [];

        const data = leaveRes.data.leaves.map((leave) => {
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

  useEffect(() => {
    let result = leaves;
    if (statusFilter !== "All") result = result.filter((l) => l.status === statusFilter);
    if (search.trim()) result = result.filter((l) => l.employeeId.toLowerCase().includes(search.toLowerCase()));
    setFilteredLeaves(result);
    setCurrentPage(1);
  }, [search, statusFilter, leaves]);

  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const currentItems = filteredLeaves.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#F6F3EC] pb-12">
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
              Leave<span className="text-[#B8912E]"> Control</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#8A8478] mt-3">
              Deduction excludes Sat, Sun & Holidays
            </p>
          </div>
        </header>

        {/* CONTROLS */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#E7E1D3] p-3 mt-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C9C2AE] group-focus-within:text-[#B8912E] transition-colors" size={20} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH EMPLOYEE ID..."
                className="w-full bg-[#F6F3EC] border-2 border-transparent rounded-[1.5rem] pl-14 pr-6 py-5 text-[11px] font-black uppercase tracking-widest outline-none focus:border-[#B8912E]/30 focus:bg-white transition-all text-[#1C1A17] placeholder:text-[#C9C2AE]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 px-2">
              {["All", "Pending", "Approved", "Rejected"].map((item) => (
                <button
                  key={item}
                  onClick={() => setStatusFilter(item)}
                  style={statusFilter === item ? { background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` } : undefined}
                  className={`px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
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

              {/* DESKTOP TABLE */}
              <div className="hidden lg:block overflow-x-auto px-8 pb-10 pt-6">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[11px] font-black text-[#8A8478] uppercase tracking-[0.3em]">
                      <th className="px-8 py-4 text-left">Ref</th>
                      <th className="px-8 py-4 text-left">Personnel</th>
                      <th className="px-8 py-4 text-left">Duration</th>
                      <th className="px-8 py-4 text-center">Net Days</th>
                      <th className="px-8 py-4 text-left">Department</th>
                      <th className="px-8 py-4 text-right">Status</th>
                      <th className="px-8 py-4 text-right">Dossier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((leave, i) => {
                      const statusKey = leave.status?.toLowerCase() || "default";
                      return (
                        <tr key={leave._id} className="bg-[#FBFAF6] hover:bg-white border border-transparent hover:border-[#E7E1D3] transition-all group shadow-sm hover:shadow-md">
                          <td className="px-8 py-6 first:rounded-l-[1.5rem] text-[11px] font-black text-[#D6D0BF]">
                            #{(currentPage - 1) * itemsPerPage + i + 1}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-black uppercase text-[#1C1A17] group-hover:text-[#B8912E] transition-colors text-base leading-tight">{leave.name}</span>
                              <span className="text-[10px] font-bold text-[#8A8478] uppercase tracking-tight">ID: {leave.employeeId}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-[#8A8478] border border-[#E7E1D3]">
                              {formatDate(leave.startDate)} <span className="mx-2 text-[#D9C79A]">→</span> {formatDate(leave.endDate)}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className="text-2xl font-black text-[#1C1A17]">{leave.days}</span>
                          </td>
                          <td className="px-8 py-6 font-black uppercase text-[10px] text-[#8A8478] tracking-wider">
                            {leave.department}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 inline-block ${STATUS_THEME[statusKey] || STATUS_THEME.default}`}>
                              {leave.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 last:rounded-r-[1.5rem] text-right">
                            <button
                              onClick={() => handleView(leave._id)}
                              className="group p-2.5 rounded-full bg-white border border-[#E7E1D3] text-[#8A8478] hover:text-[#B8912E] hover:border-[#B8912E]/40 transition-all duration-300 active:scale-90 cursor-pointer"
                            >
                              <Eye size={16} strokeWidth={3} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {filteredLeaves.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-10 bg-[#FBFAF6] border-t border-[#E7E1D3] gap-6 sm:gap-0">
                  <div className="order-1 sm:order-2 px-8 py-3 bg-white rounded-full border border-[#E7E1D3]">
                    <p className="text-[10px] sm:text-[11px] font-black text-[#8A8478] uppercase tracking-widest text-center">
                      Page <span className="text-[#B8912E]">{currentPage}</span>
                      <span className="mx-2 text-[#D6D0BF]">/</span> {totalPages}
                    </p>
                  </div>
                  <div className="order-2 sm:order-1 flex w-full sm:w-auto gap-4 items-center justify-between sm:contents">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] bg-white text-[10px] font-black uppercase tracking-widest text-[#8A8478] border border-[#E7E1D3] transition-all enabled:hover:text-[#B8912E] enabled:hover:border-[#B8912E]/40 enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} strokeWidth={3} /> Prev
                    </button>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex-1 sm:flex-none order-3 flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] bg-white text-[10px] font-black uppercase tracking-widest text-[#8A8478] border border-[#E7E1D3] transition-all enabled:hover:text-[#B8912E] enabled:hover:border-[#B8912E]/40 enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight size={16} strokeWidth={3} />
                    </button>
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

export default AdminLeaveTable;