import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, CalendarDays, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";
import AttendanceHelper from "../../utils/AttendanceHelper";

/* ================= DAY TYPE ================= */
const getDayType = (dateStr, holidays) => {
  const d = new Date(dateStr);
  const ymd = d.toISOString().split("T")[0];

  if (d.getDay() === 0) return { type: "weekend", title: "Weekend (Sunday)" };

  const holiday = holidays.find(
    (h) => new Date(h.date).toISOString().split("T")[0] === ymd
  );

  if (holiday) return { type: "holiday", title: holiday.title };

  return { type: "working", title: "" };
};

/* ================= MOBILE CARD ================= */
const MobileAttendanceCard = ({ att, dayInfo, refresh }) => (
  <div className="bg-white rounded-2xl shadow-md border border-red-100 p-3">
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-xs truncate">
          {att.name}
        </p>
        <p className="text-xs text-red-600 truncate">
          {att.department}
        </p>
        <p className="text-[11px] text-gray-500 truncate">
          {att.designation} • ID: {att.employeeCode}
        </p>
      </div>

      <div className="shrink-0">
        <AttendanceHelper
          employeeId={att.employeeMongoId}
          status={att.status}
          statusChange={refresh}
          isHoliday={dayInfo.type === "holiday"}
          isWeekend={dayInfo.type === "weekend"}
          dayTitle={dayInfo.title}
        />
      </div>
    </div>
  </div>
);

const ITEMS_PER_PAGE = 5;

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const todayStr = new Date().toISOString().split("T")[0];
  const dayInfo = getDayType(todayStr, holidays);

  /* ================= FETCH HOLIDAYS ================= */
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

  /* ================= FETCH ATTENDANCE ================= */
  const fetchAttendance = async () => {
    setLoading(true);
    try {
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
        const data = res.data.attendance.map((a) => ({
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

  /* ================= SEARCH ================= */
  useEffect(() => {
    const result = attendance.filter((a) =>
      a.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
    setCurrentPage(1);
  }, [search, attendance]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-red-700 drop-shadow-sm">
            Manage Attendance
          </h3>

          {dayInfo.type !== "working" && (
            <p className="text-sm font-semibold text-yellow-700 mt-2">
              {dayInfo.title}
            </p>
          )}
        </div>

        <div className="bg-white/95 rounded-3xl shadow-2xl border border-red-100">

          {/* TOP BAR */}
          <div className="p-5 md:p-7 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="relative w-full md:w-1/2">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400"
                size={20}
              />
              <input
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-red-300
                           pl-10 pr-4 py-3 outline-none
                           focus:ring-2 focus:ring-red-500
                           text-base shadow-sm"
              />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-red-600 flex items-center gap-2">
                <CalendarDays size={18} /> {todayStr}
              </span>

              <Link
                to="/admin-dashboard/attendance-report"
                className="rounded-xl bg-gradient-to-br from-red-600 to-red-500
                           px-6 py-3 font-semibold text-white shadow-lg
                           hover:scale-105 transition"
              >
                <FileSpreadsheet size={18} className="inline mr-2" />
                Attendance Report
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-red-600 font-semibold text-lg">
              Loading attendance...
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden grid grid-cols-1 gap-6 px-4 pb-8">
                {paginated.length ? (
                  paginated.map((att) => (
                    <MobileAttendanceCard
                      key={att._id}
                      att={att}
                      dayInfo={dayInfo}
                      refresh={fetchAttendance}
                    />
                  ))
                ) : (
                  <div className="text-center text-red-400 py-20 text-lg">
                    No records found
                  </div>
                )}
              </div>

              {/* DESKTOP */}
              <div className="hidden md:block max-h-[60vh] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-red-50 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold">S No</th>
                      <th className="px-4 py-3 text-left font-bold">Name</th>
                      <th className="px-4 py-3 text-left font-bold">Employee ID</th>
                      <th className="px-4 py-3 text-left font-bold">Department</th>
                      <th className="px-4 py-3 text-left font-bold">Designation</th>
                      <th className="px-4 py-3 text-right font-bold">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.map((att) => (
                      <tr key={att._id} className="hover:bg-red-50 transition">
                        <td className="px-4 py-3">{att.sno}</td>
                        <td className="px-4 py-3">{att.name}</td>
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

              {/* PAGINATION */}
              {filtered.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between px-4 py-5 border-t bg-white/80 rounded-b-3xl">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-5 py-2 rounded-lg font-semibold
                      ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                  >
                    ◀ Previous
                  </button>

                  <span className="text-base font-semibold text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-5 py-2 rounded-lg font-semibold
                      ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                  >
                    Next ▶
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;