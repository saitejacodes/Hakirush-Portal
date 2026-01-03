import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ClientButtons } from "../../utils/ClientHelper";

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);

      try {
        const res = await axios.get("http://localhost:5000/api/client", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

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

  // 🔍 Search filter
  useEffect(() => {
    const result = clients.filter((c) =>
      (c.name || "").toString().toLowerCase().includes(search.toLowerCase())
    );

    setFilteredClients(result);
  }, [search, clients]);

  // 🖼 smart image url builder
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";

    if (imagePath.startsWith("http")) return imagePath;

    if (imagePath.startsWith("/"))
      return `http://localhost:5000${imagePath}`;

    if (imagePath.startsWith("uploads/"))
      return `http://localhost:5000/${imagePath}`;

    return `http://localhost:5000/uploads/${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-red-50 p-6">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8 text-center">
          <h3 className="text-4xl font-extrabold text-red-700">
            Manage Clients
          </h3>
          <p className="text-red-500 mt-2">
            View, search and manage clients
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-6 border border-red-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <input
              type="text"
              placeholder="Search client..."
              className="w-full sm:w-1/2 rounded-xl border border-red-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Link
              to="/admin-dashboard/add-client"
              className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white shadow-md hover:bg-red-700 hover:shadow-lg transition"
            >
              + Add Client
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto">
            {loading ? (
              <p className="text-center text-red-500 py-10">
                Loading clients...
              </p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-red-100">
                    <th className="px-4 py-3 font-semibold text-red-700">S No</th>
                    <th className="px-4 py-3 font-semibold text-red-700">Logo</th>
                    <th className="px-4 py-3 font-semibold text-red-700">Client Name</th>
                    <th className="px-4 py-3 font-semibold text-red-700">Budget</th>
                    <th className="px-4 py-3 font-semibold text-red-700">Date of Joining</th>
                    {/* 🔥 NEW COLUMN */}
                    <th className="px-4 py-3 font-semibold text-red-700">Plan Type</th>
                    <th className="px-4 py-3 font-semibold text-red-700 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredClients.length > 0 ? (
                    filteredClients.map((c) => (
                      <tr
                        key={c._id}
                        className="border-b hover:bg-red-50 transition"
                      >
                        <td className="px-4 py-3">{c.sno}</td>

                        <td className="px-4 py-3">
                          <img
                            src={getImageUrl(c.logo)}
                            alt={c.name}
                            className="w-12 h-12 rounded-full object-cover border"
                            onError={(e) =>
                              (e.target.src = "/default-avatar.png")
                            }
                          />
                        </td>

                        <td className="px-4 py-3 font-medium">{c.name}</td>

                        <td className="px-4 py-3 font-medium">₹ {c.budget}</td>

                        <td className="px-4 py-3 font-medium">{c.doj}</td>

                        {/* 🔥 PLAN TYPE DISPLAY */}
                        <td className="px-4 py-3 font-medium">
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
                        className="px-4 py-10 text-center text-red-400"
                      >
                        No clients found.
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
