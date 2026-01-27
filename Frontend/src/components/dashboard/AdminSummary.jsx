import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BriefcaseBusiness,
  Building,
  Trophy,
  Users,
  Handshake,
} from "lucide-react";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";

/* ========== Stat Card ========== */
const StatCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-3xl p-6 sm:p-8 shadow-2xl bg-white/90 border border-red-100 backdrop-blur-xl flex items-center justify-between hover:scale-[1.03] hover:shadow-3xl transition-all duration-300">
    <div>
      <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">
        {label}
      </p>
      <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-800 drop-shadow-sm">
        {value ?? 0}
      </h2>
    </div>
    <div className="p-4 rounded-2xl bg-gradient-to-br from-red-700 to-red-500 text-white shadow-xl flex items-center justify-center">
      {Icon && <Icon size={28} />}
    </div>
  </div>
);

/* ========== Section Card ========== */
const SectionCard = ({ title, children }) => (
  <div className="rounded-4xl p-6 sm:p-10 bg-white/90 shadow-2xl border border-red-100 backdrop-blur-xl">
    <h2 className="text-xl sm:text-3xl font-extrabold text-red-800 text-center mb-7 tracking-tight drop-shadow-sm">
      {title}
    </h2>
    {children}
  </div>
);

/* ========== Custom Pie Legend ========== */
const PieLegend = ({ data, colors }) => (
  <div className="flex flex-wrap justify-center gap-3 mt-7">
    {data.map((item, index) => (
      <div
        key={index}
        className="flex items-center gap-2 bg-white/95 px-4 py-1.5 rounded-full shadow-md border border-gray-100 text-xs sm:text-sm hover:scale-105 transition"
      >
        <span
          className="w-3 h-3 rounded-full border border-gray-200"
          style={{ backgroundColor: colors[index % colors.length] }}
        />
        <span className="font-semibold text-gray-700">
          {item.name} <span className="text-gray-400">({item.value})</span>
        </span>
      </div>
    ))}
  </div>
);

const AdminSummary = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/dashboard/summary`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSummary(res.data);
    };
    fetchSummary();
  }, []);

  if (!summary)
    return <p className="text-center mt-20">Loading dashboard...</p>;

  const pieColors = [
    "#ef4444",
    "#22c55e",
    "#3b82f6",
    "#f59e0b",
    "#8b5cf6",
    "#14b8a6",
  ];

  const planData = [
    { name: "Annual", value: summary.totalAnnual || 0 },
    { name: "Quarterly", value: summary.totalQuarterly || 0 },
  ];

  const leaveData = [
    { name: "Applied", value: summary.leaveSummary.appliedFor || 0 },
    { name: "Pending", value: summary.leaveSummary.pending || 0 },
    { name: "Approved", value: summary.leaveSummary.approved || 0 },
    { name: "Rejected", value: summary.leaveSummary.rejected || 0 },
  ];

  const departmentData =
    summary.departmentSummary?.map((d) => ({
      name: d.department,
      value: d.employees,
    })) || [];

  const sponsorSummary = summary.sponsorSummary || {
    totalSponsors: 0,
    totalSponsoredEvents: 0,
    collaborationSummary: {},
  };

  const sponsorData = Object.entries(
    sponsorSummary.collaborationSummary || {}
  ).map(([name, value]) => ({ name, value }));

  // Stall summary data
  const stallSummary = summary.stallSummary || {
    totalStalls: 0,
    totalStallEvents: 0,
    typeSummary: {},
  };
  const stallTypeData = Object.entries(stallSummary.typeSummary || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen px-2 py-4 sm:p-8 bg-linear-to-br from-rose-100 via-white to-red-200">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-5xl text-red-800 font-black tracking-tight drop-shadow-md">
          Admin Dashboard
        </h1>
        <p className="text-red-500 mt-3 text-base sm:text-lg font-medium">
          All Workforce Operations in One Place
        </p>
      </div>

      <SectionCard title="Organization Overview">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <StatCard icon={Users} label="Employees" value={summary.totalEmployees} />
          <StatCard icon={Building} label="Departments" value={summary.totalDepartments} />
          <StatCard icon={BriefcaseBusiness} label="Clients" value={summary.totalClients} />
        </div>
      </SectionCard>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <SectionCard title="Client Plans">
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={3}
                  label={false}
                  labelLine={false}
                >
                  {planData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, background: '#fff', border: '1px solid #eee', color: '#333', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
            <PieLegend data={planData} colors={pieColors} />
          </div>
        </SectionCard>

        <SectionCard title="Leave Summary">
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={leaveData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={3}
                  label={false}
                  labelLine={false}
                >
                  {leaveData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, background: '#fff', border: '1px solid #eee', color: '#333', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
            <PieLegend data={leaveData} colors={pieColors} />
          </div>
        </SectionCard>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <SectionCard title="Departments">
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={270}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={3}
                  label={false}
                  labelLine={false}
                >
                  {departmentData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, background: '#fff', border: '1px solid #eee', color: '#333', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
            <PieLegend data={departmentData} colors={pieColors} />
          </div>
        </SectionCard>

        <SectionCard title="Sponsors">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <StatCard icon={Handshake} label="Sponsors" value={sponsorSummary.totalSponsors} />
            <StatCard icon={Trophy} label="Events" value={sponsorSummary.totalSponsoredEvents} />
          </div>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={sponsorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={3}
                  label={false}
                  labelLine={false}
                >
                  {sponsorData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, background: '#fff', border: '1px solid #eee', color: '#333', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
            <PieLegend data={sponsorData} colors={pieColors} />
          </div>
        </SectionCard>
      </div>

      {/* Stall Summary Section */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <SectionCard title="Stalls">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <StatCard icon={BriefcaseBusiness} label="Stalls" value={stallSummary.totalStalls} />
            <StatCard icon={Trophy} label="Events" value={stallSummary.totalStallEvents} />
          </div>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stallTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={3}
                  label={({ name, percent }) => percent > 0 ? `${name}` : ''}
                  labelLine={false}
                >
                  {stallTypeData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, background: '#fff', border: '1px solid #eee', color: '#333', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
            <PieLegend data={stallTypeData} colors={pieColors} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default AdminSummary;