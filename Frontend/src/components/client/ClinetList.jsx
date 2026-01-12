import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ClientButtons } from "../../utils/ClientHelper";
import { Search } from "lucide-react";

/* ========== MOBILE CARD ========== */
const MobileClientCard = ({ client, getImageUrl }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-red-100 p-3">
      <div className="flex items-center gap-3">

        {/* Logo */}
        <img
          src={getImageUrl(client.logo)}
          onError={(e) => (e.target.src = "/default-avatar.png")}
          className="w-12 h-12 rounded-full object-cover border shrink-0"
        />

        {/* Name + Plan */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {client.name}
          </p>
          <p className="text-xs text-red-600 truncate">
            {client.planType === "annual"
              ? "Annual Plan"
              : client.planType === "quarterly"
              ? "Quarterly Plan"
              : "No Plan"}
          </p>
        </div>

        {/* Buttons */}
        <div className="shrink-0">
          <ClientButtons id={client._id} />
        </div>

      </div>

      {/* Budget + DOJ */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>₹ {client.budget}</span>
        <span>{client.doj}</span>
      </div>
    </div>
  );
};

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

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
            planType: c.planType || "",
          }));

          setClients(data);
          setFilteredClients(data);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load clients");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    const result = clients.filter((c) =>
      (c.name || "").toLowerCase().includes(search.toLowerCase())
    );
    setFilteredClients(result);
  }, [search, clients]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/"))
      return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
    if (imagePath.startsWith("uploads/"))
      return `${import.meta.env.VITE_BACKEND_URL}/${imagePath}`;
    return `${import.meta.env.VITE_BACKEND_URL}/uploads/${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-6 md:mb-8 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-red-800">
            Manage Clients
          </h3>
          <p className="text-red-500 mt-2">View, search and manage clients</p>
        </div>

        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100 backdrop-blur">

          {/* TOP BAR */}
          <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" size={18} />
              <input
                type="text"
                placeholder="Search client..."
                className="w-full rounded-xl border border-red-300 pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-red-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Link
              to="/admin-dashboard/add-client"
              className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white shadow-md hover:bg-red-700"
            >
              + Add Client
            </Link>
          </div>

          {loading ? (
            <div className="p-10 text-center text-red-600">Loading clients...</div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden grid gap-4 p-4">
                {filteredClients.length ? (
                  filteredClients.map((c) => (
                    <MobileClientCard
                      key={c._id}
                      client={c}
                      getImageUrl={getImageUrl}
                    />
                  ))
                ) : (
                  <div className="text-center text-red-400 py-20">
                    No clients found
                  </div>
                )}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block max-h-[60vh] overflow-auto">
                <table className="w-full">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-4 py-3 text-left">S No</th>
                      <th className="px-4 py-3 text-left">Logo</th>
                      <th className="px-4 py-3 text-left">Client Name</th>
                      <th className="px-4 py-3 text-left">Budget</th>
                      <th className="px-4 py-3 text-left">DOJ</th>
                      <th className="px-4 py-3 text-left">Plan</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredClients.map((c) => (
                      <tr key={c._id} className="hover:bg-red-50">
                        <td className="px-4 py-3">{c.sno}</td>
                        <td className="px-4 py-3">
                          <img
                            src={getImageUrl(c.logo)}
                            onError={(e) => (e.target.src = "/default-avatar.png")}
                            className="w-12 h-12 rounded-full border object-cover"
                          />
                        </td>
                        <td className="px-4 py-3">{c.name}</td>
                        <td className="px-4 py-3">₹ {c.budget}</td>
                        <td className="px-4 py-3">{c.doj}</td>
                        <td className="px-4 py-3">{c.planType}</td>
                        <td className="px-4 py-3 text-right">
                          <ClientButtons id={c._id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientList;