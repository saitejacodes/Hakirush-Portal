import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import {
  BriefcaseBusiness,
  Building,
  Users,
  Activity,
  Clock,
  UserMinus,
  Calendar,
  AlertCircle,
  TrendingUp,
  LayoutDashboard,
  Download,
  Cake,
  Bell
} from "lucide-react";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

/* ================= CONFIGURATION ================= */
const PIE_COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#ec4899", "#f97316", "#3b82f6", "#14b8a6", "#8b5cf6", "#ef4444", "#e11d48", "#fbbf24"];

const SEMANTIC_COLORS = {
  Approved: "#10b981",
  Pending: "#f59e0b",
  Rejected: "#ef4444",
};

/* ================= REUSABLE COMPONENTS (RESPONSIVE) ================= */
const StatCard = ({ icon: Icon, label, value, colorClass = "text-red-600" }) => (
  <div className="bg-gradient-to-br from-white via-slate-50 to-red-50 p-4 sm:p-7 rounded-2xl sm:rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-row sm:flex-col items-center justify-between sm:justify-center h-auto sm:h-[180px] transition-all hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 group w-full relative overflow-hidden">
    <div className="absolute right-2 bottom-2 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
      {Icon && <Icon size={48} />}
    </div>
    <div className="text-2xl sm:text-5xl font-black text-slate-900 italic tracking-tighter leading-none group-hover:text-red-600 transition-colors order-2 sm:order-1 z-10">
      {value ?? 0}
    </div>
    <div className="flex flex-row sm:flex-col items-center gap-2 sm:gap-2 order-1 sm:order-2 sm:mt-4 z-10">
      <div className={`p-2 rounded-xl bg-gradient-to-br from-slate-50 via-white to-slate-100 ${colorClass} group-hover:scale-110 transition-transform`}>
        {Icon && <Icon size={18} className="sm:w-[20px] w-[18px]" />}
      </div>
      <span className="text-[10px] sm:text-[12px] font-extrabold uppercase text-slate-400 tracking-[0.2em] sm:tracking-[0.3em] group-hover:text-red-600 transition-colors text-left sm:text-center max-w-[80px] sm:max-w-none">
        {label}
      </span>
    </div>
  </div>
);

const SectionCard = ({ title, children, subtitle }) => (
  <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[3rem] shadow-xl border border-slate-50 flex flex-col hover:shadow-2xl transition-all w-full min-w-0">
    <div className="mb-3 sm:mb-4 shrink-0 flex flex-wrap items-center gap-2">
      <h3 className="text-base sm:text-xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">{title}</h3>
      {subtitle && (
        <span className="px-2 py-1 rounded-full bg-slate-50 text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5 border border-slate-200">
          {subtitle}
        </span>
      )}
    </div>
    <div className="w-full min-h-[180px] sm:min-h-[300px] flex items-center justify-center">{children}</div>
  </div>
);

/* ================= MAIN DASHBOARD ================= */

const AdminSummary = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [attSummary, setAttSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [domReady, setDomReady] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const unseenCount = notifications.filter(n => !n.seen).length;

  useEffect(() => {
    setDomReady(true);
    const fetchAllData = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        };
        const [dashRes, attRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard/summary`, config),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/admin/summary`, config)
        ]);
        setSummary(dashRes.data);
        setAttSummary(attRes.data);
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || user.role !== "admin") return;
      try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications`, config);
        if (res.data?.success) setNotifications(res.data.notifications);
      } catch (err) {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const navigate = useNavigate();

  const handleNotificationClick = async (notif) => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/${notif._id}/seen`, {}, config);
      setNotifications(notifications => notifications.map(n => n._id === notif._id ? { ...n, seen: true } : n));
      if (notif.link) navigate(notif.link);
    } catch {}
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
    const cleanPath = imagePath.replace(/^\//, "");
    return `${baseUrl}/${cleanPath}`;
  };

  const handleExport = () => {
    if (!summary || !attSummary) return;
    setIsExporting(true);
    const reportData = [
      ["TODAY'S OPERATIONAL SUMMARY REPORT"],
      [`Generated on: ${new Date().toLocaleDateString()}`],
      ["Total Employees", summary.totalEmployees],
      ["Total Departments", summary.totalDepartments],
      ["Total Clients", summary.totalClients],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + reportData.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 1000);
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin" />
      <p className="italic font-black text-slate-400 uppercase tracking-[0.3em] text-[9px]">Syncing Enterprise Data</p>
    </div>
  );

  const chartData = {
    plans: [
      { name: "Annual", value: summary?.totalAnnual || 0 },
      { name: "Quarterly", value: summary?.totalQuarterly || 0 },
    ],
    leaves: [
      { name: "Pending", value: summary?.leaveSummary?.pending || 0 },
      { name: "Approved", value: summary?.leaveSummary?.approved || 0 },
      { name: "Rejected", value: summary?.leaveSummary?.rejected || 0 },
    ],
    depts: summary?.departmentSummary?.map((d) => ({ name: d.department, value: d.employees })) || [],
    sponsors: Object.entries(summary?.sponsorSummary?.collaborationSummary || {}).map(([name, value]) => ({ name, value })),
    stalls: Object.entries(summary?.stallSummary?.typeSummary || {}).map(([name, value]) => ({ name, value })),
  };

  const todayBirthdays = summary?.birthdaySummary?.today || [];
  const upcomingBirthdays = summary?.birthdaySummary?.upcoming || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-100 text-slate-900 pb-20 selection:bg-red-100">
      <div className="max-w-[1440px] mx-auto p-4 sm:p-8 space-y-8 sm:space-y-12">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6 pt-2 sm:pt-4 w-full">
          <div className="space-y-2 sm:space-y-4">
            <div className="flex items-center gap-2">
              <LayoutDashboard size={16} className="text-red-600" />
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Admin Control</p>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-[0.9]">
              Dashboard<br/><span className="text-red-600">Summary</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full md:w-auto">
            {/* NOTIFICATION BELL */}
            <div className="relative">
              <button
                className="relative p-3 sm:p-4 bg-white rounded-2xl sm:rounded-[1.5rem] shadow-md border border-slate-100 hover:shadow-lg transition-all group"
                onClick={() => setShowNotif((v) => !v)}
              >
                <Bell size={20} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                {unseenCount > 0 && (
                  <span className="absolute top-2 right-2 sm:top-3 sm:right-3 w-2.5 h-2.5 bg-red-600 border-2 border-white rounded-full animate-bounce"></span>
                )}
              </button>
              {showNotif && (
                <div className="absolute right-0 sm:right-0 mt-2 w-[85vw] sm:w-[350px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border z-50 overflow-hidden animate-pop">
                  <div className="p-4 border-b flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notifications</span>
                    <button className="text-xs text-slate-400 hover:text-red-500 font-black" onClick={() => setShowNotif(false)}>Close</button>
                  </div>
                  <div className="max-h-[300px] sm:max-h-[350px] overflow-y-auto divide-y">
                    {notifications.length === 0 && (
                      <div className="p-6 text-center text-slate-400 text-xs">No notifications</div>
                    )}
                    {notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`p-4 cursor-pointer hover:bg-red-50 ${!notif.seen ? "bg-red-50/50" : ""}`}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div className="font-bold text-[13px] text-slate-800 mb-1">{notif.message}</div>
                        <div className="text-[10px] text-slate-400">{new Date(notif.createdAt).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DATE & STATUS CARD */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-[2rem] shadow-md border border-slate-100 flex items-center gap-3 sm:gap-8 flex-1 sm:flex-none mt-2 sm:mt-0">
              <div className="flex items-center gap-2 sm:gap-3 pr-4 sm:pr-6 border-r border-slate-100">
                <Calendar className="text-red-600" size={18} />
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Date</p>
                  <p className="text-[11px] sm:text-sm font-black uppercase whitespace-nowrap">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${attSummary?.isHoliday ? 'bg-red-500' : 'bg-emerald-500'} border border-white`} />
                <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest truncate max-w-[80px] sm:max-w-none">
                    {attSummary?.isHoliday ? attSummary.holidayName : 'Live'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* TOP STATS - Adjusts to 2 cols on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full">
          <StatCard icon={Activity} label="Active Today" value={attSummary?.activeToday} colorClass="text-emerald-500" />
          <StatCard icon={UserMinus} label="Staff on Leave" value={attSummary?.onLeaveToday} colorClass="text-blue-500" />
          <StatCard icon={AlertCircle} label="Absent Count" value={attSummary?.absentToday} colorClass="text-red-600" />
        </div>

        {/* WORKFORCE OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 w-full">
          <div className="bg-gradient-to-br from-white via-slate-50 to-emerald-50 p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] flex justify-between items-center group relative overflow-hidden shadow-2xl shadow-slate-200 border border-emerald-100">
            <TrendingUp className="absolute -right-4 -bottom-4 text-emerald-100 opacity-20" size={100} />
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase opacity-50 tracking-widest mb-1">Total Workforce</p>
              <p className="text-5xl sm:text-6xl font-black italic text-slate-900 tracking-tighter leading-none">{summary?.totalEmployees}</p>
            </div>
            <Users className="text-emerald-200 group-hover:text-emerald-500 relative z-10 transition-colors" size={40} />
          </div>

          <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50 p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] border border-blue-100 flex justify-between items-center shadow-xl group hover:border-blue-200 transition-colors">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Departments</p>
              <p className="text-5xl sm:text-6xl font-black italic tracking-tighter text-slate-900 leading-none">{summary?.totalDepartments}</p>
            </div>
            <Building className="text-blue-200 group-hover:text-blue-500 transition-colors" size={40} />
          </div>

          <div className="bg-gradient-to-br from-white via-slate-50 to-orange-50 p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] border border-orange-100 flex justify-between items-center shadow-xl group hover:border-orange-200 transition-colors">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Clients</p>
              <p className="text-5xl sm:text-6xl font-black italic tracking-tighter text-slate-900 leading-none">{summary?.totalClients}</p>
            </div>
            <BriefcaseBusiness className="text-orange-200 group-hover:text-orange-500 transition-colors" size={40} />
          </div>
        </div>

        {/* BIRTHDAY SECTION */}
        <div className="bg-gradient-to-br from-white via-pink-50 to-pink-100 p-4 sm:p-8 rounded-2xl sm:rounded-[3rem] shadow-xl border border-pink-100 space-y-4 sm:space-y-6 relative overflow-hidden w-full">
          <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5">
            <Cake size={60} className="sm:size-[100px]" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 relative z-10">
            <Cake className="text-pink-500" size={18} />
            <h3 className="text-lg sm:text-2xl font-black uppercase italic tracking-tighter text-slate-900">Birthday Spotlight</h3>
          </div>
          <div className="flex flex-col gap-3 sm:gap-6 relative z-10">
            {todayBirthdays.length > 0 && (
              <div>
                <div className="text-pink-500 font-black text-[10px] mb-3 uppercase tracking-widest">Today</div>
                <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-3">
                  {todayBirthdays.map(emp => (
                    <div key={emp._id} className="flex items-center gap-3 sm:gap-4 bg-gradient-to-br from-pink-500 to-rose-400 p-2 sm:p-4 rounded-2xl sm:rounded-3xl shadow-md w-full sm:w-auto">
                      <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white/50 shrink-0">
                        <img src={getImageUrl(emp.userId?.profileImage || emp.profileImage)} className="w-full h-full object-cover" alt="profile" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm sm:text-lg font-black italic text-white truncate uppercase tracking-tighter leading-none">
                          {emp.userId?.name || emp.name}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-black text-pink-100 uppercase italic tracking-widest mt-1">HBD! 🎉</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {upcomingBirthdays.length > 0 && (
              <div>
                <div className="text-pink-400 font-black text-[10px] mb-3 uppercase tracking-widest">Upcoming</div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                  {upcomingBirthdays.map(emp => {
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
                      <div key={emp._id} className="flex items-center gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-2xl border-2 border-pink-50 hover:border-pink-100 transition-all w-full sm:w-auto">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-slate-100 grayscale-[0.5] shrink-0">
                          <img src={getImageUrl(emp.userId?.profileImage || emp.profileImage)} className="w-full h-full object-cover opacity-70" alt="profile" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm font-black italic text-slate-500 uppercase tracking-tighter leading-none truncate">
                            {emp.userId?.name || emp.name}
                          </span>
                          <span className="text-[8px] sm:text-[9px] font-bold text-pink-400 uppercase mt-1 italic">
                            {emp.dob ? new Date(emp.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                            {daysLeft !== null && (
                              <span className="ml-2 text-[8px] sm:text-[9px] text-rose-400 font-extrabold">[
                                {daysLeft === 1 ? 'in 1 day' : `in ${daysLeft} days`}]
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-10 w-full">
          {[
            { title: "Client Mix", sub: "Plan Distribution", data: chartData.plans },
            { title: "Sponsors", sub: "Collaborations", data: chartData.sponsors, offset: 3 },
            { title: "Stalls", sub: "Categories", data: chartData.stalls, offset: 6 },
            { title: "Dept Pulse", sub: "Staffing", data: chartData.depts, offset: 9 },
            { title: "Leave Trends", sub: "Status", data: chartData.leaves, isSemantic: true },
          ].map((chart, idx) => (
            <SectionCard key={idx} title={chart.title} subtitle={chart.sub}>
              {domReady && (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={chart.data} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" paddingAngle={6} dataKey="value">
                      {chart.data.map((e, i) => (
                        <Cell 
                          key={i} 
                          fill={chart.isSemantic ? (SEMANTIC_COLORS[e.name] || PIE_COLORS[i % PIE_COLORS.length]) : PIE_COLORS[(i + (chart.offset || 0)) % PIE_COLORS.length]} 
                          strokeWidth={0} 
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', fontWeight: '800', fontSize: '12px' }} />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: '900', paddingTop: '15px', textTransform: 'uppercase' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </SectionCard>
          ))}

          {/* REPORTING CARD */}
          <div className="bg-gradient-to-br from-red-600 via-pink-500 to-rose-500 rounded-2xl sm:rounded-[3rem] p-5 sm:p-10 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[180px] sm:min-h-[250px] w-full border border-rose-200">
            <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
              <Download size={120} />
            </div>
            <div className="space-y-2 sm:space-y-4 z-10">
              <h4 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter leading-none">Global<br/>Reporting</h4>
              <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] opacity-90">Strategic organizational intelligence.</p>
            </div>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="mt-4 sm:mt-6 bg-white text-red-600 w-full py-3 sm:py-4 rounded-full text-[10px] sm:text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 transition-all hover:bg-slate-900 hover:text-white active:scale-95 z-10"
            >
              {isExporting ? "Downloading..." : <><Download size={16} /> Export CSV Report</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSummary;