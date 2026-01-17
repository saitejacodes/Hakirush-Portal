import axios from "axios";
import {
  Users,
  CalendarDays,
  Star,
  Building2,
  ChevronLeft,
  ChevronRight,
  PartyPopper
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";

const EmployeeSummary = () => {
  const { user, loading } = useAuth();

  const [department, setDepartment] = useState(null);
  const [deptEmployees, setDeptEmployees] = useState([]);
  const [newEmployees, setNewEmployees] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [attendance, setAttendance] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [hoverDay, setHoverDay] = useState(null);

  /* ---------- DATE NORMALIZER ---------- */
  const toYMD = (d) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  };

  /* ---------- FETCH DASHBOARD DATA ---------- */
  useEffect(() => {
    if (!user) return;

    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

    Promise.all([
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employee/by-department/me`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employee/new/recent`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/upcoming`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employee/leave/balance/me`, { headers })
    ])
      .then(([d1, d2, d3, d4]) => {
        setDeptEmployees(d1?.data?.employees || []);
        setNewEmployees(d2?.data?.employees || []);
        setHolidays(d3?.data?.holidays || []);
        setDepartment(d1?.data?.department || null);

        const leave = d4?.data || {};
        setLeaveBalance(leave.balance ?? (leave.total - leave.used) ?? 0);
      })
      .catch(console.error);
  }, [user]);

  /* ---------- FETCH ANNOUNCEMENTS ---------- */
  useEffect(() => {
    if (!user) return;

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/announcements`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then(res => setAnnouncements(res?.data?.announcements || []))
      .catch(console.error);
  }, [user]);

  /* ---------- FETCH ATTENDANCE ---------- */
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

  /* ---------- CALENDAR ---------- */
  const generateCalendar = () => {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    const first = new Date(y, m, 1).getDay();
    const count = new Date(y, m + 1, 0).getDate();
    return [
      ...Array(first).fill(null),
      ...Array.from({ length: count }, (_, i) => i + 1)
    ];
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

    const date = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      day
    );
    const str = toYMD(date);

    if (date.getDay() === 0) return "Weekend (Sunday)";

    const holiday = holidays.find(h => toYMD(h.date) === str);
    if (holiday) return holiday.title;

    const rec = attendance.find(a => a.date === str);
    if (!rec || !rec.status) return "No record";

    const status = rec.status.toLowerCase();
    if (status === "present") return "Present";
    if (status === "absent") return "Absent";
    if (status === "leave") return "Leave";
    if (status === "sick") return "Sick";

    return "No record";
  };

  if (loading || !user) return <p>Loading...</p>;

    const isWithin30Days = (date) => {
    if (!date) return false;

    const joinDate = new Date(date);
    const today = new Date();

    const diffTime = today - joinDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays <= 30;
  };

  return (
    <div className="min-h-screen bg-red-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        <h1 className="text-3xl font-extrabold text-red-800">Dashboard Overview</h1>

        {department && (
          <div className="bg-white rounded-3xl p-6 shadow">
            <div className="flex gap-2 items-center text-red-700">
              <Building2 />
              <h2 className="text-2xl font-bold">{department.dep_name}</h2>
            </div>
            <p className="text-gray-600 mt-1">{department.description}</p>
          </div>
        )}

        {/* -------- WIDGETS -------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">

          <Widget title="Department Employees" icon={<Users />}>
            {deptEmployees.map(e => <Chip key={e._id} color="red">{e?.userId?.name}</Chip>)}
          </Widget>

          <Widget title="New Joinees" icon={<Star />}>
            {newEmployees
              .filter(e =>
                isWithin30Days(e.joiningDate || e.createdAt)
              )
              .map(e => (
                <Chip key={e._id} color="green">
                  {e?.userId?.name}
                </Chip>
              ))
            }
          </Widget>

          <Widget title="Upcoming Holidays" icon={<CalendarDays />}>
            {holidays.map(h => <Chip key={h._id} color="yellow">{h.title}</Chip>)}
          </Widget>

          <Widget title="Announcements" icon={<PartyPopper />}>
            {announcements.length === 0
              ? <p className="text-sm text-gray-500">No announcements</p>
              : announcements.map(a => (
                  <div key={a._id} className="bg-pink-50 p-2 rounded-xl border">
                    <p className="font-semibold text-red-700">{a.title}</p>
                    <p className="text-xs text-yellow-600">{a.type} • {a.date}</p>
                    <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold
                      ${a.status === "Upcoming" && "bg-blue-100 text-blue-700"}
                      ${a.status === "Ongoing" && "bg-green-100 text-green-700"}
                      ${a.status === "Completed" && "bg-gray-200 text-gray-700"}
                    `}
                  >
                    {a.status}
                  </span>
                  </div>
                ))
            }
          </Widget>

          <Widget title="Leave Balance">
            <p className="text-5xl font-black text-red-700">{leaveBalance}</p>
          </Widget>

        </div>

        {/* -------- CALENDAR -------- */}
        <div className="rounded-3xl p-4 sm:p-8 bg-white shadow-2xl border relative overflow-visible">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
            <h2 className="text-xl sm:text-3xl font-extrabold text-red-700">
              Attendance Calendar
            </h2>

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

          {/* HOVER TOOLTIP */}
          {hoverDay && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-3 py-1 text-xs sm:text-sm rounded-xl bg-black text-white shadow-lg z-20">
              {getDayTooltip(hoverDay)}
            </div>
          )}

          {/* MONTH TITLE */}
          <p className="text-center font-semibold mb-3">
            {calendarMonth.toLocaleString("default", { month: "long" })}{" "}
            {calendarMonth.getFullYear()}
          </p>

          {/* WEEKDAY HEADERS */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center font-semibold text-xs sm:text-sm mb-2">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => (
              <div
                key={day}
                className="bg-red-100 py-2 rounded-xl"
              >
                {day}
              </div>
            ))}
          </div>

          {/* DAYS GRID */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {generateCalendar().map((day, index) => {
              const status = getDayStatus(day);

              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoverDay(day)}
                  onMouseLeave={() => setHoverDay(null)}
                  className={`
                    h-10 sm:h-12 w-full flex items-center justify-center rounded-xl
                    font-semibold cursor-pointer text-xs sm:text-base
                    ${!day ? "bg-transparent" : ""}
                    ${status === "present" ? "bg-green-500 text-white" : ""}
                    ${status === "absent" ? "bg-red-500 text-white" : ""}
                    ${status === "leave" ? "bg-yellow-400 text-white" : ""}
                    ${status === "sick" ? "bg-blue-500 text-white" : ""}
                    ${status === "holiday" ? "bg-yellow-400 text-white" : ""}
                    ${status === "weekend" ? "bg-gray-400 text-white" : ""}
                    ${status === "none" ? "bg-gray-200" : ""}
                  `}
                >
                  {day || ""}
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
  <div className="bg-white rounded-3xl p-4 shadow">
    <h3 className="flex gap-2 items-center font-semibold mb-3">
      {icon} {title}
    </h3>
    <div className="flex flex-col gap-2">{children}</div>
  </div>
);

const Chip = ({ children, color }) => {
  const c = {
    red: "bg-red-600",
    green: "bg-green-600",
    yellow: "bg-yellow-500"
  };
  return <span className={`px-3 py-1 rounded-xl text-white text-sm ${c[color]}`}>{children}</span>;
};

const NavBtn = ({ children, onClick }) => (
  <button onClick={onClick} className="px-3 py-1 bg-red-100 rounded-xl">
    {children}
  </button>
);

export default EmployeeSummary;