import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AttendanceHelper from "../../utils/AttendanceHelper";

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

 
  const fetchAttendance = async () => {
    setLoading(true);

    try {
      const response = await axios.get("http://localhost:5000/api/attendance", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

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
    } catch (error) {
      console.error(error);
      alert("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  // load at start
  useEffect(() => {
    fetchAttendance();
  }, []);

  // refresh callback passed to helper
  const statusChange = () => {
    fetchAttendance();
  };

  // search
  useEffect(() => {
    const result = attendance.filter((att) =>
      (att.name || "").toLowerCase().includes(search.toLowerCase())
    );

    setFilteredAttendance(result);
  }, [search, attendance]);

  return (
    <div className="min-h-screen bg-red-50 p-6">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8 text-center">
          <h3 className="text-4xl font-extrabold text-red-700">
            Manage Attendance
          </h3>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-6 border border-red-100">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              placeholder="Search employee..."
              className="w-full sm:w-1/2 rounded-xl border border-red-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <p className="text-sm font-medium text-red-600">
              Mark Employees for <b>{new Date().toISOString().split("T")[0]}</b>
            </p>

            <Link
              to="/admin-dashboard/attendance-report"
              className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white shadow-md hover:bg-red-700 hover:shadow-lg transition"
            >
              Attendance Report
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto">
            {loading ? (
              <p className="text-center text-red-500 py-10">
                Loading employees...
              </p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-red-100">
                    <th className="px-4 py-3 text-center">S No</th>
                    <th className="px-4 py-3 text-center">Name</th>
                    <th className="px-4 py-3 text-center">Employee Id</th>
                    <th className="px-4 py-3 text-center">Department</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAttendance.length > 0 ? (
                    filteredAttendance.map((att) => (
                      <tr key={att._id} className="border-b hover:bg-red-50">
                        <td className="px-4 py-3 text-center">{att.sno}</td>
                        <td className="px-4 py-3 text-center">{att.name}</td>
                        <td className="px-4 py-3 text-center">{att.employeeId}</td>
                        <td className="px-4 py-3 text-center">{att.department}</td>

                        <td className="px-4 py-3 text-center">
                          <AttendanceHelper employeeId={att.employeeId} status={att.status} statusChange={statusChange} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-red-400">
                        No employees found.
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
