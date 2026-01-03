import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminAttendanceReport = () => {
  const [report, setReport] = useState({});
  const [limit, setLimit] = useState(5);
  const [skip, setSkip] = useState(0);
  const [dataFilter, setDataFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams({ limit, skip });
      if (dataFilter) query.append("date", dataFilter);

      const response = await axios.get(
        `http://localhost:5000/api/attendance/report?${query.toString()}`,
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
  }, [limit, skip, dataFilter]);

  const handleDateChange = (e) => {
    setSkip(0);
    setDataFilter(e.target.value);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-4xl font-extrabold text-center text-red-700 mb-6">
        Attendance Report
      </h2>

      {/* Filter box */}
      <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl mb-6 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <label className="font-semibold text-red-800">
          Filter by Date
        </label>

        <input
          type="date"
          value={dataFilter}
          onChange={handleDateChange}
          className="border border-red-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {loading ? (
        <div className="text-center text-red-600 font-bold text-xl">
          Loading...
        </div>
      ) : (
        Object.entries(report || {}).map(([date, record]) => (
          <div
            key={date}
            className="bg-white shadow-lg border border-red-200 rounded-2xl p-5 mb-6"
          >
            <h3 className="text-2xl font-bold text-red-700 mb-3">
              {date}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-red-600 text-white">
                    <th className="p-3">S No</th>
                    <th className="p-3">Employee ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {record?.map((data, i) => (
                    <tr
                      key={data.employeeId}
                      className="text-center border-b hover:bg-red-50"
                    >
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2">{data.employeeId || "N/A"}</td>
                      <td className="p-2">{data.employeeName || "Unknown"}</td>
                      <td className="p-2">{data.departmentName || "N/A"}</td>
                      <td
                        className={`p-2 font-bold rounded-lg
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
  );
};

export default AdminAttendanceReport;
