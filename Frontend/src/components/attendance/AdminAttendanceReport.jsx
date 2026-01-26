import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, CalendarDays } from "lucide-react";

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
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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

  /* ================= FRONTEND SEARCH FILTER ================= */
  const filterBySearch = (groupData) => {
    if (!search) return groupData;
    const lower = search.toLowerCase();
    const result = {};

    Object.entries(groupData).forEach(([date, rows]) => {
      const matched = rows.filter(r =>
        r.employeeName?.toLowerCase().includes(lower) ||
        r.employeeId?.toLowerCase().includes(lower)
      );
      if (matched.length) result[date] = matched;
    });

    return result;
  };

  const finalReport = filterBySearch(report);

  /* ================= DAY TYPE HELPER ================= */
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

  const handleSubmit = (e) => {
    e.preventDefault(); 
    doSearch();
  };


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
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-4">
          <input
            type="date"
            value={dataFilter}
            disabled={!!search}
            onChange={handleDateChange}
            className="w-full md:w-1/3 outline-none border border-red-500 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-500"
          />

          <div className="relative w-full">
            <Search className="absolute left-3 top-3 text-red-400" size={18} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Employee name or ID"
              className="w-full outline-none border border-red-500 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            type="submit"
            onClick={doSearch}
            className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white hover:bg-red-700"
          >
            Search
          </button>
        </form>

        {search && (
          <button
            onClick={clearSearch}
            className="w-full rounded-xl bg-gray-200 py-2 font-semibold text-gray-700 hover:bg-gray-300"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* ================= CONTENT ================= */}
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
            <div
              key={date}
              className="max-w-6xl mx-auto mb-8 bg-white rounded-3xl shadow-xl border border-red-100"
            >
              {/* DATE HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-red-50 rounded-t-3xl">
                <div className="flex items-center gap-3 font-bold text-red-700">
                  <CalendarDays size={18} /> {date}
                </div>

                {info.type !== "working" && (
                  <span className="px-3 py-1 rounded-xl text-sm font-semibold bg-yellow-200 text-yellow-800">
                    {info.title}
                  </span>
                )}
              </div>

              {/* TABLE */}
              <div className="overflow-auto">
                <table className="w-full">
                  <thead className="bg-red-100 text-red-800">
                    <tr>
                      <th className="px-4 py-3 text-left">S No</th>
                      <th className="px-4 py-3 text-left">Employee ID</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Department</th>
                      <th className="px-4 py-3 text-left">Designation</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {info.type !== "working" && (
                      <tr className="bg-yellow-50">
                        <td
                          colSpan={6}
                          className="px-4 py-4 text-center font-bold text-red-800"
                        >
                          {info.type === "weekend" && "Weekend (Sunday)"}
                          {info.type === "holiday" &&
                            `Holiday – ${info.title}`}
                        </td>
                      </tr>
                    )}

                    {records.map((r, i) => (
                      <tr key={i} className="border-t hover:bg-red-50">
                        <td className="px-4 py-3">{i + 1}</td>
                        <td className="px-4 py-3">{r.employeeId}</td>
                        <td className="px-4 py-3 font-medium">{r.employeeName}</td>
                        <td className="px-4 py-3">{r.departmentName}</td>
                        <td className="px-4 py-3 text-gray-600">
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
  );
};

export default AdminAttendanceReport;