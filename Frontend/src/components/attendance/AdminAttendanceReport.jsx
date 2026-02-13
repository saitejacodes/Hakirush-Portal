import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, CalendarDays } from "lucide-react";

const ITEMS_PER_PAGE = 10;

/* ================= STATUS COLOR HELPERS (EXISTING) ================= */
const normalizeStatus = (status) => {
  if (status === null || status === undefined || status === "") return null;

  const s = status.toString().toLowerCase().replace(/\s+/g, "");
  if (s === "halfday") return "Half Day";
  if (s === "present") return "Present";
  if (s === "leave") return "Leave";
  if (s === "absent") return "Absent";
  return null;
};

const statusTheme = {
  Present: { bg: "#16a34a", light: "#dcfce7", text: "#166534" },
  Absent: { bg: "#dc2626", light: "#fee2e2", text: "#991b1b" },
  Leave: { bg: "#eab308", light: "#fef9c3", text: "#ca8a04" },
  "Half Day": { bg: "#2563eb", light: "#dbeafe", text: "#1e40af" },
};

/* ================= SAME TIMER LOGIC AS ADMIN ATTENDANCE ================= */
const formatLiveTimer = (row) => {
  if (!row?.checkIn) return "00:00:00";

  const endTime = row.checkOut
    ? new Date(row.checkOut)
    : row.isPaused
    ? new Date(row.pauseStartedAt)
    : new Date();

  const diffMs =
    endTime -
    new Date(row.checkIn) -
    (row.totalPausedMs || 0);

  const sec = Math.max(0, Math.floor(diffMs / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(
    2,
    "0"
  )}:${String(s).padStart(2, "0")}`;
};

/* ================= DECIMAL HOURS → HH:MM:SS ================= */
const hoursToHHMMSS = (hours) => {
  if (hours == null || isNaN(hours)) return "00:00:00";

  const totalSeconds = Math.floor(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(
    2,
    "0"
  )}:${String(s).padStart(2, "0")}`;
};

const AdminAttendanceReport = () => {
  const today = new Date().toISOString().split("T")[0];

  const [report, setReport] = useState({});
  const [holidayMap, setHolidayMap] = useState({}); // ✅ ADD ONLY
  const [dataFilter, setDataFilter] = useState(today);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPageByDate, setCurrentPageByDate] = useState({});

  /* ================= FETCH REPORT ================= */
  const fetchReport = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams();
      if (dataFilter) query.append("date", dataFilter);
      if (search) query.append("search", search);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance/report?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        const updated = {};
        const pageState = {};

        Object.entries(res.data.groupData || {}).forEach(([date, rows]) => {
          updated[date] = rows
            .sort((a, b) =>
              a.employeeId.localeCompare(b.employeeId, undefined, {
                numeric: true,
                sensitivity: "base",
              })
            )
            .map((r) => ({
              ...r,
              isLive: date === today && !r.checkOut && r.checkIn,
              runningTime:
                date === today && r.checkIn
                  ? formatLiveTimer(r)
                  : null,
            }));

          pageState[date] = 1;
        });

        setHolidayMap(res.data.holidayMap || {}); // ✅ ADD ONLY
        setCurrentPageByDate(pageState);
        setReport(updated);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dataFilter, search]);

  /* ================= LIVE TIMER ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setReport((prev) => {
        const updated = { ...prev };
        if (!updated[today]) return updated;

        updated[today] = updated[today].map((r) =>
          r.isLive ? { ...r, runningTime: formatLiveTimer(r) } : r
        );

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ================= CLEAR SEARCH ================= */
  const clearSearch = () => {
    setSearch("");
    setSearchInput("");
    setDataFilter(today);
    setReport({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-6">

      {/* HEADER */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-red-700">
          Attendance Report
        </h2>
        <p className="text-gray-500 mt-2">
          Detailed daily attendance breakdown
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg border border-red-100 p-5 mb-6 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchInput.trim()) setSearch(searchInput.trim());
          }}
          className="flex flex-col md:flex-row gap-4"
        >
          <input
            type="date"
            value={dataFilter}
            onChange={(e) => setDataFilter(e.target.value)}
            className="w-full md:w-1/3 border border-red-500 rounded-xl px-4 py-2.5 cursor-pointer"
          />

          <div className="relative w-full">
            <Search className="absolute left-3 top-3 text-red-400" size={18} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Employee name or ID"
              className="w-full border border-red-500 rounded-xl pl-10 pr-4 py-2.5"
            />
          </div>

          <button className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white cursor-pointer hover:bg-red-700 transition">
            Search
          </button>
        </form>

        {search && (
          <button
            onClick={clearSearch}
            className="w-full rounded-xl bg-gray-200 py-2 font-semibold text-gray-700 cursor-pointer hover:bg-gray-300 transition"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* DATA */}
      {loading ? (
        <p className="text-center text-red-600 font-bold mt-20">
          Loading attendance report...
        </p>
      ) : (
        Object.entries(report).map(([date, records]) => {
          const currentPage = currentPageByDate[date] || 1;
          const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
          const paginatedRecords = records.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
          );

          const isSunday = new Date(`${date}T00:00:00`).getDay() === 0;
          const holidayName = holidayMap[date]; // Sankranthi
          const isHoliday = !isSunday && !!holidayName;

          return (
            <div key={date} className="max-w-6xl mx-auto mb-8">

              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 rounded-t-2xl font-bold text-red-700">
                <CalendarDays size={18} />
                {date}
              </div>

              {isSunday && (
                <div className="bg-white p-10 text-center text-2xl font-extrabold text-red-600 rounded-b-2xl">
                  Weekend (Sunday)
                </div>
              )}

              {isHoliday && (
                <div className="bg-white p-10 text-center text-2xl font-extrabold text-red-600 rounded-b-2xl">
                  {holidayName} (Holiday)
                </div>
              )}

              {/* ===== EXISTING UI (DESKTOP + MOBILE + PAGINATION) ===== */}
              {!isSunday && !isHoliday && (
                <>
                  {/* DESKTOP TABLE */}
                  <div className="hidden md:block bg-white shadow overflow-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-red-100 text-red-800 uppercase text-sm">
                        <tr>
                          <th className="px-4 py-3 text-center">S No</th>
                          <th className="px-4 py-3 text-left">Employee ID</th>
                          <th className="px-4 py-3 text-left">Name</th>
                          <th className="px-4 py-3 text-left">Department</th>
                          <th className="px-4 py-3 text-left">Designation</th>
                          <th className="px-4 py-3 text-center">Worked Time</th>
                          <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {paginatedRecords.map((r, i) => (
                          <tr key={`${date}-${r.employeeId}-${i}`} className="border-t hover:bg-red-50">
                            <td className="px-4 py-3 text-center">
                              {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                            </td>
                            <td className="px-4 py-3">{r.employeeId}</td>
                            <td className="px-4 py-3 font-medium">{r.employeeName}</td>
                            <td className="px-4 py-3">{r.departmentName}</td>
                            <td className="px-4 py-3">{r.designation || "N/A"}</td>
                            <td className="px-4 py-3 text-center font-mono font-bold">
                              {r.runningTime || hoursToHHMMSS(r.workedHours)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {(() => {
                                const s = normalizeStatus(r.status);
                                const t = statusTheme[s];
                                return s && t ? (
                                  <span
                                    className="px-3 py-1 rounded-full text-sm font-bold"
                                    style={{ backgroundColor: t.light, color: t.text }}
                                  >
                                    {s}
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full text-gray-600 font-semibold bg-gray-300">N/A</span>
                                );
                              })()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE CARDS */}
                  <div className="md:hidden bg-white rounded-b-2xl p-4 space-y-4">
                    {paginatedRecords.map((r, i) => (
                      <div key={`${date}-${r.employeeId}-${i}`} className="border rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold">{r.employeeName}</p>
                            <p className="text-xs text-gray-500">{r.employeeId}</p>
                          </div>
                          <span className="font-mono font-bold">
                            {r.runningTime || hoursToHHMMSS(r.workedHours)}
                          </span>
                        </div>

                        <div className="mt-3">
                          {(() => {
                            const s = normalizeStatus(r.status);
                            const t = statusTheme[s];
                            return s && t ? (
                              <span
                                className="px-3 py-1 rounded-full text-sm font-bold"
                                style={{ backgroundColor: t.light, color: t.text }}
                              >
                                {s}
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-gray-600 font-semibold bg-gray-300">N/A</span>
                            );
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* PAGINATION */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-5 border-t bg-white/80 rounded-b-3xl">
                      <button
                        onClick={() =>
                          setCurrentPageByDate((p) => ({
                            ...p,
                            [date]: Math.max(currentPage - 1, 1),
                          }))
                        }
                        disabled={currentPage === 1}
                        className="px-5 py-2 rounded-lg bg-red-100 text-red-600 font-semibold"
                      >
                        ◀ Previous
                      </button>

                      <span className="font-semibold">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={() =>
                          setCurrentPageByDate((p) => ({
                            ...p,
                            [date]: Math.min(currentPage + 1, totalPages),
                          }))
                        }
                        disabled={currentPage === totalPages}
                        className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold"
                      >
                        Next ▶
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default AdminAttendanceReport;
