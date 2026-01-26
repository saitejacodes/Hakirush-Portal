import axios from "axios";
import {
  Users,
  CalendarDays,
  Building2,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
  CalendarMinus
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";

const EmployeeSummary = () => {
  const { user, loading } = useAuth();

  const [department, setDepartment] = useState(null);
  const [deptEmployees, setDeptEmployees] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [attendance, setAttendance] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [hoverDay, setHoverDay] = useState(null);

  /* ---------- DATE FORMAT ---------- */
  const toYMD = (d) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  /* ---------- FETCH DASHBOARD DATA ---------- */
  useEffect(() => {
    if (!user) return;

    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

    Promise.all([
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employee/by-department/me`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/upcoming`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employee/leave/balance/me`, { headers })
    ])
      .then(([d1, d2, d3]) => {
        setDeptEmployees(d1?.data?.employees || []);
        setDepartment(d1?.data?.department || null);
        setHolidays(d2?.data?.holidays || []);

        const leave = d3?.data || {};
        setLeaveBalance(leave.balance ?? (leave.total - leave.used) ?? 0);
      })
      .catch(console.error);
  }, [user]);

  /* ---------- ANNOUNCEMENTS ---------- */
  useEffect(() => {
    if (!user) return;

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/announcements`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then(res => setAnnouncements(res?.data?.announcements || []))
      .catch(console.error);
  }, [user]);

  /* ---------- ATTENDANCE ---------- */
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

  /* ---------- CALENDAR HELPERS ---------- */
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

    if (date.getDay() === 0) return "Weekend (Sunday)";
    const holiday = holidays.find(h => toYMD(h.date) === str);
    if (holiday) return holiday.title;

    const rec = attendance.find(a => a.date === str);
    if (!rec || !rec.status) return "No record";

    return rec.status;
  };

  if (loading || !user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-red-100 px-4 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto space-y-8">

        <h1 className="text-2xl sm:text-3xl font-extrabold text-red-800">
          Dashboard Overview
        </h1>

        {/* ---------- WIDGETS ---------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

          <Widget title="Department Employees" icon={<Users />}>
            {deptEmployees.map(e => (
              <Chip key={e._id} color="red">{e?.userId?.name}</Chip>
            ))}
          </Widget>

          <Widget title="Upcoming Holidays" icon={<CalendarDays />}>
            {holidays.map(h => (
              <Chip key={h._id} color="yellow">{h.title}</Chip>
            ))}
          </Widget>

          <Widget title="Announcements" icon={<PartyPopper />}>
            {announcements.length === 0 ? (
              <p className="text-sm text-gray-500">No announcements</p>
            ) : announcements.map(a => (
              <div key={a._id} className="bg-pink-50 p-3 rounded-2xl border">
                <p className="font-bold text-sm text-red-700">{a.title}</p>
                <p className="text-xs text-yellow-600">{a.type} • {a.date}</p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs bg-gray-200">
                  {a.status}
                </span>
              </div>
            ))}
          </Widget>

          <Widget title="Leave Balance" icon={<CalendarMinus />}>
            <div>
              <p className="text-4xl font-black text-red-700">{leaveBalance}</p>
              <p className="text-xs text-gray-500">Days Remaining</p>
            </div>
          </Widget>

        </div>

        {/* ---------- CALENDAR ---------- */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <div className="flex flex-col gap-3 sm:grid sm:grid-cols-3 sm:items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-red-700">
              Attendance Calendar
            </h2>

            <p className="text-left sm:text-center text-lg font-bold text-red-600">
              {calendarMonth.toLocaleString("default", { month: "long" })} {calendarMonth.getFullYear()}
            </p>

            <div className="flex sm:justify-end gap-2">
              <NavBtn onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
                <ChevronLeft />
              </NavBtn>

              <NavBtn onClick={() => setCalendarMonth(new Date())}>Today</NavBtn>

              <NavBtn onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
                <ChevronRight />
              </NavBtn>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold mb-2">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="bg-red-100 py-2 rounded-xl">{d}</div>
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
                  className={`relative h-9 sm:h-12 flex items-center justify-center rounded-xl
                    font-semibold cursor-pointer text-xs sm:text-base
                    ${!day && "bg-transparent cursor-default"}
                    ${status === "present" && "bg-green-500 text-white"}
                    ${status === "absent" && "bg-red-500 text-white"}
                    ${status === "leave" && "bg-yellow-400 text-white"}
                    ${status === "holiday" && "bg-yellow-400 text-white"}
                    ${status === "weekend" && "bg-gray-400 text-white"}
                    ${status === "none" && "bg-gray-200"}
                  `}
                >
                  {day || ""}
                  {hoverDay === day && day && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded-lg bg-black text-white">
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

/* ---------- UI COMPONENTS ---------- */

const Widget = ({ title, icon, children }) => (
  <div className="bg-white rounded-3xl p-5 shadow-lg flex flex-col">
    <h3 className="flex items-center gap-2 font-bold mb-4 text-sm">
      <span className="p-2 bg-red-100 rounded-xl">{icon}</span>
      {title}
    </h3>
    <div className="flex flex-col gap-2 overflow-y-auto max-h-40 pr-1">
      {children}
    </div>
  </div>
);

const Chip = ({ children, color }) => {
  const c = {
    red: "bg-red-600",
    yellow: "bg-yellow-500"
  };
  return (
    <span className={`px-3 py-1 rounded-xl text-white text-sm font-medium ${c[color]}`}>
      {children}
    </span>
  );
};

const NavBtn = ({ children, onClick }) => (
  <button onClick={onClick} className="px-3 py-1 bg-red-100 rounded-xl font-semibold">
    {children}
  </button>
);

export default EmployeeSummary;