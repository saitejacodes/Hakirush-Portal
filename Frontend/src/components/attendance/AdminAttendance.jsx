import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, CalendarDays, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";
import AttendanceHelper from "../../utils/AttendanceHelper";

/* ===== DAY TYPE HELPER ===== */
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

/* ===== MOBILE CARD ===== */
const MobileAttendanceCard = ({ att, dayInfo, refresh }) => (
  <div className="bg-white rounded-2xl shadow-md border border-red-100 p-4 space-y-2">
    <div>
      <p className="font-bold text-gray-900 truncate">{att.name}</p>
      <p className="text-xs text-red-600">
        {att.department} • {att.designation}
      </p>
      <p className="text-[11px] text-gray-500">
        Employee ID: {att.employeeCode}
      </p>
    </div>

    <AttendanceHelper
      employeeId={att.employeeMongoId}
      status={att.status}
      statusChange={refresh}
      isHoliday={dayInfo.type === "holiday"}
      isWeekend={dayInfo.type === "weekend"}
      dayTitle={dayInfo.title}
    />
  </div>
);

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const dayInfo = getDayType(today, holidays);

  /* ===== FETCH HOLIDAYS ===== */
  const fetchHolidays = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/holiday/upcoming`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    setHolidays(res.data.holidays || []);
  };

  /* ===== FETCH ATTENDANCE ===== */
  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
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
          designation: a.employeeId?.designation || "N/A",
          status: a.status || null,
        }));

        setAttendance(data);
        setFiltered(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchHolidays();
  }, []);

  useEffect(() => {
    setFiltered(
      attendance.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, attendance]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-red-700">
            Manage Attendance
          </h2>

          {dayInfo.type !== "working" && (
            <p className="text-yellow-700 font-semibold mt-2">
              {dayInfo.title}
            </p>
          )}
        </div>

        {/* TOP BAR */}
        <div className="bg-white rounded-2xl shadow border border-red-100 p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-3 text-red-400" size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employee..."
              className="w-full border border-red-300 rounded-xl pl-10 pr-4 py-2"
            />
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4">
            <span className="text-sm font-semibold text-red-600 flex items-center gap-2">
              <CalendarDays size={18} />
              {today}
            </span>

            <Link
              to="/admin-dashboard/attendance-report"
              className="bg-red-600 text-white px-4 py-2 rounded-xl font-semibold"
            >
              <FileSpreadsheet size={16} className="inline mr-1" />
              Report
            </Link>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <p className="text-center text-red-600 mt-10">Loading...</p>
        ) : (
          <>
            {/* MOBILE */}
            <div className="md:hidden grid gap-4 mt-6">
              {filtered.map(att => (
                <MobileAttendanceCard
                  key={att._id}
                  att={att}
                  dayInfo={dayInfo}
                  refresh={fetchAttendance}
                />
              ))}
            </div>

            {/* DESKTOP */}
            <div className="hidden md:block mt-6 bg-white rounded-2xl shadow border border-red-100 overflow-auto">
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
                    <tr key={att._id} className="border-t hover:bg-red-50">
                      <td className="px-4 py-3">{att.sno}</td>
                      <td className="px-4 py-3 font-medium">{att.name}</td>
                      <td className="px-4 py-3">{att.employeeCode}</td>
                      <td className="px-4 py-3">{att.department}</td>
                      <td className="px-4 py-3">{att.designation}</td>
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
  );
};

export default AdminAttendance;
