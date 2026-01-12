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

  /* ================= DATE ================= */
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

  /* ================= FRONTEND FILTER ================= */
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4">

      <h2 className="text-3xl font-bold text-center text-red-700 mb-6">
        Attendance Report
      </h2>

      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl shadow border border-red-100 p-4 mb-4 space-y-4">
        <input
          type="date"
          value={dataFilter}
          disabled={!!search}
          onChange={handleDateChange}
          className="w-full border rounded-xl px-3 py-2"
        />

        <div className="flex gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 text-red-400" size={18} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Employee Name"
              className="w-full border rounded-xl pl-10 pr-3 py-2"
            />
          </div>

          <button
            onClick={doSearch}
            className="px-4 py-2 rounded-xl bg-red-600 text-white"
          >
            Search
          </button>
        </div>

        {search && (
          <button
            onClick={clearSearch}
            className="w-full py-2 rounded-xl bg-gray-300"
          >
            Clear Search
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-center text-red-600 font-bold">Loading...</p>
      ) : Object.keys(finalReport).length === 0 ? (
        <p className="text-center text-red-400 py-20">No records found</p>
      ) : (
        Object.entries(finalReport).map(([date, records]) => (
          <div key={date} className="mb-6">

            {/* Date Header */}
            <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
              <CalendarDays size={18} /> {date}
            </div>

            {/* MOBILE CARDS */}
            <div className="space-y-3 md:hidden">
              {records.map((r, i) => (
                <div key={i} className="bg-white rounded-2xl shadow border border-red-100 p-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{r.employeeName}</p>
                    <p className="text-xs text-gray-500">
                      {r.employeeId} • {r.departmentName}
                    </p>
                  </div>
                  <span className={`font-bold ${
                    r.status === "Present" ? "text-green-600" : "text-red-600"
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-auto">
              <table className="w-full bg-white rounded-xl shadow">
                <thead className="bg-red-50">
                  <tr>
                    <th className="p-3 text-left">S No</th>
                    <th className="p-3 text-left">Employee ID</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Department</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={i} className="border-t hover:bg-red-50">
                      <td className="p-3">{i + 1}</td>
                      <td className="p-3">{r.employeeId}</td>
                      <td className="p-3">{r.employeeName}</td>
                      <td className="p-3">{r.departmentName}</td>
                      <td className={`p-3 font-bold ${
                        r.status === "Present" ? "text-green-600" : "text-red-600"
                      }`}>
                        {r.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        ))
      )}

    </div>
  );
};

export default AdminAttendanceReport;