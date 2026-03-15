import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { Eye, ChevronLeft, ChevronRight, Search, ClipboardList, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ===== STYLES & HELPERS ===== */
const STATUS_THEME = {
  approved: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-sm",
  pending: "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-sm",
  rejected: "text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-sm",
  default: "text-slate-400 bg-slate-400/10 border-slate-400/20",
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
    <div className="bg-white rounded-[1.5rem] shadow-lg border border-white p-6 transition-all active:scale-[0.98]">
      <div className="flex justify-between items-start mb-4">
        <div>
           <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1">
             LOG #{index + 1}
           </p>
           <h4 className="font-black text-slate-800 uppercase italic tracking-tighter text-xl">
             {leave.leaveType}
           </h4>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
             {leave.name} ({leave.employeeId})
           </p>
        </div>
        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${style}`}>
          {leave.status}
        </span>
      </div>
      
      <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-tight">
          <Calendar size={14} className="text-red-400" />
          {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
        </div>
      </div>

      <div className="flex justify-between items-end pt-4 border-t border-slate-50">
        <div className="max-w-[60%]">
          <p className="text-[11px] font-medium text-slate-400 italic truncate">{leave.department || "No department"}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-slate-900 leading-none">{leave.days}</p>
          <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Days</p>
        </div>
      </div>
      
      <button
        onClick={() => handleView(leave._id)}
        className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all duration-300 active:scale-95 cursor-pointer"
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
  const itemsPerPage = 8; // Match desired size

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
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 pb-12">
      <div className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-6">
        
        {/* HEADER */}
        <header className="flex items-center gap-6 pt-2">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-2xl shadow-red-200 shrink-0">
            <ClipboardList size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-red-800 uppercase tracking-tighter sm:text-4xl leading-none italic">
              Leave<span className="text-slate-900"> Control</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mt-3">
              Deduction excludes Sat, Sun & Holidays
            </p>
          </div>
        </header>

        {/* CONTROLS */}
        <div className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white p-3 mt-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH EMPLOYEE ID..."
                className="w-full bg-slate-100/50 border-2 border-transparent rounded-[1.5rem] pl-14 pr-6 py-5 text-[11px] font-black uppercase tracking-widest outline-none focus:border-red-500/20 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 px-2">
              {["All", "Pending", "Approved", "Rejected"].map((item) => (
                <button
                  key={item}
                  onClick={() => setStatusFilter(item)}
                  className={`px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                    statusFilter === item 
                    ? "bg-red-700 text-white shadow-2xl shadow-red-100" 
                    : "bg-white text-slate-400 border border-slate-50 hover:border-red-200 cursor-pointer"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden mt-4">
          {loading ? (
            <div className="p-24 text-center">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Records...</p>
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
                    <p className="text-center py-10 text-slate-400 font-bold uppercase text-[10px]">No records match criteria</p>
                )}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden lg:block overflow-x-auto px-8 pb-10 pt-6">
                <table className="w-full border-separate border-spacing-y-5">
                  <thead>
                    <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
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
                        <tr key={leave._id} className="bg-slate-50/40 hover:bg-white transition-all group shadow-sm hover:shadow-xl hover:shadow-red-500/5">
                          <td className="px-8 py-6 first:rounded-l-[2rem] text-[11px] font-black text-slate-300 italic">
                            #{(currentPage - 1) * itemsPerPage + i + 1}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-black uppercase italic text-slate-800 group-hover:text-red-700 transition-colors text-base leading-tight">{leave.name}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: {leave.employeeId}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-slate-500 border border-slate-100 shadow-sm">
                              {formatDate(leave.startDate)} <span className="mx-2 text-red-200">→</span> {formatDate(leave.endDate)}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className="text-2xl font-black text-slate-900">{leave.days}</span>
                          </td>
                          <td className="px-8 py-6 font-black uppercase text-[10px] text-slate-500 tracking-wider">
                            {leave.department}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 inline-block ${STATUS_THEME[statusKey] || STATUS_THEME.default}`}>
                              {leave.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 last:rounded-r-[2rem] text-right">
                            <button
                              onClick={() => handleView(leave._id)}
                              className="group p-2.5 rounded-full bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-100 hover:shadow-lg hover:shadow-red-50 transition-all duration-300 active:scale-90 cursor-pointer"
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
                <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-10 bg-slate-50/50 border-t border-white gap-6 sm:gap-0">
                  <div className="order-1 sm:order-2 px-8 py-3 bg-white rounded-full border border-slate-100 shadow-inner">
                    <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Page <span className="text-red-600">{currentPage}</span> 
                      <span className="mx-2 text-slate-200">/</span> {totalPages}
                    </p>
                  </div>
                  <div className="order-2 sm:order-1 flex w-full sm:w-auto gap-4 items-center justify-between sm:contents">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 shadow-sm transition-all enabled:hover:text-red-600 enabled:hover:shadow-md enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} strokeWidth={3} /> Prev
                    </button>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex-1 sm:flex-none order-3 flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 shadow-sm transition-all enabled:hover:text-red-600 enabled:hover:shadow-md enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
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