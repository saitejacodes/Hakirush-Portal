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
        <img
          src={getImageUrl(s.logo)}
          onError={(e) => (e.target.src = "/default-avatar.png")}
          className="w-12 h-12 rounded-full object-cover border shrink-0"
        />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{s.name}</p>
          <p className="text-xs text-gray-500 truncate">{s.collaboration}</p>
          <p className="text-xs text-red-600 mt-0.5">
            {s.eventsSponsored} events • Reach {s.reach}
          </p>
        </div>

        <SponsorButtons id={s._id} refresh={() => window.location.reload()} />
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
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/sponsors`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        if (res.data.success) {
          let sno = 1;
          const data = res.data.sponsors.map((s) => ({
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
    setFilteredSponsors(
      sponsors.filter((s) =>
        (s.name || "").toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, sponsors]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    return "/default-avatar.png";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">

        <div className="mb-6 text-center">
          <h3 className="text-4xl font-extrabold text-red-700">
            Manage Sponsors
          </h3>
          <p className="text-red-500 mt-1">
            View, search and manage sponsorships
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-red-100">

          <div className="p-4 flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-3 text-red-400" size={18} />
              <input
                className="w-full rounded-xl border border-red-300 pl-10 pr-4 py-2.5"
                placeholder="Search sponsor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Link
              to="/admin-dashboard/add-sponsor"
              className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-center"
            >
              + Add Sponsor
            </Link>
          </div>

          {loading ? (
            <div className="p-10 text-center text-red-600">
              Loading sponsors...
            </div>
          ) : (
            <>
              <div className="md:hidden grid gap-4 p-4">
                {filteredSponsors.map((s) => (
                  <MobileSponsorCard
                    key={s._id}
                    s={s}
                    getImageUrl={getImageUrl}
                  />
                ))}
              </div>

              <div className="hidden md:block max-h-[60vh] overflow-auto">
                <table className="w-full">
                  <thead className="bg-red-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3">S No</th>
                      <th className="px-4 py-3">Logo</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Collaboration</th>
                      <th className="px-4 py-3 text-center">Events</th>
                      <th className="px-4 py-3">Reach</th>
                      <th className="px-4 py-3">Upcoming</th>
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