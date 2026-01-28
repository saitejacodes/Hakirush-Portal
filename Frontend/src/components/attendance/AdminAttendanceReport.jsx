import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, CalendarDays } from "lucide-react";

/* ================= DAY TYPE HELPER ================= */
const getDayType = (dateStr, holidays) => {
  const d = new Date(dateStr);
  const ymd = d.toISOString().split("T")[0];

  if (d.getDay() === 0) return { type: "weekend", title: "Weekend (Sunday)" };

  const holiday = holidays.find(
    (h) => new Date(h.date).toISOString().split("T")[0] === ymd
  );

  if (holiday) return { type: "holiday", title: holiday.title };

  return { type: "working", title: "" };
};

const AdminAttendanceReport = () => {
  const today = new Date().toISOString().split("T")[0];

  const [report, setReport] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [dateFilter, setDateFilter] = useState(today);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= FETCH REPORT ================= */
  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (search) params.append("search", search);
      else if (dateFilter) params.append("date", dateFilter);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance/report?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        setReport(res.data.groupData || {});
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH HOLIDAYS ================= */
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setHolidays(res.data.holidays || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchReport();
  }, [dateFilter, search]);

  /* ================= FILTER HANDLERS ================= */
  const handleDateChange = (e) => {
    setSearch("");
    setSearchInput("");
    setReport({});
    setDateFilter(e.target.value);
  };

  const doSearch = () => {
    if (!searchInput.trim()) return;
    setDateFilter("");
    setSearch(searchInput.trim());
    setReport({});
  };

  const clearSearch = () => {
    setSearch("");
    setSearchInput("");
    setDateFilter(today);
    setReport({});
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-red-700 drop-shadow-sm">
            Attendance Report
          </h3>
          <p className="text-red-500 mt-2">
            View attendance by date or employee
          </p>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white/95 rounded-3xl shadow-2xl border border-red-100 p-5 mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              doSearch();
            }}
            className="flex flex-col md:flex-row gap-4"
          >
            <input
              type="date"
              value={dateFilter}
              disabled={!!search}
              onChange={handleDateChange}
              className="w-full md:w-1/3 rounded-xl border border-red-300 px-4 py-3
                         outline-none focus:ring-2 focus:ring-red-500"
            />

            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400"
                size={18}
              />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search employee name or ID..."
                className="w-full rounded-xl border border-red-300
                           pl-10 pr-4 py-3 outline-none
                           focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-gradient-to-br from-red-600 to-red-500
                         px-6 py-3 font-semibold text-white shadow-lg
                         hover:scale-105 transition"
            >
              Search
            </button>
          </form>

          {search && (
            <button
              onClick={clearSearch}
              className="mt-4 w-full rounded-xl bg-gray-200 py-2
                         font-semibold text-gray-700 hover:bg-gray-300"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="p-12 text-center text-red-600 font-semibold text-lg">
            Loading attendance report...
          </div>
        ) : Object.keys(report).length === 0 ? (
          <div className="text-center text-red-400 py-20 text-lg">
            No records found
          </div>
        ) : (
          Object.entries(report).map(([date, records]) => {
            const info = getDayType(date, holidays);

            return (
              <div
                key={date}
                className="mb-8 bg-white/95 rounded-3xl shadow-2xl border border-red-100"
              >
                {/* DATE HEADER */}
                <div className="flex items-center justify-between px-6 py-4
                                border-b bg-red-50 rounded-t-3xl">
                  <div className="flex items-center gap-2 font-bold text-red-700">
                    <CalendarDays size={18} />
                    {date}
                  </div>

                  {info.type !== "working" && (
                    <span className="px-3 py-1 rounded-xl text-sm font-semibold
                                     bg-yellow-200 text-yellow-800">
                      {info.title}
                    </span>
                  )}
                </div>

                {/* TABLE */}
                <div className="max-h-[60vh] overflow-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-red-50 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold">S No</th>
                        <th className="px-4 py-3 text-left font-bold">Employee ID</th>
                        <th className="px-4 py-3 text-left font-bold">Name</th>
                        <th className="px-4 py-3 text-left font-bold">Department</th>
                        <th className="px-4 py-3 text-left font-bold">Designation</th>
                        <th className="px-4 py-3 text-left font-bold">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {records.map((r, i) => (
                        <tr key={i} className="hover:bg-red-50 transition">
                          <td className="px-4 py-3">{i + 1}</td>
                          <td className="px-4 py-3">{r.employeeId}</td>
                          <td className="px-4 py-3 font-medium">
                            {r.employeeName}
                          </td>
                          <td className="px-4 py-3">{r.departmentName}</td>
                          <td className="px-4 py-3">
                            {r.designation || "N/A"}
                          </td>
                          <td
                            className={`px-4 py-3 font-bold ${
                              r.status === "Present"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {r.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminAttendanceReport;