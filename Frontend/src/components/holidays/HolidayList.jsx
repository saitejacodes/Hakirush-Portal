import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, CalendarDays, Plus, Search, Loader2, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

/* ================= PROTOCOL: DELETE CONFIRMATION ================= */
const ConfirmDeleteAlert = ({ onConfirm, onCancel }) => (
  <>
    <div className="fixed inset-0 bg-red-950/40 backdrop-blur-md z-[60] animate-in fade-in duration-300" />
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="h-2 bg-red-600" />
        <div className="p-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-6">
            <AlertTriangle size={40} strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-red-950">
            Confirm <span className="text-red-600">Erasure</span>
          </h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
            This directive is permanent. <br /> Proceed with record deletion?
          </p>
        </div>
        <div className="flex gap-3 px-8 pb-8">
          <button onClick={onCancel} className="w-1/2 py-4 rounded-2xl bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all cursor-pointer">
            Abort
          </button>
          <button onClick={onConfirm} className="w-1/2 py-4 rounded-2xl bg-red-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200 cursor-pointer">
            Execute
          </button>
        </div>
      </div>
    </div>
  </>
);

/* ================= PROTOCOL: SUCCESS ================= */
const DeleteSuccessAlert = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-red-950/20 backdrop-blur-sm z-[60]" />
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-300 text-center p-8">
        <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
        <h3 className="text-xl font-black uppercase italic tracking-tighter text-red-950">Record Purged</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 mb-6">Archive has been updated.</p>
        <button onClick={onClose} className="w-full py-4 rounded-2xl bg-red-950 text-white text-[9px] font-black uppercase tracking-widest cursor-pointer">Acknowledge</button>
      </div>
    </div>
  </>
);

const HolidayList = () => {
  const [holidays, setHolidays] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  /* PAGINATION STATE */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/upcoming`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        const today = new Date().toISOString().split("T")[0];
        const formatted = res.data.holidays.map((h, i) => ({
          ...h,
          displayDate: new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: new Date(h.date).toISOString().split("T")[0] < today ? "Past" : "Upcoming",
        }));
        setHolidays(formatted);
        setFiltered(formatted);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchHolidays(); }, []);

  const handleSearch = (e) => {
    const v = e.target.value.toLowerCase();
    setFiltered(holidays.filter((h) => h.title.toLowerCase().includes(v)));
    setCurrentPage(1);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/${deleteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDeleteId(null);
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); fetchHolidays(); }, 1500);
    } catch (err) { console.error(err); }
  };

  /* PAGINATION LOGIC */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-rose-100 pb-12">
      {deleteId && <ConfirmDeleteAlert onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />}
      {showSuccess && <DeleteSuccessAlert onClose={() => setShowSuccess(false)} />}

      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white shadow-2xl">
              <CalendarDays size={30} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-red-700 uppercase tracking-tighter sm:text-5xl italic leading-none">
                Holiday<span className="text-slate-800"> Ledger</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">Operational System Schedule</p>
            </div>
          </div>

          <Link
            to="/admin-dashboard/add-holiday"
            className="flex items-center gap-3 bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-red-100 active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> Issue New Directive
          </Link>
        </header>

        {/* SEARCH BAR */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-xl border border-white p-3">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
            <input
              onChange={handleSearch}
              placeholder="FILTER BY EVENT TITLE OR DATE..."
              className="w-full bg-white border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-red-500 shadow-sm"
            />
          </div>
        </div>

        {/* DATA CONTAINER */}
        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
          {loading ? (
            <div className="py-32 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Accessing Database...</p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="md:hidden p-4 space-y-4">
                {currentItems.map((h, i) => (
                  <div key={h._id} className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Ref #{indexOfFirstItem + i + 1}</span>
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${h.status === "Past" ? "bg-slate-50 text-slate-400 border-slate-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                        {h.status}
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 uppercase italic tracking-tighter text-lg leading-tight mb-4">{h.title}</h4>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-red-600 font-mono font-bold text-[11px] bg-red-50 px-3 py-2 rounded-xl">
                        <CalendarDays size={14} /> {h.displayDate}
                      </div>
                      {h.status === "Upcoming" && (
                        <button onClick={() => setDeleteId(h._id)} className="group p-2.5 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-300 active:scale-90 cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto p-8">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-6 py-2 text-left">Reference</th>
                      <th className="px-6 py-2 text-left">Observation Event</th>
                      <th className="px-6 py-2 text-left">Timeline</th>
                      <th className="px-6 py-2 text-center">Classification</th>
                      <th className="px-6 py-2 text-right">Purge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((h, i) => (
                      <tr key={h._id} className="bg-white/50 hover:bg-red-50/50 transition-all group shadow-sm">
                        <td className="px-6 py-5 first:rounded-l-[1.5rem] text-[10px] font-black text-slate-300 italic">
                          #{(currentPage - 1) * itemsPerPage + i + 1}
                        </td>
                        <td className="px-6 py-5 font-black uppercase italic tracking-tighter text-slate-800 group-hover:text-red-700 transition-colors">
                          {h.title}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-red-600 font-mono font-bold text-xs bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 inline-flex">
                            <CalendarDays size={14} /> {h.displayDate}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${h.status === "Past" ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                            {h.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 last:rounded-r-[1.5rem] text-right">
                          {h.status === "Upcoming" && (
                            <button onClick={() => setDeleteId(h._id)} className="group p-2.5 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-300 active:scale-90 cursor-pointer">
                              <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION CONTROLS */}
              <div className="px-8 py-6 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Registry Range: <span className="text-white">{indexOfFirstItem + 1}—{Math.min(indexOfLastItem, filtered.length)}</span> of {filtered.length}
                </p>
                
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:enabled:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft size={20} strokeWidth={3} />
                  </button>
                  
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                          currentPage === i + 1 ? "bg-red-600 text-white shadow-lg shadow-red-200" : "bg-slate-800 text-slate-500 hover:text-white"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

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

export default HolidayList;