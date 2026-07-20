import axios from "axios";
import {
  CalendarDays, ChevronLeft, ChevronRight,
  X, Bell, Activity, ArrowRight, Umbrella,
  Megaphone, Cake, Award,
  Users,
  UserPlus
} from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/authContext";
import EmployeePunch from "../attendance/EmployeePunch";

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
      case "Ongoing": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Completed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-sky-50 text-sky-700 border-sky-200";
    }
  };

  const hasUnseenNotices = announcements.some((a) => {
    const seenByArray = a.seenBy || [];
    return !seenByArray.map(id => id.toString()).includes(user?._id?.toString());
  }) || notifications.some(n => !n.seen);
  // Fetch leave status notifications for employee
  useEffect(() => {
    if (!user?._id) return;
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.success) setNotifications(res.data.notifications.filter(n => n.type === "leave-status"));
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

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

    const attRec = attendance.find(a => String(a.date) === dateStr);
    if (attRec && attRec.status) {
      const s = attRec.status.toLowerCase().replace(/\s+/g, "");
      if (["present", "halfday", "absent"].includes(s))
        return { status: s, title: attRec.status };
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
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/announcements`, { headers }),
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

  // Small reusable section label used across premium cards
  const SectionLabel = ({ icon, tone, children, live }) => (
    <div className="flex items-center justify-between mb-5 px-1">
      <div className="flex items-center gap-2.5 text-[11px] font-semibold uppercase text-slate-400 tracking-[0.16em]">
        <div className={`p-1.5 rounded-lg ${tone}`}>{icon}</div>
        {children}
      </div>
      {live && <span className="flex h-1.5 w-1.5 rounded-full bg-current animate-pulse" style={{ color: live }} />}
    </div>
  );

  if (loading || !user) return (
    <div className="h-screen flex items-center justify-center text-slate-400 uppercase tracking-[0.3em] text-sm font-semibold">
      Loading your workspace…
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 text-slate-900 pb-16">
      <div className="max-w-[1240px] mx-auto p-5 sm:p-10 space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center pt-2 relative">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-rose-400">Overview</span>
            <h1 className="text-3xl sm:text-[2.6rem] font-semibold text-slate-900 tracking-tight leading-none mt-1">
              Good to see you<span className="text-rose-500">.</span>
            </h1>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowBellMenu(!showBellMenu)}
              className={`relative p-3.5 rounded-full transition-all duration-300 border shadow-[0_8px_24px_-8px_rgba(15,23,42,0.15)] cursor-pointer ${
                showBellMenu ? "bg-rose-600 text-white border-rose-600" : "bg-white text-slate-500 border-slate-100 hover:border-rose-200 hover:text-rose-500"
              }`}
            >
              <Bell size={18} strokeWidth={2} />
              {hasUnseenNotices && (
                <span className="absolute top-2.5 right-3 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </button>
            {showBellMenu && (
              <div className="absolute right-0 mt-4 w-[320px] sm:w-[400px] bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.25)] border border-slate-100 z-[100] overflow-hidden animate-pop">
                <div className="p-6 bg-slate-50/70 border-b border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Notices &amp; Leave Updates</span>
                    <X size={15} className="cursor-pointer text-slate-300 hover:text-rose-500 transition-colors" onClick={()=>setShowBellMenu(false)}/>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                      <div className="text-sm font-semibold text-amber-500">
                        {announcements.filter(a => a.status?.toLowerCase() === "ongoing").length}
                      </div>
                      <div className="text-[9px] font-semibold uppercase text-slate-400 tracking-wide">Ongoing</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                      <div className="text-sm font-semibold text-emerald-500">
                        {announcements.filter(a => a.status?.toLowerCase() === "completed" || a.status?.toLowerCase() === "done").length}
                      </div>
                      <div className="text-[9px] font-semibold uppercase text-slate-400 tracking-wide">Done</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                      <div className="text-sm font-semibold text-sky-500">
                        {announcements.filter(a => a.status?.toLowerCase() === "coming").length}
                      </div>
                      <div className="text-[9px] font-semibold uppercase text-slate-400 tracking-wide">Coming</div>
                    </div>
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
                  {/* Announcements */}
                  {announcements.map(a => {
                    const isRead = a.seenBy?.map(id => id.toString()).includes(user?._id?.toString());
                    return (
                      <div key={a._id} onClick={() => { setActiveAnnouncement(a); setShowBellMenu(false); if(!isRead) markAsSeenOnServer(a._id); }} 
                        className={`p-4 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${isRead ? 'opacity-40 border-transparent' : 'bg-slate-50 border-rose-100 shadow-sm hover:bg-rose-50/40'}`}>
                        <div className="flex flex-col">
                          <h4 className="text-[12px] font-semibold text-slate-800">{a.title}</h4>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{a.type}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase border ${getStatusBadge(a.status)}`}>
                          {a.status}
                        </span>
                      </div>
                    )
                  })}
                  {/* Leave Status Notifications */}
                  {notifications.length > 0 && <div className="mt-2 mb-1 text-[10px] font-semibold uppercase text-slate-400 tracking-wide">Leave Updates</div>}
                  {notifications.map(n => (
                    <div
                      key={n._id}
                      className={`p-4 rounded-2xl border flex flex-col gap-1 cursor-pointer transition-all ${n.seen ? 'opacity-50' : 'bg-amber-50/70 border-amber-100 shadow-sm hover:bg-amber-50'}`}
                      onClick={async () => {
                        if (!n.seen) {
                          try {
                            const token = localStorage.getItem("token");
                            await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/${n._id}/seen`, {}, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, seen: true } : x));
                          } catch (err) {}
                        }
                      }}
                    >
                      <span className="text-[12px] font-medium text-amber-800">{n.message}</span>
                      <span className="text-[10px] font-medium text-slate-400">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                  {announcements.length === 0 && notifications.length === 0 && (
                    <div className="p-6 text-center text-slate-400 text-xs">No notices or leave updates</div>
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
            <div className="bg-white p-6 rounded-[2rem] shadow-[0_20px_45px_-20px_rgba(15,23,42,0.12)] h-[280px] flex flex-col border border-slate-100">
              <SectionLabel icon={<Activity size={13} className="text-rose-500" />} tone="bg-rose-50" live="#f43f5e">
                Team Pulse
              </SectionLabel>
              <div className="flex flex-col gap-2.5 overflow-y-auto flex-grow pr-2 custom-scrollbar">
                {deptEmployees.map((e) => (
                  <div 
                    key={e._id} 
                    className="flex items-center gap-3.5 p-2 rounded-2xl border border-transparent hover:border-rose-100 hover:bg-rose-50/30 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-100 shadow-sm flex items-center justify-center bg-slate-100 relative">
                      <img 
                        src={getImageUrl(e.userId?.profileImage || e.profileImage)} 
                        className="w-full h-full object-cover" 
                        alt="" 
                        onError={(e) => {e.target.style.display = 'none'}} 
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-slate-400 -z-10 uppercase">
                        {(e.userId?.name || e.name).charAt(0)}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12.5px] font-medium text-slate-800 truncate">
                        {e.userId?.name || e.name || "Unknown"}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 tracking-wide">
                        {typeof e.employeeId === 'object' ? e.userId?.employeeId : e.employeeId}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* New Employees */}
            <div className="bg-white p-6 rounded-[2rem] shadow-[0_20px_45px_-20px_rgba(15,23,42,0.12)] h-[280px] flex flex-col border border-slate-100">
              <SectionLabel icon={<UserPlus size={13} className="text-emerald-500" />} tone="bg-emerald-50">
                Welcome Aboard
              </SectionLabel>
              <div className="flex-grow overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
                {newEmployees.length > 0 ? newEmployees.map(e => (
                  <div key={e._id} className="flex items-center gap-3 p-2.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/70">
                    <img src={getImageUrl(e.profileImage)} className="w-9 h-9 rounded-full object-cover border border-white shadow-sm" alt="" />
                    <div className="flex flex-col">
                      <span className="text-[12.5px] font-medium text-emerald-900 truncate">{e.name}</span>
                      <span className="text-[10px] font-medium text-emerald-500">Joined recently</span>
                    </div>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-300">
                    <Users size={30} strokeWidth={1.5} />
                    <span className="text-[11px] font-medium uppercase tracking-wide">No new joinees</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Birthdays */}
            <div className="bg-white p-6 rounded-[2rem] shadow-[0_20px_45px_-20px_rgba(15,23,42,0.12)] h-[280px] flex flex-col border border-slate-100">
              <SectionLabel icon={<Cake size={13} className="text-pink-500" />} tone="bg-pink-50" live={birthdays.today?.length ? "#ec4899" : null}>
                Birthdays
              </SectionLabel>
              <div className="flex flex-col gap-2 overflow-y-auto flex-grow pr-2 custom-scrollbar">
                {birthdays.today?.map(emp => (
                  <div key={emp._id} className="relative overflow-hidden flex items-center gap-3.5 p-2.5 bg-gradient-to-br from-pink-500 to-rose-400 rounded-2xl shadow-[0_12px_24px_-8px_rgba(244,114,182,0.5)]">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-white/60 relative z-10">
                      <img src={getImageUrl(emp.userId?.profileImage || emp.profileImage)} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex flex-col relative z-10">
                      <span className="text-[12.5px] font-semibold text-white truncate leading-tight">{emp.userId?.name || emp.name}</span>
                      <span className="text-[10px] font-medium text-pink-100 mt-0.5">Happy birthday, today 🎉</span>
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
                    <div key={emp._id} className="flex items-center gap-3.5 p-2 rounded-2xl border border-transparent hover:border-pink-100 hover:bg-pink-50/30 transition-all group">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-100 grayscale-[0.4] group-hover:grayscale-0 transition-all">
                        <img src={getImageUrl(emp.userId?.profileImage || emp.profileImage)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" alt="" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12.5px] font-medium text-slate-700 truncate leading-tight">{emp.userId?.name || emp.name}</span>
                        <span className="text-[10px] font-medium text-pink-400 mt-0.5">
                          {formatBday(emp.dob)}
                          {daysLeft !== null && (
                            <span className="ml-1.5 text-slate-400">· {daysLeft === 1 ? 'in 1 day' : `in ${daysLeft} days`}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {!birthdays.today?.length && !birthdays.upcoming?.length && (
                  <div className="flex-grow flex items-center justify-center text-[12px] font-medium text-slate-300">No birthdays this week</div>
                )}
              </div>
            </div>

            {/* 3. Anniversaries */}
            <div className="bg-white p-6 rounded-[2rem] shadow-[0_20px_45px_-20px_rgba(15,23,42,0.12)] h-[280px] flex flex-col border border-slate-100">
              <SectionLabel icon={<Award size={13} className="text-amber-600" />} tone="bg-amber-50" live={anniversaries.today?.length ? "#f59e0b" : null}>
                Anniversaries
              </SectionLabel>
              <div className="flex flex-col gap-2 overflow-y-auto flex-grow pr-2 custom-scrollbar">
                {anniversaries.today?.map(emp => (
                  <div key={emp._id} className="relative overflow-hidden flex items-center gap-3.5 p-2.5 bg-gradient-to-br from-amber-500 to-orange-400 rounded-2xl shadow-[0_12px_24px_-8px_rgba(245,158,11,0.5)]">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-white/60 relative z-10">
                      <img src={getImageUrl(emp.userId?.profileImage || emp.profileImage)} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex flex-col relative z-10">
                      <span className="text-[12.5px] font-semibold text-white truncate leading-tight">{emp.userId?.name || emp.name}</span>
                      <span className="text-[10px] font-medium text-amber-100 mt-0.5">{getYearsJoined(emp.joiningDate)}-year anniversary 🥂</span>
                    </div>
                  </div>
                ))}
                {anniversaries.upcoming?.map(emp => (
                  <div key={emp._id} className="flex items-center gap-3.5 p-2 rounded-2xl border border-transparent hover:border-amber-100 hover:bg-amber-50/30 transition-all group">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-100 grayscale-[0.4] group-hover:grayscale-0 transition-all">
                      <img src={getImageUrl(emp.userId?.profileImage || emp.profileImage)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" alt="" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12.5px] font-medium text-slate-700 truncate leading-tight">{emp.userId?.name || emp.name}</span>
                      <span className="text-[10px] font-medium text-amber-500 mt-0.5">{formatBday(emp.joiningDate)}</span>
                    </div>
                  </div>
                ))}
                {!anniversaries.today?.length && !anniversaries.upcoming?.length && (
                  <div className="flex-grow flex items-center justify-center text-[12px] font-medium text-slate-300">No milestones soon</div>
                )}
              </div>
            </div>

            {/* 4. Holidays */}
            <div className="bg-white p-6 rounded-[2rem] shadow-[0_20px_45px_-20px_rgba(15,23,42,0.12)] h-[280px] flex flex-col border border-slate-100">
              <SectionLabel icon={<CalendarDays size={13} className="text-indigo-600" />} tone="bg-indigo-50">
                Holidays
              </SectionLabel>
              <div className="flex flex-col gap-2.5 overflow-y-auto flex-grow pr-2 custom-scrollbar scroll-smooth">
                {holidays
                  .filter((h) => toYMD(h.date) >= toYMD(new Date()))
                  .map((h) => (
                    <div
                      key={h._id}
                      className="group flex items-stretch min-h-[52px] rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-300 overflow-hidden shrink-0"
                    >
                      <div className="flex-1 flex flex-col justify-center py-3 pl-5 min-w-0">
                        <span className="text-[12.5px] font-medium text-slate-700 group-hover:text-indigo-700 truncate">
                          {h.title}
                        </span>
                      </div>
                      <div className="w-16 flex flex-col items-center justify-center bg-indigo-600 group-hover:bg-indigo-500 transition-colors">
                        <span className="text-[16px] font-semibold text-white leading-none">
                          {new Date(h.date).toLocaleDateString("en-IN", { day: "2-digit" })}
                        </span>
                        <span className="text-[9px] font-medium text-indigo-200 uppercase tracking-wide">
                          {new Date(h.date).toLocaleDateString("en-IN", { month: "short" })}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 5. Leaves */}
            <div 
              onClick={() => setShowLeaveBreakdown(true)} 
              className="bg-white p-8 rounded-[2rem] shadow-[0_20px_45px_-20px_rgba(15,23,42,0.12)] border border-slate-100 flex flex-col items-center justify-center cursor-pointer h-[280px] transition-all duration-300 hover:shadow-[0_25px_50px_-15px_rgba(244,63,94,0.18)] hover:border-rose-100 active:scale-[0.98] group relative overflow-hidden"
            >
              <Umbrella 
                size={130} 
                className="absolute -top-6 -right-6 opacity-[0.04] group-hover:opacity-[0.08] group-hover:scale-105 group-hover:-rotate-6 transition-all duration-500 text-rose-600" 
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 z-10">Available Leaves</span>
              <div className="relative z-10 text-center mt-2">
                <div className="text-[68px] font-semibold text-rose-600 leading-none tracking-tight group-hover:scale-105 transition-transform duration-500">
                  {leaveBalance.casual + leaveBalance.sick}
                </div>
                <span className="text-[11px] font-medium text-slate-400">days remaining</span>
              </div>
              <div className="mt-6 flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-[11px] font-medium z-10 shadow-[0_10px_20px_-5px_rgba(15,23,42,0.35)] group-hover:bg-rose-600 transition-colors">
                View breakdown
                <ArrowRight size={13} strokeWidth={2.2} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* Calendar Section */}
        <section className="bg-white/70 backdrop-blur-2xl p-6 sm:p-10 rounded-[2.5rem] shadow-[0_25px_55px_-20px_rgba(15,23,42,0.14)] border border-white/60">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-400">Calendar</span>
              <h3 className="text-2xl sm:text-3xl text-slate-900 font-semibold tracking-tight mt-1">Attendance history</h3>
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full w-full sm:w-auto justify-between shadow-sm border border-slate-100">
              <button onClick={() => setCalendarMonth(p => new Date(p.getFullYear(), p.getMonth()-1, 1))} className="p-2 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all cursor-pointer text-slate-400"><ChevronLeft size={18}/></button>
              <span className="text-sm font-medium w-40 text-center text-slate-700">
                {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => setCalendarMonth(p => new Date(p.getFullYear(), p.getMonth()+1, 1))} className="p-2 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all cursor-pointer text-slate-400"><ChevronRight size={18}/></button>
            </div>
          </div>

          <div className="hidden sm:grid grid-cols-7 gap-3 bg-white/60 rounded-2xl p-5 border border-white/60">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="text-center text-[11px] font-semibold text-slate-400 uppercase pb-3 tracking-[0.15em]">{d}</div>
            ))}
            {generateCalendar().map((day, i) => {
              const { status, title } = getDayInfo(day);
              const styles = {
                present: "bg-emerald-500 text-white border-emerald-500 shadow-[0_10px_20px_-8px_rgba(16,185,129,0.5)]", 
                halfday: "bg-sky-500 text-white border-sky-500 shadow-[0_10px_20px_-8px_rgba(14,165,233,0.5)]",
                absent: "bg-rose-500 text-white border-rose-500 shadow-[0_10px_20px_-8px_rgba(244,63,94,0.5)]", 
                leave: "bg-amber-400 text-white border-amber-400",
                holiday: "bg-indigo-600 text-white border-indigo-600", 
                weekend: "bg-slate-50 text-slate-300 border-slate-100", 
                none: "bg-white text-slate-800 border-slate-100 shadow-sm"
              };
              return (
                <div key={i} className={`min-h-[86px] rounded-2xl border flex flex-col items-center justify-center p-3 transition-all duration-300 hover:scale-[1.04] hover:shadow-lg ${day ? styles[status] : "opacity-0 pointer-events-none"}`}>
                  <span className="text-xl font-semibold leading-none">{day}</span>
                  {day && title && <span className="text-[9px] font-medium text-center mt-2 leading-tight opacity-90">{title}</span>}
                </div>
              );
            })}
          </div>

          <div className="sm:hidden w-full px-1 py-3">
            <div className="grid grid-cols-7 mb-2 bg-white/60 rounded-xl p-2 border border-white/60">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                <span key={d} className="text-[9px] font-semibold text-slate-400 text-center tracking-widest">{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 bg-white/70 backdrop-blur rounded-2xl p-2 border border-white/60">
              {generateCalendar().map((day, i) => {
                const { status, title } = day ? getDayInfo(day) : { status: 'none', title: '' };
                const statusStyles = {
                  present: "bg-emerald-500 text-white border-emerald-500", 
                  halfday: "bg-sky-500 text-white border-sky-500",
                  absent: "bg-rose-500 text-white border-rose-500", 
                  leave: "bg-amber-400 text-white border-amber-400",
                  holiday: "bg-indigo-600 text-white border-indigo-600", 
                  weekend: "bg-slate-50 text-slate-300 border-slate-100", 
                  none: "bg-white text-slate-800 border-slate-100 shadow-sm"
                };

                const currentStyle = statusStyles[status] || statusStyles.none;

                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1 transition-all active:scale-95 ${!day ? "opacity-0 pointer-events-none" : currentStyle}`}
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
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xl animate-fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-pop">
              <button onClick={() => setActiveAnnouncement(null)} className="absolute top-6 right-6 p-2.5 bg-white/20 text-white rounded-full z-20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-colors"><X size={20}/></button>
              <div className="relative h-64 sm:h-80 bg-slate-900 overflow-hidden">
                 {activeAnnouncement.image ? <img src={getImageUrl(activeAnnouncement.image)} className="w-full h-full object-cover opacity-85" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-600 to-indigo-900"><Megaphone size={72} className="text-white opacity-25" /></div>}
                 <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent z-10"></div>
                 <div className="absolute bottom-8 left-10 right-10 z-10">
                    <div className={`inline-block px-3.5 py-1 rounded-full text-[10px] font-semibold uppercase border mb-3 ${getStatusBadge(activeAnnouncement.status)}`}>{activeAnnouncement.status}</div>
                    <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 leading-tight tracking-tight">{activeAnnouncement.title}</h2>
                 </div>
              </div>
              <div className="p-10">
                 <div className="bg-slate-50 p-8 rounded-[1.75rem] border border-slate-100 max-h-[250px] overflow-y-auto">
                    <p className="text-slate-600 text-base leading-relaxed">{activeAnnouncement.description}</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* LEAVE MODAL */}
      {showLeaveBreakdown && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xl transition-all">
          <div className="bg-white/95 backdrop-blur-2xl w-full max-w-md rounded-t-[3rem] sm:rounded-[2.5rem] p-10 pt-12 animate-in fade-in slide-in-from-bottom-10 duration-500 relative shadow-[0_32px_64px_-15px_rgba(15,23,42,0.25)] border border-white/60">
            
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-100 rounded-full sm:hidden" />

            <button 
              onClick={() => setShowLeaveBreakdown(false)} 
              className="absolute top-10 right-10 p-2 rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90 cursor-pointer"
            >
              <X size={20} strokeWidth={2.2} />
            </button>

            <div className="text-center">
              <div className="flex flex-col items-center mb-8">
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 mb-3">
                  Total Credits Left
                </span>
                <div className="relative">
                  <div className="text-[6.5rem] font-semibold leading-none tracking-tight text-slate-900">
                    {leaveBalance.casual + leaveBalance.sick}
                  </div>
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[11px] font-medium text-slate-300 tracking-wide">
                    Total Days
                  </span>
                </div>
              </div>

              {/* Breakdown Section */}
              <div className="grid grid-cols-2 gap-4 mt-12">
                {/* Casual Leave Box */}
                <div className="bg-white p-6 rounded-[1.75rem] border border-slate-100 shadow-sm flex flex-col items-center">
                  <span className="text-[11px] font-semibold uppercase text-rose-500 mb-1 tracking-wide">Casual</span>
                  <div className="text-4xl font-semibold text-slate-800">{leaveBalance.casual}</div>
                  <div className="w-8 h-1 bg-rose-100 rounded-full mt-3" />
                  <span className="text-[10px] font-medium text-slate-300 mt-2">of {TOTAL_ANNUAL_CASUAL} days</span>
                </div>

                {/* Sick Leave Box */}
                <div className="bg-white p-6 rounded-[1.75rem] border border-slate-100 shadow-sm flex flex-col items-center">
                  <span className="text-[11px] font-semibold uppercase text-indigo-500 mb-1 tracking-wide">Sick</span>
                  <div className="text-4xl font-semibold text-slate-800">{leaveBalance.sick}</div>
                  <div className="w-8 h-1 bg-indigo-100 rounded-full mt-3" />
                  <span className="text-[10px] font-medium text-slate-300 mt-2">of {TOTAL_ANNUAL_SICK} days</span>
                </div>
              </div>

              <p className="mt-8 text-[11px] font-medium text-slate-400">
                Approved leaves are automatically deducted from your annual quota.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSummary;