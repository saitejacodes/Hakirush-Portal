import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BriefcaseBusiness,
  Building,
  CalendarRange,
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
  <div className="rounded-2xl p-4 sm:p-6 shadow-xl bg-white/70 border backdrop-blur-lg flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-xs sm:text-sm">{label}</p>
      <h2 className="text-xl sm:text-3xl font-black">{value ?? 0}</h2>
    </div>
    <div className="p-3 sm:p-4 rounded-xl bg-red-800 text-white">
      <Icon size={20} />
    </div>
  </div>
);

/* ========== Section Card ========== */
const SectionCard = ({ title, children }) => (
  <div className="rounded-3xl p-4 sm:p-8 bg-white/70 shadow-xl border backdrop-blur-xl">
    <h2 className="text-lg sm:text-2xl font-bold text-red-800 text-center mb-4">
      {title}
    </h2>
    {children}
  </div>
);

/* ========== Custom Pie Legend ========== */
const PieLegend = ({ data, colors }) => (
  <div className="flex flex-wrap justify-center gap-3 mt-4">
    {data.map((item, index) => (
      <div
        key={index}
        className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow text-xs sm:text-sm"
      >
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: colors[index % colors.length] }}
        />
        <span className="font-medium">
          {item.name} ({item.value})
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

  const colors = ["#991b1b", "#16a34a", "#facc15", "#6366f1", "#22c55e"];

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

  return (
    <div className="min-h-screen px-4 py-6 sm:p-10 bg-gradient-to-br from-rose-100 via-white to-red-200">

      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-5xl text-red-800 font-black">Admin Dashboard</h1>
        <p className="text-red-500 mt-2">All Workforce Operations in One Place</p>
      </div>

      {/* Top Stats */}
      <SectionCard title="Organization Overview">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Users} label="Employees" value={summary.totalEmployees} />
          <StatCard icon={Building} label="Departments" value={summary.totalDepartments} />
          <StatCard icon={BriefcaseBusiness} label="Clients" value={summary.totalClients} />
        </div>
      </SectionCard>

      {/* Plan */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Client Plans">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={planData} cx="50%" cy="50%" outerRadius={90} dataKey="value">
                {planData.map((_, i) => (
                  <Cell key={i} fill={colors[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <PieLegend data={planData} colors={colors} />
        </SectionCard>

        <SectionCard title="Leave Summary">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={leaveData} cx="50%" cy="50%" outerRadius={90} dataKey="value">
                {leaveData.map((_, i) => (
                  <Cell key={i} fill={colors[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <PieLegend data={leaveData} colors={colors} />
        </SectionCard>
      </div>

      {/* Departments */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Departments">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={departmentData} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                {departmentData.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <PieLegend data={departmentData} colors={colors} />
        </SectionCard>

        <SectionCard title="Sponsors">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <StatCard icon={Handshake} label="Sponsors" value={sponsorSummary.totalSponsors} />
            <StatCard icon={Trophy} label="Events" value={sponsorSummary.totalSponsoredEvents} />
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={sponsorData} cx="50%" cy="50%" outerRadius={90} dataKey="value">
                {sponsorData.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <PieLegend data={sponsorData} colors={colors} />
        </SectionCard>
      </div>

    </div>
  );
};

export default AdminSummary;