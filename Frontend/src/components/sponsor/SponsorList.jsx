import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { SponsorButtons } from "../../utils/SponsorHelper";

/* ===== MOBILE CARD ===== */
const MobileSponsorCard = ({ s, getImageUrl }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-red-100 p-3">
      <div className="flex items-center gap-3">

        {/* Logo */}
        <img
          src={getImageUrl(s.logo)}
          onError={(e) => (e.target.src = "/default-avatar.png")}
          className="w-12 h-12 rounded-full object-cover border shrink-0"
        />

        {/* Name & Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {s.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {s.collaboration}
          </p>
          <p className="text-xs text-red-600 mt-0.5">
            {s.eventsSponsored} events • Reach {s.reach}
          </p>
        </div>

        {/* Actions */}
        <div className="shrink-0">
          <SponsorButtons id={s._id} refresh={() => window.location.reload()} />
        </div>
      </div>
    </div>
  );
};

const SponsorList = () => {
  const [sponsors, setSponsors] = useState([]);
  const [filteredSponsors, setFilteredSponsors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchSponsors = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/sponsors`,
          {
            headers: { Authorization: `Bearer ${token}` },
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
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  useEffect(() => {
    const result = sponsors.filter((s) =>
      (s.name || "").toLowerCase().includes(search.toLowerCase())
    );
    setFilteredSponsors(result);
  }, [search, sponsors]);

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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 px-3 py-4 md:p-6">
      <div className="w-full max-w-6xl mx-auto">

        <div className="mb-6 md:mb-8 text-center">
          <h3 className="text-2xl md:text-4xl font-extrabold text-red-700">
            Manage Sponsors
          </h3>
          <p className="text-red-500 mt-1">
            View, search and manage sports sponsorships
          </p>
        </div>

        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100 backdrop-blur">

          <div className="p-4 md:p-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-3 text-red-400" size={18} />
              <input
                type="text"
                placeholder="Search sponsor..."
                className="w-full rounded-xl border border-red-300 pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-red-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Link
              to="/admin-dashboard/add-sponsor"
              className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white text-center"
            >
              + Add Sponsor
            </Link>
          </div>

          {loading ? (
            <div className="p-10 text-center text-red-600">Loading sponsors...</div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden grid gap-3 px-2 pb-24">
                {filteredSponsors.length ? (
                  filteredSponsors.map((s) => (
                    <MobileSponsorCard
                      key={s._id}
                      s={s}
                      getImageUrl={getImageUrl}
                    />
                  ))
                ) : (
                  <div className="text-center text-red-400 py-20">
                    No sponsors found
                  </div>
                )}
              </div>

              {/* DESKTOP */}
              <div className="hidden md:block max-h-[60vh] overflow-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-red-50">
                    <tr>
                      <th className="px-4 py-3 text-left">S No</th>
                      <th className="px-4 py-3 text-left">Logo</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Collaboration</th>
                      <th className="px-4 py-3 text-center">Events</th>
                      <th className="px-4 py-3 text-left">Reach</th>
                      <th className="px-4 py-3 text-left">Upcoming</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSponsors.map((s) => (
                      <tr key={s._id} className="hover:bg-red-50">
                        <td className="px-4 py-3">{s.sno}</td>
                        <td className="px-4 py-3">
                          <img
                            src={getImageUrl(s.logo)}
                            onError={(e) => (e.target.src = "/default-avatar.png")}
                            className="w-12 h-12 rounded-full border object-cover"
                          />
                        </td>
                        <td className="px-4 py-3">{s.name}</td>
                        <td className="px-4 py-3">{s.collaboration}</td>
                        <td className="px-4 py-3 text-center">{s.eventsSponsored}</td>
                        <td className="px-4 py-3">{s.reach}</td>
                        <td className="px-4 py-3">{s.upcomingEvents}</td>
                        <td className="px-4 py-3 text-right">
                          <SponsorButtons id={s._id} refresh={() => window.location.reload()} />
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

export default SponsorList;