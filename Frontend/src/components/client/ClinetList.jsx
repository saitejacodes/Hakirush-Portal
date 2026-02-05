import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClientButtons } from "../../utils/ClientHelper";
import { Search } from "lucide-react";

/* ================= MOBILE CARD ================= */
const MobileClientCard = ({ client, getImageUrl }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-red-100 p-3">
      <div className="flex items-center gap-3">
        <img
          src={getImageUrl(client.logo)}
          onError={(e) => (e.target.src = "/default-avatar.png")}
          className="w-12 h-12 rounded-full object-cover border shrink-0"
        />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-xs truncate">
            {client.name}
          </p>
          <p className="text-xs text-red-600 truncate">
            {client.planType}
          </p>
          <p className="text-[11px] text-gray-500 truncate">
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
    return "/default-avatar.png";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-red-700">
            Manage Clients
          </h3>
          <p className="text-red-500 mt-2">
            View, search and manage client records
          </p>
        </div>

        <div className="bg-white/95 rounded-3xl shadow-2xl border border-red-100">
          {/* TOP BAR */}
          <div className="p-5 md:p-7 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
              <input
                type="text"
                placeholder="Search client..."
                className="w-full rounded-xl border border-red-300 pl-10 pr-4 py-3"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Link
              to="/admin-dashboard/add-client"
              className="rounded-xl bg-red-600 px-7 py-3 font-semibold text-white"
            >
              + Add Client
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-red-600 font-semibold text-lg">
              Loading clients...
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden grid gap-4 px-4 pb-6">
                {paginatedClients.length ? (
                  paginatedClients.map((c) => (
                    <MobileClientCard
                      key={c._id}
                      client={c}
                      getImageUrl={getImageUrl}
                    />
                  ))
                ) : (
                  <div className="text-center text-red-400 py-20 text-lg">
                    No clients found
                  </div>
                )}
              </div>

              {/* DESKTOP */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-4 py-3 text-center">S No</th>
                      <th className="px-4 py-3 text-left">Logo</th>
                      <th className="px-4 py-3 text-left">Client Name</th>
                      <th className="px-4 py-3 text-left">Budget</th>
                      <th className="px-4 py-3 text-left">DOJ</th>
                      <th className="px-4 py-3 text-left">Plan</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedClients.map((c) => (
                      <tr key={c._id} className="hover:bg-red-50 transition">
                        <td className="px-4 py-3 text-center">{c.sno}</td>
                        <td className="px-4 py-3 text-center">
                          <img
                            src={getImageUrl(c.logo)}
                            className="w-12 h-12 rounded-full"
                          />
                        </td>
                        <td className="px-4 py-3 text-left">{c.name}</td>
                        <td className="px-4 py-3 text-left">₹ {c.budget}</td>
                        <td className="px-4 py-3 text-left">{c.doj}</td>
                        <td className="px-4 py-3 text-left">{c.planType}</td>
                        <td className="px-4 py-3 text-right">
                          <ClientButtons id={c._id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {filteredClients.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between px-4 py-5 border-t bg-white/80 rounded-b-3xl">
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.max(p - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                    }`}
                  >
                    ◀ Previous
                  </button>

                  <span className="text-base font-semibold text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(p + 1, totalPages)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                    }`}
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