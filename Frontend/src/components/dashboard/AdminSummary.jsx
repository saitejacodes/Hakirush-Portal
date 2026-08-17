import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import {
  BriefcaseBusiness,
  Building,
  Users,
  Activity,
  UserMinus,
  Calendar,
  AlertCircle,
  TrendingUp,
  Download,
  Cake,
  Bell,
  X,
  XCircle,
  Clock,
} from "lucide-react";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";

/* ================= DESIGN TOKENS ================= */
/* One palette, named once, used everywhere — cards, charts, and
   accents all pull from this instead of picking their own hex values. */

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#C6A15B";
const HAIRLINE = "#E7DFD2";
const CREAM = "#FBF8F3";
const SAGE = "#3F5B54";
const SLATE = "#4A5A6B";

const PIE_COLORS = [GARNET, GOLD, SAGE, SLATE, "#9C3A4E", "#D8BC7C", "#2E4640", "#8E7A66"];

const SEMANTIC_COLORS = {
  Approved: SAGE,
  Pending: GOLD,
  Rejected: GARNET,
};

const displayFont = { fontFamily: "'Playfair Display', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

const GRAIN_URI =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='140'%20height='140'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23n)'%20opacity='0.5'/%3E%3C/svg%3E";

const CornerTicks = ({ color = GOLD }) => (
  <>
    <span
      className="pointer-events-none absolute top-3 left-3 h-2.5 w-2.5 border-t border-l opacity-70 sm:top-4 sm:left-4"
      style={{ borderColor: color }}
    />
    <span
      className="pointer-events-none absolute top-3 right-3 h-2.5 w-2.5 border-t border-r opacity-70 sm:top-4 sm:right-4"
      style={{ borderColor: color }}
    />
  </>
);

const StatCard = ({ icon: Icon, label, value, accent = GARNET }) => (
  <div
    className="group relative flex w-full flex-row items-center justify-between overflow-hidden rounded-2xl border border-[#E7DFD2] bg-white/70 p-4 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_16px_32px_-16px_rgba(28,26,23,0.14)] backdrop-blur-md transition-all duration-300 hover:-translate-y-[3px] hover:border-[#D9C79A] hover:shadow-[0_1px_2px_rgba(28,26,23,0.05),0_24px_40px_-16px_rgba(28,26,23,0.18)] sm:h-[172px] sm:flex-col sm:items-center sm:justify-center sm:rounded-[1.75rem] sm:p-7"
    style={bodyFont}
  >
    {/* top hairline accent, brightens on hover */}
    <span
      className="pointer-events-none absolute top-0 left-1/2 h-px w-10 -translate-x-1/2 opacity-40 transition-opacity duration-300 group-hover:opacity-100"
      style={{ backgroundColor: accent }}
    />
    <div className="pointer-events-none absolute -right-4 -bottom-4 opacity-[0.045]">
      {Icon && <Icon size={64} color={INK} strokeWidth={1.25} />}
    </div>
    <div
      className="order-2 z-10 text-2xl leading-none tracking-tight tabular-nums text-[#1C1A17] sm:order-1 sm:text-[2.75rem]"
      style={{ ...displayFont, fontWeight: 700 }}
    >
      {value ?? 0}
    </div>
    <div className="z-10 order-1 flex flex-row items-center gap-2.5 sm:order-2 sm:mt-4 sm:flex-col sm:gap-3">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-300"
        style={{ borderColor: `${accent}40`, color: accent }}
      >
        {Icon && <Icon size={15} strokeWidth={1.75} />}
      </div>
      <span className="max-w-[84px] text-left text-[9.5px] font-semibold uppercase tracking-[0.24em] text-[#8A8378] sm:max-w-none sm:text-center sm:text-[10.5px]">
        {label}
      </span>
    </div>
  </div>
);

const SectionCard = ({ title, children, subtitle }) => (
  <div className="relative flex w-full min-w-0 flex-col rounded-2xl border border-[#E7DFD2] bg-white/70 p-4 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_16px_32px_-16px_rgba(28,26,23,0.12)] backdrop-blur-md transition-all duration-300 hover:border-[#D9C79A] hover:shadow-[0_1px_2px_rgba(28,26,23,0.05),0_24px_40px_-16px_rgba(28,26,23,0.16)] sm:rounded-[2rem] sm:p-8">
    <div className="mb-3 flex shrink-0 flex-wrap items-baseline gap-2.5 sm:mb-5">
      <h3
        className="text-base leading-none tracking-tight text-[#1C1A17] sm:text-xl"
        style={{ ...displayFont, fontWeight: 700 }}
      >
        {title}
      </h3>
      {subtitle && (
        <span
          className="mt-0.5 border-t pt-1 text-[8px] font-semibold uppercase tracking-[0.22em] text-[#B4ADA0] sm:text-[9px]"
          style={{ borderColor: HAIRLINE }}
        >
          {subtitle}
        </span>
      )}
    </div>
    <div className="flex min-h-[180px] w-full items-center justify-center sm:min-h-[280px]">
      {children}
    </div>
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
  const unseenCount = notifications.filter((n) => !n.seen).length;

  useEffect(() => {
    setDomReady(true);
    let mounted = true;
    const config = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };

    const fetchAllData = async () => {
      try {
        const [dashRes, attRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard/summary`, config),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/admin/summary`, config),
        ]);
        if (!mounted) return;
        setSummary(dashRes.data);
        setAttSummary(attRes.data);
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // initial fetch
    fetchAllData();

    // poll attendance summary so top cards update when admin marks attendance elsewhere
    const attInterval = setInterval(async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/admin/summary`, config);
        if (mounted && res?.data) setAttSummary(res.data);
      } catch (err) {
        // silent
      }
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(attInterval);
    };
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
      setNotifications((notifications) =>
        notifications.map((n) => (n._id === notif._id ? { ...n, seen: true } : n))
      );

      const targetPath = notif?.data?.link || notif?.link ||
        (notif?.type === "leave-request"
          ? "/admin-dashboard/leaves"
          : notif?.type === "attendance-request"
            ? "/admin-dashboard/attendance-requests"
            : null);

      if (targetPath) {
        setShowNotif(false);
        navigate(targetPath);
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

    const csvContent =
      "data:text/csv;charset=utf-8," + reportData.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 1000);
  };

  if (loading)
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-[#FBF8F3]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E7DFD2] border-t-[#7A2233]" />
        <p
          className="text-[9px] font-semibold uppercase tracking-[0.35em] text-[#8A8378]"
          style={bodyFont}
        >
          Syncing Enterprise Data
        </p>
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
    sponsors: Object.entries(summary?.sponsorSummary?.collaborationSummary || {}).map(([name, value]) => ({
      name,
      value,
    })),
    stalls: Object.entries(summary?.stallSummary?.typeSummary || {}).map(([name, value]) => ({ name, value })),
  };

  const todayBirthdays = summary?.birthdaySummary?.today || [];
  const upcomingBirthdays = summary?.birthdaySummary?.upcoming || [];

  return (
    <div
      className="relative min-h-screen bg-gradient-to-br from-[#FBF8F3] via-white to-[#F3EDE0] pb-20 text-[#1C1A17] selection:bg-[#7A2233]/10"
      style={bodyFont}
    >
      {/* soft ambient glow behind the masthead — replaces the old pink/red
          gradient with something drawn from the actual palette */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[420px] opacity-70"
        style={{
          background:
            "radial-gradient(60% 60% at 15% 0%, rgba(198,161,91,0.10), transparent 70%), radial-gradient(50% 50% at 100% 0%, rgba(122,34,51,0.06), transparent 70%)",
        }}
      />
      {/* faint paper grain over the existing gradient — the one
          textural signature carried through the whole page */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] mix-blend-multiply"
        style={{ backgroundImage: `url("${GRAIN_URI}")` }}
      />
      {/* masthead rule at the very top of the page */}
      <div
        className="relative z-10 h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, ${GARNET}, ${GOLD} 45%, ${GARNET})` }}
      />

      <div className="relative z-10 mx-auto max-w-[1440px] space-y-8 p-4 sm:space-y-14 sm:p-8">
        {/* HEADER */}
        <header className="relative flex w-full flex-col items-start gap-4 pt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pt-6">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px w-6" style={{ backgroundColor: GOLD }} />
              <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-[#C6A15B] sm:text-[10px]">
                Admin Control
              </p>
            </div>
            <h1
              className="text-3xl leading-[0.95] tracking-tight text-[#1C1A17] sm:text-5xl"
              style={{ ...displayFont, fontWeight: 700 }}
            >
              Dashboard <span className="italic text-[#7A2233]">Summary</span>
            </h1>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-4">
            {/* NOTIFICATION BELL */}
            <div className="relative">
              <button
                className="group relative rounded-2xl border border-[#E7DFD2] bg-white/80 p-3 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_8px_20px_-10px_rgba(28,26,23,0.12)] backdrop-blur-md transition-all duration-300 hover:border-[#D9C79A] hover:shadow-[0_1px_2px_rgba(28,26,23,0.05),0_14px_28px_-10px_rgba(28,26,23,0.16)] sm:p-4 cursor-pointer"
                onClick={() => setShowNotif((v) => !v)}
              >
                <Bell size={19} strokeWidth={1.75} className="text-[#8A8378] transition-colors group-hover:text-[#7A2233]" />
                {unseenCount > 0 && (
                  <span
                    className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full border border-white sm:top-3.5 sm:right-3.5"
                    style={{ backgroundColor: GARNET }}
                  ></span>
                )}
              </button>
              {showNotif && (
                <>
                  {/* backdrop: closes the panel on outside tap, mobile only */}
                  <div
                    className="fixed inset-0 z-40 sm:hidden"
                    onClick={() => setShowNotif(false)}
                  />
                  <div
                    className="fixed left-4 right-4 top-[4.5rem] z-50 overflow-hidden rounded-2xl border border-[#E7DFD2] bg-white/95 shadow-[0_2px_8px_rgba(28,26,23,0.06),0_30px_60px_-15px_rgba(28,26,23,0.22)] backdrop-blur-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[350px] sm:rounded-3xl"
                  >
                    <div
                      className="flex items-center justify-between border-b p-4"
                      style={{ borderColor: HAIRLINE }}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8A8378]">
                        Notifications
                      </span>
                      <button
                        className="text-xs font-semibold text-[#8A8378] transition-colors hover:text-[#7A2233] cursor-pointer"
                        onClick={() => setShowNotif(false)}
                      >
                       <XCircle size={16} />
                      </button>
                    </div>
                    <div className="max-h-[60vh] divide-y overflow-y-auto sm:max-h-[350px]" style={{ borderColor: HAIRLINE }}>
                      {notifications.length === 0 && (
                        <div className="p-6 text-center text-xs text-[#B4ADA0]">No notifications</div>
                      )}
                      {notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-[#FBF8F3] ${!notif.seen ? "bg-[#FBF8F3]/60" : ""}`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          {!notif.seen && (
                            <span
                              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: GOLD }}
                            />
                          )}
                          <div>
                            <div className="mb-1 text-[13px] font-semibold leading-snug text-[#1C1A17]">
                              {notif.message}
                            </div>
                            <div className="text-[10px] text-[#B4ADA0]">
                              {new Date(notif.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* DATE & STATUS CARD */}
            <div className="mt-2 flex flex-1 items-center gap-3 rounded-2xl border border-[#E7DFD2] bg-white/80 p-3 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_8px_20px_-10px_rgba(28,26,23,0.12)] backdrop-blur-md sm:mt-0 sm:flex-none sm:gap-8 sm:rounded-[1.5rem] sm:p-4">
              <div className="flex items-center gap-2 border-r pr-4 sm:gap-3 sm:pr-6" style={{ borderColor: HAIRLINE }}>
                <Calendar size={17} strokeWidth={1.75} style={{ color: GARNET }} />
                <div>
                  <p className="mb-1 text-[8px] font-semibold uppercase tracking-widest leading-none text-[#B4ADA0]">
                    Date
                  </p>
                  <p className="whitespace-nowrap text-[11px] font-semibold text-[#1C1A17] sm:text-sm">
                    {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full border border-white"
                  style={{ backgroundColor: attSummary?.isHoliday ? GARNET : SAGE }}
                />
                <p className="max-w-[80px] truncate text-[10px] font-semibold uppercase tracking-widest text-[#1C1A17] sm:max-w-none sm:text-[11px]">
                  {attSummary?.isHoliday ? attSummary.holidayName : "Live"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* TOP STATS */}
        <div className="grid w-full grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <StatCard icon={Activity} label="Present Today" value={attSummary?.presentToday ?? attSummary?.activeToday} accent={SAGE} />
          <StatCard icon={Clock} label="Half Day" value={attSummary?.halfDayToday} accent={GOLD} />
          <StatCard icon={UserMinus} label="Leave" value={attSummary?.onLeaveToday} accent={SLATE} />
          <StatCard icon={AlertCircle} label="Absent" value={attSummary?.absentToday} accent={GARNET} />
        </div>

        {/* WORKFORCE OVERVIEW */}
        <div className="grid w-full grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          <div className="group relative flex items-center justify-between overflow-hidden rounded-[1.75rem] border border-[#E7DFD2] bg-white/70 p-6 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_20px_40px_-18px_rgba(28,26,23,0.14)] backdrop-blur-md transition-all duration-300 hover:border-[#D9C79A] sm:p-8">
            <span
              className="pointer-events-none absolute top-0 left-8 h-px w-12 opacity-50"
              style={{ backgroundColor: SAGE }}
            />
            <TrendingUp className="pointer-events-none absolute -right-4 -bottom-4 opacity-[0.045]" size={100} color={INK} strokeWidth={1.25} />
            <div className="relative z-10">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#B4ADA0]">
                Total Workforce
              </p>
              <p className="text-5xl leading-none tracking-tight tabular-nums text-[#1C1A17] sm:text-6xl" style={{ ...displayFont, fontWeight: 700 }}>
                {summary?.totalEmployees}
              </p>
            </div>
            <Users className="relative z-10 opacity-30 transition-opacity duration-300 group-hover:opacity-100" style={{ color: SAGE }} size={36} strokeWidth={1.5} />
          </div>

          <div className="group relative flex items-center justify-between overflow-hidden rounded-[1.75rem] border border-[#E7DFD2] bg-white/70 p-6 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_20px_40px_-18px_rgba(28,26,23,0.14)] backdrop-blur-md transition-all duration-300 hover:border-[#D9C79A] sm:p-8">
            <span
              className="pointer-events-none absolute top-0 left-8 h-px w-12 opacity-50"
              style={{ backgroundColor: SLATE }}
            />
            <div className="relative z-10">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#B4ADA0]">Departments</p>
              <p className="text-5xl leading-none tracking-tight tabular-nums text-[#1C1A17] sm:text-6xl" style={{ ...displayFont, fontWeight: 700 }}>
                {summary?.totalDepartments}
              </p>
            </div>
            <Building className="relative z-10 opacity-30 transition-opacity duration-300 group-hover:opacity-100" style={{ color: SLATE }} size={36} strokeWidth={1.5} />
          </div>

          <div className="group relative flex items-center justify-between overflow-hidden rounded-[1.75rem] border border-[#E7DFD2] bg-white/70 p-6 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_20px_40px_-18px_rgba(28,26,23,0.14)] backdrop-blur-md transition-all duration-300 hover:border-[#D9C79A] sm:p-8">
            <span
              className="pointer-events-none absolute top-0 left-8 h-px w-12 opacity-50"
              style={{ backgroundColor: GOLD }}
            />
            <div className="relative z-10">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#B4ADA0]">Clients</p>
              <p className="text-5xl leading-none tracking-tight tabular-nums text-[#1C1A17] sm:text-6xl" style={{ ...displayFont, fontWeight: 700 }}>
                {summary?.totalClients}
              </p>
            </div>
            <BriefcaseBusiness className="relative z-10 opacity-30 transition-opacity duration-300 group-hover:opacity-100" style={{ color: GOLD }} size={36} strokeWidth={1.5} />
          </div>
        </div>

        {/* BIRTHDAY SECTION */}
        <div className="relative w-full space-y-4 overflow-hidden rounded-2xl border border-[#E7DFD2] bg-white/70 p-4 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_20px_40px_-18px_rgba(28,26,23,0.14)] backdrop-blur-md sm:space-y-6 sm:rounded-[2rem] sm:p-8">
          <CornerTicks />
          <div className="pointer-events-none absolute top-0 right-0 p-4 opacity-[0.04] sm:p-8">
            <Cake size={90} color={INK} strokeWidth={1.25} />
          </div>
          <div className="relative z-10 flex items-center gap-2 sm:gap-3">
            <Cake size={18} strokeWidth={1.75} style={{ color: GARNET }} />
            <h3 className="text-lg tracking-tight text-[#1C1A17] sm:text-2xl" style={{ ...displayFont, fontWeight: 700 }}>
              Birthday Spotlight
            </h3>
          </div>
          <div className="relative z-10 flex flex-col gap-3 sm:gap-6">
            {todayBirthdays.length > 0 && (
              <div>
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: GARNET }}>
                  Today
                </div>
                <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
                  {todayBirthdays.map((emp) => (
                    <div
                      key={emp._id}
                      className="flex w-full items-center gap-3 rounded-2xl p-2.5 shadow-[0_10px_28px_-8px_rgba(122,34,51,0.35)] transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto sm:gap-4 sm:rounded-3xl sm:p-4"
                      style={{ background: `linear-gradient(135deg, ${GARNET}, #9C3A4E)` }}
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white/40 sm:h-16 sm:w-16">
                        <img
                          src={getImageUrl(emp.userId?.profileImage || emp.profileImage)}
                          className="h-full w-full object-cover"
                          alt="profile"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span
                          className="truncate text-sm leading-none tracking-tight text-white sm:text-lg"
                          style={{ ...displayFont, fontWeight: 700 }}
                        >
                          {emp.userId?.name || emp.name}
                        </span>
                        <span className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-white/70 sm:text-[10px]">
                          Celebrating today
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {upcomingBirthdays.length > 0 && (
              <div>
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#B4ADA0]">Upcoming</div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                  {upcomingBirthdays.map((emp) => {
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
                      <div
                        key={emp._id}
                        className="flex w-full items-center gap-2.5 rounded-2xl border bg-[#FBF8F3]/80 p-2.5 transition-all duration-300 hover:border-[#C6A15B]/60 sm:w-auto sm:gap-3 sm:p-3"
                        style={{ borderColor: HAIRLINE }}
                      >
                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border grayscale sm:h-12 sm:w-12" style={{ borderColor: HAIRLINE }}>
                          <img
                            src={getImageUrl(emp.userId?.profileImage || emp.profileImage)}
                            className="h-full w-full object-cover opacity-80"
                            alt="profile"
                          />
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-xs leading-none tracking-tight text-[#1C1A17] sm:text-sm" style={{ ...displayFont, fontWeight: 700 }}>
                            {emp.userId?.name || emp.name}
                          </span>
                          <span className="mt-1 text-[8px] font-semibold uppercase text-[#8A8378] sm:text-[9px]">
                            {emp.dob
                              ? new Date(emp.dob).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                              : ""}
                            {daysLeft !== null && (
                              <span className="ml-2 font-semibold" style={{ color: GOLD }}>
                                {daysLeft === 1 ? "in 1 day" : `in ${daysLeft} days`}
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
        <div className="grid w-full grid-cols-1 gap-4 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Client Mix", sub: "Plan Distribution", data: chartData.plans },
            { title: "Sponsors", sub: "Collaborations", data: chartData.sponsors, offset: 2 },
            { title: "Stalls", sub: "Categories", data: chartData.stalls, offset: 4 },
            { title: "Dept Pulse", sub: "Staffing", data: chartData.depts, offset: 6 },
            { title: "Leave Trends", sub: "Status", data: chartData.leaves, isSemantic: true },
          ].map((chart, idx) => (
            <SectionCard key={idx} title={chart.title} subtitle={chart.sub}>
              {domReady && (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chart.data}
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="80%"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chart.data.map((e, i) => (
                        <Cell
                          key={i}
                          fill={
                            chart.isSemantic
                              ? SEMANTIC_COLORS[e.name] || PIE_COLORS[i % PIE_COLORS.length]
                              : PIE_COLORS[(i + (chart.offset || 0)) % PIE_COLORS.length]
                          }
                          strokeWidth={0}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: `1px solid ${HAIRLINE}`,
                        borderTop: `2px solid ${GOLD}`,
                        fontWeight: 600,
                        fontSize: "12px",
                        boxShadow: "0 20px 40px -12px rgba(28,26,23,0.20)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </SectionCard>
          ))}

          {/* REPORTING CARD */}
          <div
            className="relative flex min-h-[180px] w-full flex-col justify-between overflow-hidden rounded-2xl p-5 text-white shadow-[0_1px_2px_rgba(0,0,0,0.2),0_30px_60px_-20px_rgba(122,34,51,0.45)] sm:min-h-[280px] sm:rounded-[2rem] sm:p-10"
            style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
          >
            <span
              className="pointer-events-none absolute top-0 left-0 h-px w-full opacity-60"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
            />
            <div className="pointer-events-none absolute right-0 bottom-0 opacity-[0.10]">
              <Download size={120} strokeWidth={1} />
            </div>
            <div className="z-10 space-y-2 sm:space-y-4">
              <div className="h-px w-8" style={{ backgroundColor: GOLD }} />
              <h4 className="text-2xl leading-none tracking-tight sm:text-4xl" style={{ ...displayFont, fontWeight: 700 }}>
                Global <span className="italic" style={{ color: GOLD }}>Reporting</span>
              </h4>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 sm:text-[11px]">
                Strategic organizational intelligence
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="z-10 mt-4 flex w-full items-center justify-center gap-2.5 rounded-full py-3 text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 active:scale-95 sm:mt-6 sm:py-4 sm:text-[12px]"
              style={{
                background: `linear-gradient(135deg, #D8BC7C, ${GOLD})`,
                color: INK,
                boxShadow: "0 10px 24px -8px rgba(198,161,91,0.55)",
              }}
            >
              {isExporting ? "Downloading…" : (
                <>
                  <Download size={16} strokeWidth={1.75} /> Export CSV Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSummary;
