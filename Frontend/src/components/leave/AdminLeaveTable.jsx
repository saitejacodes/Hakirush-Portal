import axios from "axios";
import React, { useEffect, useState } from "react";
import { Eye, ChevronLeft, ChevronRight, Search, ClipboardList, RotateCcw, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ===== STATUS STYLES ===== */
const statusConfig = {
  pending: "bg-amber-50 text-amber-600 border-amber-100",
  approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
  rejected: "bg-rose-50 text-rose-600 border-rose-100",
  default: "bg-slate-50 text-slate-400 border-slate-100",
};

/* ===== MOBILE CARD ===== */
const MobileLeaveCard = ({ leave, index, handleView }) => {
  const statusKey = leave.status?.toLowerCase() || "default";
  const style = statusConfig[statusKey] || statusConfig.default;

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
            <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider">{leave.name}</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{leave.employeeId} • {leave.department}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-slate-900 leading-none">{leave.days}</p>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Days</p>
          </div>
        </div>

        <button
          onClick={() => handleView(leave._id)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-100 hover:shadow-lg hover:shadow-red-50 transition-all duration-300 active:scale-90 cursor-pointer"
        >
          <Eye size={14} /> Open Dossier
        </button>
      </div>
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

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/leave`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.success) {
        const data = res.data.leaves.map((leave, index) => ({
          _id: leave._id,
          employeeId: leave.employeeId?.employeeId || "N/A",
          name: leave.employeeId?.userId?.name || "N/A",
          leaveType: leave.leaveType,
          department: leave.employeeId?.department?.dep_name || "N/A",
          days: leave.days,
          status: leave.status,
        }));
        setLeaves(data);
        setFilteredLeaves(data);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  useEffect(() => {
    let result = leaves;
    if (statusFilter !== "All") result = result.filter((l) => l.status === statusFilter);
    if (search.trim()) result = result.filter((l) => l.employeeId.toLowerCase().includes(search.toLowerCase()));
    setFilteredLeaves(result);
    setCurrentPage(1);
  }, [search, statusFilter, leaves]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-rose-100 pb-12">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white shadow-2xl">
              <ClipboardList size={30} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-red-700 uppercase tracking-tighter sm:text-5xl italic leading-none">
                Leave<span className="text-slate-800"> Control</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">Operational Absence Management</p>
            </div>
          </div>
        </header>

        {/* CONTROLS */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-xl border border-white p-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH EMPLOYEE IDENTITY..."
                className="w-full bg-white border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-red-500 shadow-sm"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 px-2">
              {["All", "Pending", "Approved", "Rejected"].map((item) => (
                <button
                  key={item}
                  onClick={() => setStatusFilter(item)}
                  className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    statusFilter === item 
                    ? "bg-red-600 text-white shadow-lg shadow-red-200" 
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
        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
          {loading ? (
            <div className="py-32 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Datastreams...</p>
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden p-4 space-y-4">
                {currentItems.map((leave, i) => (
                  <MobileLeaveCard key={leave._id} leave={leave} index={indexOfFirstItem + i} handleView={handleView} />
                ))}
              </div>

              {/* DESKTOP */}
              <div className="hidden md:block overflow-x-auto p-8">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-6 py-2 text-left">Ref</th>
                      <th className="px-6 py-2 text-left">Personnel</th>
                      <th className="px-6 py-2 text-left">Department</th>
                      <th className="px-6 py-2 text-left">Leave Category</th>
                      <th className="px-6 py-2 text-center">Duration</th>
                      <th className="px-6 py-2 text-center">Status</th>
                      <th className="px-6 py-2 text-right">Dossier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((leave, i) => {
                      const statusKey = leave.status?.toLowerCase() || "default";
                      return (
                        <tr key={leave._id} className="bg-white/50 hover:bg-red-50/50 transition-all group shadow-sm">
                          <td className="px-6 py-5 first:rounded-l-[1.5rem] text-[10px] font-black text-slate-300 italic">
                            #{(currentPage - 1) * itemsPerPage + i + 1}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="font-black uppercase italic tracking-tighter text-slate-800 group-hover:text-red-700 transition-colors">
                                {leave.name}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {leave.employeeId}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 font-black uppercase text-[10px] text-slate-500">{leave.department}</td>
                          <td className="px-6 py-5">
                            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg uppercase">
                              {leave.leaveType}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="text-lg font-black text-red-600 tracking-tighter">{leave.days} <span className="text-[10px] uppercase">Days</span></span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusConfig[statusKey] || statusConfig.default}`}>
                              {leave.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 last:rounded-r-[1.5rem] text-right">
                            <button
                              onClick={() => handleView(leave._id)}
                              className="group p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-100 hover:shadow-lg hover:shadow-red-50 transition-all duration-300 active:scale-90 cursor-pointer"
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
              <div className="px-8 py-6 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Registry Range: <span className="text-white">{indexOfFirstItem + 1}—{Math.min(indexOfLastItem, filteredLeaves.length)}</span> of {filteredLeaves.length}
                </p>
                <div className="flex items-center gap-2">
                  {/* PREVIOUS BUTTON */}
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:enabled:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft size={20} strokeWidth={3} />
                  </button>

                  {/* PAGE NUMBERS */}
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                          currentPage === i + 1 
                            ? "bg-red-600 text-white" 
                            : "bg-slate-800 text-slate-500 hover:text-white"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  {/* NEXT BUTTON */}
                  <button
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:enabled:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
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

export default AdminLeaveTable;