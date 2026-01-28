import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { SponsorButtons } from "../../utils/SponsorHelper";

/* ================= IMAGE HELPER ================= */
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/default-avatar.png";
  if (imagePath.startsWith("http")) return imagePath;
  return "/default-avatar.png";
};

/* ================= MOBILE CARD ================= */
const MobileSponsorCard = ({ s, refresh }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-red-100 p-3">
      <div className="flex items-center gap-3">
        <img
          src={getImageUrl(s.logo)}
          onError={(e) => (e.target.src = "/default-avatar.png")}
          className="w-12 h-12 rounded-full object-cover border shrink-0"
        />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-xs truncate">
            {s.name}
          </p>
          <p className="text-xs text-red-600 truncate">
            {s.collaboration}
          </p>
          <p className="text-[11px] text-gray-500 truncate">
            {s.eventsSponsored} events • Reach {s.reach}
          </p>
        </div>

        <div className="shrink-0">
          <SponsorButtons id={s._id} refresh={refresh} />
        </div>
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 5;

const SponsorList = () => {
  const [sponsors, setSponsors] = useState([]);
  const [filteredSponsors, setFilteredSponsors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /* ================= FETCH SPONSORS ================= */
  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/sponsors`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        let sno = 1;
        const data = res.data.sponsors.map((s) => ({
          _id: s._id,
          sno: sno++,
          name: s.name,
          collaboration: s.collaboration,
          eventsSponsored: s.eventsSponsored || 0,
          reach: s.reach || "N/A",
          upcomingEvents: s.upcomingEvents || "N/A",
          logo: s.logo || "",
        }));

        setSponsors(data);
        setFilteredSponsors(data);
      }
    } catch {
      alert("Failed to load sponsors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    const result = sponsors.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredSponsors(result);
    setCurrentPage(1);
  }, [search, sponsors]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredSponsors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSponsors = filteredSponsors.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-red-700 drop-shadow-sm">
            Manage Sponsors
          </h3>
          <p className="text-red-500 mt-2 text-base">
            View, search and manage sponsorships
          </p>
        </div>

        <div className="bg-white/95 rounded-3xl shadow-2xl border border-red-100">

          {/* TOP BAR */}
          <div className="p-5 md:p-7 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="relative w-full md:w-1/2">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search sponsor..."
                className="w-full rounded-xl border border-red-300 pl-10 pr-4 py-3
                           outline-none focus:ring-2 focus:ring-red-500
                           text-base shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Link
              to="/admin-dashboard/add-sponsor"
              className="rounded-xl bg-gradient-to-br from-red-600 to-red-500
                         px-7 py-3 font-semibold text-white shadow-lg
                         hover:scale-105 hover:bg-red-700 transition-all text-base"
            >
              + Add Sponsor
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-red-600 font-semibold text-lg">
              Loading sponsors...
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden grid grid-cols-1 gap-6 px-4 pb-8">
                {paginatedSponsors.length ? (
                  paginatedSponsors.map((s) => (
                    <MobileSponsorCard
                      key={s._id}
                      s={s}
                      refresh={fetchSponsors}
                    />
                  ))
                ) : (
                  <div className="text-center text-red-400 py-20 text-lg">
                    No sponsors found
                  </div>
                )}
              </div>

              {/* DESKTOP */}
              <div className="hidden md:block max-h-[60vh] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-red-50 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold">S No</th>
                      <th className="px-4 py-3 text-left font-bold">Logo</th>
                      <th className="px-4 py-3 text-left font-bold">Name</th>
                      <th className="px-4 py-3 text-left font-bold">Collaboration</th>
                      <th className="px-4 py-3 text-center font-bold">Events</th>
                      <th className="px-4 py-3 text-left font-bold">Reach</th>
                      <th className="px-4 py-3 text-left font-bold">Upcoming</th>
                      <th className="px-4 py-3 text-right font-bold">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedSponsors.map((s) => (
                      <tr key={s._id} className="hover:bg-red-50 transition">
                        <td className="px-4 py-3">{s.sno}</td>
                        <td className="px-4 py-3">
                          <img
                            src={getImageUrl(s.logo)}
                            className="w-12 h-12 rounded-full border object-cover"
                            onError={(e) =>
                              (e.target.src = "/default-avatar.png")
                            }
                          />
                        </td>
                        <td className="px-4 py-3">{s.name}</td>
                        <td className="px-4 py-3">{s.collaboration}</td>
                        <td className="px-4 py-3 text-center">
                          {s.eventsSponsored}
                        </td>
                        <td className="px-4 py-3">{s.reach}</td>
                        <td className="px-4 py-3">{s.upcomingEvents}</td>
                        <td className="px-4 py-3 text-right">
                          <SponsorButtons
                            id={s._id}
                            refresh={fetchSponsors}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {filteredSponsors.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between px-4 py-5 border-t bg-white/80 rounded-b-3xl">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-5 py-2 rounded-lg font-semibold
                      ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                  >
                    ◀ Previous
                  </button>

                  <span className="text-base font-semibold text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-5 py-2 rounded-lg font-semibold
                      ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
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

export default SponsorList;