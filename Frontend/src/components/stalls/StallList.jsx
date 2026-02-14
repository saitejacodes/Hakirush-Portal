import axios from "axios";
import React, { useEffect, useState } from "react";
import { Search, Plus, Store, ChevronLeft, ChevronRight, Loader2, Info } from "lucide-react";
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
    <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-xl shadow-red-100/50 border border-white p-4 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500" />
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative">
          <img
            src={getImageUrl(s.logo)}
            onError={(e) => (e.target.src = "/default-avatar.png")}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
            alt={s.name}
          />
          <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
            #{s.number}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-black text-red-950 text-sm uppercase tracking-tighter truncate">
            {s.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-lg">
              {s.type}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              • {s.eventCount} Operations
            </span>
          </div>
        </div>

        <div className="shrink-0 scale-90 origin-right">
          <StallButtons id={s._id} refresh={refresh} />
        </div>
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 5;

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
      console.error("Critical: Stall data sync failure.");
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
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStalls = filteredStalls.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-1 bg-red-600 rounded-full" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Logistics Registry</p>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-red-950 leading-none">
              Manage <span className="text-red-600 underline decoration-red-200 underline-offset-8">Stalls</span>
            </h1>
          </div>

          <Link
            to="/admin-dashboard/add-stall"
            className="group flex items-center gap-3 rounded-2xl bg-red-600 px-8 py-4 font-black text-[11px] uppercase tracking-[0.2em] text-white shadow-2xl shadow-red-200 hover:bg-red-950 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> Add New Asset
          </Link>
        </div>

        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(220,38,38,0.1)] border border-white overflow-hidden">
          
          {/* SEARCH BAR */}
          <div className="p-6 md:p-8 bg-gradient-to-b from-red-50/50 to-transparent flex flex-col md:flex-row gap-4 items-center border-b border-red-50">
            <div className="relative w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-red-400" size={18} />
              <input
                type="text"
                placeholder="FILTER BY STALL NAME OR IDENTIFIER..."
                className="w-full rounded-2xl border-2 border-red-50 bg-white/50 pl-14 pr-4 py-4 outline-none focus:border-red-600 focus:bg-white text-[11px] font-black uppercase tracking-widest text-red-950 transition-all shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-32 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="animate-spin text-red-600" size={40} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">Retrieving Stall Intelligence...</p>
            </div>
          ) : (
            <>
              {/* MOBILE GRID */}
              <div className="md:hidden grid grid-cols-1 gap-4 p-4 pb-10">
                {paginatedStalls.length ? (
                  paginatedStalls.map((s) => <MobileStallCard key={s._id} s={s} refresh={fetchStalls} />)
                ) : (
                  <EmptyState />
                )}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-red-800 text-white uppercase text-[10px] font-black tracking-[0.2em]">
                      <th className="px-8 py-5">ID</th>
                      <th className="px-6 py-5">Identifier</th>
                      <th className="px-6 py-5">Asset Type</th>
                      <th className="px-6 py-5 text-center">Load</th>
                      <th className="px-6 py-5">Allocation</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-50">
                    {paginatedStalls.map((s) => (
                      <tr key={s._id} className="hover:bg-red-50/50 transition-colors group">
                        <td className="px-8 py-6 text-[10px] font-black text-red-300">{s.sno.toString().padStart(2, '0')}</td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white border border-red-50 p-1 shadow-sm overflow-hidden group-hover:scale-110 transition-transform">
                              <img src={getImageUrl(s.logo)} className="w-full h-full object-cover rounded-lg" alt="" />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-tighter text-red-950">{s.name}</p>
                              <p className="text-[9px] font-bold text-red-500 uppercase">Stall No: {s.number}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                           <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-red-100 text-red-600 rounded-lg">
                             {s.type}
                           </span>
                        </td>
                        <td className="px-6 py-6 text-center font-black text-red-950 text-xs">{s.eventCount}</td>
                        <td className="px-6 py-6">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {s.plans.length ? s.plans.map((p, i) => (
                              <span key={i} className="text-[8px] font-bold uppercase px-2 py-0.5 bg-slate-100 rounded-md text-slate-500">
                                {p}
                              </span>
                            )) : <span className="text-[9px] italic text-slate-300">Unallocated</span>}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <StallButtons id={s._id} refresh={fetchStalls} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {filteredStalls.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between px-8 py-8 border-t border-red-50 bg-red-50/30">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed bg-white border border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-sm"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-950 bg-white px-4 py-2 rounded-xl shadow-sm border border-red-100">
                      Tier {currentPage} <span className="text-red-300 ml-2">/ {totalPages}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed bg-red-600 text-white hover:bg-red-950 transition-all cursor-pointer shadow-xl shadow-red-200"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* DEEP RED FOOTER */}
        <div className="mt-8 flex justify-between items-center px-6">
           <p className="text-[9px] font-bold text-red-300 uppercase tracking-[0.2em]">Asset Terminal V3.0 • Status: Operational</p>
           <div className="flex gap-1">
             {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-red-200" />)}
           </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="text-center py-20 bg-white/50 rounded-[2rem] border-2 border-dashed border-red-100">
    <Store className="mx-auto text-red-200 mb-4" size={48} strokeWidth={1} />
    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-300">No assets found in current sector</p>
  </div>
);

export default StallList;