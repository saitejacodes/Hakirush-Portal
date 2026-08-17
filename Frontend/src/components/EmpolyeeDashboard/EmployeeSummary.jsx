import axios from "axios";
import {
  CalendarDays, ChevronLeft, ChevronRight,
  X, Bell, Activity, ArrowRight, Umbrella,
  Megaphone, Cake, Award, Clock, Send, CheckCircle2, XCircle, Clock3,
  Users, UserPlus
} from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/authContext";
import EmployeePunch from "../attendance/EmployeePunch";

const NOTICE_TYPES = ["leave-status", "attendance-request-status"];

/* ================= DESIGN TOKENS ================= */
/* Same palette as the Admin dashboard, so the employee side of the
   product reads as the same identity instead of a different app. */
const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#C6A15B";
const HAIRLINE = "#E7DFD2";
const CREAM = "#FBF8F3";
const SAGE = "#3F5B54";
const SLATE = "#4A5A6B";

const displayFont = { fontFamily: "'Playfair Display', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

const GRAIN_URI =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='140'%20height='140'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23n)'%20opacity='0.5'/%3E%3C/svg%3E";

const CornerTicks = ({ color = GOLD }) => (
  <>
    <span className="pointer-events-none absolute top-4 left-4 h-2.5 w-2.5 border-t border-l opacity-70" style={{ borderColor: color }} />
    <span className="pointer-events-none absolute top-4 right-4 h-2.5 w-2.5 border-t border-r opacity-70" style={{ borderColor: color }} />
  </>
);

const EmployeeSummary = () => {
  const { user, loading } = useAuth();
  const [deptEmployees, setDeptEmployees] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]); 
  const [leaveBalance, setLeaveBalance] = useState({ casual: 0, sick: 0 });
  const [showLeaveBreakdown, setShowLeaveBreakdown] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);
  const [showBellMenu, setShowBellMenu] = useState(false);
  const [birthdays, setBirthdays] = useState({ today: [], upcoming: [] });
  const [anniversaries, setAnniversaries] = useState({ today: [], upcoming: [] });
  const [notifications, setNotifications] = useState([]);
  const [newEmployees, setNewEmployees] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null); 
  const [myRequests, setMyRequests] = useState([]);
  const [requestForm, setRequestForm] = useState({ requestedStatus: "Present", reason: "" });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const TOTAL_ANNUAL_CASUAL = 12; 
  const TOTAL_ANNUAL_SICK = 12;   
  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
    const cleanPath = imagePath.replace(/^\//, "");
    return `${baseUrl}/${cleanPath}`;
  };

  const toYMD = (d) => {
    if (!d) return "";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Ongoing": return "bg-[#C6A15B]/10 text-[#8A6A2E] border-[#C6A15B]/30";
      case "Completed": return "bg-[#3F5B54]/10 text-[#3F5B54] border-[#3F5B54]/25";
      default: return "bg-[#4A5A6B]/10 text-[#4A5A6B] border-[#4A5A6B]/25";
    }
  };

  // Returns a human-readable "joined X days ago" string for the New Employees card
  const getDaysAgo = (date) => {
    if (!date) return "Joined recently";
    const joined = new Date(date);
    if (isNaN(joined.getTime())) return "Joined recently";

    const today = new Date();
    // Normalize both to midnight so partial-day differences don't cause off-by-one results
    const joinedMid = new Date(joined.getFullYear(), joined.getMonth(), joined.getDate());
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const diffMs = todayMid - joinedMid;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (days <= 0) return "Joined today";
    if (days === 1) return "Joined 1 day ago";
    if (days < 30) return `Joined ${days} days ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return months === 1 ? "Joined 1 month ago" : `Joined ${months} months ago`;

    const years = Math.floor(months / 12);
    return years === 1 ? "Joined 1 year ago" : `Joined ${years} years ago`;
  };

  const hasUnseenNotices = announcements.some((a) => {
    const seenByArray = a.seenBy || [];
    return !seenByArray.map(id => id.toString()).includes(user?._id?.toString());
  }) || notifications.some(n => !n.seen);

  // Fetch leave-status + attendance-request-status notifications for employee
  useEffect(() => {
    if (!user?._id) return;
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.success) setNotifications(res.data.notifications.filter(n => NOTICE_TYPES.includes(n.type)));
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch my attendance correction requests
  useEffect(() => {
    if (!user?._id) return;
    const token = localStorage.getItem("token");
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance-request/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => { if (res.data?.success) setMyRequests(res.data.requests); })
      .catch(() => {});
  }, [user, calendarMonth]);

  const markAsSeenOnServer = async (announcementId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/announcements/${announcementId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnnouncements(prev => 
        prev.map(a => 
          a._id === announcementId 
            ? { ...a, seenBy: [...(a.seenBy || []), user._id.toString()] } 
            : a
        )
      );
    } catch (error) { 
      console.error(error); 
    }
  };

  const getDayInfo = (day) => {
    if (!day) return { status: "none", title: "" };
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    const dateStr = toYMD(date);

    const holidayRec = holidays.find(h => toYMD(h.date) === dateStr);
    if (holidayRec) return { status: "holiday", title: holidayRec.title };

    if (date.getDay() === 0 || date.getDay() === 6) {
        return { status: "weekend", title: date.getDay() === 0 ? "Sunday" : "Saturday" };
    }

    const activeLeave = leaves.find(l => {
      if (l.status !== "Approved") return false;
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
      return date >= start && date <= end;
    });

    if (activeLeave) return { status: "leave", title: activeLeave.leaveType };

    const attRec = attendance.find(a => toYMD(a.date) === dateStr);
    if (attRec) {
      const s = (attRec.status || "").toLowerCase().replace(/\s+/g, "");
      const workedHours = Number(attRec.workedHours || 0);
      const todayStr = toYMD(new Date());
      const isPastDay = dateStr < todayStr;

      if (attRec.checkOut) {
        if (s === "present" || workedHours >= 8) {
          return { status: "present", title: "Present" };
        }
        if (s === "halfday" || (workedHours >= 4 && workedHours < 8)) {
          return { status: "halfday", title: "Half Day" };
        }
        return { status: "absent", title: "Absent" };
      }

      if (attRec.checkIn && !attRec.checkOut) {
        if (isPastDay || s === "absent") {
          return { status: "absent", title: "Absent" };
        }
        return { status: "working", title: "Working" };
      }

      if (["present", "halfday", "absent"].includes(s)) {
        return { status: s, title: attRec.status };
      }
    }
    return { status: "none", title: "Working Day" };
  };

  const generateCalendar = () => {
    const y = calendarMonth.getFullYear(); 
    const m = calendarMonth.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    return [
      ...Array(firstDay).fill(null), 
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
    ];
  };

  const formatBday = (dateString) => {
    if(!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short' 
    }).toUpperCase();
  };


  // Helper: Get years since joining
  const getYearsJoined = (date) => {
    if (!date) return "1st";
    const diff = new Date().getFullYear() - new Date(date).getFullYear();
    return diff > 0 ? diff : "1st";
  };

  /* ================= DATA FETCHING ================= */
  const fetchData = useCallback(() => {
    if (!user?._id) return;
    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

    Promise.all([
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employee/by-department/me`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/all`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/announcements/public`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/leave/${user._id}/employee`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employee/birthdays`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/user/${user._id}/monthly?month=${calendarMonth.getMonth() + 1}&year=${calendarMonth.getFullYear()}`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employee/anniversaries`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employee/new/recent`, { headers })  
    ])
    .then(([d1, d2, d3, d4, d5, d6, d7, d8]) => { 
      const employeeData = d1?.data?.employees || [];
      const holidayData = d2?.data?.holidays || [];
      const announcementData = d3?.data?.announcements || [];
      const allLeaves = d4?.data?.leaves || [];
      const birthdayData = d5?.data || { today: [], upcoming: [] };
      const attendanceData = d6?.data?.attendance || [];
      const anniversaryData = d7?.data || { today: [], upcoming: [] }; 
      const newEmployeeData = d8?.data?.employees || [];

      setDeptEmployees(employeeData);
      setHolidays(holidayData);
      setAnnouncements(announcementData);
      setLeaves(allLeaves);
      setBirthdays(birthdayData);
      setAttendance(attendanceData);
      setAnniversaries(anniversaryData);
      setNewEmployees(newEmployeeData);

      const getUsedDays = (lt) => {
        const hols = holidayData.map(h => toYMD(h.date));
        return allLeaves.filter(l => l.status === "Approved" && l.leaveType === lt)
          .reduce((total, l) => {
            let count = 0, curr = new Date(l.startDate), last = new Date(l.endDate);
            curr.setHours(0,0,0,0); last.setHours(0,0,0,0);
            while (curr <= last) {
              const dayOfWeek = curr.getDay();
              if (dayOfWeek !== 0 && dayOfWeek !== 6 && !hols.includes(toYMD(curr))) {
                count++;
              }
              curr.setDate(curr.getDate() + 1);
            }
            return total + count;
          }, 0);
      };

      setLeaveBalance({ 
        casual: Math.max(0, TOTAL_ANNUAL_CASUAL - getUsedDays("Casual Leave")), 
        sick: Math.max(0, TOTAL_ANNUAL_SICK - getUsedDays("Sick Leave")) 
      });
    }).catch(console.error);
  }, [user, calendarMonth, deptEmployees]);

  useEffect(() => {
    fetchData();
  }, [calendarMonth, fetchData]);

  const handleAttendanceSuccess = () => {
    fetchData();
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.seen) {
      try {
        const token = localStorage.getItem("token");
        await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/${notification._id}/seen`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(prev => prev.map(item => item._id === notification._id ? { ...item, seen: true } : item));
      } catch (err) {
        console.error(err);
      }
    }

    setShowBellMenu(false);

    if (notification.type === "leave-status") {
      if (user?._id) {
        window.location.href = `/employee-dashboard/leaves/${user._id}`;
      }
      return;
    }

    if (notification.type === "attendance-request-status") {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      setCalendarMonth(monthStart);
      const dateStr = toYMD(today);
      const record = attendance.find((entry) => toYMD(entry.date) === dateStr) || null;
      setSelectedDay({
        day: today.getDate(),
        dateStr,
        status: (record?.status || "Absent").toLowerCase().replace(/\s+/g, ""),
        title: record?.status || "Attendance detail",
        record,
      });
      setRequestForm({ requestedStatus: "Present", reason: "" });
      document.getElementById("attendance-calendar-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Open the zoom modal for a clicked calendar day
  const handleDayClick = (day) => {
    if (!day) return;
    const { status, title } = getDayInfo(day);
    const dateStr = toYMD(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
    const record = attendance.find(a => toYMD(a.date) === dateStr) || null;
    setSelectedDay({ day, dateStr, status, title, record });
    setRequestForm({ requestedStatus: "Present", reason: "" });
  };

  // Submit an attendance correction request for the selected day
  const handleRequestSubmit = async () => {
    if (!selectedDay || !requestForm.reason.trim()) return;
    setSubmittingRequest(true);
    try {
      const token = localStorage.getItem("token");
      const currentStatusLabel = selectedDay.record?.status || (selectedDay.status === "halfday" ? "Half Day" : "Absent");
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance-request`,
        {
          date: selectedDay.dateStr,
          currentStatus: currentStatusLabel,
          requestedStatus: requestForm.requestedStatus,
          reason: requestForm.reason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setMyRequests(prev => [res.data.request, ...prev]);
        setRequestForm({ requestedStatus: "Present", reason: "" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Small reusable section label used across premium cards
  const SectionLabel = ({ icon, tone, children, live }) => (
    <div className="flex items-center justify-between mb-5 px-1">
      <div className="flex items-center gap-2.5 text-[10.5px] font-semibold uppercase text-[#8A8378] tracking-[0.2em]">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border" style={{ borderColor: `${tone}40`, color: tone }}>{icon}</div>
        {children}
      </div>
      {live && <span className="flex h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: live }} />}
    </div>
  );

  if (loading || !user) return (
    <div className="h-screen flex items-center justify-center text-[#8A8378] uppercase tracking-[0.3em] text-sm font-semibold" style={bodyFont}>
      Loading your workspace…
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#FBF8F3] via-white to-[#F3EDE0] text-[#1C1A17] pb-16" style={bodyFont}>
      {/* soft ambient glow + grain, matching the admin dashboard's texture */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[420px] opacity-70"
        style={{
          background:
            "radial-gradient(60% 60% at 15% 0%, rgba(198,161,91,0.10), transparent 70%), radial-gradient(50% 50% at 100% 0%, rgba(122,34,51,0.06), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] mix-blend-multiply"
        style={{ backgroundImage: `url("${GRAIN_URI}")` }}
      />
      <div className="relative z-10 h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${GARNET}, ${GOLD} 45%, ${GARNET})` }} />

      <div className="relative z-10 max-w-[1240px] mx-auto p-5 sm:p-10 space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-end pt-4 relative">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-px w-6" style={{ backgroundColor: GOLD }} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.4em]" style={{ color: GOLD }}>Overview</span>
            </div>
            <h1 className="text-3xl sm:text-[2.6rem] tracking-tight leading-none" style={{ ...displayFont, fontWeight: 700 }}>
              Good to see you<span className="italic" style={{ color: GARNET }}>.</span>
            </h1>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowBellMenu(!showBellMenu)}
              className="relative rounded-2xl border border-[#E7DFD2] bg-white/80 p-3.5 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_8px_20px_-10px_rgba(28,26,23,0.12)] backdrop-blur-md transition-all duration-300 hover:border-[#D9C79A] cursor-pointer"
              style={showBellMenu ? { backgroundColor: GARNET, borderColor: GARNET } : {}}
            >
              <Bell size={18} strokeWidth={1.75} className={showBellMenu ? "text-white" : "text-[#8A8378]"} />
              {hasUnseenNotices && (
                <span className="absolute top-2.5 right-3 h-2 w-2 rounded-full ring-2 ring-white" style={{ backgroundColor: GARNET }} />
              )}
            </button>
            {showBellMenu && (
              <div className="absolute right-0 mt-4 w-[320px] sm:w-[400px] bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_2px_8px_rgba(28,26,23,0.06),0_30px_60px_-15px_rgba(28,26,23,0.22)] border border-[#E7DFD2] z-[100] overflow-hidden">
                <div className="p-6 bg-[#FBF8F3]/70 border-b" style={{ borderColor: HAIRLINE }}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A8378]">Notices &amp; Leave Updates</span>
                    <X size={15} className="cursor-pointer text-[#B4ADA0] hover:text-[#7A2233] transition-colors" onClick={()=>setShowBellMenu(false)}/>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-3 rounded-xl border text-center" style={{ borderColor: HAIRLINE }}>
                      <div className="text-sm font-semibold" style={{ color: GOLD }}>
                        {announcements.filter(a => a.status?.toLowerCase() === "ongoing").length}
                      </div>
                      <div className="text-[9px] font-semibold uppercase text-[#B4ADA0] tracking-wide">Ongoing</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border text-center" style={{ borderColor: HAIRLINE }}>
                      <div className="text-sm font-semibold" style={{ color: SAGE }}>
                        {announcements.filter(a => a.status?.toLowerCase() === "completed" || a.status?.toLowerCase() === "done").length}
                      </div>
                      <div className="text-[9px] font-semibold uppercase text-[#B4ADA0] tracking-wide">Done</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border text-center" style={{ borderColor: HAIRLINE }}>
                      <div className="text-sm font-semibold" style={{ color: SLATE }}>
                        {announcements.filter(a => a.status?.toLowerCase() === "coming").length}
                      </div>
                      <div className="text-[9px] font-semibold uppercase text-[#B4ADA0] tracking-wide">Coming</div>
                    </div>
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
                  {/* Announcements */}
                  {announcements.map(a => {
                    const isRead = a.seenBy?.map(id => id.toString()).includes(user?._id?.toString());
                    return (
                      <div key={a._id} onClick={() => { setActiveAnnouncement(a); setShowBellMenu(false); if(!isRead) markAsSeenOnServer(a._id); }} 
                        className={`p-4 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${isRead ? 'opacity-40 border-transparent' : 'shadow-sm hover:bg-[#FBF8F3]'}`}
                        style={!isRead ? { backgroundColor: "#FBF8F3", borderColor: `${GARNET}25` } : {}}>
                        <div className="flex flex-col">
                          <h4 className="text-[12px] font-semibold text-[#1C1A17]">{a.title}</h4>
                          <span className="text-[10px] font-medium text-[#B4ADA0] uppercase tracking-wide">{a.type}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase border ${getStatusBadge(a.status)}`}>
                          {a.status}
                        </span>
                      </div>
                    )
                  })}
                  {/* Leave / Attendance Status Notifications */}
                  {notifications.length > 0 && <div className="mt-2 mb-1 text-[10px] font-semibold uppercase text-[#B4ADA0] tracking-wide">Leave &amp; Attendance Updates</div>}
                  {notifications.map(n => (
                    <div
                      key={n._id}
                      className={`p-4 rounded-2xl border flex flex-col gap-1 cursor-pointer transition-all ${n.seen ? 'opacity-50' : 'shadow-sm'}`}
                      style={!n.seen ? { backgroundColor: `${GOLD}12`, borderColor: `${GOLD}45` } : { borderColor: HAIRLINE }}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <span className="text-[12px] font-medium" style={{ color: "#8A6A2E" }}>{n.message}</span>
                      <span className="text-[10px] font-medium text-[#B4ADA0]">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                  {announcements.length === 0 && notifications.length === 0 && (
                    <div className="p-6 text-center text-[#B4ADA0] text-xs">No notices or leave updates</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <EmployeePunch onSuccess={handleAttendanceSuccess} />

        {/* Stats Grid */}
        <section className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 1. Team Pulse */}
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_1px_2px_rgba(28,26,23,0.04),0_20px_40px_-18px_rgba(28,26,23,0.14)] h-[280px] flex flex-col border border-[#E7DFD2]">
              <SectionLabel icon={<Activity size={13} />} tone={GARNET} live={GARNET}>
                Team Pulse
              </SectionLabel>
              <div className="flex flex-col gap-2.5 overflow-y-auto flex-grow pr-2 custom-scrollbar">
                {deptEmployees.map((e) => (
                  <div 
                    key={e._id} 
                    className="flex items-center gap-3.5 p-2 rounded-2xl border border-transparent transition-all group"
                    style={{}}
                    onMouseEnter={(ev)=>{ev.currentTarget.style.borderColor=`${GARNET}25`; ev.currentTarget.style.backgroundColor=`${GARNET}08`;}}
                    onMouseLeave={(ev)=>{ev.currentTarget.style.borderColor="transparent"; ev.currentTarget.style.backgroundColor="transparent";}}
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border shadow-sm flex items-center justify-center bg-[#FBF8F3] relative" style={{ borderColor: HAIRLINE }}>
                      <img 
                        src={getImageUrl(e.userId?.profileImage || e.profileImage)} 
                        className="w-full h-full object-cover" 
                        alt="" 
                        onError={(e) => {e.target.style.display = 'none'}} 
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-[#B4ADA0] -z-10 uppercase">
                        {(e.userId?.name || e.name).charAt(0)}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12.5px] font-medium text-[#1C1A17] truncate">
                        {e.userId?.name || e.name || "Unknown"}
                      </span>
                      <span className="text-[10px] font-medium text-[#B4ADA0] tracking-wide">
                        {typeof e.employeeId === 'object' ? e.userId?.employeeId : e.employeeId}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* New Employees */}
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_1px_2px_rgba(28,26,23,0.04),0_20px_40px_-18px_rgba(28,26,23,0.14)] h-[280px] flex flex-col border border-[#E7DFD2]">
              <SectionLabel icon={<UserPlus size={13} />} tone={SAGE}>
                Joined Recently
              </SectionLabel>
              <div className="flex-grow overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
                {newEmployees.length > 0 ? newEmployees.map(e => (
                  <div key={e._id} className="flex items-center gap-3 p-2.5 rounded-2xl border" style={{ backgroundColor: `${SAGE}08`, borderColor: `${SAGE}30` }}>
                    <img src={getImageUrl(e.profileImage)} className="w-9 h-9 rounded-full object-cover border border-white shadow-sm" alt="" />
                    <div className="flex flex-col">
                      <span className="text-[12.5px] font-medium truncate" style={{ color: "#2A3F3A" }}>{e.name}</span>
                      <span className="text-[10px] font-medium" style={{ color: SAGE }}>
                        {e.dateOfJoining ? (
                          getDaysAgo(e.dateOfJoining)
                        ) : typeof e.joinedDaysAgo === 'number' ? (
                          e.joinedDaysAgo <= 0 ? 'Joined today' : (e.joinedDaysAgo === 1 ? 'Joined 1 day ago' : `Joined ${e.joinedDaysAgo} days ago`)
                        ) : (
                          getDaysAgo(e.joiningDate)
                        )}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-[#D9D2C4]">
                    <Users size={30} strokeWidth={1.5} />
                    <span className="text-[11px] font-medium uppercase tracking-wide">No new joinees</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Birthdays */}
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_1px_2px_rgba(28,26,23,0.04),0_20px_40px_-18px_rgba(28,26,23,0.14)] h-[280px] flex flex-col border border-[#E7DFD2]">
              <SectionLabel icon={<Cake size={13} />} tone={GARNET} live={birthdays.today?.length ? GARNET : null}>
                Birthdays
              </SectionLabel>
              <div className="flex flex-col gap-2 overflow-y-auto flex-grow pr-2 custom-scrollbar">
                {birthdays.today?.map(emp => (
                  <div key={emp._id} className="relative overflow-hidden flex items-center gap-3.5 p-2.5 rounded-2xl shadow-[0_12px_24px_-8px_rgba(122,34,51,0.4)]" style={{ background: `linear-gradient(135deg, ${GARNET}, #9C3A4E)` }}>
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-white/40 relative z-10">
                      <img src={getImageUrl(emp.userId?.profileImage || emp.profileImage)} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex flex-col relative z-10">
                      <span className="text-[12.5px] font-semibold text-white truncate leading-tight">{emp.userId?.name || emp.name}</span>
                      <span className="text-[10px] font-medium text-white/70 mt-0.5">Happy birthday, today 🎉</span>
                    </div>
                  </div>
                ))}
                {birthdays.upcoming?.map(emp => {
                  let daysLeft = null;
                  if (emp.dob) {
                    const today = new Date();
                    const dob = new Date(emp.dob);
                    let nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
                    if (nextBirthday < today) {
                      nextBirthday.setFullYear(today.getFullYear() + 1);
                    }
                    daysLeft = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
                  }
                  return (
                    <div key={emp._id} className="flex items-center gap-3.5 p-2 rounded-2xl border border-[#E7DFD2]/0 hover:border-[#E7DFD2] hover:bg-[#FBF8F3]/60 transition-all group">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border grayscale-[0.4] group-hover:grayscale-0 transition-all" style={{ borderColor: HAIRLINE }}>
                        <img src={getImageUrl(emp.userId?.profileImage || emp.profileImage)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" alt="" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12.5px] font-medium text-[#1C1A17] truncate leading-tight">{emp.userId?.name || emp.name}</span>
                        <span className="text-[10px] font-medium mt-0.5" style={{ color: GARNET }}>
                          {formatBday(emp.dob)}
                          {daysLeft !== null && (
                            <span className="ml-1.5 text-[#B4ADA0]">· {daysLeft === 1 ? 'in 1 day' : `in ${daysLeft} days`}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {!birthdays.today?.length && !birthdays.upcoming?.length && (
                  <div className="flex-grow flex items-center justify-center text-[12px] font-medium text-[#D9D2C4]">No birthdays this week</div>
                )}
              </div>
            </div>

            {/* 3. Anniversaries */}
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_1px_2px_rgba(28,26,23,0.04),0_20px_40px_-18px_rgba(28,26,23,0.14)] h-[280px] flex flex-col border border-[#E7DFD2]">
              <SectionLabel icon={<Award size={13} />} tone={GOLD} live={anniversaries.today?.length ? GOLD : null}>
                Anniversaries
              </SectionLabel>
              <div className="flex flex-col gap-2 overflow-y-auto flex-grow pr-2 custom-scrollbar">
                {anniversaries.today?.map(emp => (
                  <div key={emp._id} className="relative overflow-hidden flex items-center gap-3.5 p-2.5 rounded-2xl shadow-[0_12px_24px_-8px_rgba(198,161,91,0.5)]" style={{ background: `linear-gradient(135deg, #D8BC7C, ${GOLD})` }}>
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-white/60 relative z-10">
                      <img src={getImageUrl(emp.userId?.profileImage || emp.profileImage)} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex flex-col relative z-10">
                      <span className="text-[12.5px] font-semibold text-white truncate leading-tight">{emp.userId?.name || emp.name}</span>
                      <span className="text-[10px] font-medium text-white/80 mt-0.5">{getYearsJoined(emp.joiningDate)}-year anniversary 🥂</span>
                    </div>
                  </div>
                ))}
                {anniversaries.upcoming?.map(emp => (
                  <div key={emp._id} className="flex items-center gap-3.5 p-2 rounded-2xl border border-transparent hover:border-[#E7DFD2] hover:bg-[#FBF8F3]/60 transition-all group">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border grayscale-[0.4] group-hover:grayscale-0 transition-all" style={{ borderColor: HAIRLINE }}>
                      <img src={getImageUrl(emp.userId?.profileImage || emp.profileImage)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" alt="" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12.5px] font-medium text-[#1C1A17] truncate leading-tight">{emp.userId?.name || emp.name}</span>
                      <span className="text-[10px] font-medium mt-0.5" style={{ color: "#8A6A2E" }}>{formatBday(emp.joiningDate)}</span>
                    </div>
                  </div>
                ))}
                {!anniversaries.today?.length && !anniversaries.upcoming?.length && (
                  <div className="flex-grow flex items-center justify-center text-[12px] font-medium text-[#D9D2C4]">No milestones soon</div>
                )}
              </div>
            </div>

            {/* 4. Holidays */}
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_1px_2px_rgba(28,26,23,0.04),0_20px_40px_-18px_rgba(28,26,23,0.14)] h-[280px] flex flex-col border border-[#E7DFD2]">
              <SectionLabel icon={<CalendarDays size={13} />} tone={SLATE}>
                Holidays
              </SectionLabel>
              <div className="flex flex-col gap-2.5 overflow-y-auto flex-grow pr-2 custom-scrollbar scroll-smooth">
                {holidays
                  .filter((h) => toYMD(h.date) >= toYMD(new Date()))
                  .map((h) => (
                    <div
                      key={h._id}
                      className="group flex items-stretch min-h-[52px] rounded-2xl border bg-white hover:bg-[#FBF8F3]/60 transition-all duration-300 overflow-hidden shrink-0"
                      style={{ borderColor: HAIRLINE }}
                    >
                      <div className="flex-1 flex flex-col justify-center py-3 pl-5 min-w-0">
                        <span className="text-[12.5px] font-medium text-[#1C1A17] truncate">
                          {h.title}
                        </span>
                      </div>
                      <div className="w-16 flex flex-col items-center justify-center transition-colors" style={{ backgroundColor: SLATE }}>
                        <span className="text-[16px] font-semibold text-white leading-none">
                          {new Date(h.date).toLocaleDateString("en-IN", { day: "2-digit" })}
                        </span>
                        <span className="text-[9px] font-medium text-white/70 uppercase tracking-wide">
                          {new Date(h.date).toLocaleDateString("en-IN", { month: "short" })}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 5. Leaves */}
            <div 
              id="leave-summary-card"
              onClick={() => setShowLeaveBreakdown(true)} 
              className="relative bg-white/70 backdrop-blur-md p-8 rounded-[2rem] shadow-[0_1px_2px_rgba(28,26,23,0.04),0_20px_40px_-18px_rgba(28,26,23,0.14)] border border-[#E7DFD2] flex flex-col items-center justify-center cursor-pointer h-[280px] transition-all duration-300 hover:border-[#D9C79A] active:scale-[0.98] group overflow-hidden"
            >
              <Umbrella 
                size={130} 
                className="absolute -top-6 -right-6 opacity-[0.05] group-hover:opacity-[0.09] group-hover:scale-105 group-hover:-rotate-6 transition-all duration-500"
                style={{ color: GARNET }}
              />
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B4ADA0] z-10">Available Leaves</span>
              <div className="relative z-10 text-center mt-2">
                <div className="text-[68px] leading-none tracking-tight group-hover:scale-105 transition-transform duration-500" style={{ ...displayFont, fontWeight: 700, color: GARNET }}>
                  {leaveBalance.casual + leaveBalance.sick}
                </div>
                <span className="text-[11px] font-medium text-[#B4ADA0]">days remaining</span>
              </div>
              <div className="mt-6 flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-widest z-10 shadow-[0_10px_20px_-5px_rgba(28,26,23,0.35)] transition-colors" style={{ backgroundColor: INK }}
                onMouseEnter={(e)=>e.currentTarget.style.backgroundColor=GARNET} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor=INK}>
                View breakdown
                <ArrowRight size={13} strokeWidth={2.2} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* Calendar Section */}
        <section id="attendance-calendar-section" className="relative bg-white/70 backdrop-blur-2xl p-6 sm:p-10 rounded-[2.5rem] shadow-[0_1px_2px_rgba(28,26,23,0.04),0_25px_55px_-20px_rgba(28,26,23,0.16)] border border-[#E7DFD2]">
          <CornerTicks />
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>Calendar</span>
              <h3 className="text-2xl sm:text-3xl tracking-tight mt-1" style={{ ...displayFont, fontWeight: 700 }}>Attendance history</h3>
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full w-full sm:w-auto justify-between shadow-sm border" style={{ borderColor: HAIRLINE }}>
              <button onClick={() => setCalendarMonth(p => new Date(p.getFullYear(), p.getMonth()-1, 1))} className="p-2 rounded-full transition-all cursor-pointer text-[#B4ADA0] hover:text-[#7A2233]"><ChevronLeft size={18}/></button>
              <span className="text-sm font-medium w-40 text-center text-[#1C1A17]">
                {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => setCalendarMonth(p => new Date(p.getFullYear(), p.getMonth()+1, 1))} className="p-2 rounded-full transition-all cursor-pointer text-[#B4ADA0] hover:text-[#7A2233]"><ChevronRight size={18}/></button>
            </div>
          </div>

          <div className="hidden sm:grid grid-cols-7 gap-3 bg-white/60 rounded-2xl p-5 border" style={{ borderColor: HAIRLINE }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="text-center text-[11px] font-semibold text-[#B4ADA0] uppercase pb-3 tracking-[0.15em]">{d}</div>
            ))}
            {generateCalendar().map((day, i) => {
              const { status, title } = getDayInfo(day);
              const styles = {
                present: { backgroundColor: SAGE, color: "#fff", borderColor: SAGE, boxShadow: "0 10px 20px -8px rgba(63,91,84,0.45)" },
                halfday: { backgroundColor: GOLD, color: "#fff", borderColor: GOLD, boxShadow: "0 10px 20px -8px rgba(198,161,91,0.45)" },
                absent: { backgroundColor: GARNET, color: "#fff", borderColor: GARNET, boxShadow: "0 10px 20px -8px rgba(122,34,51,0.45)" },
                working: { backgroundColor: "#2E4640", color: "#fff", borderColor: "#2E4640", boxShadow: "0 10px 20px -8px rgba(46,70,64,0.4)" },
                leave: { backgroundColor: "#D8BC7C", color: "#fff", borderColor: "#D8BC7C" },
                holiday: { backgroundColor: SLATE, color: "#fff", borderColor: SLATE },
                weekend: { backgroundColor: CREAM, color: "#C7BFAF", borderColor: HAIRLINE },
                none: { backgroundColor: "#fff", color: "#1C1A17", borderColor: HAIRLINE },
              };
              return (
                <div
                  key={i}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[86px] rounded-2xl border flex flex-col items-center justify-center p-3 transition-all duration-300 hover:scale-[1.04] hover:shadow-lg ${day ? "cursor-pointer" : "opacity-0 pointer-events-none"}`}
                  style={day ? styles[status] : {}}
                >
                  <span className="text-xl font-semibold leading-none">{day}</span>
                  {day && title && <span className="text-[9px] font-medium text-center mt-2 leading-tight opacity-90">{title}</span>}
                </div>
              );
            })}
          </div>

          <div className="sm:hidden w-full px-1 py-3">
            <div className="grid grid-cols-7 mb-2 bg-white/60 rounded-xl p-2 border" style={{ borderColor: HAIRLINE }}>
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                <span key={d} className="text-[9px] font-semibold text-[#B4ADA0] text-center tracking-widest">{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 bg-white/70 backdrop-blur rounded-2xl p-2 border" style={{ borderColor: HAIRLINE }}>
              {generateCalendar().map((day, i) => {
                const { status, title } = day ? getDayInfo(day) : { status: 'none', title: '' };
                const statusStyles = {
                  present: { backgroundColor: SAGE, color: "#fff", borderColor: SAGE },
                  halfday: { backgroundColor: GOLD, color: "#fff", borderColor: GOLD },
                  absent: { backgroundColor: GARNET, color: "#fff", borderColor: GARNET },
                  working: { backgroundColor: "#2E4640", color: "#fff", borderColor: "#2E4640" },
                  leave: { backgroundColor: "#D8BC7C", color: "#fff", borderColor: "#D8BC7C" },
                  holiday: { backgroundColor: SLATE, color: "#fff", borderColor: SLATE },
                  weekend: { backgroundColor: CREAM, color: "#C7BFAF", borderColor: HAIRLINE },
                  none: { backgroundColor: "#fff", color: "#1C1A17", borderColor: HAIRLINE },
                };

                const currentStyle = statusStyles[status] || statusStyles.none;

                return (
                  <div
                    key={i}
                    onClick={() => handleDayClick(day)}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1 transition-all active:scale-95 ${!day ? "opacity-0 pointer-events-none" : "cursor-pointer"}`}
                    style={day ? currentStyle : {}}
                  >
                    <span className="text-base font-semibold leading-none">
                      {day}
                    </span>
                    
                    {day && title && (
                      <span className="text-[6px] font-medium mt-0.5 opacity-90 text-center leading-[1.2]">
                        {title}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ANNOUNCEMENT MODAL */}
      {activeAnnouncement && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-xl" style={{ backgroundColor: "rgba(28,26,23,0.7)" }}>
           <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative">
              <button onClick={() => setActiveAnnouncement(null)} className="absolute top-6 right-6 p-2.5 bg-white/20 text-white rounded-full z-20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-colors"><X size={20}/></button>
              <div className="relative h-64 sm:h-80 overflow-hidden" style={{ backgroundColor: INK }}>
                 {activeAnnouncement.image ? <img src={getImageUrl(activeAnnouncement.image)} className="w-full h-full object-cover opacity-85" /> : <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${GARNET}, ${INK})` }}><Megaphone size={72} className="text-white opacity-25" /></div>}
                 <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent z-10"></div>
                 <div className="absolute bottom-8 left-10 right-10 z-10">
                    <div className={`inline-block px-3.5 py-1 rounded-full text-[10px] font-semibold uppercase border mb-3 ${getStatusBadge(activeAnnouncement.status)}`}>{activeAnnouncement.status}</div>
                    <h2 className="text-3xl sm:text-4xl leading-tight tracking-tight text-[#1C1A17]" style={{ ...displayFont, fontWeight: 700 }}>{activeAnnouncement.title}</h2>
                 </div>
              </div>
              <div className="p-10">
                 <div className="p-8 rounded-[1.75rem] border max-h-[250px] overflow-y-auto" style={{ backgroundColor: "#FBF8F3", borderColor: HAIRLINE }}>
                    <p className="text-[#5A5348] text-base leading-relaxed">{activeAnnouncement.description}</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* LEAVE MODAL */}
      {showLeaveBreakdown && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center backdrop-blur-xl transition-all" style={{ backgroundColor: "rgba(28,26,23,0.5)" }}>
          <div className="bg-white/95 backdrop-blur-2xl w-full max-w-md rounded-t-[3rem] sm:rounded-[2.5rem] p-10 pt-12 relative shadow-[0_32px_64px_-15px_rgba(28,26,23,0.25)] border border-white/60">
            
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full sm:hidden" style={{ backgroundColor: HAIRLINE }} />

            <button 
              onClick={() => setShowLeaveBreakdown(false)} 
              className="absolute top-10 right-10 p-2 rounded-full text-[#B4ADA0] hover:text-[#7A2233] transition-all active:scale-90 cursor-pointer"
              style={{ backgroundColor: "#FBF8F3" }}
            >
              <X size={20} strokeWidth={2.2} />
            </button>

            <div className="text-center">
              <div className="flex flex-col items-center mb-8">
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B4ADA0] mb-3">
                  Total Credits Left
                </span>
                <div className="relative">
                  <div className="text-[6.5rem] leading-none tracking-tight text-[#1C1A17]" style={{ ...displayFont, fontWeight: 700 }}>
                    {leaveBalance.casual + leaveBalance.sick}
                  </div>
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[11px] font-medium text-[#D9D2C4] tracking-wide">
                    Total Days
                  </span>
                </div>
              </div>

              {/* Breakdown Section */}
              <div className="grid grid-cols-2 gap-4 mt-12">
                {/* Casual Leave Box */}
                <div className="bg-white p-6 rounded-[1.75rem] border shadow-sm flex flex-col items-center" style={{ borderColor: HAIRLINE }}>
                  <span className="text-[11px] font-semibold uppercase mb-1 tracking-wide" style={{ color: GARNET }}>Casual</span>
                  <div className="text-4xl font-semibold text-[#1C1A17]">{leaveBalance.casual}</div>
                  <div className="w-8 h-1 rounded-full mt-3" style={{ backgroundColor: `${GARNET}25` }} />
                  <span className="text-[10px] font-medium text-[#D9D2C4] mt-2">of {TOTAL_ANNUAL_CASUAL} days</span>
                </div>

                {/* Sick Leave Box */}
                <div className="bg-white p-6 rounded-[1.75rem] border shadow-sm flex flex-col items-center" style={{ borderColor: HAIRLINE }}>
                  <span className="text-[11px] font-semibold uppercase mb-1 tracking-wide" style={{ color: SLATE }}>Sick</span>
                  <div className="text-4xl font-semibold text-[#1C1A17]">{leaveBalance.sick}</div>
                  <div className="w-8 h-1 rounded-full mt-3" style={{ backgroundColor: `${SLATE}25` }} />
                  <span className="text-[10px] font-medium text-[#D9D2C4] mt-2">of {TOTAL_ANNUAL_SICK} days</span>
                </div>
              </div>

              <p className="mt-8 text-[11px] font-medium text-[#B4ADA0]">
                Approved leaves are automatically deducted from your annual quota.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DAY DETAIL / ATTENDANCE CORRECTION MODAL */}
      {selectedDay && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center backdrop-blur-xl transition-all" style={{ backgroundColor: "rgba(28,26,23,0.5)" }}>
          <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[2.5rem] p-8 sm:p-10 relative shadow-[0_32px_64px_-15px_rgba(28,26,23,0.25)] border border-white/60 max-h-[90vh] overflow-y-auto">
            
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full sm:hidden" style={{ backgroundColor: HAIRLINE }} />

            <button
              onClick={() => setSelectedDay(null)}
              className="absolute top-8 right-8 p-2 rounded-full text-[#B4ADA0] hover:text-[#7A2233] transition-all active:scale-90 cursor-pointer"
              style={{ backgroundColor: "#FBF8F3" }}
            >
              <X size={20} strokeWidth={2.2} />
            </button>

            <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: GOLD }}>
              {calendarMonth.toLocaleString('default', { month: 'long' })} {selectedDay.day}, {calendarMonth.getFullYear()}
            </span>
            <h3 className="text-2xl tracking-tight mt-1 mb-6" style={{ ...displayFont, fontWeight: 700 }}>
              {selectedDay.title || "Attendance detail"}
            </h3>

            {/* Check-in / check-out */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-2xl p-4 flex flex-col items-center" style={{ backgroundColor: "#FBF8F3" }}>
                <Clock size={16} className="mb-1" style={{ color: SAGE }} />
                <span className="text-[10px] font-semibold uppercase text-[#B4ADA0] tracking-wide">Check-in</span>
                <span className="text-sm font-medium text-[#1C1A17] mt-1">
                  {selectedDay.record?.checkIn
                    ? new Date(selectedDay.record.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                    : "—"}
                </span>
              </div>
              <div className="rounded-2xl p-4 flex flex-col items-center" style={{ backgroundColor: "#FBF8F3" }}>
                <Clock size={16} className="mb-1" style={{ color: GARNET }} />
                <span className="text-[10px] font-semibold uppercase text-[#B4ADA0] tracking-wide">Check-out</span>
                <span className="text-sm font-medium text-[#1C1A17] mt-1">
                  {selectedDay.record?.checkOut
                    ? new Date(selectedDay.record.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                    : "—"}
                </span>
              </div>
            </div>

            {/* Existing request for this date, if any — otherwise offer the correction form */}
            {(() => {
              const existing = myRequests.find(
  (r) =>
    r.date === selectedDay.dateStr &&
    r.status === "Pending"
);

if (existing) {
  const badgeMap = {
    Pending: {
      icon: <Clock3 size={13} />,
      cls: "bg-[#C6A15B]/10 text-[#8A6A2E] border-[#C6A15B]/30",
    },
    Approved: {
      icon: <CheckCircle2 size={13} />,
      cls: "bg-[#3F5B54]/10 text-[#3F5B54] border-[#3F5B54]/25",
    },
    Rejected: {
      icon: <XCircle size={13} />,
      cls: "bg-[#7A2233]/10 text-[#7A2233] border-[#7A2233]/25",
    },
  };

  const badge = badgeMap[existing.status] || badgeMap.Pending;

  return (
    <div className="space-y-3">
      <div
        className={`flex items-center justify-between px-4 py-3 rounded-2xl border text-[12px] font-medium ${badge.cls}`}
      >
        <div className="flex items-center gap-2">
          {badge.icon}
          <span>
            Correction to <b>{existing.requestedStatus}</b> — {existing.status}
          </span>
        </div>

        <button
          onClick={async () => {
            try {
              const token = localStorage.getItem("token");

              await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/api/attendance-request/${existing._id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              setMyRequests((prev) =>
                prev.filter((r) => r._id !== existing._id)
              );

              // Close the modal after deleting
              setSelectedDay(null);
            } catch (err) {
              console.log(err);
            }
          }}
          className="text-[#7A2233] hover:text-[#5C1A28] text-xs font-semibold cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

              // Only offer a correction request for Absent / Half Day
              if (!["absent", "halfday"].includes(selectedDay.status)) return null;

              return (
                <div className="border-t pt-5" style={{ borderColor: HAIRLINE }}>
                  <span className="text-[11px] font-semibold uppercase text-[#B4ADA0] tracking-wide">Request correction</span>
                  <div className="flex gap-2 mt-3 mb-3">
                    {["Present", "Half Day"].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setRequestForm(f => ({ ...f, requestedStatus: opt }))}
                        className="flex-1 py-2 rounded-xl text-[12px] font-medium border transition-all cursor-pointer"
                        style={requestForm.requestedStatus === opt
                          ? { backgroundColor: GARNET, color: "#fff", borderColor: GARNET }
                          : { backgroundColor: "#fff", color: "#8A8378", borderColor: HAIRLINE }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={requestForm.reason}
                    onChange={(e) => setRequestForm(f => ({ ...f, reason: e.target.value }))}
                    placeholder="Reason for correction..."
                    rows={3}
                    className="w-full text-sm p-3 rounded-2xl border focus:outline-none resize-none"
                    style={{ borderColor: HAIRLINE }}
                  />
                  <button
                    onClick={handleRequestSubmit}
                    disabled={submittingRequest || !requestForm.reason.trim()}
                    className="mt-3 w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-2xl text-[12px] font-medium transition-colors cursor-pointer"
                    style={{ backgroundColor: INK }}
                    onMouseEnter={(e)=>{if(!submittingRequest && requestForm.reason.trim()) e.currentTarget.style.backgroundColor=GARNET;}}
                    onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor=INK;}}
                  >
                    <Send size={13} /> {submittingRequest ? "Submitting..." : "Submit request"}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSummary;
