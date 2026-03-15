import axios from "axios";
import {
  CalendarDays, ChevronLeft, ChevronRight,
  X, Bell, Activity, ArrowRight, Umbrella,
  Megaphone, Cake, Award
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
      case "Ongoing": return "bg-amber-100 text-amber-600 border-amber-200";
      case "Completed": return "bg-green-100 text-green-600 border-green-200";
      default: return "bg-blue-100 text-blue-600 border-blue-200";
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
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employee/anniversaries`, { headers }) 
  ])
  .then(([d1, d2, d3, d4, d5, d6, d7]) => { // Matched destructuring
    const employeeData = d1?.data?.employees || [];
    const holidayData = d2?.data?.holidays || [];
    const announcementData = d3?.data?.announcements || [];
    const allLeaves = d4?.data?.leaves || [];
    const birthdayData = d5?.data || { today: [], upcoming: [] };
    const attendanceData = d6?.data?.attendance || [];
    const anniversaryData = d7?.data || { today: [], upcoming: [] }; // Correct mapping

    setDeptEmployees(employeeData);
    setHolidays(holidayData);
    setAnnouncements(announcementData);
    setLeaves(allLeaves);
    setBirthdays(birthdayData);
    setAttendance(attendanceData);
    setAnniversaries(anniversaryData);

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
  }, [user, calendarMonth]);

  useEffect(() => {
    fetchData();
  }, [calendarMonth, fetchData]);

  const handleAttendanceSuccess = () => {
    fetchData();
  };

  if (loading || !user) return (
    <div className="h-screen flex items-center justify-center font-black italic text-slate-400 uppercase tracking-tighter text-4xl">
      LOADING...
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 text-slate-900 pb-12">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-center pt-2 relative">
          <h1 className="text-2xl font-black text-red-700 uppercase tracking-tighter sm:text-4xl leading-none italic">Dashboard</h1>
          <div className="relative">
            <button onClick={() => setShowBellMenu(!showBellMenu)} className={`p-3 rounded-3xl transition-all border shadow-xl cursor-pointer ${showBellMenu ? 'bg-red-600 text-white' : 'bg-white text-slate-600 border-slate-100'}`}>
              <Bell size={20} className={hasUnseenNotices ? "animate-bounce text-red-500" : ""} />
            </button>
            {showBellMenu && (
              <div className="absolute right-0 mt-4 w-[320px] sm:w-[400px] bg-white rounded-[3rem] shadow-2xl border z-[100] overflow-hidden animate-pop">
                <div className="p-6 bg-slate-50 border-b">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Notices & Leave Updates</span>
                    <X size={15} className="cursor-pointer text-slate-300 hover:text-red-500" onClick={()=>setShowBellMenu(false)}/>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center">
                      <div className="text-xs font-black text-amber-500">
                        {announcements.filter(a => a.status?.toLowerCase() === "ongoing").length}
                      </div>
                      <div className="text-[7px] font-black uppercase text-slate-400">Ongoing</div>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center">
                      <div className="text-xs font-black text-green-500">
                        {announcements.filter(a => a.status?.toLowerCase() === "completed" || a.status?.toLowerCase() === "done").length}
                      </div>
                      <div className="text-[7px] font-black uppercase text-slate-400">Done</div>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center">
                      <div className="text-xs font-black text-blue-500">
                        {announcements.filter(a => a.status?.toLowerCase() === "coming").length}
                      </div>
                      <div className="text-[7px] font-black uppercase text-slate-400">Coming</div>
                    </div>
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
                  {/* Announcements */}
                  {announcements.map(a => {
                    const isRead = a.seenBy?.map(id => id.toString()).includes(user?._id?.toString());
                    return (
                      <div key={a._id} onClick={() => { setActiveAnnouncement(a); setShowBellMenu(false); if(!isRead) markAsSeenOnServer(a._id); }} 
                        className={`p-4 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${isRead ? 'opacity-30' : 'bg-slate-50 border-red-50 shadow-sm'}`}>
                        <div className="flex flex-col">
                          <h4 className="text-[11px] font-black uppercase">{a.title}</h4>
                          <span className="text-[8px] font-black text-slate-400 uppercase">{a.type}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase border ${getStatusBadge(a.status)}`}>
                          {a.status}
                        </span>
                      </div>
                    )
                  })}
                  {/* Leave Status Notifications */}
                  {notifications.length > 0 && <div className="mt-2 mb-1 text-[9px] font-black uppercase text-slate-400">Leave Updates</div>}
                  {notifications.map(n => (
                    <div
                      key={n._id}
                      className={`p-4 rounded-2xl border flex flex-col gap-1 cursor-pointer ${n.seen ? 'opacity-50' : 'bg-amber-50 border-amber-100 shadow-sm'}`}
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
                      <span className="text-[11px] font-black text-amber-700">{n.message}</span>
                      <span className="text-[8px] font-bold text-slate-400">{new Date(n.createdAt).toLocaleString()}</span>
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

        {/* Stats Grid - Improved Layout */}
        <section className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Team Pulse, Birthdays, Anniversaries */}
            <div className="md:col-span-4 flex flex-col gap-8">
              {/* Team Pulse */}
              <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] h-[280px] flex flex-col border border-slate-100">
                {/* ...existing code... */}
                <div className="flex items-center justify-between mb-5 px-1">
                  <div className="flex items-center gap-2 text-[8px] font-[1000] uppercase text-slate-400 tracking-[0.2em]">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <Activity size={10} className="relative text-red-500" />
                    </div>
                    Team Pulse
                  </div>
                  <span className="text-[6px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full uppercase">Live</span>
                </div>
                <div className="flex flex-col gap-3 overflow-y-auto flex-grow pr-2 custom-scrollbar">
                  {deptEmployees.map((e, idx) => (
                    <div 
                      key={e._id} 
                      className="flex items-center gap-4 p-2 bg-white rounded-2xl border-2 border-slate-50 hover:border-red-100 hover:shadow-md transition-all group"
                    >
                      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border-2 border-white shadow-sm flex items-center justify-center bg-slate-100 relative group-hover:scale-110 transition-transform">
                        <img 
                          src={getImageUrl(e.userId?.profileImage || e.profileImage)} 
                          className="w-full h-full object-cover" 
                          alt="" 
                          onError={(e) => {e.target.style.display = 'none'}} 
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-400 -z-10 uppercase">
                          {(e.userId?.name || e.name).charAt(0)}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black italic uppercase truncate">
                          {e.userId?.name || e.name || "Unknown"}
                        </span>
                        <span className="text-[7px] font-bold text-slate-400 uppercase">
                          {typeof e.employeeId === 'object' ? e.userId?.employeeId : e.employeeId}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Birthdays */}
              <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] h-[180px] flex flex-col border border-slate-100">
                {/* ...existing code... */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2 text-[8px] font-[1000] uppercase text-slate-400 tracking-[0.2em]">
                    <div className="p-1.5 bg-pink-50 rounded-lg">
                      <Cake size={10} className="text-pink-500" />
                    </div>
                    Birthdays
                  </div>
                  {birthdays.today?.length > 0 && (
                    <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-pulse"></span>
                  )}
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto flex-grow pr-2 custom-scrollbar">
                  {birthdays.today?.map(emp => (
                    <div 
                      key={emp._id} 
                      className="relative overflow-hidden flex items-center gap-4 p-2 bg-gradient-to-br from-pink-500 to-rose-400 rounded-[1.2rem] shadow-[0_10px_20px_-5px_rgba(244,114,182,0.4)] transition-transform active:scale-95"
                    >
                      <div className="absolute top-[-10px] right-[-10px] opacity-20 text-white rotate-12">
                        <Cake size={40} />
                      </div>
                      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border-2 border-white/50 shadow-sm relative z-10">
                        <img 
                          src={getImageUrl(emp.userId?.profileImage || emp.profileImage)} 
                          className="w-full h-full object-cover" 
                          alt="" 
                        />
                      </div>
                      <div className="flex flex-col relative z-10">
                        <span className="text-[10px] font-[1000] italic text-white truncate uppercase tracking-tighter leading-none">
                          {emp.userId?.name || emp.name}
                        </span>
                        <span className="text-[7px] font-black text-pink-100 uppercase italic tracking-widest mt-1 drop-shadow-sm">
                          HBD! Today 🎉
                        </span>
                      </div>
                    </div>
                  ))}
                  {birthdays.upcoming?.map(emp => (
                    <div 
                      key={emp._id} 
                      className="flex items-center gap-4 p-1.5 bg-white rounded-2xl border-2 border-slate-50 hover:border-pink-100 transition-all group"
                    >
                      <div className="w-7 h-7 rounded-xl overflow-hidden shrink-0 border border-slate-100 grayscale-[0.5] group-hover:grayscale-0 transition-all">
                        <img 
                          src={getImageUrl(emp.userId?.profileImage || emp.profileImage)} 
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-100" 
                          alt="" 
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-[1000] italic text-slate-500 group-hover:text-slate-800 transition-colors truncate uppercase tracking-tighter leading-none">
                          {emp.userId?.name || emp.name}
                        </span>
                        <span className="text-[7px] font-bold text-pink-400 uppercase mt-0.5 italic">
                          {formatBday(emp.dob)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {!birthdays.today?.length && !birthdays.upcoming?.length && (
                    <div className="flex-grow flex items-center justify-center text-[9px] font-black uppercase text-slate-300 italic">
                      No Birthdays This Week
                    </div>
                  )}
                </div>
              </div>
              {/* Anniversaries */}
              <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] h-[180px] flex flex-col border border-slate-100">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2 text-[8px] font-[1000] uppercase text-slate-400 tracking-[0.2em]">
                    <div className="p-1.5 bg-amber-50 rounded-lg"><Award size={10} className="text-amber-600" /></div>
                    Anniversaries
                  </div>
                  {anniversaries.today?.length > 0 && <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>}
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto flex-grow pr-2 custom-scrollbar">
                  {anniversaries.today?.map(emp => (
                    <div key={emp._id} className="relative overflow-hidden flex items-center gap-4 p-2 bg-gradient-to-br from-amber-500 to-orange-400 rounded-[1.2rem] shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)]">
                      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border-2 border-white/50 relative z-10">
                        <img src={getImageUrl(emp.userId?.profileImage || emp.profileImage)} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex flex-col relative z-10">
                        <span className="text-[10px] font-[1000] italic text-white truncate uppercase tracking-tighter leading-none">{emp.userId?.name || emp.name}</span>
                        <span className="text-[7px] font-black text-amber-100 uppercase italic tracking-widest mt-1">
                          {getYearsJoined(emp.joiningDate)} Anniversary! 🥂
                        </span>
                      </div>
                    </div>
                  ))}
                  {anniversaries.upcoming?.map(emp => (
                    <div key={emp._id} className="flex items-center gap-4 p-1.5 bg-white rounded-2xl border-2 border-slate-50 hover:border-amber-100 transition-all group">
                      <div className="w-7 h-7 rounded-xl overflow-hidden shrink-0 border border-slate-100 grayscale-[0.5] group-hover:grayscale-0 transition-all">
                        <img src={getImageUrl(emp.userId?.profileImage || emp.profileImage)} className="w-full h-full object-cover opacity-70 group-hover:opacity-100" alt="" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-[1000] italic text-slate-500 group-hover:text-slate-800 truncate uppercase tracking-tighter leading-none">{emp.userId?.name || emp.name}</span>
                        <span className="text-[7px] font-bold text-amber-500 uppercase mt-0.5 italic">{formatBday(emp.joiningDate)}</span>
                      </div>
                    </div>
                  ))}
                  {!anniversaries.today?.length && !anniversaries.upcoming?.length && (
                    <div className="flex-grow flex items-center justify-center text-[9px] font-black uppercase text-slate-300 italic">No Milestones Soon</div>
                  )}
                </div>
              </div>
            </div>
            {/* Right Column: Holidays and Leaves */}
            <div className="md:col-span-8 flex flex-col gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Holidays */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] h-[280px] flex flex-col border border-slate-100">
                  <div className="flex items-center justify-between mb-5 px-1 shrink-0">
                    <div className="flex items-center gap-2 text-[8px] font-[1000] uppercase text-slate-400 tracking-[0.2em]">
                      <div className="p-1.5 bg-indigo-50 rounded-xl">
                        <CalendarDays size={10} className="text-indigo-600" />
                      </div>
                      Holidays
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 overflow-y-auto flex-grow pr-2 custom-scrollbar scroll-smooth">
                    {holidays
                      .filter((h) => toYMD(h.date) >= toYMD(new Date()))
                      .map((h) => (
                        <div
                          key={h._id}
                          className="group flex items-stretch min-h-[50px] rounded-[2rem] border-2 border-slate-50 bg-white hover:border-indigo-100 transition-all duration-300 overflow-hidden shrink-0"
                        >
                          <div className="flex-1 flex flex-col justify-center py-3 pl-5 min-w-0">
                            <span className="text-[10px] font-[1000] italic text-slate-800 uppercase tracking-tighter leading-none group-hover:text-indigo-600 truncate">
                              {h.title}
                            </span>
                          </div>
                          <div className="w-16 flex flex-col items-center justify-center bg-indigo-600 group-hover:bg-indigo-500 transition-colors border-l-2 border-dashed border-white/30">
                            <span className="text-[16px] font-[1000] text-white italic leading-none">
                              {new Date(h.date).toLocaleDateString("en-IN", { day: "2-digit" })}
                            </span>
                            <span className="text-[8px] font-black text-indigo-200 uppercase tracking-tighter">
                              {new Date(h.date).toLocaleDateString("en-IN", { month: "short" })}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                {/* Leaves */}
                <div 
                  onClick={() => setShowLeaveBreakdown(true)} 
                  className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center cursor-pointer h-[280px] transition-all hover:shadow-2xl hover:shadow-red-500/10 active:scale-95 group relative overflow-hidden"
                >
                  <Umbrella 
                    size={140} 
                    className="absolute -top-4 -right-4 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 text-red-600" 
                  />
                  <div className="flex items-center gap-2 mb-2 z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-[8px] font-[1000] uppercase tracking-[0.2em] text-slate-400">
                      Available Leaves
                    </span>
                  </div>
                  <div className="relative z-10">
                    <div className="text-[80px] font-[1000] text-red-600 italic leading-none tracking-[-0.07em] drop-shadow-[0_10px_10px_rgba(220,38,38,0.15)] group-hover:scale-105 transition-transform duration-500">
                      {leaveBalance.casual + leaveBalance.sick}
                    </div>
                    <span className="absolute -bottom-2 -right-6 text-[10px] font-black italic uppercase text-red-400 opacity-60">
                      Days
                    </span>
                  </div>
                  <div className="mt-6 flex items-center gap-3 bg-red-600 text-white px-6 py-2.5 rounded-[1.5rem] text-[8px] font-[1000] uppercase z-10 shadow-[0_10px_20px_-5px_rgba(220,38,38,0.4)] group-hover:bg-red-700 transition-colors">
                    Breakdown 
                    <ArrowRight size={10} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Calendar Section */}
        <section className="bg-white/80 backdrop-blur-2xl p-6 sm:p-12 rounded-[3.5rem] shadow-[0_12px_48px_0_rgba(220,38,38,0.10)] border border-white/40 transition-all duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
            <h3 className="text-2xl sm:text-3xl text-red-600 font-black uppercase italic tracking-tighter drop-shadow-sm bg-white/60 px-6 py-2 rounded-2xl shadow-[0_2px_8px_rgba(220,38,38,0.04)]">Attendance History</h3>
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur px-4 py-2 rounded-2xl w-full sm:w-auto justify-between shadow-[0_2px_8px_rgba(220,38,38,0.04)] border border-slate-100">
              <button onClick={() => setCalendarMonth(p => new Date(p.getFullYear(), p.getMonth()-1, 1))} className="p-2 bg-white/90 rounded-xl shadow hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer border border-white/60"><ChevronLeft/></button>
              <span className="text-base font-black uppercase w-44 text-center tracking-widest text-slate-700">
                {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => setCalendarMonth(p => new Date(p.getFullYear(), p.getMonth()+1, 1))} className="p-2 bg-white/90 rounded-xl shadow hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer border border-white/60"><ChevronRight/></button>
            </div>
          </div>

          <div className="hidden sm:grid grid-cols-7 gap-4 bg-white/60 rounded-2xl p-4 shadow-[0_2px_8px_rgba(220,38,38,0.04)] border border-white/40">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase pb-4 tracking-[0.2em]">{d}</div>
            ))}
            {generateCalendar().map((day, i) => {
              const { status, title } = getDayInfo(day);
              const styles = {
                present: "bg-green-500 text-white border-green-200 shadow-lg shadow-green-100", 
                halfday: "bg-blue-500 text-white border-blue-200 shadow-lg shadow-blue-100",
                absent: "bg-red-500 text-white border-red-200 shadow-lg shadow-red-100", 
                leave: "bg-amber-400 text-white border-amber-200",
                holiday: "bg-indigo-600 text-white border-indigo-200", 
                weekend: "bg-slate-50 text-slate-300 border-slate-100", 
                none: "bg-white/80 text-slate-900 border-slate-50 shadow-sm"
              };
              return (
                <div key={i} className={`min-h-[90px] rounded-[2.7rem] border-2 flex flex-col items-center justify-center p-4 transition-all hover:scale-110 hover:shadow-xl ${day ? styles[status] : "opacity-0 pointer-events-none"}`}>
                  <span className="text-2xl font-black italic drop-shadow-sm">{day}</span>
                  {day && title && <span className="text-[8px] font-black uppercase text-center mt-2 tracking-tighter px-2 leading-tight text-slate-500">{title}</span>}
                </div>
              );
            })}
          </div>

          <div className="sm:hidden w-full px-2 py-4">
            <div className="grid grid-cols-7 mb-2 bg-white/60 rounded-xl p-2 shadow-[0_2px_8px_rgba(220,38,38,0.04)] border border-white/40">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                <span key={d} className="text-[10px] font-black text-slate-400 text-center tracking-widest">{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 bg-white/70 backdrop-blur rounded-2xl p-2 shadow-[0_4px_16px_rgba(220,38,38,0.08)] border border-white/40">
              {generateCalendar().map((day, i) => {
                const { status, title } = day ? getDayInfo(day) : { status: 'none', title: '' };
                const statusStyles = {
                  present: "bg-green-500 text-white border-green-200 shadow-lg shadow-green-100", 
                  halfday: "bg-blue-500 text-white border-blue-200 shadow-lg shadow-blue-100",
                  absent: "bg-red-500 text-white border-red-200 shadow-lg shadow-red-100", 
                  leave: "bg-amber-400 text-white border-amber-200",
                  holiday: "bg-indigo-600 text-white border-indigo-200", 
                  weekend: "bg-slate-50 text-slate-300 border-slate-100", 
                  none: "bg-white/90 text-slate-900 border-slate-50 shadow-sm"
                };

                const currentStyle = statusStyles[status] || statusStyles.none;

                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-1 transition-all hover:scale-110 hover:shadow-xl active:scale-95 ${!day ? "opacity-0 pointer-events-none" : currentStyle}`}
                    style={{backdropFilter:'blur(8px)'}}
                  >
                    <span className="text-lg font-black italic drop-shadow-sm">
                      {day}
                    </span>
                    
                    {day && title && (
                      <span className="text-[5px] font-[1000] uppercase mt-0.5 tracking-tighter opacity-90 text-center leading-[1.2]">
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
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden relative animate-pop">
              <button onClick={() => setActiveAnnouncement(null)} className="absolute top-6 right-6 p-3 bg-white/20 text-white rounded-full z-20 backdrop-blur-md border border-white/30"><X size={24}/></button>
              <div className="relative h-64 sm:h-80 bg-slate-900 overflow-hidden">
                 {activeAnnouncement.image ? <img src={getImageUrl(activeAnnouncement.image)} className="w-full h-full object-cover opacity-80" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-indigo-900 opacity-80"><Megaphone size={80} className="text-white opacity-20" /></div>}
                 <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent z-10"></div>
                 <div className="absolute bottom-8 left-10 right-10 z-10">
                    <div className={`inline-block px-4 py-1 rounded-full text-[9px] font-black uppercase border mb-4 ${getStatusBadge(activeAnnouncement.status)}`}>{activeAnnouncement.status}</div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-none tracking-tighter uppercase italic">{activeAnnouncement.title}</h2>
                 </div>
              </div>
              <div className="p-10">
                 <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 max-h-[250px] overflow-y-auto">
                    <p className="text-slate-600 text-lg font-medium leading-relaxed italic uppercase">{activeAnnouncement.description}</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* LEAVE MODAL */}
      {showLeaveBreakdown && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xl transition-all">
          <div className="bg-white/90 backdrop-blur-2xl w-full max-w-md rounded-t-[4rem] sm:rounded-[3.5rem] p-10 pt-12 animate-in fade-in slide-in-from-bottom-10 duration-500 relative shadow-[0_32px_64px_-15px_rgba(220,38,38,0.15)] border border-white/40">
            
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-100 rounded-full sm:hidden" />

            <button 
              onClick={() => setShowLeaveBreakdown(false)} 
              className="absolute top-10 right-10 p-2 rounded-full bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90 cursor-pointer"
            >
              <X size={24} strokeWidth={3} />
            </button>

            <div className="text-center">
              <div className="flex flex-col items-center mb-8">
                <span className="text-[11px] font-[1000] uppercase tracking-[0.25em] text-slate-400 mb-2">
                  Total Credits Left
                </span>
                <div className="relative">
                  <div className="text-[8rem] font-[1000] italic leading-none tracking-[-0.05em] text-slate-900 drop-shadow-sm">
                    {leaveBalance.casual + leaveBalance.sick}
                  </div>
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-black italic uppercase text-slate-300 tracking-widest">
                    Total Days
                  </span>
                </div>
              </div>

              {/* Breakdown Section */}
              <div className="grid grid-cols-2 gap-4 mt-12">
                {/* Casual Leave Box */}
                <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase text-red-500 mb-1 italic">Casual</span>
                  <div className="text-4xl font-[1000] text-slate-800 italic">{leaveBalance.casual}</div>
                  <div className="w-8 h-1 bg-red-100 rounded-full mt-2" />
                  <span className="text-[8px] font-bold text-slate-300 mt-2 uppercase">of {TOTAL_ANNUAL_CASUAL} Days</span>
                </div>

                {/* Sick Leave Box */}
                <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase text-indigo-500 mb-1 italic">Sick</span>
                  <div className="text-4xl font-[1000] text-slate-800 italic">{leaveBalance.sick}</div>
                  <div className="w-8 h-1 bg-indigo-100 rounded-full mt-2" />
                  <span className="text-[8px] font-bold text-slate-300 mt-2 uppercase">of {TOTAL_ANNUAL_SICK} Days</span>
                </div>
              </div>

              <p className="mt-8 text-[9px] font-bold text-slate-400 uppercase tracking-tight italic">
                * Approved leaves are automatically deducted from your annual quota
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSummary;