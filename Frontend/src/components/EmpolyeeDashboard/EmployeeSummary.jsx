import axios from "axios";
import {
  Users, CalendarDays, ChevronLeft, ChevronRight,
  X, Bell, Activity, ArrowRight, Calendar as CalIcon,
  Clock, PlayCircle, CheckCircle, Eye, UserX, Umbrella,
  Megaphone, TrendingUp, BarChart3, AlertCircle
} from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/authContext";
import EmployeePunch from "../attendance/EmployeePunch";

const EmployeeSummary = () => {
  const { user, loading } = useAuth();
  
  // States
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

  // --- HELPERS ---

  // Standardize dates to YYYY-MM-DD for comparison
  const toYMD = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return isNaN(date.getTime()) 
      ? "" 
      : date.toISOString().split('T')[0];
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
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/announcements/${announcementId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(prev => prev.map(a => 
        a._id === announcementId ? { ...a, seenBy: [...(a.seenBy || []), user._id.toString()] } : a
      ));
    } catch (error) { console.error(error); }
  };

  const getDayInfo = (day) => {
    if (!day) return { status: "none", title: "" };
    
    // Create date for the specific calendar cell
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    const dateStr = toYMD(date);

    // 1. Check Holidays
    const holidayRec = holidays.find(h => toYMD(h.date) === dateStr);
    if (holidayRec) return { status: "holiday", title: holidayRec.title };

    // 2. Check Weekends
    if (date.getDay() === 0) return { status: "weekend", title: "Sunday" };

    // 3. Check Approved Leaves
    const activeLeave = leaves.find(l => {
      if (l.status !== "Approved") return false;
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);
      return date >= start && date <= end;
    });
    if (activeLeave) return { status: "leave", title: activeLeave.leaveType };

    // 4. Check Attendance Logs
    const attRec = attendance.find(a => a.date === dateStr);
    if (attRec && attRec.status) {
      const s = attRec.status.toLowerCase().replace(/\s+/g, "");
      if (["present", "halfday", "absent"].includes(s)) return { status: s, title: attRec.status };
    }

    return { status: "none", title: "" };
  };

  const generateCalendar = () => {
    const y = calendarMonth.getFullYear(); const m = calendarMonth.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    return [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  };

  const fetchData = useCallback(() => {
    if (!user?._id) return;
    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
    Promise.all([
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employee/by-department/me`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/all`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/leave/balance/me`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/announcements`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/leave/${user._id}/employee`, { headers }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/user/${user._id}/monthly?month=${calendarMonth.getMonth() + 1}&year=${calendarMonth.getFullYear()}`, { headers })
    ]).then(([d1, d2, d3, d4, d5, d6]) => {
      setDeptEmployees(d1?.data?.employees || []);
      setHolidays(d2?.data?.holidays || []);
      setLeaveBalance({ casual: d3?.data?.casual?.balance ?? 0, sick: d3?.data?.sick?.balance ?? 0 });
      setAnnouncements(d4?.data?.announcements || []);
      setLeaves(d5?.data?.leaves || []);
      setAttendance(d6?.data?.attendance || []);
    }).catch(console.error);
  }, [user, calendarMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading || !user) return <div className="h-screen flex items-center justify-center font-black italic text-slate-400 uppercase tracking-tighter text-4xl">LOADING...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 text-slate-900 pb-12">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-6">
        
        {/* Header Section */}
        <header className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl transition-transform hover:scale-105 bg-slate-100">
                {user?.profileImage ? (
                    <img src={user.profileImage} alt="profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-red-600 flex items-center justify-center text-white text-xl font-black italic">{user?.name[0]}</div>
                )}
             </div>
             <div>
                <h1 className="text-3xl font-black text-red-700 uppercase tracking-tighter sm:text-5xl leading-none">Dashboard</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{user?.name}</p>
             </div>
          </div>

          <div className="relative">
            <button onClick={() => setShowBellMenu(!showBellMenu)} className={`p-4 rounded-3xl transition-all border shadow-xl cursor-pointer ${showBellMenu ? 'bg-black text-white' : 'bg-white text-slate-600 border-slate-100'}`}>
              <Bell size={24} className={hasUnseenNotices ? "animate-bounce text-red-500" : ""} />
            </button>

            {showBellMenu && (
              <div className="absolute right-0 mt-4 w-[320px] sm:w-[400px] bg-white rounded-[3rem] shadow-2xl border z-[100] overflow-hidden animate-pop">
                <div className="p-8 bg-slate-50 border-b">
                   <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Overview</span>
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
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${isRead ? 'bg-slate-300' : 'bg-red-500 shadow-lg animate-pulse'}`}></div>
                           <div className="flex flex-col">
                              <h4 className="text-[11px] font-black uppercase leading-tight">{a.title}</h4>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{a.type}</span>
                           </div>
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

        {/* Attendance Punching Component */}
        <EmployeePunch onSuccess={fetchData} />

        {/* Dashboard Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Team Members List */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-lg h-[240px] flex flex-col border border-slate-50">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest"><Activity size={16} className="text-red-500" /> Team Pulse</div>
            <div className="flex flex-col gap-2 overflow-y-auto flex-grow pr-1 custom-scrollbar">
              {deptEmployees.map(e => (
                <div key={e._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white shadow-sm">
                    {e.userId?.profileImage ? <img src={e.userId.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-red-600 flex items-center justify-center text-white text-[10px] font-black uppercase">{e.userId?.name[0]}</div>}
                  </div>
                  <span className="text-[12px] font-black text-slate-700 truncate uppercase tracking-tighter">{e.userId?.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Holidays */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-lg h-[240px] flex flex-col border border-slate-50">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest"><CalendarDays size={16} className="text-indigo-500" /> Holidays</div>
             <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                {holidays.filter(h => toYMD(h.date) >= toYMD(new Date())).map(h => (
                   <div key={h._id} className="flex justify-between items-center p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-tighter">{h.title}</span>
                      <span className="text-[9px] font-black text-indigo-600 bg-white px-3 py-1 rounded-lg uppercase shadow-sm">
                        {new Date(h.date).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}
                      </span>
                   </div>
                ))}
             </div>
          </div>

          {/* Leave Credits Summary */}
          <div onClick={() => setShowLeaveBreakdown(true)} className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 flex flex-col items-center justify-center cursor-pointer h-[240px] transition-transform active:scale-95 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Umbrella size={120} className="text-red-500 -rotate-12" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 z-10">Total Credits</span>
            <div className="text-8xl font-black text-red-500 italic group-hover:scale-110 transition-transform z-10 tracking-tighter">
              {leaveBalance.casual + leaveBalance.sick}
            </div>
            <div className="mt-4 flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full text-[9px] font-black uppercase z-10 shadow-sm border border-slate-100">
                Breakdown <ArrowRight size={12}/>
            </div>
          </div>
        </section>

        {/* History Calendar Section */}
        <section className="bg-white p-6 sm:p-10 rounded-[3rem] shadow-2xl border border-white">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Attendance History</h3>
            <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl w-full sm:w-auto justify-between shadow-inner">
              <button onClick={() => setCalendarMonth(p => new Date(p.getFullYear(), p.getMonth()-1, 1))} className="p-2 bg-white rounded-xl shadow-sm cursor-pointer hover:bg-red-50 transition-colors"><ChevronLeft/></button>
              <span className="text-xs font-black uppercase w-40 text-center tracking-widest">
                {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => setCalendarMonth(p => new Date(p.getFullYear(), p.getMonth()+1, 1))} className="p-2 bg-white rounded-xl shadow-sm cursor-pointer hover:bg-red-50 transition-colors"><ChevronRight/></button>
            </div>
          </div>

          {/* Desktop Calendar Grid */}
          <div className="hidden sm:grid grid-cols-7 gap-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase pb-4 tracking-[0.2em]">{d}</div>
            ))}
            {generateCalendar().map((day, i) => {
              const { status, title } = getDayInfo(day);
              const styles = {
                present: "bg-green-500 text-white border-green-200", 
                halfday: "bg-blue-500 text-white border-blue-200",
                absent: "bg-red-500 text-white border-red-200", 
                leave: "bg-amber-400 text-white border-amber-200",
                holiday: "bg-indigo-600 text-white border-indigo-200", 
                weekend: "bg-slate-50 text-slate-300 border-slate-100", 
                none: "bg-white text-slate-100 border-slate-50"
              };
              return (
                <div key={i} className={`min-h-[120px] rounded-[2.5rem] border-2 flex flex-col items-center justify-center p-4 transition-all hover:scale-105 ${day ? styles[status] : "opacity-0"}`}>
                  <span className="text-3xl font-black italic">{day}</span>
                  {day && title && <span className="text-[8px] font-black uppercase text-center mt-2 leading-tight tracking-tighter px-2">{title}</span>}
                </div>
              );
            })}
          </div>

          {/* Mobile Calendar List View */}
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
                    <div key={day} className="flex items-center justify-between p-5 rounded-3xl border bg-slate-50 border-slate-100">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-lg font-black italic shadow-sm">{day}</div>
                            <span className="text-[12px] font-black uppercase text-slate-800 tracking-tighter">{title || "Work Day"}</span>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${dotColor[status]} shadow-lg`}></div>
                    </div>
                );
             })}
          </div>
        </section>
      </div>

      {/* --- MODAL: ANNOUNCEMENT DETAIL --- */}
      {activeAnnouncement && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden relative animate-pop">
              <button onClick={() => setActiveAnnouncement(null)} className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all z-20 backdrop-blur-md border border-white/30"><X size={24}/></button>
              
              <div className="relative h-64 sm:h-80 bg-slate-900 overflow-hidden">
                 {activeAnnouncement.image ? (
                   <img src={activeAnnouncement.image} className="w-full h-full object-cover opacity-80" alt="notice" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-indigo-900 opacity-80">
                      <Megaphone size={80} className="text-white opacity-20" />
                   </div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent z-10"></div>
                 <div className="absolute bottom-8 left-10 right-10 z-10">
                    <div className={`inline-block px-4 py-1 rounded-full text-[9px] font-black uppercase border mb-4 shadow-sm ${getStatusBadge(activeAnnouncement.status)}`}>
                       {activeAnnouncement.status}
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-none tracking-tighter uppercase italic">{activeAnnouncement.title}</h2>
                 </div>
              </div>

              <div className="p-10 pt-4 sm:p-14 sm:pt-6">
                 <div className="flex items-center gap-3 mb-8 text-slate-400">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{activeAnnouncement.type}</span>
                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(activeAnnouncement.createdAt).toLocaleDateString('en-IN', {day:'2-digit', month:'long', year:'numeric'})}</span>
                 </div>
                 
                 <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 max-h-[250px] overflow-y-auto custom-scrollbar">
                    <p className="text-slate-600 text-lg sm:text-xl font-medium leading-relaxed">{activeAnnouncement.description}</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- MODAL: LEAVE BREAKDOWN --- */}
      {showLeaveBreakdown && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md transition-all">
          <div className="bg-white w-full max-w-md rounded-t-[3.5rem] sm:rounded-[3rem] p-10 animate-slide-up relative shadow-2xl">
            <button onClick={() => setShowLeaveBreakdown(false)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors cursor-pointer"><X size={28} /></button>
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Allocated Credits</span>
              <div className="text-[7rem] font-black italic leading-none my-4 tracking-tighter text-slate-900">
                {leaveBalance.casual + leaveBalance.sick}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-red-50 p-6 rounded-[2.5rem] border border-red-100 shadow-sm transition-transform hover:scale-105">
                  <div className="text-3xl font-black text-red-600 italic">{leaveBalance.casual}</div>
                  <div className="text-[9px] uppercase font-black text-red-400 tracking-widest mt-1">Casual Leave</div>
                </div>
                <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 shadow-sm transition-transform hover:scale-105">
                  <div className="text-3xl font-black text-blue-600 italic">{leaveBalance.sick}</div>
                  <div className="text-[9px] uppercase font-black text-blue-400 tracking-widest mt-1">Sick Leave</div>
                </div>
              </div>
              <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">*Calculated based on active tenure</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSummary;