import axios from "axios";
import {
  CalendarDays, ChevronLeft, ChevronRight,
  X, Bell, Activity, ArrowRight, Umbrella,
  Megaphone, Cake
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

  /* ================= SETTINGS ================= */
  const TOTAL_ANNUAL_CASUAL = 12; 
  const TOTAL_ANNUAL_SICK = 12;   

  /* ================= HELPERS ================= */
  
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
  });

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

  /* --- UPDATED: Includes Saturday as Weekend --- */
  const getDayInfo = (day) => {
    if (!day) return { status: "none", title: "" };
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    const dateStr = toYMD(date);

    const holidayRec = holidays.find(h => toYMD(h.date) === dateStr);
    if (holidayRec) return { status: "holiday", title: holidayRec.title };

    // UPDATED: 0 is Sunday, 6 is Saturday
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
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/user/${user._id}/monthly?month=${calendarMonth.getMonth() + 1}&year=${calendarMonth.getFullYear()}`, { headers })
    ])
    .then(([d1, d2, d4, d5, d6, d7]) => {
      const employeeData = d1?.data?.employees || [];
      const holidayData = d2?.data?.holidays || [];
      const announcementData = d4?.data?.announcements || [];
      const allLeaves = d5?.data?.leaves || [];
      const birthdayData = d6?.data || { today: [], upcoming: [] };
      const attendanceData = d7?.data?.attendance || [];

      setDeptEmployees(employeeData);
      setHolidays(holidayData);
      setAnnouncements(announcementData);
      setLeaves(allLeaves);
      setBirthdays(birthdayData);
      setAttendance(attendanceData);

      /* --- UPDATED: Excludes Sat & Sun from Balance --- */
      const getUsedDays = (lt) => {
        const hols = holidayData.map(h => toYMD(h.date));
        return allLeaves.filter(l => l.status === "Approved" && l.leaveType === lt)
          .reduce((total, l) => {
            let count = 0, curr = new Date(l.startDate), last = new Date(l.endDate);
            curr.setHours(0,0,0,0); last.setHours(0,0,0,0);
            while (curr <= last) {
              const dayOfWeek = curr.getDay();
              // Check: Not Sunday (0), Not Saturday (6), and Not a Holiday
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

  useEffect(() => { fetchData(); }, [fetchData]);

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
          <h1 className="text-3xl font-black text-red-700 uppercase tracking-tighter sm:text-5xl leading-none italic">Dashboard</h1>
          <div className="relative">
            <button onClick={() => setShowBellMenu(!showBellMenu)} className={`p-4 rounded-3xl transition-all border shadow-xl cursor-pointer ${showBellMenu ? 'bg-black text-white' : 'bg-white text-slate-600 border-slate-100'}`}>
              <Bell size={24} className={hasUnseenNotices ? "animate-bounce text-red-500" : ""} />
            </button>
            
            {showBellMenu && (
              <div className="absolute right-0 mt-4 w-[320px] sm:w-[400px] bg-white rounded-[3rem] shadow-2xl border z-[100] overflow-hidden animate-pop">
                <div className="p-8 bg-slate-50 border-b">
                    <div className="flex justify-between items-center mb-6">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notices</span>
                       <X size={18} className="cursor-pointer text-slate-300 hover:text-red-500" onClick={()=>setShowBellMenu(false)}/>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                       <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center">
                          <div className="text-xs font-black text-amber-500">{announcements.filter(a => a.status === "Ongoing").length}</div>
                          <div className="text-[7px] font-black uppercase text-slate-400">Ongoing</div>
                       </div>
                       <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center">
                          <div className="text-xs font-black text-green-500">{announcements.filter(a => a.status === "Completed").length}</div>
                          <div className="text-[7px] font-black uppercase text-slate-400">Done</div>
                       </div>
                       <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center">
                          <div className="text-xs font-black text-blue-500">{announcements.filter(a => a.status === "Coming").length}</div>
                          <div className="text-[7px] font-black uppercase text-slate-400">Coming</div>
                       </div>
                    </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
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
                </div>
              </div>
            )}
          </div>
        </header>

        <EmployeePunch onSuccess={fetchData} />

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-lg h-[240px] flex flex-col border border-slate-50">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest"><Activity size={16} className="text-red-500" /> Team Pulse</div>
            <div className="flex flex-col gap-2 overflow-y-auto flex-grow pr-1 custom-scrollbar">
              {deptEmployees.map(e => (
                <div key={e._id} className="flex items-center gap-3 p-1 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-white shadow-sm flex items-center justify-center bg-red-600 relative">
                    <img src={getImageUrl(e.userId?.profileImage || e.profileImage)} className="w-full h-full object-cover" alt="" onError={(e) => {e.target.style.display = 'none'}} />
                  </div>
                  <span className="text-[12px] font-black text-slate-700 truncate uppercase tracking-tighter">{e.userId?.name || e.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] shadow-lg h-[240px] flex flex-col border border-slate-50">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest"><Cake size={16} className="text-pink-500" /> Birthdays</div>
            <div className="flex flex-col gap-2 overflow-y-auto flex-grow pr-1 custom-scrollbar">
              {birthdays.today?.map(emp => (
                <div key={emp._id} className="flex items-center gap-3 p-3 bg-pink-50 rounded-2xl border border-pink-100">
                  <img src={getImageUrl(emp.userId?.profileImage || emp.profileImage)} className="w-8 h-8 rounded-full border-2 border-pink-400 object-cover" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[11px] font-black text-pink-700 truncate uppercase">{emp.userId?.name || emp.name}</span>
                    <span className="text-[7px] font-black text-pink-400 uppercase italic">Today! 🎉</span>
                  </div>
                </div>
              ))}
              {birthdays.upcoming?.map(emp => (
                <div key={emp._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <img src={getImageUrl(emp.userId?.profileImage || emp.profileImage)} className="w-8 h-8 rounded-full border border-white opacity-60 object-cover" />
                  <span className="text-[11px] font-black text-slate-600 truncate uppercase">{emp.userId?.name || emp.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] shadow-lg h-[240px] flex flex-col border border-slate-50">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest"><CalendarDays size={16} className="text-indigo-500" /> Holidays</div>
             <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                {holidays.filter(h => toYMD(h.date) >= toYMD(new Date())).map(h => (
                   <div key={h._id} className="flex justify-between items-center p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-tighter">{h.title}</span>
                      <span className="text-[9px] font-black text-indigo-600 bg-white px-3 py-1 rounded-lg uppercase">
                        {new Date(h.date).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}
                      </span>
                   </div>
                ))}
             </div>
          </div>

          <div onClick={() => setShowLeaveBreakdown(true)} className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 flex flex-col items-center justify-center cursor-pointer h-[240px] transition-transform active:scale-95 group relative overflow-hidden">
            <Umbrella size={120} className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-red-500 -rotate-12" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 z-10">Available Credits</span>
            <div className="text-8xl font-black text-red-500 italic z-10 tracking-tighter">
              {leaveBalance.casual + leaveBalance.sick}
            </div>
            <div className="mt-4 flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full text-[9px] font-black uppercase z-10 shadow-sm border border-slate-100">
                Breakdown <ArrowRight size={12}/>
            </div>
          </div>
        </section>

        {/* Calendar Section */}
        <section className="bg-white p-6 sm:p-10 rounded-[3rem] shadow-2xl border border-white">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Attendance History</h3>
            <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl w-full sm:w-auto justify-between shadow-inner">
              <button onClick={() => setCalendarMonth(p => new Date(p.getFullYear(), p.getMonth()-1, 1))} className="p-2 bg-white rounded-xl shadow-sm hover:text-red-500 transition-colors cursor-pointer"><ChevronLeft/></button>
              <span className="text-xs font-black uppercase w-40 text-center tracking-widest">
                {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => setCalendarMonth(p => new Date(p.getFullYear(), p.getMonth()+1, 1))} className="p-2 bg-white rounded-xl shadow-sm hover:text-red-500 transition-colors cursor-pointer"><ChevronRight/></button>
            </div>
          </div>

          <div className="hidden sm:grid grid-cols-7 gap-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase pb-4 tracking-[0.2em]">{d}</div>
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
                none: "bg-white text-slate-900 border-slate-50 shadow-sm"
              };
              return (
                <div key={i} className={`min-h-[120px] rounded-[2.5rem] border-2 flex flex-col items-center justify-center p-4 transition-all hover:scale-105 ${day ? styles[status] : "opacity-0 pointer-events-none"}`}>
                  <span className="text-3xl font-black italic">{day}</span>
                  {day && title && <span className="text-[8px] font-black uppercase text-center mt-2 tracking-tighter px-2 leading-tight">{title}</span>}
                </div>
              );
            })}
          </div>

          <div className="sm:hidden space-y-3">
             {generateCalendar().filter(d => d !== null).reverse().map((day) => {
                const { status, title } = getDayInfo(day);
                const dotColor = { 
                    present: "bg-green-500", 
                    halfday: "bg-blue-500", 
                    absent: "bg-red-500", 
                    leave: "bg-amber-400", 
                    holiday: "bg-indigo-600", 
                    weekend: "bg-slate-300", 
                    none: "bg-slate-100" 
                };
                return (
                    <div key={day} className="flex items-center justify-between p-5 rounded-[2rem] border bg-slate-50 border-slate-100">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-lg font-black italic shadow-sm">{day}</div>
                            <span className="text-[12px] font-black uppercase text-slate-800 tracking-tighter">{title}</span>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${dotColor[status]} shadow-sm`}></div>
                    </div>
                );
             })}
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
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-t-[3.5rem] sm:rounded-[3rem] p-10 animate-slide-up relative shadow-2xl">
            <button onClick={() => setShowLeaveBreakdown(false)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500"><X size={28} /></button>
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Credits Left</span>
              <div className="text-[7rem] font-black italic leading-none my-4 tracking-tighter text-slate-900">{leaveBalance.casual + leaveBalance.sick}</div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-red-50 p-6 rounded-[2.5rem] border border-red-100 shadow-sm transition-transform hover:scale-105">
                  <div className="text-3xl font-black text-red-600 italic">{leaveBalance.casual}</div>
                  <div className="text-[9px] uppercase font-black text-red-400 mt-1">Casual</div>
                </div>
                <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 shadow-sm transition-transform hover:scale-105">
                  <div className="text-3xl font-black text-blue-600 italic">{leaveBalance.sick}</div>
                  <div className="text-[9px] uppercase font-black text-blue-400 mt-1">Sick</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSummary;