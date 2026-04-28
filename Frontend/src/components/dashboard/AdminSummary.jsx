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

/* ================= REUSABLE COMPONENTS ================= */
const StatCard = ({ icon: Icon, label, value, colorClass = "text-red-600" }) => (
  <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100 flex flex-col items-center justify-center h-[180px] transition-all hover:shadow-2xl hover:-translate-y-2 hover:border-red-200 group">

    {/* Number (Centered) */}
    <div className="text-5xl font-black text-slate-900 italic tracking-tighter leading-none group-hover:text-red-600 transition-colors">
      {value ?? 0}
    </div>

    {/* Icon + Label (Below) */}
    <div className="flex flex-col items-center mt-4 gap-2">
      <div className={`p-2 rounded-xl bg-gradient-to-br from-slate-50 via-white to-slate-100 ${colorClass} group-hover:scale-110 transition-transform`}>
        {Icon && <Icon size={18} className="drop-shadow-sm" />}
      </div>

      <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-[0.3em] group-hover:text-red-600 transition-colors text-center">
        {label}
      </span>
    </div>

  </div>
);

const SectionCard = ({ title, children, subtitle }) => (
  <div className="bg-white p-6 sm:p-8 rounded-[3rem] shadow-xl border border-slate-50 flex flex-col hover:shadow-2xl transition-all">
    <div className="mb-4 shrink-0 flex items-center gap-2">
      <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">{title}</h3>
      {subtitle && (
        <span className="ml-2 px-2 py-1 rounded-full bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 border border-slate-200">
          {subtitle}
        </span>
      )}
    </div>
    <div className="w-full min-h-[300px] flex items-center justify-center">{children}</div>
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

  // Fetch notifications for admin
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || user.role !== "admin") return;
      try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications`, config);
        if (res.data?.success) setNotifications(res.data.notifications);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchNotifications();
    // Optionally poll every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const navigate = useNavigate();

  // Mark notification as seen and navigate
  const handleNotificationClick = async (notif) => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/${notif._id}/seen`, {}, config);
      setNotifications(notifications => notifications.map(n => n._id === notif._id ? { ...n, seen: true } : n));
      // Navigate to respective page if link exists
      if (notif.link) {
        navigate(notif.link);
      }
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
      <div className="w-12 h-12 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin" />
      <p className="italic font-black text-slate-400 uppercase tracking-[0.5em] text-[10px]">Syncing Enterprise Data</p>
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
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 text-slate-900 pb-20 selection:bg-red-100">
      <div className="max-w-[1440px] mx-auto p-4 sm:p-8 space-y-12">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pt-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <LayoutDashboard size={18} className="text-red-600" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Admin Control</p>
            </div>
            <h1 className="text-2xl sm:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-[0.9]">
              Dashboard<br/><span className="text-red-600">Summary</span>
            </h1>
          </div>

          <div className="flex items-center gap-4"> {/* Wrapper for Header Actions */}
            {/* NOTIFICATION BELL */}
            <div className="relative">
              <button
                className="relative p-4 bg-white rounded-[1.5rem] shadow-md border border-slate-100 hover:shadow-lg transition-all group cursor-pointer"
                onClick={() => setShowNotif((v) => !v)}
              >
                <Bell size={22} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                {unseenCount > 0 && (
                  <span className="absolute top-3 right-3 w-3 h-3 bg-red-600 border-2 border-white rounded-full animate-bounce"></span>
                )}
              </button>
              {showNotif && (
                <div className="absolute right-0 mt-2 w-[350px] bg-white rounded-3xl shadow-2xl border z-50 overflow-hidden animate-pop">
                  <div className="p-4 border-b flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notifications</span>
                    <button className="text-xs text-slate-400 hover:text-red-500 font-black" onClick={() => setShowNotif(false)}>Close</button>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto divide-y">
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
                        {!notif.seen && <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[9px] font-black uppercase">New</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DATE & STATUS CARD */}
            <div className="bg-white p-5 rounded-[2rem] shadow-md border border-slate-100 flex items-center gap-8">
              <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
                <Calendar className="text-red-600" size={22} />
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                  <p className="text-sm font-black uppercase">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full animate-pulse ${attSummary?.isHoliday ? 'bg-red-500' : 'bg-emerald-500'} border border-white`} />
                <p className="text-[11px] font-black uppercase tracking-widest">{attSummary?.isHoliday ? attSummary.holidayName : 'Live Status'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* TOP STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Activity} label="Active Today" value={attSummary?.activeToday} colorClass="text-emerald-500" />
          <StatCard icon={Clock} label="Late Arrivals" value={attSummary?.lateLogins} colorClass="text-amber-500" />
          <StatCard icon={UserMinus} label="Staff on Leave" value={attSummary?.onLeaveToday} colorClass="text-blue-500" />
          <StatCard icon={AlertCircle} label="Absent Count" value={attSummary?.absentToday} colorClass="text-red-600" />
        </div>

        {/* WORKFORCE OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[3rem] flex justify-between items-center group relative overflow-hidden shadow-2xl shadow-slate-200">
            <TrendingUp className="absolute -right-4 -bottom-4 text-slate-100" size={120} />
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase opacity-50 tracking-widest mb-1">Total Workforce</p>
              <p className="text-6xl font-black italic text-slate-900 tracking-tighter leading-none">{summary?.totalEmployees}</p>
            </div>
            <Users className="text-slate-200 group-hover:text-red-500 relative z-10" size={48} />
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 flex justify-between items-center shadow-sm group hover:border-red-100 transition-colors">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Departments</p>
              <p className="text-6xl font-black italic tracking-tighter text-slate-900 leading-none">{summary?.totalDepartments}</p>
            </div>
            <Building className="text-slate-200 group-hover:text-red-500 transition-colors" size={48} />
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 flex justify-between items-center shadow-sm group hover:border-red-100 transition-colors">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Clients</p>
              <p className="text-6xl font-black italic tracking-tighter text-slate-900 leading-none">{summary?.totalClients}</p>
            </div>
            <BriefcaseBusiness className="text-slate-200 group-hover:text-red-500 transition-colors" size={48} />
          </div>
        </div>

        {/* BIRTHDAY SECTION */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-pink-100 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Cake size={120} />
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <Cake className="text-pink-500" size={28} />
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Birthday Spotlight</h3>
          </div>
          <div className="flex flex-col gap-3 relative z-10">
            {todayBirthdays.length > 0 && (
              <div>
                <div className="text-pink-500 font-black text-xs mb-2 uppercase tracking-widest">Today</div>
                <div className="flex flex-wrap gap-4">
                  {todayBirthdays.map(emp => (
                    <div key={emp._id} className="flex items-center gap-4 bg-gradient-to-br from-pink-500 to-rose-400 p-4 rounded-3xl shadow-md">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/50 shadow-sm">
                        <img src={getImageUrl(emp.userId?.profileImage || emp.profileImage)} className="w-full h-full object-cover" alt="profile" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-black italic text-white truncate uppercase tracking-tighter leading-none">
                          {emp.userId?.name || emp.name}
                        </span>
                        <span className="text-xs font-black text-pink-100 uppercase italic tracking-widest mt-1 drop-shadow-sm">HBD! Today 🎉</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {upcomingBirthdays.length > 0 && (
              <div>
                <div className="text-pink-400 font-black text-xs mb-2 mt-4 uppercase tracking-widest">Upcoming</div>
                <div className="flex flex-wrap gap-4">
                  {upcomingBirthdays.map(emp => (
                    <div key={emp._id} className="flex items-center gap-4 bg-white p-4 rounded-3xl border-2 border-pink-50 hover:border-pink-100 transition-all">
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-100 grayscale-[0.5] hover:grayscale-0 transition-all">
                        <img src={getImageUrl(emp.userId?.profileImage || emp.profileImage)} className="w-full h-full object-cover opacity-70 hover:opacity-100" alt="profile" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-black italic text-slate-500 hover:text-slate-800 transition-colors truncate uppercase tracking-tighter leading-none">
                          {emp.userId?.name || emp.name}
                        </span>
                        <span className="text-xs font-bold text-pink-400 uppercase mt-0.5 italic">
                          {emp.dob ? new Date(emp.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!todayBirthdays.length && !upcomingBirthdays.length && (
              <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-slate-400 italic font-medium">No birthdays to celebrate this week.</p>
              </div>
            )}
          </div>
        </div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <SectionCard title="Client Mix" subtitle="Plan Distribution">
            {domReady && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData.plans} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" paddingAngle={6} dataKey="value">
                    {chartData.plans.map((e, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Sponsors" subtitle="Collaboration Types">
            {domReady && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData.sponsors} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" paddingAngle={6} dataKey="value">
                    {chartData.sponsors.map((e, i) => (
                      <Cell key={i} fill={PIE_COLORS[(i + 3) % PIE_COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Stalls" subtitle="Category Diversity">
            {domReady && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData.stalls} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" paddingAngle={6} dataKey="value">
                    {chartData.stalls.map((e, i) => (
                      <Cell key={i} fill={PIE_COLORS[(i + 6) % PIE_COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Dept Pulse" subtitle="Staffing">
            {domReady && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData.depts} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" paddingAngle={6} dataKey="value">
                    {chartData.depts.map((e, i) => (
                      <Cell key={i} fill={PIE_COLORS[(i + 9) % PIE_COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Leave Trends" subtitle="Application Status">
            {domReady && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData.leaves} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" paddingAngle={6} dataKey="value">
                    {chartData.leaves.map((e, i) => (
                      <Cell key={i} fill={SEMANTIC_COLORS[e.name] || PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <div className="bg-red-600 rounded-[3rem] p-10 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="space-y-4">
              <h4 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Global<br/>Reporting</h4>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-90">Strategic organizational intelligence.</p>
            </div>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="mt-6 bg-white text-red-600 w-full py-4 rounded-full text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-slate-900 hover:text-white"
            >
              {isExporting ? "Downloading..." : <><Download size={18} /> Export CSV Report</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSummary;