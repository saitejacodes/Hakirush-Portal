import axios from "axios";
import {
  Users,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
  CalendarMinus
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";

const EmployeeSummary = () => {
  const { user, loading } = useAuth();

  const [deptEmployees, setDeptEmployees] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [attendance, setAttendance] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [hoverDay, setHoverDay] = useState(null);

  const toYMD = (d) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const today = new Date().toISOString().split("T")[0];

  const upcomingHolidays = holidays.filter(
    h => new Date(h.date).toISOString().split("T")[0] >= today
  );

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    if (!user) return;
    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

    Promise.all([
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employee/by-department/me`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/all`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employee/leave/balance/me`, { headers })
    ])
      .then(([d1, d2, d3]) => {
        setDeptEmployees(d1?.data?.employees || []);
        setHolidays(d2?.data?.holidays || []);
        const leave = d3?.data || {};
        setLeaveBalance(leave.balance ?? (leave.total - leave.used) ?? 0);
      })
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/announcements`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then(res => setAnnouncements(res?.data?.announcements || []))
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;
    const m = calendarMonth.getMonth() + 1;
    const y = calendarMonth.getFullYear();

    axios
      .get(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance/user/${user._id}/monthly?month=${m}&year=${y}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      .then(res => setAttendance(res.data.attendance || []))
      .catch(console.error);
  }, [user, calendarMonth]);

  const generateCalendar = () => {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    const first = new Date(y, m, 1).getDay();
    const count = new Date(y, m + 1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  };

  const getDayStatus = (day) => {
    if (!day) return "none";
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    const str = toYMD(date);

    if (date.getDay() === 0) return "weekend";
    if (holidays.some(h => toYMD(h.date) === str)) return "holiday";

    const rec = attendance.find(a => a.date === str);
    return rec?.status?.toLowerCase() || "none";
  };

  const getDayTooltip = (day) => {
    if (!day) return "";
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    const str = toYMD(date);

    if (date.getDay() === 0) return "Sunday";
    const holiday = holidays.find(h => toYMD(h.date) === str);
    if (holiday) return holiday.title;

    const rec = attendance.find(a => a.date === str);
    return rec?.status || "No record";
  };

  if (loading || !user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-yellow-50 px-4 py-10">
      <div className="max-w-7xl mx-auto space-y-12">

        <h1 className="text-3xl font-extrabold text-red-800 tracking-tight">
          Dashboard Overview
        </h1>

        {/* ---------- WIDGETS ---------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <Widget title="Department Employees" icon={<Users />}>
            <div className="flex flex-wrap gap-2">
              {deptEmployees.map(e => (
                <Chip key={e._id}>{e?.userId?.name}</Chip>
              ))}
            </div>
          </Widget>

          <Widget title="Upcoming Holidays" icon={<CalendarDays />}>
            {upcomingHolidays.length === 0
              ? <Empty>No upcoming holidays</Empty>
              : upcomingHolidays.map(h => (
                  <Chip key={h._id} yellow>{h.title}</Chip>
                ))
            }
          </Widget>

          <Widget title="Announcements" icon={<PartyPopper />}>
            {announcements.length === 0 ? (
              <Empty>No announcements</Empty>
            ) : (
              announcements.map(a => (
                <div
                  key={a._id}
                  className="rounded-2xl p-3 bg-white/70 backdrop-blur border shadow-sm"
                >
                  <p className="font-bold text-sm text-red-700">{a.title}</p>
                  <p className="text-xs text-gray-500">
                    {a.type} • {a.date}
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">
                    {a.status}
                  </span>
                </div>
              ))
            )}
          </Widget>

          <Widget title="Leave Balance" icon={<CalendarMinus />}>
            <div className="text-center">
              <p className="text-6xl font-black text-red-700">{leaveBalance}</p>
              <p className="text-xs text-gray-500 tracking-wide">
                DAYS REMAINING
              </p>
            </div>
          </Widget>
        </div>

        {/* ---------- CALENDAR ---------- */}
        <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-xl">

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-red-700">Attendance</h2>

            <p className="text-xl font-extrabold text-red-600">
              {calendarMonth.toLocaleString("default", { month: "long" })}{" "}
              {calendarMonth.getFullYear()}
            </p>

            <div className="flex gap-2">
              <NavBtn onClick={() =>
                setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
              }>
                <ChevronLeft />
              </NavBtn>

              <NavBtn onClick={() => setCalendarMonth(new Date())}>
                Today
              </NavBtn>

              <NavBtn onClick={() =>
                setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
              }>
                <ChevronRight />
              </NavBtn>
            </div>
          </div>

          <div className="grid grid-cols-7 text-xs font-semibold text-center gap-2 mb-3">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="rounded-xl py-2 bg-red-100 text-red-700">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {generateCalendar().map((day, i) => {
              const status = getDayStatus(day);
              return (
                <div
                  key={i}
                  onMouseEnter={() => day && setHoverDay(day)}
                  onMouseLeave={() => setHoverDay(null)}
                  className={`
                    relative h-12 flex items-center justify-center rounded-xl
                    font-semibold transition-all duration-150
                    ${!day && "bg-transparent"}
                    ${status === "present" && "bg-green-500 text-white"}
                    ${status === "absent" && "bg-red-500 text-white"}
                    ${status === "leave" && "bg-yellow-400 text-white"}
                    ${status === "holiday" && "bg-yellow-400 text-white"}
                    ${status === "weekend" && "bg-gray-400 text-white"}
                    ${status === "none" && "bg-gray-100 hover:bg-gray-200"}
                  `}
                >
                  {day}
                  {hoverDay === day && day && (
                    <div className="absolute -top-9 px-2 py-1 text-xs rounded-lg bg-black text-white">
                      {getDayTooltip(day)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};

/* ---------- UI HELPERS ---------- */

const Widget = ({ title, icon, children }) => (
  <div className="bg-white/80 backdrop-blur rounded-3xl p-5 shadow-lg space-y-3 hover:shadow-xl transition">
    <div className="flex items-center gap-2 font-bold text-sm">
      <span className="p-2 rounded-xl bg-gradient-to-br from-red-100 to-yellow-100 text-red-700">
        {icon}
      </span>
      {title}
    </div>
    {children}
  </div>
);

const Chip = ({ children, yellow }) => (
  <span
    className={`px-3 py-1 rounded-xl text-sm font-medium text-white
      ${yellow ? "bg-yellow-500" : "bg-red-600"}
    `}
  >
    {children}
  </span>
);

const Empty = ({ children }) => (
  <p className="text-sm text-gray-400">{children}</p>
);

const NavBtn = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1 rounded-xl bg-red-100 hover:bg-red-200 transition"
  >
    {children}
  </button>
);

export default EmployeeSummary;
