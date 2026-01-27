import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, CalendarDays, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";
import AttendanceHelper from "../../utils/AttendanceHelper";

/* ===== HELPER ===== */
const getDayType = (dateStr, holidays) => {
  const d = new Date(dateStr);
  const ymd = d.toISOString().split("T")[0];

  if (d.getDay() === 0) return { type: "weekend", title: "Weekend (Sunday)" };

  const holiday = holidays.find(
    h => new Date(h.date).toISOString().split("T")[0] === ymd
  );

  if (holiday) return { type: "holiday", title: holiday.title };

  return { type: "working", title: "" };
};

/* ========== MOBILE CARD ========== */
const MobileAttendanceCard = ({ att, dayInfo, statusChange }) => (
  <div className="bg-white rounded-2xl shadow-md border border-red-100 p-3">
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{att.name}</p>

        <p className="text-xs text-red-600 truncate">
          {att.department} • {att.designation}
        </p>

        <p className="text-[11px] text-gray-500 truncate">
          ID: {att.employeeCode}
        </p>
      </div>

      <AttendanceHelper
        employeeId={att.employeeMongoId}
        status={att.status}
        statusChange={statusChange}
        isHoliday={dayInfo.type === "holiday"}
        isWeekend={dayInfo.type === "weekend"}
        dayTitle={dayInfo.title}
      />
    </div>
  </div>
);

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const dayInfo = getDayType(todayStr, holidays);

  const fetchHolidays = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/holiday/upcoming`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    setHolidays(res.data.holidays || []);
  };

  const fetchAttendance = async () => {
    setLoading(true);
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/attendance`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    if (res.data.success) {
      let sno = 1;
      const data = res.data.attendance.map(a => ({
        _id: a._id,
        sno: sno++,
        employeeMongoId: a.employeeId?._id,
        employeeCode: a.employeeId?.employeeId || "N/A",
        name: a.employeeId?.userId?.name || "Unknown",
        department: a.employeeId?.department?.dep_name || "N/A",
        designation: a.employeeId?.designation || "N/A", // ✅ ADDED
        status: a.status || null,
      }));
      setAttendance(data);
      setFiltered(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
    fetchHolidays();
  }, []);

  useEffect(() => {
    setFiltered(
      attendance.filter(a =>
        (a.name || "").toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, attendance]);

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-red-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-8">
          <h3 className="text-3xl md:text-4xl font-extrabold text-red-800">
            Manage Attendance
          </h3>
          {dayInfo.type !== "working" && (
            <p className="text-sm font-semibold text-yellow-700 mt-2">
              {dayInfo.title}
            </p>
          )}
        </div>

        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100">

          <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee..."
                className="w-full rounded-xl border border-red-300 pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-red-500"
              />
            </div>

            <p className="text-sm font-semibold text-red-600 flex items-center gap-2">
              <CalendarDays size={18} /> {todayStr}
            </p>

            <Link
              to="/admin-dashboard/attendance-report"
              className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white shadow-md"
            >
              <FileSpreadsheet size={18} className="inline mr-2" />
              Attendance Report
            </Link>
          </div>

          {loading ? (
            <div className="p-10 text-center text-red-600">Loading...</div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden grid gap-4 p-4">
                {filtered.map(att => (
                  <MobileAttendanceCard
                    key={att._id}
                    att={att}
                    dayInfo={dayInfo}
                    statusChange={fetchAttendance}
                  />
                ))}
              </div>

              {/* DESKTOP */}
              <div className="hidden md:block max-h-[60vh] overflow-auto">
                <table className="w-full">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-4 py-3">S No</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Employee ID</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Designation</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(att => (
                      <tr key={att._id} className="hover:bg-red-50">
                        <td className="px-4 py-3">{att.sno}</td>
                        <td className="px-4 py-3 font-medium">{att.name}</td>
                        <td className="px-4 py-3">{att.employeeCode}</td>
                        <td className="px-4 py-3">{att.department}</td>
                        <td className="px-4 py-3 text-gray-600">{att.designation}</td>
                        <td className="px-4 py-3 text-right">
                          <AttendanceHelper
                            employeeId={att.employeeMongoId}
                            status={att.status}
                            statusChange={fetchAttendance}
                            isHoliday={dayInfo.type === "holiday"}
                            isWeekend={dayInfo.type === "weekend"}
                            dayTitle={dayInfo.title}
                          />
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

export default AdminAttendance;