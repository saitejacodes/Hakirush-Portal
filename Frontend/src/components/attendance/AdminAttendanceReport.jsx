import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminAttendanceReport = () => {
  const today = new Date().toISOString().split("T")[0];

  const [report, setReport] = useState({});
  const [limit, setLimit] = useState(5);
  const [skip, setSkip] = useState(0);
  const [dataFilter, setDataFilter] = useState(today);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams({ limit, skip });

      /* 🔑 KEY LOGIC */
      if (search) {
        query.append("search", search); // all days
      } else if (dataFilter) {
        query.append("date", dataFilter); // single day
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance/report?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setReport(response.data.groupData || {});
      }
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [limit, skip, dataFilter, search]);

  const handleDateChange = (e) => {
    setSkip(0);
    setSearch("");
    setSearchInput("");
    setReport({});
    setDataFilter(e.target.value);
  };

  const changeDay = (direction) => {
    const current = new Date(dataFilter);
    current.setDate(current.getDate() + direction);
    const newDate = current.toISOString().split("T")[0];

    setSkip(0);
    setSearch("");
    setSearchInput("");
    setReport({});
    setDataFilter(newDate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6">
      <div className="max-w-6xl mx-auto">

        <h2 className="text-4xl font-extrabold text-center text-red-700 mb-8">
          Attendance Report
        </h2>

        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100 p-6 mb-8">
          <div className="grid sm:grid-cols-2 gap-4">

            {/* DATE PICKER */}
            <div>
              <p className="text-red-700 font-semibold">Select date</p>
              <input
                type="date"
                value={dataFilter}
                onChange={handleDateChange}
                className="border border-red-300 rounded-xl px-3 py-2 w-full"
              />
            </div>

            {/* SEARCH */}
            <div>
              <p className="text-red-700 font-semibold">
                Search by Name / Employee ID
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchInput}
                  placeholder="EMP001 or name"
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="border border-red-300 rounded-xl px-3 py-2 w-full"
                />

                <button
                  onClick={() => {
                    if (!searchInput.trim()) return;
                    setSkip(0);
                    setDataFilter("");
                    setSearch(searchInput.trim());
                  }}
                  className="px-4 py-2 rounded-xl font-semibold bg-red-600 text-white"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* REPORT */}
        {loading ? (
          <div className="text-center text-red-600 font-bold text-xl">
            Loading report...
          </div>
        ) : (
          Object.entries(report).map(([date, record]) => (
            <div
              key={date}
              className="bg-white/90 rounded-3xl shadow-xl border border-red-100 p-6 mb-8"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between mb-4">
                {!search && (
                  <button
                    onClick={() => changeDay(-1)}
                    className="px-4 py-2 rounded-xl bg-gray-200 font-semibold"
                  >
                    ◀ Previous
                  </button>
                )}

                <h3 className="text-2xl font-bold text-red-700">
                  {date}
                </h3>

                {!search && (
                  <button
                    onClick={() => changeDay(1)}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold"
                  >
                    Next ▶
                  </button>
                )}
              </div>

              <table className="w-full border-collapse">
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
                  {record.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3">{i + 1}</td>
                      <td className="p-3">{row.employeeId}</td>
                      <td className="p-3">{row.employeeName}</td>
                      <td className="p-3">{row.departmentName}</td>
                      <td
                        className={`p-3 font-semibold ${
                          row.status === "Present"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {row.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAttendanceReport;
