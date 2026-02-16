import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Filter, Users, LayoutGrid, ChevronLeft, ChevronRight, Loader2, Award } from "lucide-react";
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
    <div className="bg-white rounded-[2.5rem] shadow-lg border border-white p-6 transition-all active:scale-[0.98]">
      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          <img
            src={getImageUrl(s.logo)}
            onError={(e) => (e.target.src = "/default-avatar.png")}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-red-50 shadow-sm shrink-0"
            alt="logo"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
            <Award size={10} className="text-white" />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">
            {s.collaboration}
          </p>
          <h4 className="font-black text-slate-800 uppercase italic tracking-tighter truncate leading-none">
            {s.name}
          </h4>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-slate-50 rounded-2xl p-3 text-center">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Events</p>
          <p className="font-black text-slate-700">{s.eventsSponsored}</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-3 text-center">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Reach</p>
          <p className="font-black text-slate-700">{s.reach}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-50 flex justify-end">
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
        const data = res.data.sponsors.map((s, idx) => ({ ...s, sno: idx + 1 }));
        setSponsors(data);
        setFilteredSponsors(data);
      }
    } catch {
      console.error("Failed to retrieve sponsor intelligence.");
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
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 pb-12">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-red-100">
              <Award size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-red-700 uppercase tracking-tighter sm:text-5xl leading-none italic">
                Sponsors
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">
                Manage Strategic Partnerships
              </p>
            </div>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white overflow-hidden">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row gap-4">
            <div className="group relative flex-1 w-full flex items-center bg-slate-100/50 border-2 border-transparent rounded-[1.5rem] px-5 focus-within:border-red-500/20 focus-within:bg-white transition-all shadow-inner">
              <Search className="text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="SEARCH PARTNERS OR COLLABORATIONS..."
                className="w-full py-5 pl-4 outline-none bg-transparent text-[11px] font-black uppercase tracking-widest text-slate-700 placeholder:text-slate-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
              <Link
                to="/admin-dashboard/add-sponsor"
                className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-[1.5rem] bg-red-700 px-8 py-5 font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-slate-200 transition-all hover:bg-red-600 hover:shadow-red-200 active:scale-95 whitespace-nowrap"
              >
                <Plus size={18} strokeWidth={3} />
                <span>Add Partner</span>
              </Link>
          </div>

          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
              <Loader2 className="text-red-600 animate-spin" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Syncing Intelligence...</p>
            </div>
          ) : (
            <>
              {/* DESKTOP VIEW */}
              <div className="hidden md:block overflow-x-auto px-4 pb-4">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-6 py-4 text-left">Identity</th>
                      <th className="px-6 py-4 text-center">Engagement</th>
                      <th className="px-6 py-4 text-left">Reach Metrics</th>
                      <th className="px-6 py-4 text-left">Current Status</th>
                      <th className="px-6 py-4 text-right">Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSponsors.map((s) => (
                      <tr key={s._id} className="bg-slate-50/50 hover:bg-red-50/50 transition-all group">
                        <td className="px-6 py-4 first:rounded-l-[1.5rem]">
                          <div className="flex items-center gap-4">
                            <img src={getImageUrl(s.logo)} className="w-12 h-12 rounded-xl border-2 border-white shadow-sm object-cover" alt="" />
                            <div>
                              <p className="font-black uppercase italic tracking-tighter text-slate-800 leading-none group-hover:text-red-700 transition-colors">{s.name}</p>
                              <p className="text-[9px] font-bold text-red-500 uppercase mt-1 tracking-widest">{s.collaboration}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center px-4 py-1 bg-white border border-slate-100 rounded-lg text-slate-700 font-black text-xs">
                            {s.eventsSponsored}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-600 font-black text-[11px] uppercase tracking-tight">
                            <Users size={14} className="text-red-400" /> {s.reach}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[9px] font-black uppercase tracking-widest text-red-600 bg-white border border-red-50 px-3 py-1.5 inline-block rounded-lg shadow-sm">
                            {s.upcomingEvents}
                          </div>
                        </td>
                        <td className="px-6 py-4 last:rounded-r-[1.5rem] text-right">
                          <SponsorButtons id={s._id} refresh={fetchSponsors} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE VIEW */}
              <div className="md:hidden p-4 space-y-6">
                {paginatedSponsors.map((s) => (
                  <MobileSponsorCard key={s._id} s={s} refresh={fetchSponsors} />
                ))}
              </div>

              {/* EMPTY STATE */}
              {!paginatedSponsors.length && (
                <div className="py-32 text-center">
                  <LayoutGrid className="mx-auto text-slate-100 mb-4" size={64} />
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">No partner records detected</p>
                </div>
              )}

              {/* PREMIUM PAGINATION */}
              {filteredSponsors.length > ITEMS_PER_PAGE && (
                <div className="px-8 py-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Page <span className="text-red-600">{currentPage}</span> of {totalPages}
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

export default SponsorList;