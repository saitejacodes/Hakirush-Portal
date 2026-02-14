import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Filter, Users, LayoutGrid, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { SponsorButtons } from "../../utils/SponsorHelper";

/* ================= IMAGE HELPER ================= */
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/default-avatar.png";
  if (imagePath.startsWith("http")) return imagePath;
  return `${import.meta.env.VITE_BACKEND_URL}/${imagePath}`;
};

/* ================= PREMIUM MOBILE CARD ================= */
const MobileSponsorCard = ({ s, refresh }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-red-100 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-red-50 shadow-sm">
            <img
              src={getImageUrl(s.logo)}
              onError={(e) => (e.target.src = "/default-avatar.png")}
              className="w-full h-full object-cover"
              alt="logo"
            />
          </div>
          <div>
            <h4 className="font-black italic uppercase tracking-tighter text-slate-800 leading-none truncate w-40">
              {s.name}
            </h4>
            <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest text-red-500">
              {s.collaboration}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4 bg-red-50/50 p-3 rounded-2xl">
        <div className="text-center">
          <p className="text-[8px] font-bold text-red-400 uppercase tracking-widest">Events</p>
          <p className="font-black text-slate-700">{s.eventsSponsored}</p>
        </div>
        <div className="text-center border-l border-red-100">
          <p className="text-[8px] font-bold text-red-400 uppercase tracking-widest">Reach</p>
          <p className="font-black text-slate-700">{s.reach}</p>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-red-50">
        <SponsorButtons id={s._id} refresh={refresh} />
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 8;

const SponsorList = () => {
  const [sponsors, setSponsors] = useState([]);
  const [filteredSponsors, setFilteredSponsors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/sponsors`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        setSponsors(res.data.sponsors.map((s, idx) => ({ ...s, sno: idx + 1 })));
        setFilteredSponsors(res.data.sponsors.map((s, idx) => ({ ...s, sno: idx + 1 })));
      }
    } catch {
      alert("System Fault: Failed to retrieve sponsor intelligence.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSponsors(); }, []);

  useEffect(() => {
    const result = sponsors.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.collaboration.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredSponsors(result);
    setCurrentPage(1);
  }, [search, sponsors]);

  const totalPages = Math.ceil(filteredSponsors.length / ITEMS_PER_PAGE);
  const paginatedSponsors = filteredSponsors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-1 bg-red-600 rounded-full" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Global Partners</p>
            </div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900 leading-[0.8]">
              Sponsor <span className="text-red-600">Assets</span>
            </h1>
          </div>

          <Link
            to="/admin-dashboard/add-sponsor"
            className="group flex items-center gap-3 bg-gradient-to-r from-red-600 to-rose-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-200 hover:scale-105 transition-all active:scale-95"
          >
            <Plus size={16} /> Add New Partner
          </Link>
        </div>

        {/* MAIN CONTAINER */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(220,38,38,0.1)] border border-white overflow-hidden">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="p-6 md:p-8 border-b border-red-50 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-red-300 group-focus-within:text-red-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="SEARCH BY PARTNER NAME OR COLLABORATION..."
                className="w-full bg-red-50/30 border border-red-100 rounded-2xl py-4 pl-14 pr-6 text-[11px] font-bold uppercase tracking-widest outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-400/10 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="hidden md:flex items-center gap-2 px-6 bg-white border border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors">
              <Filter size={16} /> Filter
            </button>
          </div>

          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
              <Loader2 className="text-red-600 animate-spin" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Syncing Intelligence...</p>
            </div>
          ) : (
            <>
              {/* DESKTOP VIEW */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    {/* UPDATED: HEADER FROM BLACK TO RED GRADIENT */}
                    <tr className="bg-gradient-to-r from-red-700 to-red-900 text-[10px] font-black uppercase tracking-widest text-white">
                      <th className="px-8 py-6">Identity</th>
                      <th className="px-6 py-6 text-center">Engagement</th>
                      <th className="px-6 py-6">Reach Metrics</th>
                      <th className="px-6 py-6">Upcoming Status</th>
                      <th className="px-8 py-6 text-right">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-50">
                    {paginatedSponsors.map((s) => (
                      <tr key={s._id} className="group hover:bg-red-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-red-200 w-4">{s.sno}</span>
                            <img src={getImageUrl(s.logo)} className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm object-cover" alt="" />
                            <div>
                              <p className="font-black uppercase italic tracking-tighter text-slate-800 leading-none">{s.name}</p>
                              <p className="text-[9px] font-bold text-red-500 uppercase mt-1 tracking-widest">{s.collaboration}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 bg-red-50 rounded-lg text-red-700 font-black text-xs">
                            {s.eventsSponsored}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase">
                            <Users size={14} className="text-red-400" /> {s.reach}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-3 py-1 inline-block rounded-md border border-red-100">
                            {s.upcomingEvents}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <SponsorButtons id={s._id} refresh={fetchSponsors} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE VIEW */}
              <div className="md:hidden p-4 space-y-4">
                {paginatedSponsors.map((s) => (
                  <MobileSponsorCard key={s._id} s={s} refresh={fetchSponsors} />
                ))}
              </div>

              {/* EMPTY STATE */}
              {!paginatedSponsors.length && (
                <div className="py-32 text-center">
                  <LayoutGrid className="mx-auto text-red-100 mb-4" size={64} />
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-red-300">Zero Sponsor Records Detected</p>
                </div>
              )}

              {/* PREMIUM PAGINATION */}
              <div className="px-8 py-8 border-t border-red-50 flex items-center justify-between bg-red-50/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-400">
                  Page <span className="text-red-600">{currentPage}</span> of {totalPages}
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-3 rounded-xl bg-white border border-red-100 text-red-600 transition-all shadow-sm 
                               cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 
                               hover:enabled:bg-red-600 hover:enabled:text-white"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-xl bg-red-600 text-white transition-all shadow-xl shadow-red-100 
                               cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 
                               hover:enabled:bg-red-700"
                  >
                    <ChevronRight size={18} />
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

export default SponsorList;