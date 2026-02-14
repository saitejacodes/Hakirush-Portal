import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClientButtons } from "../../utils/ClientHelper";
import { Search, UserPlus } from "lucide-react"; // Added UserPlus icon

/* ================= MOBILE CARD ================= */
const MobileClientCard = ({ client, getImageUrl }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-red-100 p-3 transition-all active:scale-[0.98]">
      <div className="flex items-center gap-3">
        <img
          src={getImageUrl(client.logo)}
          onError={(e) => (e.target.src = "/default-avatar.png")}
          className="w-12 h-12 rounded-full object-cover border shrink-0 border-red-50"
        />

        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-xs truncate uppercase tracking-tight">
            {client.name}
          </p>
          <p className="text-[10px] font-black text-red-600 truncate uppercase tracking-widest">
            {client.planType}
          </p>
          <p className="text-[11px] font-medium text-gray-400 truncate">
            ₹ {client.budget}
          </p>
        </div>

        <div className="shrink-0">
          <ClientButtons id={client._id} />
        </div>
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
            doj: c.dateOfJoining
              ? new Date(c.dateOfJoining).toDateString()
              : "N/A",
            logo: c.companyLogo || "",
            planType:
              c.planType === "Annual"
                ? "Annual Plan"
                : c.planType === "Quarterly"
                ? "Quarterly Plan"
                : "No Plan",
          }));

          setClients(data);
          setFilteredClients(data);
        }
      } catch {
        alert("Failed to load clients");
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

  /* ===== PAGINATION LOGIC ===== */
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedClients = filteredClients.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  /* ===== IMAGE HANDLER ===== */
  const getImageUrl = (img) => {
    if (!img) return "/default-avatar.png";
    if (img.startsWith("http")) return img;
    return `${import.meta.env.VITE_BACKEND_URL}/${img}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 text-center md:text-left">
          <h3 className="text-3xl md:text-5xl font-black text-red-700 uppercase italic tracking-tighter">
            Manage Clients<span className="text-slate-800">.</span>
          </h3>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-400 mt-2">
            View and manage organizational partners
          </p>
        </div>

        <div className="bg-white/95 rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
          
          {/* TOP BAR - SIDE BY SIDE LAYOUT */}
          <div className="p-6 md:p-8 border-b border-red-50">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              
              {/* SEARCH BAR */}
              <div className="group relative flex-1 w-full flex items-center bg-slate-100/50 border-2 border-transparent rounded-2xl px-5 focus-within:border-red-500/20 focus-within:bg-white transition-all shadow-inner">
                <Search className="text-red-300 group-focus-within:text-red-500 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="SEARCH CLIENT NAME..."
                  className="w-full py-4 pl-4 outline-none bg-transparent text-[11px] font-bold uppercase tracking-widest text-slate-700 placeholder:text-slate-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* ACTION BUTTON BESIDE SEARCH */}
              <Link
                to="/admin-dashboard/add-client"
                className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-red-700 px-8 py-4 font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-slate-200 transition-all hover:bg-red-600 hover:shadow-red-200 active:scale-95 whitespace-nowrap"
              >
                <UserPlus size={18} strokeWidth={3} />
                <span>Add Client</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-24 text-center">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Syncing Clients...</p>
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden grid gap-4 px-4 pb-6 pt-4">
                {paginatedClients.length ? (
                  paginatedClients.map((c) => (
                    <MobileClientCard
                      key={c._id}
                      client={c}
                      getImageUrl={getImageUrl}
                    />
                  ))
                ) : (
                  <div className="text-center text-red-400 py-20 text-[10px] font-black uppercase tracking-widest">
                    No clients found
                  </div>
                )}
              </div>

              {/* DESKTOP */}
              <div className="hidden md:block px-4 pb-4 overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-6 py-4 text-center">S.No</th>
                      <th className="px-6 py-4 text-left">Identity</th>
                      <th className="px-6 py-4 text-left">Client Details</th>
                      <th className="px-6 py-4 text-left">Financials</th>
                      <th className="px-6 py-4 text-left">Timeline</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedClients.map((c) => (
                      <tr key={c._id} className="bg-slate-50/50 hover:bg-red-50/50 transition-all group">
                        <td className="px-6 py-4 first:rounded-l-2xl text-xs font-black text-slate-300 italic">#{c.sno}</td>
                        <td className="px-6 py-4">
                          <img
                            src={getImageUrl(c.logo)}
                            className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm"
                            alt="logo"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-black text-slate-700 uppercase italic tracking-tighter group-hover:text-red-700 transition-colors">
                            {c.name}
                          </p>
                          <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded border border-slate-100 text-red-500 uppercase">
                            {c.planType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-slate-600">₹ {c.budget}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{c.doj}</p>
                        </td>
                        <td className="px-6 py-4 last:rounded-r-2xl text-right">
                          <ClientButtons id={c._id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {filteredClients.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between p-8 bg-slate-50/50 border-t border-white">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 transition-all enabled:cursor-pointer enabled:hover:text-red-600 enabled:active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ◀ Prev
                  </button>

                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Page <span className="text-red-600">{currentPage}</span> / {totalPages}
                  </p>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 transition-all enabled:cursor-pointer enabled:hover:text-red-600 enabled:active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next ▶
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