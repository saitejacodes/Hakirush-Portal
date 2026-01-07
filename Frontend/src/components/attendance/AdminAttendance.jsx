import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AttendanceHelper from "../../utils/AttendanceHelper";

import { Search, FileSpreadsheet, CalendarDays } from "lucide-react";

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchAttendance = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/attendance`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        let sno = 1;

        const data = response.data.attendance.map((att) => ({
          _id: att._id,
          sno: sno++,
          employeeId: att.employeeId?.employeeId || "N/A",
          name: att.employeeId?.userId?.name || "Unknown",
          department: att.employeeId?.department?.dep_name || "N/A",
          status: att.status || null,
        }));

        setAttendance(data);
        setFilteredAttendance(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const statusChange = () => fetchAttendance();

  useEffect(() => {
    const result = attendance.filter((att) =>
      (att.name || "").toLowerCase().includes(search.toLowerCase())
    );
    setFilteredAttendance(result);
  }, [search, attendance]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h3 className="text-4xl font-extrabold text-red-700 tracking-tight">
            Manage Attendance
          </h3>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100 backdrop-blur">

          {/* TOP BAR */}
          <div className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            {/* SEARCH */}
            <div className="relative w-full sm:w-1/2">
              <Search size={18} className="absolute left-3 top-3 text-red-500" />
              <input
                type="text"
                placeholder="Search employee..."
                className="w-full rounded-xl border border-red-300 pl-9 pr-4 py-2.5
                           outline-none focus:ring-2 focus:ring-red-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* DATE */}
            <p className="text-sm font-medium text-red-600 flex items-center gap-2">
              <CalendarDays size={18} />
              <span className="hidden sm:inline">Mark Employees for</span>
              <b>{new Date().toISOString().split("T")[0]}</b>
            </p>

            {/* REPORT BUTTON */}
            <Link
              to="/admin-dashboard/attendance-report"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white shadow hover:bg-red-700 transition"
            >
              <FileSpreadsheet size={18} />
              <span className="hidden sm:inline">Attendance Report</span>
            </Link>
          </div>

          {/* TABLE */}
          <div className="max-h-[60vh] overflow-auto rounded-b-3xl">
            {loading ? (
              <div className="p-10 text-center text-red-600 font-semibold text-lg">
                Loading employees...
              </div>
            ) : (
              <table className="w-full border-collapse">

                <thead className="sticky top-0 bg-red-50/80 backdrop-blur-xl shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">S No</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Employee Id</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Department</th>
                    <th className="px-4 py-3 text-right text-red-800 font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-red-100/70">
                  {filteredAttendance.length ? (
                    filteredAttendance.map((att) => (
                      <tr key={att._id} className="hover:bg-red-50">
                        <td className="px-4 py-3">{att.sno}</td>
                        <td className="px-4 py-3">{att.name}</td>
                        <td className="px-4 py-3">{att.employeeId}</td>
                        <td className="px-4 py-3">{att.department}</td>

                        <td className="px-4 py-3 text-right">
                          <AttendanceHelper
                            employeeId={att.employeeId}
                            status={att.status}
                            statusChange={statusChange}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-16 text-center text-red-400 text-lg"
                      >
                        No employees found
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

export default AdminAttendance;