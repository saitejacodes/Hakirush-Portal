import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, CalendarDays, Plus, Search, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
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
          <button onClick={onCancel} className="w-1/2 py-4 rounded-2xl bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
            Abort
          </button>
          <button onClick={onConfirm} className="w-1/2 py-4 rounded-2xl bg-red-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200">
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
        <button onClick={onClose} className="w-full py-4 rounded-2xl bg-red-950 text-white text-[9px] font-black uppercase tracking-widest">Acknowledge</button>
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
          sno: i + 1,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-4 md:p-10 font-sans">
      {deleteId && <ConfirmDeleteAlert onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />}
      {showSuccess && <DeleteSuccessAlert onClose={() => setShowSuccess(false)} />}

      <div className="max-w-6xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest">
              <CalendarDays size={12} fill="currentColor" /> System Schedule
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-red-950">
              Holiday <span className="text-red-600">Ledger</span>
            </h1>
          </div>

          <Link to="/admin-dashboard/add-holiday" className="group flex items-center gap-3 bg-red-950 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-xl shadow-red-900/20 active:scale-95">
            <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
            Issue New Directive
          </Link>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl p-4 mb-8">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-red-300" size={20} />
            <input
              onChange={handleSearch}
              placeholder="FILTER BY EVENT TITLE..."
              className="w-full bg-white border-2 border-transparent focus:border-red-500 rounded-2xl pl-14 pr-6 py-4 text-xs font-bold uppercase tracking-wider outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* DATA CONTAINER */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 size={32} className="animate-spin text-red-600 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Accessing Database...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-red-950/5 border-b border-red-100">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-red-900/40 italic">#ID</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-red-950">Observation Event</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-red-950">Timeline</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-red-950">Classification</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-red-950">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-50/50">
                  {filtered.map((h) => (
                    <tr key={h._id} className="group hover:bg-red-50/30 transition-all">
                      <td className="px-8 py-6 text-xs font-black text-red-950/20 italic">{h.sno}</td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black uppercase tracking-tight text-red-950">{h.title}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-red-600 font-mono font-bold text-xs bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 inline-flex">
                          <CalendarDays size={14} />
                          {h.displayDate}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic border ${
                          h.status === "Past" 
                          ? "bg-slate-100 text-slate-400 border-slate-200" 
                          : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        }`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {h.status === "Upcoming" && (
                          <button
                            onClick={() => setDeleteId(h._id)}
                            className="group p-2.5 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-300 active:scale-90 cursor-pointer shadow-sm hover:shadow-red-200"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr>
                      <td colSpan="5" className="px-8 py-24 text-center">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">No historical or upcoming directives found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HolidayList;