import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

const HolidayList = () => {
  const [holidays, setHolidays] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/holiday/upcoming`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data.success) {
        let sno = 1;
        const formatted = res.data.holidays.map((h) => ({
          _id: h._id,
          sno: sno++,
          title: h.title,
          date: new Date(h.date).toDateString(),
        }));

        setHolidays(formatted);
        setFiltered(formatted);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const v = e.target.value.toLowerCase();
    setFiltered(
      holidays.filter((h) => h.title.toLowerCase().includes(v))
    );
  };

  const deleteHoliday = async (id) => {
    if (!confirm("Delete this holiday?")) return;

    await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/api/holiday/${id}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    fetchHolidays();
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-red-700 tracking-tight">
            Upcoming Holidays
          </h2>
          <p className="text-red-500 mt-1">
            View, search and manage upcoming holidays
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100 backdrop-blur">

          {/* TOP BAR */}
          <div className="p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">

            {/* SEARCH */}
            <input
              onChange={handleSearch}
              placeholder="Search holiday..."
              className="w-full sm:w-1/2 rounded-xl border border-red-300 px-4 py-2.5
                         outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            />

            {/* ADD BUTTON */}
            <Link
              to="/admin-dashboard/add-holiday"
              className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white
                         shadow-md hover:bg-red-700 hover:shadow-lg transition active:scale-95"
            >
              + Add Holiday
            </Link>
          </div>

          {/* TABLE WRAPPER */}
          <div className="max-h-[60vh] overflow-auto rounded-b-3xl">

            {loading ? (
              <div className="p-12 text-center text-red-600 font-semibold text-lg">
                Loading holidays...
              </div>
            ) : (
              <table className="w-full border-collapse">

                {/* STICKY HEADER */}
                <thead className="sticky top-0 bg-red-50/80 backdrop-blur-xl shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">S No</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Title</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Date</th>
                    <th className="px-4 py-3 text-right text-red-800 font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-red-100/70">
                  {filtered.length ? (
                    filtered.map((h) => (
                      <tr key={h._id} className="hover:bg-red-50">
                        <td className="px-4 py-3">{h.sno}</td>
                        <td className="px-4 py-3 font-medium">{h.title}</td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <CalendarDays size={16} className="text-red-500" />
                          {h.date}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => deleteHoliday(h._id)}
                            className="text-red-600 hover:text-red-800 active:scale-95 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-16 text-center text-red-400 text-lg"
                      >
                        No upcoming holidays
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

export default HolidayList;