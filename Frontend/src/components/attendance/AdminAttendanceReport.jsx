import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminAttendanceReport = () => {
  const [report, setReport] = useState({});
  const [limit, setLimit] = useState(5);
  const [skip, setSkip] = useState(0);
  const [dataFilter, setDataFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");


  const fetchReport = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams({ limit, skip });
      if (dataFilter) query.append("date", dataFilter);
      if (search) query.append("search", search);

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/attendance/report?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        if (skip === 0) {
          setReport(response.data.groupData || {});
        } else {
          setReport((prev) => ({
            ...prev,
            ...(response.data.groupData || {}),
          }));
        }
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
    setDataFilter(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6">
      <div className="max-w-6xl mx-auto">

        <h2 className="text-4xl font-extrabold text-center text-red-700 mb-8">
          Attendance Report
        </h2>

        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100 backdrop-blur p-6 mb-8">
          <div className="grid sm:grid-cols-2 gap-4">

        {/* DATE FILTER */}
        <div>
          <p className="text-red-700 font-semibold">Filter by date</p>
          <input
            type="date"
            value={dataFilter}
            onChange={handleDateChange}
            className="border border-red-300 rounded-xl px-3 py-2 w-full
                       focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* 🔍 SEARCH FILTER */}
        <div>
          <p className="text-red-700 font-semibold">Search by Name / Employee ID</p>
            <div className="flex gap-2">
              <input type="text" value={searchInput} placeholder="eg: EMP001 or name"
                onChange={(e) => {
                const value = e.target.value;
                setSearchInput(value);

                if (value.trim() === "") {
                  setSearch("");
                  setSkip(0);
                  setReport({});
                }
              }}
                className="border border-red-300 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500" />

              <button
                onClick={() => {
                  if (!searchInput.trim()) return;
                  setSkip(0);
                  setReport({});
                  setSearch(searchInput.trim());
                }}
                className="px-4 py-2 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
        {/* REPORT CARDS */}
        {loading ? (
          <div className="text-center text-red-600 font-bold text-xl">
            Loading report...
          </div>
        ) : (
          Object.entries(report || {}).map(([date, record]) => (
            <div
              key={date}
              className="bg-white/90 rounded-3xl shadow-xl border border-red-100 backdrop-blur p-6 mb-8"
            >
              <h3 className="text-2xl font-bold text-red-700 mb-4">
                {date}
              </h3>

              <div className="max-h-[60vh] overflow-auto rounded-b-2xl">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-red-50/80 backdrop-blur-xl shadow-sm">
                    <tr>
                      <th className="p-3 text-left text-red-800 font-semibold">S No</th>
                      <th className="p-3 text-left text-red-800 font-semibold">Employee ID</th>
                      <th className="p-3 text-left text-red-800 font-semibold">Name</th>
                      <th className="p-3 text-left text-red-800 font-semibold">Department</th>
                      <th className="p-3 text-left text-red-800 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-red-100/70">
                    {record?.map((data, i) => (
                      <tr key={`${date}-${data.employeeId}-${i}`} className="hover:bg-red-50">
                        <td className="p-3">{i + 1}</td>
                        <td className="p-3">{data.employeeId || "N/A"}</td>
                        <td className="p-3">{data.employeeName || "Unknown"}</td>
                        <td className="p-3">{data.departmentName || "N/A"}</td>

                        <td
                          className={`p-3 font-semibold
                          ${
                            data.status === "Present"
                              ? "text-green-600"
                              : data.status === "Absent"
                              ? "text-red-600"
                              : "text-orange-500"
                          }`}
                        >
                          {data.status}
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
    </div>
  );
};

export default AdminAttendanceReport;