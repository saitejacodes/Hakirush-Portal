import axios from "axios";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Search, ClipboardList, PlusCircle, AlertCircle, Calendar, Hash, Info } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/authContext";

/* ===== STYLES & HELPERS ===== */
const STATUS_THEME = {
  approved: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_12px_-3px_rgba(16,185,129,0.3)]",
  pending: "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-[0_0_12px_-3px_rgba(245,158,11,0.3)]",
  rejected: "text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-[0_0_12px_-3px_rgba(244,63,94,0.3)]",
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
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-rose-100 pb-16 font-sans">
      <button onClick={() => navigate(-1)} className="group px-30 pt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-all cursor-pointer">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Back to Personnel
      </button>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <header className="pt-8 mb-6">
          <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-4 sm:p-6 flex flex-col md:flex-row justify-between items-center shadow-xl border border-white">
            <div className="flex items-center gap-6 mb-6 md:mb-0">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-pulse"></div>
                <div className="relative w-12 h-12 bg-gradient-to-tr from-red-600 to-rose-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <ClipboardList size={24} />
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase italic">
                  Leave List
                </h1>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.3em]">Operational Dashboard</p>
              </div>
            </div>

            {user.role === "employee" && (
              <Link 
                to="/employee-dashboard/add-leave" 
                className="group flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-500 transition-all duration-300 shadow-lg shadow-slate-200 active:scale-95"
              >
                <PlusCircle size={18} className="group-hover:rotate-90 transition-transform" /> 
                New Application
              </Link>
            )}
          </div>
        </header>

        <div className="mb-6 flex flex-col md:flex-row gap-2 items-stretch">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={18} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Filter by leave category..."
              className="w-full bg-white/60 backdrop-blur-sm border-2 border-transparent focus:border-red-500/20 rounded-3xl pl-16 pr-8 py-5 text-sm font-bold text-slate-700 shadow-xl outline-none transition-all placeholder:text-slate-300"
            />
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl px-8 flex items-center justify-center shadow-xl border border-white">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Total Logs: <span className="text-red-600 ml-1">{processedData.length}</span>
            </span>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-2xl rounded-[3rem] border border-white/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden">
          {loading ? (
             <div className="py-40 flex flex-col items-center gap-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-red-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">Syncing Database...</p>
             </div>
          ) : (
            <div className="p-2 sm:p-6">
              <div className="hidden lg:block">
                <table className="w-full border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                      <th className="pb-2 px-6 text-left"><div className="flex items-center gap-2">ID</div></th>
                      <th className="pb-2 px-6 text-left">Category</th>
                      <th className="pb-2 px-6 text-left"><div className="flex items-center gap-2"><Calendar size={14}/> Timeline</div></th>
                      <th className="pb-2 px-6 text-center">Net Days</th>
                      <th className="pb-2 px-6 text-left"><div className="flex items-center gap-2"><Info size={14}/> Reason</div></th>
                      <th className="pb-2 px-6 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((leave, i) => (
                      <tr key={leave._id} className="group hover:scale-[1.01] transition-all duration-300">
                        <td className="bg-white/80 py-6 px-6 rounded-l-3xl shadow-sm text-[8px] font-black text-slate-300 italic group-hover:text-red-400 transition-colors">
                          {(currentPage - 1) * itemsPerPage + i + 1}
                        </td>
                        <td className="bg-white/80 py-6 px-6 font-black uppercase italic text-slate-800 tracking-tight">
                          {leave.leaveType}
                        </td>
                        <td className="bg-white/80 py-6 px-6">
                          <div className="text-[8px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl inline-block border border-slate-200">
                            {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                          </div>
                        </td>
                        <td className="bg-white/80 py-6 px-6 text-center">
                          <span className="text-xl font-black text-slate-900 tracking-tighter">{leave.net}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase ml-1 italic">Days</span>
                        </td>
                        <td className="bg-white/80 py-6 px-6 max-w-[240px]">
                          <p className="text-[11px] font-medium text-slate-400 truncate leading-relaxed">
                            {leave.reason || "—"}
                          </p>
                        </td>
                        <td className="bg-white/80 py-6 px-6 rounded-r-3xl text-center">
                          <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all duration-500 ${STATUS_THEME[leave.status?.toLowerCase()] || STATUS_THEME.default}`}>
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE GRID */}
              <div className="lg:hidden space-y-4 p-2">
                {currentItems.map((leave, i) => (
                  <div key={leave._id} className="bg-white/80 p-6 rounded-[2.5rem] shadow-sm border border-white">
                    <div className="flex justify-between items-center mb-6">
                      <span className="px-4 py-1.5 bg-slate-100 rounded-xl text-[10px] font-black text-slate-400 italic">LOG #{(currentPage - 1) * itemsPerPage + i + 1}</span>
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${STATUS_THEME[leave.status?.toLowerCase()] || STATUS_THEME.default}`}>
                        {leave.status}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 uppercase italic mb-2 tracking-tight">{leave.leaveType}</h4>
                    <p className="text-[11px] font-bold text-red-500 bg-red-50 inline-block px-3 py-1 rounded-lg mb-6 tracking-wide">
                      {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                    </p>
                    <div className="flex justify-between items-end border-t border-slate-100 pt-6">
                      <div className="max-w-[60%]">
                        <p className="text-[10px] uppercase font-black text-slate-300 tracking-widest mb-1">Reason</p>
                        <p className="text-[11px] font-medium text-slate-500 italic truncate">{leave.reason || "No remarks"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-slate-900 leading-none">{leave.net}</p>
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em] mt-1">Working Days</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION CAPSULE */}
              <div className="mt-2 mb-2 mx-2 sm:mx-6 bg-slate-900 rounded-[2.5rem] p-2 flex flex-row sm:flex-row items-center justify-between gap-4 shadow-xl">
                 <div className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                   Page <span className="text-white">{currentPage}</span> / {totalPages || 1}
                 </div>
                 <div className="flex items-center gap-2">
                    <button 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="w-8 h-8 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-red-600 hover:text-white disabled:opacity-20 transition-all shadow-lg cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={10} strokeWidth={3} />
                    </button>
                    <div className="hidden sm:flex gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button 
                          key={i} 
                          onClick={() => setCurrentPage(i + 1)} 
                          className={`w-8 h-8 rounded-2xl text-[11px] font-black transition-all ${currentPage === i + 1 ? "bg-red-600 text-white shadow-red-500/50" : "bg-slate-800 text-slate-500 hover:text-slate-200"}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button 
                      disabled={currentPage === totalPages || totalPages === 0} 
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="w-8 h-8 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-red-600 hover:text-white disabled:opacity-20 transition-all shadow-lg cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={10} strokeWidth={3} />
                    </button>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeaveList;