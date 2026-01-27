import axios from "axios";
import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { StallButtons } from "../../utils/StallHelper";

const getImageUrl = (imagePath) => {
  if (!imagePath) return "/default-avatar.png";
  if (imagePath.startsWith("http")) return imagePath;
  return "/default-avatar.png";
};

const MobileStallCard = ({ s }) => (
  <div className="bg-white rounded-2xl shadow-md border border-red-100 p-3">
    <div className="flex items-center gap-3">
      <img
        src={getImageUrl(s.logo)}
        onError={(e) => (e.target.src = "/default-avatar.png")}
        className="w-12 h-12 rounded-full object-cover border shrink-0"
        alt={s.name}
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{s.name}</p>
        <p className="text-xs text-gray-500 truncate">Stall No: {s.number}</p>
        <p className="text-xs text-red-600 mt-0.5">{s.type}</p>
        <p className="text-xs text-gray-500 mt-0.5">Events: {s.eventCount}</p>
        <span className="font-semibold text-xs">Plans:</span>
        <ul className="list-disc ml-5 text-xs">
          {s.plans && s.plans.length > 0 ? (
            s.plans.map((plan, idx) => <li key={idx}>{plan}</li>)
          ) : (
            <li>No plans</li>
          )}
        </ul>
      </div>
    </div>
  </div>
);

const ITEMS_PER_PAGE = 5;

const StallList = () => {
  const [stalls, setStalls] = useState([]);
  const [filteredStalls, setFilteredStalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchStalls = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/stalls`);
      if (res.data.success) {
        let sno = 1;
        const data = res.data.stalls.map((s) => ({
          _id: s._id,
          sno: sno++,
          name: s.name,
          number: s.number,
          type: s.type,
          eventCount: s.eventCount || 0,
          plans: s.plans || [],
          logo: s.logo || "",
        }));
        setStalls(data);
        setFilteredStalls(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStalls();
  }, []);

  useEffect(() => {
    const result = stalls.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredStalls(result);
    setCurrentPage(1);
  }, [search, stalls]);

  const totalPages = Math.ceil(filteredStalls.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStalls = filteredStalls.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-red-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-red-700">
            Manage Stalls
          </h3>
          <p className="text-red-500 mt-1">
            View, search and manage stalls
          </p>
        </div>

        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100">
          {/* TOP BAR */}
          <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" size={18} />
              <input
                className="w-full rounded-xl border border-red-300 pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-red-500"
                placeholder="Search stall..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Link
              to="/admin-dashboard/add-stall"
              className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white hover:bg-red-700"
            >
              + Add Stall
            </Link>
          </div>

          {loading ? (
            <div className="p-10 text-center text-red-600 font-semibold">
              Loading stalls...
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden grid gap-4 px-4 pb-6">
                {paginatedStalls.length ? (
                  paginatedStalls.map((s) => <MobileStallCard key={s._id} s={s} />)
                ) : (
                  <div className="text-center text-red-400 py-20">No stalls found</div>
                )}
              </div>

              {/* DESKTOP */}
              <div className="hidden md:block max-h-[60vh] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-red-50">
                    <tr>
                      <th className="px-4 py-3 text-left">S No</th>
                      <th className="px-4 py-3 text-left">Logo</th>
                      <th className="px-4 py-3 text-left">Stall Name</th>
                      <th className="px-4 py-3 text-left">Stall Number</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-center">Events</th>
                      <th className="px-4 py-3 text-left">Plans</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStalls.map((s) => (
                      <tr key={s._id} className="hover:bg-red-50">
                        <td className="px-4 py-3">{s.sno}</td>
                        <td className="px-4 py-3">
                          <img
                            src={getImageUrl(s.logo)}
                            className="w-12 h-12 rounded-full border object-cover"
                            alt={s.name}
                          />
                        </td>
                        <td className="px-4 py-3">{s.name}</td>
                        <td className="px-4 py-3">{s.number}</td>
                        <td className="px-4 py-3">{s.type}</td>
                        <td className="px-4 py-3 text-center">{s.eventCount}</td>
                        <td className="px-4 py-3">
                          <ul className="list-disc ml-5">
                            {s.plans && s.plans.length > 0 ? (
                              s.plans.map((plan, idx) => <li key={idx}>{plan}</li>)
                            ) : (
                              <li>No plans</li>
                            )}
                          </ul>
                        </td>
                        <td className="px-4 py-3">
                          <StallButtons id={s._id} refresh={fetchStalls} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {filteredStalls.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-1 rounded-lg font-semibold
                      ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                  >
                    ◀ Previous
                  </button>

                  <span className="text-sm font-semibold text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-1 rounded-lg font-semibold
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

export default StallList;
