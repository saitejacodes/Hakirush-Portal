import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClientButtons } from "../../utils/ClientHelper";
import { Search, UserPlus, Building2, ChevronLeft, ChevronRight } from "lucide-react";

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#C6A15B";
const HAIRLINE = "#E7DFD2";

const displayFont = { fontFamily: "'Playfair Display', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

const GRAIN_URI =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='140'%20height='140'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23n)'%20opacity='0.5'/%3E%3C/svg%3E";

/* ================= PREMIUM MOBILE CARD ================= */
const MobileClientCard = ({ client, getImageUrl }) => {
  return (
    <div className="rounded-[1.5rem] border border-[#E7DFD2] bg-white/75 p-5 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_16px_32px_-16px_rgba(28,26,23,0.14)] backdrop-blur-md transition-all duration-300 active:scale-[0.98]">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <img
            src={getImageUrl(client.logo)}
            onError={(e) => (e.target.src = "/default-avatar.png")}
            className="h-14 w-14 rounded-[1.1rem] border-2 object-cover shadow-sm"
            style={{ borderColor: HAIRLINE }}
          />
          <div
            className="absolute -right-0.5 -bottom-0.5 h-4 w-4 rounded-full border-2 border-white"
            style={{ backgroundColor: "#3F5B54" }}
          ></div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-widest" style={{ color: GOLD }}>
            {client.planType}
          </p>
          <p
            className="truncate text-base leading-none tracking-tight text-[#1C1A17]"
            style={{ ...displayFont, fontWeight: 700 }}
          >
            {client.name}
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-tight text-[#8A8378]">
            ₹ {client.budget}
          </p>
        </div>
      </div>

      <div className="mt-5 flex justify-end border-t pt-4" style={{ borderColor: HAIRLINE }}>
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

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/client`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
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
      } catch (err) {
        console.error("Failed to load clients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const result = clients.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
      || c.planType.toLowerCase().includes(search.toLowerCase())
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
    <div
      className="relative min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-100 pb-20 text-[#1C1A17]"
      style={bodyFont}
    >
      {/* faint paper grain, matching the rest of the app */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] mix-blend-multiply"
        style={{ backgroundImage: `url("${GRAIN_URI}")` }}
      />
      {/* masthead rule */}
      <div
        className="relative z-10 h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, ${GARNET}, ${GOLD} 45%, ${GARNET})` }}
      />

      <div className="relative z-10 mx-auto max-w-[1400px] space-y-8 p-4 sm:p-8">

        {/* HEADER */}
        <header className="flex items-center gap-5 pt-4 sm:gap-6 sm:pt-6">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] text-white shadow-[0_20px_40px_-14px_rgba(122,34,51,0.45)] sm:h-16 sm:w-16"
            style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
          >
            <Building2 size={28} strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-px w-6" style={{ backgroundColor: GOLD }} />
              <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-[#C6A15B] sm:text-[10px]">
                Registry &amp; Account Management
              </p>
            </div>
            <h1
              className="text-2xl leading-[0.95] tracking-tight text-[#1C1A17] sm:text-4xl"
              style={{ ...displayFont, fontWeight: 700 }}
            >
              <span className="italic text-[#7A2233]">Client</span> Directory
            </h1>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <div className="overflow-hidden rounded-[2rem] border border-[#E7DFD2] bg-white/70 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_30px_60px_-24px_rgba(28,26,23,0.16)] backdrop-blur-md sm:rounded-[2.25rem]">

          {/* SEARCH & ACTION ROW */}
          <div className="border-b p-6 md:p-9" style={{ borderColor: HAIRLINE }}>
            <div className="flex flex-col items-center gap-4 lg:flex-row lg:gap-5">

              {/* SEARCH BAR */}
              <div
                className="group relative flex w-full flex-1 items-center rounded-2xl border px-5 transition-all focus-within:border-[#C6A15B]/50 focus-within:bg-white"
                style={{ borderColor: HAIRLINE, backgroundColor: "#FBF8F3" }}
              >
                <Search className="text-[#B4ADA0] transition-colors group-focus-within:text-[#7A2233]" size={18} strokeWidth={1.75} />
                <input
                  type="text"
                  placeholder="Search by name or plan…"
                  className="w-full bg-transparent py-4 pl-4 text-[12px] font-semibold uppercase tracking-widest text-[#1C1A17] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[#B4ADA0]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* ACTION BUTTON */}
              <Link
                to="/admin-dashboard/add-client"
                className="flex w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-2xl px-9 py-4 text-[10.5px] font-semibold uppercase tracking-widest text-white shadow-[0_14px_28px_-10px_rgba(28,26,23,0.35)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 lg:w-auto"
                style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
              >
                <UserPlus size={17} strokeWidth={1.75} />
                <span>Onboard Client</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-24 text-center">
              <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-[#E7DFD2] border-t-[#7A2233]"></div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-[#8A8378]">
                Synchronizing Registry
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="space-y-4 p-4 md:hidden">
                {paginatedClients.length ? (
                  paginatedClients.map((client) => (
                    <MobileClientCard key={client._id} client={client} getImageUrl={getImageUrl} />
                  ))
                ) : (
                  <p className="py-16 text-center text-xs font-semibold uppercase tracking-widest text-[#B4ADA0]">
                    No records found
                  </p>
                )}
              </div>

              {/* DESKTOP VIEW */}
              <div className="hidden overflow-x-auto px-8 pb-10 md:block">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10.5px] font-semibold uppercase tracking-[0.28em] text-[#B4ADA0]">
                      <th className="px-8 py-3 text-left">S.No</th>
                      <th className="px-8 py-3 text-left">Client</th>
                      <th className="px-8 py-3 text-left">Plan</th>
                      <th className="px-8 py-3 text-left">Budget</th>
                      <th className="px-8 py-3 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedClients.map((client) => (
                      <tr
                        key={client._id}
                        className="group border transition-all duration-300 hover:border-[#D9C79A]"
                        style={{ backgroundColor: "#FBF8F3", borderColor: HAIRLINE }}
                      >
                        {/* S.No */}
                        <td className="rounded-l-[1.5rem] px-8 py-5 text-[11px] font-semibold italic tabular-nums text-[#B4ADA0]">
                          {client.sno.toString().padStart(2, "0")}
                        </td>

                        {/* Logo & Name */}
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <img
                              src={getImageUrl(client.logo)}
                              className="h-11 w-11 rounded-[0.9rem] border-2 border-white object-cover shadow-md transition-transform duration-300 group-hover:scale-110"
                              alt=""
                            />
                            <p
                              className="text-base leading-tight tracking-tight text-[#1C1A17] transition-colors group-hover:text-[#7A2233]"
                              style={{ ...displayFont, fontWeight: 700 }}
                            >
                              {client.name}
                            </p>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="px-8 py-5">
                          <span
                            className="rounded-xl border bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#8A8378] shadow-sm transition-colors group-hover:border-[#D9C79A]"
                            style={{ borderColor: HAIRLINE }}
                          >
                            {client.planType}
                          </span>
                        </td>

                        {/* Budget */}
                        <td className="px-8 py-5">
                          <span
                            className="rounded-xl border bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#8A8378] shadow-sm transition-colors group-hover:border-[#D9C79A]"
                            style={{ borderColor: HAIRLINE }}
                          >
                            ₹ {client.budget}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="rounded-r-[1.5rem] px-8 py-5 text-right">
                          <div className="origin-right scale-110 transition-transform group-hover:-translate-x-1">
                            <ClientButtons id={client._id} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {filteredClients.length > ITEMS_PER_PAGE && (
                <div
                  className="flex flex-col items-center justify-between gap-4 border-t p-6 sm:flex-row sm:gap-0 sm:p-8"
                  style={{ borderColor: HAIRLINE, backgroundColor: "#FBF8F3" }}
                >
                  {/* Page Counter */}
                  <div
                    className="order-1 rounded-full border bg-white px-6 py-2 sm:order-2"
                    style={{ borderColor: HAIRLINE }}
                  >
                    <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-[#8A8378] sm:text-[11px]">
                      Page <span style={{ color: GARNET }}>{currentPage}</span>
                      <span className="mx-2 text-[#E7DFD2]">/</span> {totalPages}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="order-2 flex w-full items-center justify-between gap-3 sm:order-1 sm:w-auto sm:contents">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border bg-white px-4 py-3 text-[9px] font-semibold uppercase tracking-widest text-[#8A8378] shadow-sm transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:border-[#D9C79A] enabled:hover:text-[#7A2233] enabled:active:scale-95 sm:flex-none sm:gap-3 sm:px-6 sm:text-[10px]"
                      style={{ borderColor: HAIRLINE }}
                    >
                      <ChevronLeft size={14} className="sm:h-4 sm:w-4" strokeWidth={1.75} />
                      <span>Prev</span>
                    </button>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="order-3 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border bg-white px-4 py-3 text-[9px] font-semibold uppercase tracking-widest text-[#8A8378] shadow-sm transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:border-[#D9C79A] enabled:hover:text-[#7A2233] enabled:active:scale-95 sm:flex-none sm:gap-3 sm:px-6 sm:text-[10px]"
                      style={{ borderColor: HAIRLINE }}
                    >
                      <span>Next</span>
                      <ChevronRight size={14} className="sm:h-4 sm:w-4" strokeWidth={1.75} />
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

export default ClientList;