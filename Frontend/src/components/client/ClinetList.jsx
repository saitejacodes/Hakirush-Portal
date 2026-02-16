import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClientButtons } from "../../utils/ClientHelper";
import { Search, UserPlus, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";

/* ================= PREMIUM MOBILE CARD ================= */
const MobileClientCard = ({ client, getImageUrl }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-lg border border-white p-5 transition-all active:scale-[0.98]">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={getImageUrl(client.logo)}
            onError={(e) => (e.target.src = "/default-avatar.png")}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-red-50 shadow-sm shrink-0"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 border-2 border-white rounded-full"></div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">
            {client.planType}
          </p>
          <p className="font-black text-slate-800 uppercase italic tracking-tighter truncate leading-none">
            {client.name}
          </p>
          <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
            Budget: <span className="text-slate-700">₹ {client.budget}</span>
          </p>
        </div>
      </div>
      
      <div className="mt-5 pt-4 border-t border-slate-50 flex justify-end">
        <ClientButtons id={client._id} />
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 5;

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /* ===== FETCH CLIENTS ===== */
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/client`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data.success) {
          let sno = 1;
          const data = res.data.clients.map((c) => ({
            _id: c._id,
            sno: sno++,
            name: c.userId?.name || "Unknown",
            budget: c.budget || "N/A",
            doj: c.dateOfJoining ? new Date(c.dateOfJoining).toDateString() : "N/A",
            logo: c.companyLogo || "",
            planType: c.planType || "No Plan",
          }));

          setClients(data);
          setFilteredClients(data);
        }
      } catch {
        console.error("Failed to load clients");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  /* ===== SEARCH ===== */
  useEffect(() => {
    const result = clients.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredClients(result);
    setCurrentPage(1);
  }, [search, clients]);

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getImageUrl = (img) => {
    if (!img) return "/default-avatar.png";
    if (img.startsWith("http")) return img;
    return `${import.meta.env.VITE_BACKEND_URL}/${img}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 pb-12">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
        
        {/* HEADER */}
        <header className="flex items-center gap-5 pt-2">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-red-100">
            <Briefcase size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-red-700 uppercase tracking-tighter sm:text-5xl leading-none italic">
                Clients
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">
              Manage Organizational Clients
            </p>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white overflow-hidden">
          
          {/* SEARCH & ACTION ROW */}
          <div className="p-6 md:p-8 border-b border-slate-50">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              
              {/* SEARCH BAR */}
              <div className="group relative flex-1 w-full flex items-center bg-slate-100/50 border-2 border-transparent rounded-[1.5rem] px-5 focus-within:border-red-500/20 focus-within:bg-white transition-all shadow-inner">
                <Search className="text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="SEARCH BY CLIENT NAME..."
                  className="w-full py-5 pl-4 outline-none bg-transparent text-[11px] font-black uppercase tracking-widest text-slate-700 placeholder:text-slate-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* ACTION BUTTON */}
              <Link
                to="/admin-dashboard/add-client"
                className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-[1.5rem] bg-red-700 px-8 py-5 font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-slate-200 transition-all hover:bg-red-600 hover:shadow-red-200 active:scale-95 whitespace-nowrap"
              >
                <UserPlus size={18} strokeWidth={3} />
                <span>Add Client</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-24 text-center">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Syncing Partners...</p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="md:hidden p-4 space-y-4">
                {paginatedClients.length ? (
                  paginatedClients.map((c) => (
                    <MobileClientCard key={c._id} client={c} getImageUrl={getImageUrl} />
                  ))
                ) : (
                  <p className="text-center py-10 font-bold text-slate-300 uppercase text-xs">No Clients Found</p>
                )}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto px-4 pb-4">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-6 py-4 text-left">S.No</th>
                      <th className="px-6 py-4 text-left">Brand</th>
                      <th className="px-6 py-4 text-left">Partner Details</th>
                      <th className="px-6 py-4 text-left">Investment</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedClients.map((c) => (
                      <tr key={c._id} className="bg-slate-50/50 hover:bg-red-50/50 transition-all group">
                        <td className="px-6 py-4 first:rounded-l-[1.5rem] text-xs font-black text-slate-300 italic">#{c.sno}</td>
                        <td className="px-6 py-4">
                          <img
                            src={getImageUrl(c.logo)}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                            alt=""
                          />
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-black text-slate-700 uppercase italic tracking-tighter group-hover:text-red-700 transition-colors">
                            {c.name}
                          </p>
                          <span className="px-2 py-0.5 bg-white rounded text-[9px] font-black uppercase tracking-widest text-red-500 border border-slate-100">
                            {c.planType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-sm font-black text-slate-700">₹ {c.budget}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic">Since {c.doj}</p>
                        </td>
                        <td className="px-6 py-4 last:rounded-r-[1.5rem] text-right">
                          <ClientButtons id={c._id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {filteredClients.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between p-8 bg-slate-50/50">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 transition-all enabled:cursor-pointer enabled:hover:text-red-600 enabled:active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} strokeWidth={3} /> Prev
                  </button>

                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Page <span className="text-red-600">{currentPage}</span> / {totalPages}
                  </p>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 transition-all enabled:cursor-pointer enabled:hover:text-red-600 enabled:active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight size={16} strokeWidth={3} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientList;