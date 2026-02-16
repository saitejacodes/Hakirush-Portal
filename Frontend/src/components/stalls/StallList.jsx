import axios from "axios";
import React, { useEffect, useState } from "react";
import { Search, Plus, Store, ChevronLeft, ChevronRight, Loader2, Award, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import { StallButtons } from "../../utils/StallHelper";

/* ================= IMAGE HELPER ================= */
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/default-avatar.png";
  if (imagePath.startsWith("http")) return imagePath;
  return `${import.meta.env.VITE_BACKEND_URL}/${imagePath}`;
};

/* ================= PREMIUM MOBILE CARD ================= */
const MobileStallCard = ({ s, refresh }) => {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-lg border border-white p-6 transition-all active:scale-[0.98]">
      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          <img
            src={getImageUrl(s.logo)}
            onError={(e) => (e.target.src = "/default-avatar.png")}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-red-50 shadow-sm shrink-0"
            alt={s.name}
          />
          <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-lg border-2 border-white uppercase">
            #{s.number}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">
            {s.type}
          </p>
          <h4 className="font-black text-slate-800 uppercase italic tracking-tighter truncate leading-none">
            {s.name}
          </h4>
        </div>
      </div>
      
      <div className="bg-slate-50 rounded-2xl p-4 mb-5 flex justify-between items-center">
        <div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Operations</p>
          <p className="font-black text-slate-700">{s.eventCount} Events</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Allocation</p>
          <p className="font-black text-slate-700 text-[10px] truncate max-w-[100px]">
            {s.plans.length > 0 ? s.plans[0] : "None"}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-50 flex justify-end">
        <StallButtons id={s._id} refresh={refresh} />
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 8;

const StallList = () => {
  const [stalls, setStalls] = useState([]);
  const [filteredStalls, setFilteredStalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchStalls = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/stalls`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.success) {
        const data = res.data.stalls.map((s, index) => ({
          _id: s._id,
          sno: index + 1,
          ...s,
        }));
        setStalls(data);
        setFilteredStalls(data);
      }
    } catch {
      console.error("Stall data sync failure.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStalls(); }, []);

  useEffect(() => {
    const result = stalls.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.number.toString().includes(search)
    );
    setFilteredStalls(result);
    setCurrentPage(1);
  }, [search, stalls]);

  const totalPages = Math.ceil(filteredStalls.length / ITEMS_PER_PAGE);
  const paginatedStalls = filteredStalls.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 pb-12">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-red-100">
              <Store size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-red-700 uppercase tracking-tighter sm:text-5xl leading-none italic">
                Stalls
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">
                Logistics & Asset Registry
              </p>
            </div>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white overflow-hidden">
          
          {/* SEARCH BAR */}
          <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row gap-4">
            <div className="group relative flex-1 w-full flex items-center bg-slate-100/50 border-2 border-transparent rounded-[1.5rem] px-5 focus-within:border-red-500/20 focus-within:bg-white transition-all shadow-inner">
              <Search className="text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="FILTER BY STALL NAME OR IDENTIFIER..."
                className="w-full py-5 pl-4 outline-none bg-transparent text-[11px] font-black uppercase tracking-widest text-slate-700 placeholder:text-slate-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
              <Link
                to="/admin-dashboard/add-stall"
                className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-[1.5rem] bg-red-700 px-8 py-5 font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-slate-200 transition-all hover:bg-red-600 hover:shadow-red-200 active:scale-95 whitespace-nowrap"
              >
                <Plus size={18} strokeWidth={3} />
                <span>Add New Asset</span>
              </Link>
          </div>

          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
              <Loader2 className="text-red-600 animate-spin" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Retrieving Assets...</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto px-4 pb-4">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-6 py-4 text-left">ID</th>
                      <th className="px-6 py-4 text-left">Asset Details</th>
                      <th className="px-6 py-4 text-left">Type</th>
                      <th className="px-6 py-4 text-center">Load</th>
                      <th className="px-6 py-4 text-left">Allocations</th>
                      <th className="px-6 py-4 text-right">Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStalls.map((s) => (
                      <tr key={s._id} className="bg-slate-50/50 hover:bg-red-50/50 transition-all group">
                        <td className="px-6 py-4 first:rounded-l-[1.5rem] text-xs font-black text-slate-300 italic">
                           #{s.sno.toString().padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img src={getImageUrl(s.logo)} className="w-12 h-12 rounded-xl border-2 border-white shadow-sm object-cover" alt="" />
                            <div>
                              <p className="font-black uppercase italic tracking-tighter text-slate-800 leading-none group-hover:text-red-700 transition-colors">{s.name}</p>
                              <p className="text-[9px] font-bold text-red-500 uppercase mt-1 tracking-widest">Stall No: {s.number}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white border border-slate-100 text-slate-600 rounded-lg">
                            {s.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <p className="text-xs font-black text-slate-700">{s.eventCount}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {s.plans.length ? s.plans.map((p, i) => (
                              <span key={i} className="text-[8px] font-bold uppercase px-2 py-0.5 bg-red-100/50 text-red-700 rounded-md">
                                {p}
                              </span>
                            )) : <span className="text-[9px] italic text-slate-300">No Data</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 last:rounded-r-[1.5rem] text-right">
                          <StallButtons id={s._id} refresh={fetchStalls} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE VIEW */}
              <div className="md:hidden p-4 space-y-6">
                {paginatedStalls.length ? (
                  paginatedStalls.map((s) => <MobileStallCard key={s._id} s={s} refresh={fetchStalls} />)
                ) : (
                  <div className="py-20 text-center text-slate-300 font-black uppercase text-xs tracking-widest">
                     No Assets Found
                  </div>
                )}
              </div>

              {/* PREMIUM PAGINATION */}
              {filteredStalls.length > ITEMS_PER_PAGE && (
                <div className="px-8 py-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Tier <span className="text-red-600">{currentPage}</span> of {totalPages}
                  </p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 transition-all shadow-sm 
                                 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 
                                 hover:enabled:text-red-600 hover:enabled:border-red-100"
                    >
                      <ChevronLeft size={20} strokeWidth={3} />
                    </button>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-3 rounded-xl bg-red-600 text-white transition-all shadow-xl shadow-red-100 
                                 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 
                                 hover:enabled:bg-red-700 active:enabled:scale-95"
                    >
                      <ChevronRight size={20} strokeWidth={3} />
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

export default StallList;