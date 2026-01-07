import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ClientButtons } from "../../utils/ClientHelper";
import { Search } from "lucide-react";

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
          `${import.meta.env.VITE_BACKEND_URL}/client`,
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

  // search filter
  useEffect(() => {
    const result = clients.filter((c) =>
      (c.name || "").toLowerCase().includes(search.toLowerCase())
    );
    setFilteredClients(result);
  }, [search, clients]);

  // smart logo url builder
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return `http://localhost:5000${imagePath}`;
    if (imagePath.startsWith("uploads/"))
      return `http://localhost:5000/${imagePath}`;
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h3 className="text-4xl font-extrabold text-red-800 tracking-tight">
            Manage Clients
          </h3>
          <p className="text-red-500 mt-2">View, search and manage clients</p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100 backdrop-blur">

          {/* TOP BAR */}
          <div className="p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">

            {/* Search box */}
            <div className="relative w-full sm:w-1/2">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400"
                size={18}
              />

              <input
                type="text"
                placeholder="Search client..."
                className="w-full rounded-xl border border-red-300 pl-10 pr-4 py-2.5
                           outline-none focus:ring-2 focus:ring-red-500 transition shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Add client button */}
            <Link
              to="/admin-dashboard/add-client"
              className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white
                         shadow-md hover:bg-red-700 hover:shadow-lg transition active:scale-95 text-center"
            >
              + Add Client
            </Link>
          </div>

          {/* TABLE WRAPPER */}
          <div className="max-h-[60vh] overflow-auto rounded-b-3xl">

            {loading ? (
              <div className="p-10 text-center text-red-600 font-semibold text-lg">
                Loading clients...
              </div>
            ) : (
              <table className="w-full border-collapse">

                {/* STICKY HEADER */}
                <thead className="sticky top-0 z-10 bg-red-50/80 backdrop-blur-xl shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">S No</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Logo</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Client Name</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Budget</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Date of Joining</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Plan Type</th>
                    <th className="px-4 py-3 text-right text-red-800 font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-red-100/70">
                  {filteredClients.length ? (
                    filteredClients.map((c) => (
                      <tr
                        key={c._id}
                        className="transition-all duration-200 hover:bg-red-50"
                      >
                        <td className="px-4 py-3">{c.sno}</td>

                        <td className="px-4 py-3">
                          <img
                            src={getImageUrl(c.logo)}
                            alt={c.name}
                            className="w-12 h-12 rounded-full object-cover border shadow-sm"
                            onError={(e) =>
                              (e.target.src = "/default-avatar.png")
                            }
                          />
                        </td>

                        <td className="px-4 py-3 font-medium text-gray-900">
                          {c.name}
                        </td>

                        <td className="px-4 py-3 font-medium">
                          ₹ {c.budget}
                        </td>

                        <td className="px-4 py-3">{c.doj}</td>

                        <td className="px-4 py-3">
                          {c.planType === "annual"
                            ? "Annual"
                            : c.planType === "quarterly"
                            ? "Quarterly"
                            : "N/A"}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <ClientButtons id={c._id} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-16 text-center text-red-400 text-lg"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-4xl">🧾</span>
                          No clients found
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientList;