import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

/* ================= MOBILE CARD ================= */
const MobileHolidayCard = ({ h, deleteHoliday }) => (
  <div className="bg-white rounded-2xl shadow-md border border-red-100 p-3 flex justify-between items-center">
    <div>
      <p className="font-semibold text-gray-900">{h.title}</p>

      <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
        <CalendarDays size={14} />
        {h.date}
      </p>

      <p className="text-[10px] text-gray-500 mt-0.5">
        {h.status === "past" ? "Past Holiday" : "Upcoming Holiday"}
      </p>
    </div>

    {h.status === "upcoming" && (
      <button
        onClick={() => deleteHoliday(h._id)}
        className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-100"
      >
        <Trash2 size={16} />
      </button>
    )}
  </div>
);

const HolidayList = () => {
  const [holidays, setHolidays] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH HOLIDAYS ================= */
  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/holiday/upcoming`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        let sno = 1;
        const today = new Date().toISOString().split("T")[0];

        const formatted = res.data.holidays.map((h) => {
          const holidayDate = new Date(h.date).toISOString().split("T")[0];
          return {
            _id: h._id,
            sno: sno++,
            title: h.title,
            date: new Date(h.date).toDateString(),
            status: holidayDate < today ? "past" : "upcoming",
          };
        });

        setHolidays(formatted);
        setFiltered(formatted);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  /* ================= SEARCH ================= */
  const handleSearch = (e) => {
    const v = e.target.value.toLowerCase();
    setFiltered(
      holidays.filter((h) => h.title.toLowerCase().includes(v))
    );
  };

  /* ================= DELETE ================= */
  const deleteHoliday = async (id) => {
    if (!confirm("Delete this holiday?")) return;

    await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/api/holiday/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    fetchHolidays();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-6 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-red-700">
            Upcoming Holidays
          </h3>
          <p className="text-red-500 mt-1">
            View, search and manage holidays
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100">

          {/* TOP BAR – EMPLOYEE LIST STYLE */}
          <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <input
              onChange={handleSearch}
              placeholder="Search holiday..."
              className="w-full md:w-1/2 rounded-xl border border-red-300
                         px-4 py-2.5 outline-none
                         focus:ring-2 focus:ring-red-500"
            />

            <Link
              to="/admin-dashboard/add-holiday"
              className="rounded-xl bg-red-600 px-6 py-2.5
                         font-semibold text-white
                         hover:bg-red-700 transition text-center"
            >
              + Add Holiday
            </Link>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="p-10 text-center text-red-600 font-semibold">
              Loading holidays...
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden grid gap-4 px-4 pb-24">
                {filtered.length ? (
                  filtered.map((h) => (
                    <MobileHolidayCard
                      key={h._id}
                      h={h}
                      deleteHoliday={deleteHoliday}
                    />
                  ))
                ) : (
                  <div className="text-center text-red-400 py-20">
                    No holidays found
                  </div>
                )}
              </div>

              {/* DESKTOP – EMPLOYEE LIST TABLE */}
              <div className="hidden md:block max-h-[60vh] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-red-50">
                    <tr>
                      <th className="px-4 py-3 text-left">S No</th>
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((h) => (
                      <tr
                        key={h._id}
                        className="hover:bg-red-50 transition"
                      >
                        <td className="px-4 py-3">{h.sno}</td>
                        <td className="px-4 py-3 font-medium">
                          {h.title}
                        </td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <CalendarDays size={16} className="text-red-500" />
                          {h.date}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              h.status === "Past"
                                ? "bg-gray-200 text-gray-600"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {h.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {h.status === "Upcoming" && (
                            <button
                              onClick={() => deleteHoliday(h._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
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

export default HolidayList;