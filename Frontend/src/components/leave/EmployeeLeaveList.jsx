import axios from "axios";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Search, ClipboardList, PlusCircle, Calendar, Info } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/authContext";

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

const getNetDays = (start, end, holidaySet) => {
  if (!start || !end) return 0;
  let count = 0;
  let current = new Date(start);
  const last = new Date(end);
  current.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);
  while (current <= last) {
    const day = current.getDay();
    const dateStr = current.toISOString().split('T')[0];
    if (day !== 0 && day !== 6 && !holidaySet.has(dateStr)) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
};

const EmployeeLeaveList = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const itemsPerPage = 5;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const [leaveRes, holidayRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/leave/${id}/${user.role}`, { headers }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/all`, { headers })
      ]);
      if (leaveRes.data.success) setLeaves(leaveRes.data.leaves || []);
      if (holidayRes.data.success) setHolidays(holidayRes.data.holidays || []);
    } catch (err) {
      setError("Sync Failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, user.role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const processedData = useMemo(() => {
    const holidaySet = new Set(holidays.map(h => new Date(h.date).toISOString().split('T')[0]));
    return leaves
      .filter(l => (l.leaveType || "").toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(l => ({ ...l, net: getNetDays(l.startDate, l.endDate, holidaySet) }));
  }, [leaves, search, holidays]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const currentItems = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 pb-12">
      <div className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-6">
        
        {/* BACK BUTTON - Clean, Minimalist Position */}
        <div className="flex justify-start">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            <ChevronLeft size={18} className="text-slate-400 group-hover:text-red-600 group-hover:-translate-x-1 transition-all" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-600 transition-colors">
              Return to Dashboard
            </span>
          </button>
        </div>

        {/* HEADER */}
        <header className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-2xl shadow-red-200 shrink-0">
            <ClipboardList size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-red-800 uppercase tracking-tighter sm:text-4xl leading-none italic">
              Leave Records
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mt-3">
              Personnel Absence & History Tracking
            </p>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden mt-4">
          
          {/* SEARCH & ACTION ROW */}
          <div className="p-6 md:p-10 border-b border-slate-50">
            <div className="flex flex-col lg:flex-row gap-5 items-center">
              
              <div className="group relative flex-1 w-full flex items-center bg-slate-100/50 border-2 border-transparent rounded-[1.5rem] px-6 focus-within:border-red-500/20 focus-within:bg-white transition-all shadow-inner">
                <Search className="text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="SEARCH BY LEAVE CATEGORY..."
                  className="w-full py-5 pl-4 outline-none bg-transparent text-[11px] font-black uppercase tracking-widest text-slate-700 placeholder:text-slate-300"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                />
              </div>

              {user.role === "employee" && (
                <Link
                  to="/employee-dashboard/add-leave"
                  className="w-full lg:w-auto flex items-center justify-center gap-3 rounded-[1.5rem] bg-gradient-to-br from-slate-900 to-slate-800 px-10 py-5 font-black uppercase text-[10px] tracking-widest text-white shadow-2xl shadow-red-100 transition-all hover:from-red-600 hover:to-rose-500 active:scale-95 whitespace-nowrap"
                >
                  <PlusCircle size={18} strokeWidth={3} />
                  <span>Request Leave</span>
                </Link>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-24 text-center">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Records...</p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="lg:hidden p-4 space-y-4">
                {currentItems.map((leave, i) => (
                  <div key={leave._id} className="bg-white rounded-[1.5rem] shadow-lg border border-white p-6 transition-all active:scale-[0.98]">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                         <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1">
                           LOG #{(currentPage - 1) * itemsPerPage + i + 1}
                         </p>
                         <h4 className="font-black text-slate-800 uppercase italic tracking-tighter text-xl">
                           {leave.leaveType}
                         </h4>
                      </div>
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${STATUS_THEME[leave.status?.toLowerCase()] || STATUS_THEME.default}`}>
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
                        <p className="text-[11px] font-medium text-slate-400 italic truncate">{leave.reason || "No reason provided"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-slate-900 leading-none">{leave.net}</p>
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Days</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden lg:block overflow-x-auto px-8 pb-10">
                <table className="w-full border-separate border-spacing-y-5">
                  <thead>
                    <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                      <th className="px-8 py-4 text-left">Ref</th>
                      <th className="px-8 py-4 text-left">Category</th>
                      <th className="px-8 py-4 text-left">Duration</th>
                      <th className="px-8 py-4 text-center">Net Days</th>
                      <th className="px-8 py-4 text-left">Reason</th>
                      <th className="px-8 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((leave, i) => (
                      <tr key={leave._id} className="bg-slate-50/40 hover:bg-white transition-all group shadow-sm hover:shadow-xl hover:shadow-red-500/5">
                        <td className="px-8 py-6 first:rounded-l-[2rem] text-[11px] font-black text-slate-300 italic">
                          #{(currentPage - 1) * itemsPerPage + i + 1}
                        </td>
                        <td className="px-8 py-6 font-black uppercase italic text-slate-800 text-base tracking-tighter group-hover:text-red-700 transition-colors">
                          {leave.leaveType}
                        </td>
                        <td className="px-8 py-6">
                          <span className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-slate-500 border border-slate-100 shadow-sm">
                            {formatDate(leave.startDate)} <span className="mx-2 text-red-200">→</span> {formatDate(leave.endDate)}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="text-2xl font-black text-slate-900">{leave.net}</span>
                        </td>
                        <td className="px-8 py-6 max-w-[250px]">
                          <p className="text-[12px] font-medium text-slate-400 truncate italic">
                            {leave.reason || "—"}
                          </p>
                        </td>
                        <td className="px-8 py-6 last:rounded-r-[2rem] text-right">
                          <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 inline-block ${STATUS_THEME[leave.status?.toLowerCase()] || STATUS_THEME.default}`}>
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {processedData.length > itemsPerPage && (
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

export default EmployeeLeaveList;