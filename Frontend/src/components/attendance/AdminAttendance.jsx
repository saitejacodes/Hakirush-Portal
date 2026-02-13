import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Search, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import AttendanceHelper from "../../utils/AttendanceHelper";

const ITEMS_PER_PAGE = 6;

/* ===== TIMER FORMAT ===== */
const formatTimer = (attendance) => {
  if (!attendance?.checkIn) return "00:00:00";

  const endTime = attendance.checkOut
    ? new Date(attendance.checkOut)
    : attendance.isPaused
    ? new Date(attendance.pauseStartedAt)
    : new Date();

  const diffMs =
    endTime -
    new Date(attendance.checkIn) -
    (attendance.totalPausedMs || 0);

  const sec = Math.max(0, Math.floor(diffMs / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(
    2,
    "0"
  )}:${String(s).padStart(2, "0")}`;
};

/* ===== DAY FORMAT ===== */
const getTodayLabel = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  /* ===== ADD ONLY (DO NOT REMOVE) ===== */
  const [isSunday, setIsSunday] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState("");

  /* ===== FETCH ATTENDANCE ===== */
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (res.data.success) {
        /* ===== ADD ONLY ===== */
        setIsSunday(res.data.isSunday || false);
        setIsHoliday(res.data.isHoliday || false);
        setHolidayName(res.data.holidayName || "");

        setAttendance(
          res.data.attendance.map((a) => ({
            _id: a._id,
            employeeMongoId: a.employeeId?._id,
            employeeCode: a.employeeId?.employeeId || "N/A",
            name: a.employeeId?.userId?.name || "Unknown",
            department: a.employeeId?.department?.dep_name || "N/A",
            designation: a.employeeId?.designation || "N/A",
            status: a.status ?? null,
            checkIn: a.checkIn,
            checkOut: a.checkOut,
            isPaused: a.isPaused,
            pauseStartedAt: a.pauseStartedAt,
            totalPausedMs: a.totalPausedMs || 0,
            timer: formatTimer(a),
          }))
        );

        setCurrentPage(1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  /* ===== FILTER + SORT ===== */
  const filtered = useMemo(
    () =>
      attendance.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase())
      ),
    [attendance, search]
  );

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) =>
        a.employeeCode.localeCompare(b.employeeCode, undefined, {
          numeric: true,
        })
      ),
    [filtered]
  );

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);

  const paginated = useMemo(
    () =>
      sorted.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [sorted, currentPage]
  );

  /* ===== LIVE TIMER ===== */
  useEffect(() => {
    const visibleIds = paginated.map((p) => p._id ?? p.employeeMongoId);

    const interval = setInterval(() => {
      setAttendance((prev) =>
        prev.map((att) => {
          const key = att._id ?? att.employeeMongoId;
          if (!visibleIds.includes(key) || att.isPaused || att.checkOut)
            return att;
          return { ...att, timer: formatTimer(att) };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [paginated]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4">
      <div className="max-w-6xl mx-auto">

        <h2 className="text-3xl font-extrabold text-red-700 text-center mb-6">
          Manage Attendance
        </h2>

        {/* TOP BAR */}
        <div className="bg-white rounded-t-2xl shadow px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-700 font-semibold text-sm">
              <CalendarDays size={18} />
              {getTodayLabel()}
            </div>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" size={18} />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search employee..."
                className="w-full border border-red-300 rounded-xl pl-10 pr-4 py-2"
              />
            </div>

            <Link
              to="/admin-dashboard/attendance-report"
              className="bg-red-600 text-white px-5 py-2 rounded-xl font-semibold"
            >
              Report
            </Link>
          </div>
        </div>

        {/* ===== ADD ONLY : WEEKEND / HOLIDAY VIEW ===== */}
        {isSunday && (
          <div className="bg-white p-10 text-center text-2xl font-extrabold text-red-600 rounded-b-2xl shadow">
            Weekend (Sunday)
          </div>
        )}

        {isHoliday && (
          <div className="bg-white p-10 text-center text-2xl font-extrabold text-red-600 rounded-b-2xl shadow">
            {holidayName} (Holiday)
          </div>
        )}

        {/* ===== EXISTING TABLE + CARDS (UNCHANGED) ===== */}
        {!isSunday && !isHoliday && (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-white shadow overflow-hidden">
              <table className="w-full table-auto">
                <thead className="bg-red-50">
                  <tr>
                    <th className="p-3">S No</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3">Employee ID</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Designation</th>
                    <th className="p-3">Worked</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((a, i) => (
                    <tr key={`${a.employeeMongoId}-${a._id ?? "new"}`} className="border-t">
                      <td className="p-3 text-center">
                        {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                      </td>
                      <td className="p-3">{a.name}</td>
                      <td className="p-3">{a.employeeCode}</td>
                      <td className="p-3">{a.department}</td>
                      <td className="p-3">{a.designation}</td>
                      <td className="p-3 font-mono font-bold text-center">{a.timer}</td>
                      <td className="p-3 text-center">
                        <AttendanceHelper
                          employeeId={a.employeeMongoId}
                          status={a.status}
                          statusChange={fetchAttendance}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden space-y-4 my-4">
              {paginated.map((a) => (
                <div
                  key={`${a.employeeMongoId}-${a._id ?? "new"}`}
                  className="bg-white rounded-2xl shadow border border-red-100 p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold">{a.name}</p>
                      <p className="text-xs text-gray-500">ID: {a.employeeCode}</p>
                    </div>
                    <div className="bg-green-50 text-green-700 font-mono font-bold px-3 py-1 rounded-lg text-sm">
                      {a.timer}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t">
                    <AttendanceHelper
                      employeeId={a.employeeMongoId}
                      status={a.status}
                      statusChange={fetchAttendance}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && !isSunday && !isHoliday && (
          <div className="flex items-center justify-between px-4 py-5 bg-white/80 rounded-b-3xl">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-5 py-2 rounded-lg bg-red-100 text-red-600 font-semibold cursor-pointer disabled:bg-red-50 disabled:text-red-300 disabled:cursor-not-allowed"
            >
              ◀ Previous
            </button>

            <span className="font-semibold">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold cursor-pointer disabled:bg-red-300 disabled:cursor-not-allowed"
            >
              Next ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendance;