import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { SponsorButtons } from "../../utils/SponsorHelper";

const SponsorList = () => {
  const [sponsors, setSponsors] = useState([]);
  const [filteredSponsors, setFilteredSponsors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  /* ================= FETCH SPONSORS ================= */
  useEffect(() => {
    const fetchSponsors = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          alert("Login required");
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/sponsors`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          let sno = 1;

          const data = response.data.sponsors.map((s) => ({
            _id: s._id,
            sno: sno++,
            name: s.name,
            collaboration: s.collaboration,
            eventsSponsored: s.eventsSponsored || 0,
            reach: s.reach || "—",
            upcomingEvents: s.upcomingEvents || "—",
            logo: s.logo || "",
          }));

          setSponsors(data);
          setFilteredSponsors(data);
        } else {
          alert("Failed to load sponsors");
        }
      } catch (error) {
        console.error("FETCH SPONSORS ERROR:", error.response || error.message);
        alert(
          error.response?.data?.error ||
            "Server error while loading sponsors"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  /* ================= SEARCH FILTER ================= */
  useEffect(() => {
    const result = sponsors.filter((s) =>
      (s.name || "").toLowerCase().includes(search.toLowerCase())
    );
    setFilteredSponsors(result);
  }, [search, sponsors]);

  /* ================= IMAGE URL HANDLER ================= */
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* ================= HEADER ================= */}
        <div className="mb-8 text-center">
          <h3 className="text-4xl font-extrabold text-red-700 tracking-tight">
            Manage Sponsors
          </h3>
          <p className="text-red-500 mt-2">
            View, search and manage sports sponsorships
          </p>
        </div>

        {/* ================= MAIN CARD ================= */}
        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100 backdrop-blur">

          <div className="p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">

            {/* SEARCH */}
            <div className="relative w-full sm:w-1/2">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search sponsor..."
                className="w-full rounded-xl border border-red-300 pl-10 pr-4 py-2.5
                           outline-none focus:ring-2 focus:ring-red-500 transition shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* ADD BUTTON */}
            <Link
              to="/admin-dashboard/add-sponsor"
              className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white
                         shadow-md hover:bg-red-700 hover:shadow-lg transition active:scale-95 text-center"
            >
              + Add Sponsor
            </Link>
          </div>

          {/* ================= TABLE ================= */}
          <div className="max-h-[60vh] overflow-auto rounded-b-3xl">

            {loading ? (
              <div className="p-10 text-center text-red-600 font-semibold text-lg">
                Loading sponsors...
              </div>
            ) : (
              <table className="w-full border-collapse">

                <thead className="sticky top-0 z-10 bg-red-50/80 backdrop-blur-xl shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">S No</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Logo</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Collaboration</th>
                    <th className="px-4 py-3 text-center text-red-800 font-semibold">Events</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Reach</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Upcoming</th>
                    <th className="px-4 py-3 text-red-800 font-semibold text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-red-100/70">

                  {filteredSponsors.length ? (
                    filteredSponsors.map((s) => (
                      <tr
                        key={s._id}
                        className="transition-all duration-200 hover:bg-red-50"
                      >
                        <td className="px-4 py-3">{s.sno}</td>

                        <td className="px-4 py-3">
                          <img
                            src={getImageUrl(s.logo)}
                            alt={s.name}
                            className="w-12 h-12 rounded-full object-cover border shadow-sm"
                            onError={(e) =>
                              (e.target.src = "/default-avatar.png")
                            }
                          />
                        </td>

                        <td className="px-4 py-3 font-medium text-gray-900">
                          {s.name}
                        </td>

                        <td className="px-4 py-3 text-gray-700">
                          {s.collaboration}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {s.eventsSponsored}
                        </td>

                        <td className="px-4 py-3 text-gray-700">
                          {s.reach}
                        </td>

                        <td className="px-4 py-3 text-gray-700">
                          {s.upcomingEvents}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <SponsorButtons
                            id={s._id}
                            refresh={() => window.location.reload()}
                          />
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
                          <span className="text-4xl">🏆</span>
                          No sponsors found
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

export default SponsorList;