import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, CalendarDays } from "lucide-react";

/* ================= MOBILE CARD ================= */
const MobileReportCard = ({ r }) => (
  <div className="bg-white rounded-2xl shadow border border-red-100 p-4 space-y-1">
    <div className="flex justify-between items-start">
      <div>
        <p className="font-bold text-gray-900">{r.employeeName}</p>
        <p className="text-xs text-gray-500">ID: {r.employeeId}</p>
      </div>

      <span
        className={`px-3 py-1 rounded-xl text-xs font-bold ${
          r.status === "Present"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {r.status}
      </span>
    </div>

    <p className="text-sm text-gray-700">{r.departmentName}</p>
    <p className="text-xs text-gray-500">{r.designation || "N/A"}</p>
  </div>
);

const AdminAttendanceReport = () => {
  const today = new Date().toISOString().split("T")[0];

  const [report, setReport] = useState({});
  const [dataFilter, setDataFilter] = useState(today);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [holidays, setHolidays] = useState([]);

  /* ================= FETCH REPORT ================= */
  const fetchReport = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams();
      if (search) query.append("search", search);
      else if (dataFilter) query.append("date", dataFilter);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance/report?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        setReport(res.data.groupData || {});
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dataFilter, search]);

  /* ================= FETCH HOLIDAYS ================= */
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(res => setHolidays(res.data.holidays || []))
      .catch(console.error);
  }, []);

  /* ================= DATE CHANGE ================= */
  const handleDateChange = (e) => {
    setSearch("");
    setSearchInput("");
    setReport({});
    setDataFilter(e.target.value);
  };

  /* ================= SEARCH ================= */
  const doSearch = () => {
    if (!searchInput.trim()) return;
    setDataFilter("");
    setSearch(searchInput.trim());
    setReport({});
  };

  const clearSearch = () => {
    setSearch("");
    setSearchInput("");
    setDataFilter(today);
    setReport({});
  };

  /* ================= FRONTEND SEARCH FILTER (UNCHANGED) ================= */
  const filterBySearch = (groupData) => {
    if (!search) return groupData;

    const lower = search.toLowerCase();
    const result = {};

    Object.entries(groupData).forEach(([date, rows]) => {
      const matched = rows.filter(
        r =>
          r.employeeName?.toLowerCase().includes(lower) ||
          r.employeeId?.toLowerCase().includes(lower)
      );

      if (matched.length) result[date] = matched;
    });

    return result;
  };

  const finalReport = filterBySearch(report);

  /* ================= DAY TYPE HELPER (UNCHANGED) ================= */
  const getDayType = (dateStr) => {
    const d = new Date(dateStr);
    const ymd = d.toISOString().split("T")[0];

    if (d.getDay() === 0) {
      return { type: "weekend", title: "Weekend (Sunday)" };
    }

    const holiday = holidays.find(
      h => new Date(h.date).toISOString().split("T")[0] === ymd
    );

    if (holiday) {
      return { type: "holiday", title: holiday.title };
    }

    return { type: "working", title: "" };
  };

  const selectedDayInfo = getDayType(dataFilter || today);

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-6">

      {/* HEADER */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-red-700">
          Attendance Report
        </h2>
        <p className="text-sm text-red-500 mt-2">
          View attendance by date or employee
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg border border-red-100 p-5 mb-6 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            doSearch();
          }}
          className="flex flex-col md:flex-row gap-4"
        >
          <input
            type="date"
            value={dataFilter}
            disabled={!!search}
            onChange={handleDateChange}
            className="w-full md:w-1/3 border border-red-500 rounded-xl px-4 py-2.5"
          />

          <div className="relative w-full">
            <Search className="absolute left-3 top-3 text-red-400" size={18} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Employee name or ID"
              className="w-full border border-red-500 rounded-xl pl-10 pr-4 py-2.5"
            />
          </div>

          <button className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white">
            Search
          </button>
        </form>

        {search && (
          <button
            onClick={clearSearch}
            className="w-full rounded-xl bg-gray-200 py-2 font-semibold"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-center text-red-600 font-bold mt-20">
          Loading attendance report...
        </p>
      ) : Object.keys(finalReport).length === 0 ? (
        selectedDayInfo.type !== "working" ? (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg border border-red-100 p-8 text-center">
            <div className="flex justify-center items-center gap-2 font-bold text-red-700 mb-3">
              <CalendarDays size={20} />
              {dataFilter || today}
            </div>

            <div className="inline-block px-4 py-2 rounded-xl bg-yellow-100 text-yellow-800 font-bold">
              {selectedDayInfo.type === "weekend" && "Weekend (Sunday)"}
              {selectedDayInfo.type === "holiday" &&
                `Holiday – ${selectedDayInfo.title}`}
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Attendance is not required for this day.
            </p>
          </div>
        ) : (
          <p className="text-center text-red-400 py-20">
            No records found
          </p>
        )
      ) : (
        Object.entries(finalReport).map(([date, records]) => {
          const info = getDayType(date);

          return (
            <div key={date} className="max-w-6xl mx-auto mb-8">
              {/* DATE HEADER */}
              <div className="flex items-center justify-between px-4 py-3 bg-red-50 rounded-t-2xl">
                <div className="flex items-center gap-2 font-bold text-red-700">
                  <CalendarDays size={18} />
                  {date}
                </div>

                {info.type !== "working" && (
                  <span className="px-3 py-1 rounded-xl text-sm bg-yellow-200 text-yellow-800 font-semibold">
                    {info.title}
                  </span>
                )}
              </div>

              {/* MOBILE */}
              <div className="md:hidden grid gap-4 bg-red-50 p-4 rounded-b-2xl">
                {records.map((r, i) => (
                  <MobileReportCard key={i} r={r} />
                ))}
              </div>

              {/* DESKTOP */}
              <div className="hidden md:block bg-white rounded-b-2xl shadow overflow-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-red-100 text-red-800">
                    <tr>
                      <th className="px-4 py-3 text-center">S No</th>
                      <th className="px-4 py-3 text-left">Employee ID</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Department</th>
                      <th className="px-4 py-3 text-left">Designation</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {records.map((r, i) => (
                      <tr key={i} className="border-t hover:bg-red-50">
                        <td className="px-4 py-3 text-center">{i + 1}</td>
                        <td className="px-4 py-3 text-left">{r.employeeId}</td>
                        <td className="px-4 py-3 text-left font-medium">
                          {r.employeeName}
                        </td>
                        <td className="px-4 py-3 text-left">
                          {r.departmentName}
                        </td>
                        <td className="px-4 py-3 text-left">
                          {r.designation || "N/A"}
                        </td>
                        <td
                          className={`px-4 py-3 text-center font-bold ${
                            r.status === "Present"
                              ? "text-green-600"
                              : r.status === "Leave"
                              ? "text-yellow-600"
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
  );
};

export default AdminAttendanceReport;