import axios from "axios";
import React, { useEffect, useState } from "react";
import { Eye, ChevronLeft, ChevronRight, Search, ClipboardList, PlusCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/authContext";

/* ===== STATUS STYLES ===== */
const statusConfig = {
  pending: "bg-amber-50 text-amber-600 border-amber-100",
  approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
  rejected: "bg-rose-50 text-rose-600 border-rose-100",
  default: "bg-slate-50 text-slate-400 border-slate-100",
};

/* ===== DATE FORMAT HELPER ===== */
const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ===== UPDATED NET DAYS CALCULATOR (Excludes Sat, Sun, and Holidays) ===== */
const calculateNetDays = (start, end, holidays = []) => {
  if (!start || !end) return 0;
  let count = 0;
  let current = new Date(start);
  const lastDate = new Date(end);
  
  current.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);

  const holidayStrings = holidays.map(h => 
    new Date(h.date).toISOString().split('T')[0]
  );

  while (current <= lastDate) {
    const dayOfWeek = current.getDay();
    const dateStr = current.toISOString().split('T')[0];
    
    // Skip Sunday (0), Saturday (6), and Holidays
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayStrings.includes(dateStr)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};

/* ===== MOBILE CARD ===== */
const MobileLeaveCard = ({ leave, index, holidays }) => {
  const statusKey = leave.status?.toLowerCase() || "default";
  const style = statusConfig[statusKey] || statusConfig.default;
  
  const displayDays = calculateNetDays(leave.startDate, leave.endDate, holidays);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
            Registry #{index + 1}
          </span>
          <h4 className="font-black text-slate-900 uppercase italic tracking-tighter text-lg leading-tight mt-1">
            {leave.leaveType}
          </h4>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${style}`}>
          {leave.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
              {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
            </p>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest italic truncate max-w-[200px]">
              "{leave.reason || "No reason provided"}"
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-slate-900 leading-none">{displayDays}</p>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Working Days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeeLeaveList = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      
      const [leaveRes, holidayRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/leave/${id}/${user.role}`, { headers }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/all`, { headers })
      ]);

      if (leaveRes.data.success) {
        const sortedData = (leaveRes.data.leaves || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setLeaves(sortedData);
        setFilteredLeaves(sortedData);
      }
      if (holidayRes.data.success) {
        setHolidays(holidayRes.data.holidays || []);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id, user.role]);

  useEffect(() => {
    const result = leaves.filter((l) =>
      (l.leaveType || "").toLowerCase().includes(search.toLowerCase())
    );
    setFilteredLeaves(result);
    setCurrentPage(1);
  }, [search, leaves]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-rose-100 pb-12 font-sans">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white shadow-2xl">
              <ClipboardList size={30} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-red-700 uppercase tracking-tighter sm:text-5xl italic leading-none">
                My Leave<span className="text-slate-800"> Registry</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">Deduction excludes Sat, Sun & Holidays</p>
            </div>
          </div>

          {user.role === "employee" && (
            <Link
              to="/employee-dashboard/add-leave"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-red-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 hover:-translate-y-1 transition-all active:scale-95"
            >
              <PlusCircle size={16} /> Apply New Leave
            </Link>
          )}
        </header>

        {/* CONTROLS */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-xl border border-white p-3">
          <div className="relative group flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH BY LEAVE CATEGORY..."
              className="w-full bg-white border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-red-500 shadow-sm transition-all"
            />
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
          {loading ? (
            <div className="py-32 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Retrieving Dossiers...</p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="md:hidden p-4 space-y-4">
                {currentItems.length ? (
                  currentItems.map((leave, i) => (
                    <MobileLeaveCard key={leave._id} leave={leave} holidays={holidays} index={indexOfFirstItem + i} />
                  ))
                ) : (
                  <p className="text-center py-10 text-slate-400 font-bold uppercase text-[10px]">No records found</p>
                )}
              </div>

              {/* DESKTOP VIEW */}
              <div className="hidden md:block overflow-x-auto p-8">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-6 py-2 text-left">Ref</th>
                      <th className="px-6 py-2 text-left">Leave Category</th>
                      <th className="px-6 py-2 text-left">Duration Period</th>
                      <th className="px-6 py-2 text-center">Net Days</th>
                      <th className="px-6 py-2 text-left">Reason / Remarks</th>
                      <th className="px-6 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((leave, i) => {
                      const statusKey = leave.status?.toLowerCase() || "default";
                      // Recalculate Net Days (excluding Saturdays/Sundays/Holidays)
                      const displayDays = calculateNetDays(leave.startDate, leave.endDate, holidays);
                      
                      return (
                        <tr key={leave._id} className="bg-white/50 hover:bg-red-50/50 transition-all group shadow-sm">
                          <td className="px-6 py-5 first:rounded-l-[1.5rem] text-[10px] font-black text-slate-300 italic">
                            #{(currentPage - 1) * itemsPerPage + i + 1}
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-black uppercase italic tracking-tighter text-slate-800 group-hover:text-red-700 transition-colors">
                              {leave.leaveType}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-slate-700">{formatDate(leave.startDate)}</span>
                              <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">To {formatDate(leave.endDate)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="text-lg font-black text-red-600 tracking-tighter">
                                {displayDays} <span className="text-[10px] uppercase text-slate-400">Days</span>
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-[11px] font-medium text-slate-500 italic max-w-[200px] truncate" title={leave.reason}>
                              {leave.reason || "—"}
                            </p>
                          </td>
                          <td className="px-6 py-5 last:rounded-r-[1.5rem] text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusConfig[statusKey] || statusConfig.default}`}>
                              {leave.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="px-8 py-6 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Registry Range: <span className="text-white">{indexOfFirstItem + 1}—{Math.min(indexOfLastItem, filteredLeaves.length)}</span> of {filteredLeaves.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:enabled:text-white transition-all disabled:opacity-20 cursor-pointer"
                  >
                    <ChevronLeft size={20} strokeWidth={3} />
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                          currentPage === i + 1 ? "bg-red-600 text-white" : "bg-slate-800 text-slate-500 hover:text-white"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:enabled:text-white transition-all disabled:opacity-20 cursor-pointer"
                  >
                    <ChevronRight size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeaveList;