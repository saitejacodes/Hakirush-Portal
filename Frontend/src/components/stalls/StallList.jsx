import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

/* ========== MOBILE CARD ========== */
const MobileStallCard = ({ s }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-red-100 p-3">
      <div className="flex items-center gap-3">

        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold">
          {s.stallName?.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {s.stallName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {s.vendorName} • {s.category}
          </p>
          <p className="text-xs text-red-600 mt-0.5">
            {s.eventName}
          </p>
        </div>

        {/* Status */}
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            s.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {s.status}
        </span>
      </div>
    </div>
  );
};

const StallList = () => {
  const [stalls, setStalls] = useState([]);
  const [filteredStalls, setFilteredStalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  /* ================= FETCH STALLS ================= */
  useEffect(() => {
    const fetchStalls = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/stalls`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data.success) {
          let sno = 1;
          const data = res.data.stalls.map((s) => ({
            _id: s._id,
            sno: sno++,
            stallName: s.stallName,
            vendorName: s.vendorName,
            category: s.category,
            status: s.status,
            eventName: s.eventId?.eventName || "—",
          }));

          setStalls(data);
          setFilteredStalls(data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStalls();
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    const result = stalls.filter((s) =>
      (s.stallName || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.vendorName || "").toLowerCase().includes(search.toLowerCase())
    );
    setFilteredStalls(result);
  }, [search, stalls]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 px-3 py-4 md:p-6">
      <div className="w-full max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-6 md:mb-8 text-center">
          <h3 className="text-2xl md:text-4xl font-extrabold text-red-700">
            Manage Stalls
          </h3>
          <p className="text-red-500 mt-1">
            View, search and manage event stalls
          </p>
        </div>

        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100 backdrop-blur">

          {/* SEARCH + ADD */}
          <div className="p-4 md:p-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-3 text-red-400" size={18} />
              <input
                type="text"
                placeholder="Search stall or vendor..."
                className="w-full rounded-xl border border-red-300 pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-red-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Link
              to="/admin-dashboard/add-stall"
              className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white text-center"
            >
              + Add Stall
            </Link>
          </div>

          {loading ? (
            <div className="p-10 text-center text-red-600">
              Loading stalls...
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden grid gap-3 px-2 pb-24">
                {filteredStalls.length ? (
                  filteredStalls.map((s) => (
                    <MobileStallCard key={s._id} s={s} />
                  ))
                ) : (
                  <div className="text-center text-red-400 py-20">
                    No stalls found
                  </div>
                )}
              </div>

              {/* DESKTOP */}
              <div className="hidden md:block max-h-[60vh] overflow-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-red-50">
                    <tr>
                      <th className="px-4 py-3 text-left">S No</th>
                      <th className="px-4 py-3 text-left">Stall</th>
                      <th className="px-4 py-3 text-left">Vendor</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Event</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStalls.map((s) => (
                      <tr key={s._id} className="hover:bg-red-50">
                        <td className="px-4 py-3">{s.sno}</td>
                        <td className="px-4 py-3 font-semibold">{s.stallName}</td>
                        <td className="px-4 py-3">{s.vendorName}</td>
                        <td className="px-4 py-3">{s.category}</td>
                        <td className="px-4 py-3">{s.eventName}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              s.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {s.status}
                          </span>
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

export default StallList;