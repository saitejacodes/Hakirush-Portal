import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, CalendarDays, Plus, Search, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#B8912E";
const SAGE = "#3F6B52";
const RUST = "#A24A32";

/* ================= PROTOCOL: DELETE CONFIRMATION ================= */
const ConfirmDeleteAlert = ({ onConfirm, onCancel }) => (
  <>
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] animate-in fade-in duration-300" />
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-[#E7E1D3] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="h-2" style={{ backgroundColor: RUST }} />
        <div className="p-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-[#FAF1EA] flex items-center justify-center mx-auto mb-6" style={{ color: RUST }}>
            <AlertTriangle size={40} strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tighter text-[#1C1A17]">
            Confirm <span style={{ color: RUST }}>Erasure</span>
          </h3>
          <p className="text-[10px] font-bold text-[#8A8478] uppercase tracking-widest mt-2">
            This directive is permanent. <br /> Proceed with record deletion?
          </p>
        </div>
        <div className="flex gap-3 px-8 pb-8">
          <button onClick={onCancel} className="w-1/2 py-4 rounded-2xl bg-[#F1EFE8] text-[#8A8478] text-[9px] font-black uppercase tracking-widest hover:bg-[#E7E1D3] transition-all cursor-pointer">
            Abort
          </button>
          <button onClick={onConfirm} className="w-1/2 py-4 rounded-2xl text-[#F6F3EC] text-[9px] font-black uppercase tracking-widest transition-all shadow-md cursor-pointer hover:opacity-90" style={{ backgroundColor: RUST }}>
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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" />
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-[#E7E1D3] overflow-hidden animate-in zoom-in-95 duration-300 text-center p-8">
        <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: SAGE }} />
        <h3 className="text-xl font-black uppercase tracking-tighter text-[#1C1A17]">Record Purged</h3>
        <p className="text-[10px] font-bold text-[#8A8478] uppercase tracking-widest mt-2 mb-6">Archive has been updated.</p>
        <button onClick={onClose} className="w-full py-4 rounded-2xl bg-[#1C1A17] text-[#F6F3EC] text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-[#B8912E] hover:text-[#1C1A17] transition-colors">Acknowledge</button>
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
    } catch (err) {
      console.error(err);
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
    <div className="min-h-screen bg-[#F6F3EC] pb-12">
      {deleteId && <ConfirmDeleteAlert onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />}
      {showSuccess && <DeleteSuccessAlert onClose={() => setShowSuccess(false)} />}

      {/* Widened container to 1400px to match employee list */}
      <div className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-8">

        {/* HEADER SECTION */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div
              className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-[#F6F3EC] shadow-xl shadow-black/10 ring-1 ring-[#B8912E]/20"
              style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
            >
              <CalendarDays size={30} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#1C1A17] uppercase tracking-tighter sm:text-5xl leading-none">
                Holiday<span className="text-[#B8912E]"> Ledger</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#8A8478] mt-2">Operational System Schedule</p>
            </div>
          </div>

          <Link
            to="/admin-dashboard/add-holiday"
            className="flex w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-2xl px-9 py-4 text-[10.5px] font-semibold uppercase tracking-widest text-white shadow-[0_14px_28px_-10px_rgba(28,26,23,0.35)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 lg:w-auto"
                style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
          >
            <Plus size={16} strokeWidth={3} /> Issue New Holiday
          </Link>
        </header>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-[#E7E1D3] p-3">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C9C2AE] group-focus-within:text-[#B8912E] transition-colors" size={20} />
            <input
              onChange={handleSearch}
              placeholder="FILTER BY EVENT TITLE OR DATE..."
              className="w-full bg-[#F6F3EC] border border-[#E7E1D3] rounded-2xl pl-14 pr-6 py-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-[#B8912E] transition-colors text-[#1C1A17] placeholder:text-[#C9C2AE]"
            />
          </div>
        </div>

        {/* DATA CONTAINER */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#E7E1D3] overflow-hidden">
          {loading ? (
            <div className="py-32 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#EFE9D8] border-t-[#B8912E] rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A8478]">Accessing Database...</p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="md:hidden p-4 space-y-4">
                {currentItems.map((h, i) => (
                  <div key={h._id} className="bg-[#FBFAF6] rounded-[2rem] border border-[#E7E1D3] p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black text-[#D6D0BF] uppercase tracking-widest">Ref #{indexOfFirstItem + i + 1}</span>
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${h.status === "Past" ? "bg-[#F1EFE8] text-[#8A8478] border-[#E7E1D3]" : "bg-[#EEF3EE] text-[#3F6B52] border-[#D7E4D9]"}`}>
                        {h.status}
                      </span>
                    </div>
                    <h4 className="font-black text-[#1C1A17] uppercase tracking-tighter text-lg leading-tight mb-4">{h.title}</h4>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-[#1C1A17] font-mono font-bold text-[11px] bg-white px-3 py-2 rounded-xl border border-[#E7E1D3]">
                        <CalendarDays size={14} className="text-[#B8912E]" /> {h.displayDate}
                      </div>
                      {h.status === "Upcoming" && (
                        <button onClick={() => setDeleteId(h._id)} className="group p-2.5 rounded-xl bg-white border border-[#E7E1D3] text-[#C9C2AE] hover:bg-[#A24A32] hover:text-white hover:border-[#A24A32] transition-all duration-300 active:scale-90 cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block w-full overflow-x-auto px-8 pb-10">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black text-[#8A8478] uppercase tracking-[0.2em]">
                      <th className="px-6 py-2 text-left">Reference</th>
                      <th className="px-6 py-2 text-left">Observation Event</th>
                      <th className="px-6 py-2 text-left">Timeline</th>
                      <th className="px-6 py-2 text-center">Classification</th>
                      <th className="px-6 py-2 text-right">Purge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((h, i) => (
                      <tr key={h._id} className="bg-[#FBFAF6] hover:bg-white border border-transparent hover:border-[#E7E1D3] transition-all group shadow-sm">
                        <td className="px-6 py-5 first:rounded-l-[1.5rem] text-[10px] font-black text-[#D6D0BF]">
                          #{(currentPage - 1) * itemsPerPage + i + 1}
                        </td>
                        <td className="px-6 py-5 font-black uppercase tracking-tighter text-[#1C1A17] group-hover:text-[#B8912E] transition-colors">
                          {h.title}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-[#1C1A17] font-mono font-bold text-xs bg-white px-3 py-1.5 rounded-xl border border-[#E7E1D3] inline-flex">
                            <CalendarDays size={14} className="text-[#B8912E]" /> {h.displayDate}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${h.status === "Past" ? "bg-[#F1EFE8] text-[#8A8478] border-[#E7E1D3]" : "bg-[#EEF3EE] text-[#3F6B52] border-[#D7E4D9]"}`}>
                            {h.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 last:rounded-r-[1.5rem] text-right">
                          {h.status === "Upcoming" && (
                            <button onClick={() => setDeleteId(h._id)} className="group p-2.5 rounded-full bg-white border border-[#E7E1D3] text-[#C9C2AE] hover:bg-[#A24A32] hover:text-white hover:border-[#A24A32] transition-all duration-300 active:scale-90 cursor-pointer">
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
              {filtered.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 bg-[#FBFAF6] border-t border-[#E7E1D3] gap-4 sm:gap-0">

                  {/* Page Counter */}
                  <div className="order-1 sm:order-2 px-6 py-2 bg-white rounded-full border border-[#E7E1D3]">
                    <p className="text-[10px] sm:text-[11px] font-black text-[#8A8478] uppercase tracking-widest text-center">
                      Page <span className="text-[#B8912E]">{currentPage}</span>
                      <span className="mx-2 text-[#D6D0BF]">/</span> {totalPages}
                    </p>
                  </div>

                  {/* Buttons Container */}
                  <div className="order-2 sm:order-1 flex w-full sm:w-auto gap-3 items-center justify-between sm:contents">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-2xl bg-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#8A8478] border border-[#E7E1D3] transition-all enabled:hover:text-[#B8912E] enabled:hover:border-[#B8912E]/40 enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
                      <span>Prev</span>
                    </button>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex-1 sm:flex-none order-3 flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-2xl bg-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#8A8478] border border-[#E7E1D3] transition-all enabled:hover:text-[#B8912E] enabled:hover:border-[#B8912E]/40 enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <span>Next</span>
                      <ChevronRight size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
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

export default HolidayList;