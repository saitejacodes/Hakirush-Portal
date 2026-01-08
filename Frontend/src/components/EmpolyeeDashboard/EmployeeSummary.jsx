import axios from "axios";
import {
  Users,
  CalendarDays,
  Star,
  Building2,
  ChevronLeft,
  ChevronRight
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

  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [hoverDay, setHoverDay] = useState(null);

  // 🔥 normalize date to YYYY-MM-DD
  const toYMD = (d) => {
    const date = new Date(d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // FETCH DATA
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

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

        const leaveData = d4?.data || {};
        setLeaveBalance(
          leaveData.balance ??
          (leaveData.total - leaveData.used) ??
          0
        );
      })
      .catch(console.error);
  }, [user]);

  // FETCH ATTENDANCE
  useEffect(() => {
    if (!user || !user._id) return;

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const month = calendarMonth.getMonth() + 1;
    const year = calendarMonth.getFullYear();

    axios
      .get(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance/user/${user._id}/monthly?month=${month}&year=${year}`,
        { headers }
      )
      .then(res => setAttendance(res.data.attendance || []))
      .catch(console.error);
  }, [user, calendarMonth]);

  // MONTH CONTROLS
  const goPrevMonth = () =>
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));

  const goNextMonth = () =>
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const goToday = () => setCalendarMonth(new Date());

  // CALENDAR GEN
  const generateCalendar = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const first = new Date(year, month, 1).getDay();
    const count = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < first; i++) days.push(null);
    for (let i = 1; i <= count; i++) days.push(i);

    return { days, month, year };
  };

  const calendar = generateCalendar();

  // TODAY CHECK
  const isToday = (day) => {
    if (!day) return false;
    const d = new Date(calendar.year, calendar.month, day);
    return toYMD(d) === toYMD(new Date());
  };

  // TOOLTIP
  const getDayTooltip = (day) => {
    if (!day) return "";

    const date = new Date(calendar.year, calendar.month, day);
    const str = toYMD(date);

    if (date.getDay() === 0) return "Week Off";

    const holiday = holidays.find(h => toYMD(h.date) === str);
    if (holiday) return holiday.title;

    const rec = attendance.find(a => a.date === str);
    if (!rec || !rec.status) return "No record";

    const status = rec.status.toString().trim().toLowerCase();

    if (status === "present") return "Present";
    if (status === "absent") return "Absent";
    if (status === "leave") return "Leave";
    if (status === "sick") return "Sick";

    return "No record";
  };

  // STATUS COLORS
  const getDayStatus = (day) => {
    if (!day) return null;

    const date = new Date(calendar.year, calendar.month, day);
    const str = toYMD(date);

    if (date.getDay() === 0) return "do";

    const isHoliday = holidays.some(h => toYMD(h.date) === str);
    if (isHoliday) return "holiday";

    const rec = attendance.find(a => a.date === str);
    if (!rec || !rec.status) return "none";

    const status = rec.status.toString().trim().toLowerCase();

    if (status === "present") return "present";
    if (status === "absent") return "absent";
    if (status === "leave") return "leave";
    if (status === "sick") return "sick";

    return "none";
  };

  if (loading || !user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-red-100 p-10">
      <div className="max-w-7xl mx-auto space-y-10">

        <h1 className="text-3xl font-extrabold text-red-800">
          Dashboard Overview
        </h1>

        {department && (
          <div className="rounded-3xl p-7 bg-white shadow-xl border">
            <div className="flex items-center gap-3 text-red-700">
              <Building2 />
              <span className="text-2xl font-bold">{department.dep_name}</span>
            </div>
            <p className="mt-2 text-gray-600">{department.description}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Widget title="Department Employees" icon={<Users className="text-red-600" />}>
            {deptEmployees.map(e => (
              <Chip key={e._id} color="red">{e?.userId?.name}</Chip>
            ))}
          </Widget>

          <Widget title="New Joinees" icon={<Star className="text-green-600" />}>
            {newEmployees.map(e => (
              <Chip key={e._id} color="green">{e?.userId?.name}</Chip>
            ))}
          </Widget>

          <Widget title="Upcoming Holidays" icon={<CalendarDays className="text-blue-600" />}>
            {holidays.map(h => (
              <Chip key={h._id} color="yellow">{h.title}</Chip>
            ))}
          </Widget>

          <Widget title="Leave Balance">
            <p className="text-6xl font-black text-red-700">{leaveBalance}</p>
          </Widget>
        </div>

        {/* ✅ FULL CALENDAR – UNBROKEN */}
        <div className="rounded-3xl p-8 bg-white shadow-2xl border relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-extrabold text-red-700">
              Attendance Calendar
            </h2>

            <div className="flex gap-2">
              <NavBtn onClick={goPrevMonth}><ChevronLeft /></NavBtn>
              <NavBtn onClick={goToday}>Today</NavBtn>
              <NavBtn onClick={goNextMonth}><ChevronRight /></NavBtn>
            </div>
          </div>

          {hoverDay && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-3 py-1 text-sm rounded-xl bg-black text-white shadow-lg z-20">
              {getDayTooltip(hoverDay)}
            </div>
          )}

          <p className="text-center font-semibold mb-2">
            {calendarMonth.toLocaleString("default", { month: "long" })}{" "}
            {calendarMonth.getFullYear()}
          </p>

          <div className="grid grid-cols-7 gap-2 text-center font-semibold mb-2">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="bg-red-100 py-2 rounded-xl">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendar.days.map((d, i) => {
              const s = getDayStatus(d);
              const todayActive = isToday(d);

              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoverDay(d)}
                  onMouseLeave={() => setHoverDay(null)}
                  className={`
                    h-12 flex items-center justify-center rounded-xl font-semibold cursor-pointer
                    ${!d ? "bg-transparent" : ""}
                    ${s === "present" ? "bg-green-500 text-white" : ""}
                    ${s === "absent" ? "bg-red-500 text-white" : ""}
                    ${s === "leave" ? "bg-yellow-400 text-white" : ""}
                    ${s === "sick" ? "bg-blue-500 text-white" : ""}
                    ${s === "holiday" ? "bg-yellow-400 text-white" : ""}
                    ${s === "do" ? "bg-gray-600 text-white" : ""}
                    ${s === "none" ? "bg-gray-200" : ""}
                    ${todayActive ? "border-2 border-red-600" : ""}
                  `}
                >
                  {d || ""}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ----------- UI COMPONENTS ----------- */

const Widget = ({ title, icon, children }) => (
  <div className="rounded-3xl p-6 bg-white shadow-xl border">
    <h3 className="font-semibold flex items-center gap-2 mb-4 text-gray-800">
      {icon} {title}
    </h3>
    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">{children}</div>
  </div>
);

const Chip = ({ children, color }) => {
  const colors = {
    red: "bg-red-600",
    green: "bg-green-600",
    yellow: "bg-yellow-500"
  };
  return (
    <span className={`px-3 py-1 rounded-xl text-white text-sm shadow ${colors[color]}`}>
      {children}
    </span>
  );
};

const NavBtn = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 shadow"
  >
    {children}
  </button>
);

export default EmployeeSummary;