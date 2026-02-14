import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BriefcaseBusiness,
  Building,
  Trophy,
  Users,
  Handshake,
  TrendingUp,
  Calendar,
  Layers,
  Activity,
  ArrowRight
} from "lucide-react";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";

/* ========== Stat Card (Same Style as Summary) ========== */
const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-50 flex flex-col justify-between h-[200px] transition-transform hover:scale-[1.02]">
    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
      {Icon && <Icon size={16} className="text-red-500" />} {label}
    </div>
    <div className="text-6xl font-black text-slate-800 italic tracking-tighter">
      {value ?? 0}
    </div>
    <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-300">
      Total Registered <ArrowRight size={12} />
    </div>
  </div>
);

/* ========== Section Card (Same Style as Attendance History) ========== */
const SectionCard = ({ title, children }) => (
  <div className="bg-white p-6 sm:p-10 rounded-[3rem] shadow-2xl border border-white">
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
      <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
        {title}
      </h3>
      <div className="h-1 w-20 bg-red-500 rounded-full hidden sm:block"></div>
    </div>
    {children}
  </div>
);

/* ========== Custom Pie Legend ========== */
const PieLegend = ({ data, colors }) => (
  <div className="flex flex-wrap justify-center gap-3 mt-8">
    {data.map((item, index) => (
      <div
        key={index}
        className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-tighter shadow-sm"
      >
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: colors[index % colors.length] }}
        />
        <span className="text-slate-600">{item.name}</span>
        <span className="text-red-500">{item.value}</span>
      </div>
    ))}
  </div>
);

const AdminSummary = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/dashboard/summary`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setSummary(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSummary();
  }, []);

  if (!summary)
    return (
      <div className="h-screen flex items-center justify-center font-black italic text-slate-400 uppercase tracking-tighter text-4xl">
        LOADING ADMIN...
      </div>
    );

  const pieColors = ["#b91c1c", "#4f46e5", "#0891b2", "#d97706", "#7c3aed", "#059669"];

  const sections = {
    plans: [
      { name: "Annual", value: summary.totalAnnual || 0 },
      { name: "Quarterly", value: summary.totalQuarterly || 0 },
    ],
    leaves: [
      { name: "Applied", value: summary.leaveSummary.appliedFor || 0 },
      { name: "Pending", value: summary.leaveSummary.pending || 0 },
      { name: "Approved", value: summary.leaveSummary.approved || 0 },
      { name: "Rejected", value: summary.leaveSummary.rejected || 0 },
    ],
    depts: summary.departmentSummary?.map((d) => ({ name: d.department, value: d.employees })) || [],
    sponsors: Object.entries(summary.sponsorSummary?.collaborationSummary || {}).map(([name, value]) => ({ name, value })),
    stalls: Object.entries(summary.stallSummary?.typeSummary || {}).map(([name, value]) => ({ name, value })),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 text-slate-900 pb-12">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-10">
        
        {/* Header Section */}
        <header className="flex justify-between items-center pt-2">
          <div>
            <h1 className="text-3xl font-black text-red-700 uppercase tracking-tighter sm:text-5xl leading-none">
              Admin Summary
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2 ml-1">
              Global Operations Overview
            </p>
          </div>
        </header>

        {/* Top Statistics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={Users} label="Employees" value={summary.totalEmployees} />
          <StatCard icon={Building} label="Departments" value={summary.totalDepartments} />
          <StatCard icon={BriefcaseBusiness} label="Clients" value={summary.totalClients} />
        </section>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          <SectionCard title="Client Plans">
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={sections.plans}
                    cx="50%" cy="50%"
                    innerRadius={70} outerRadius={100}
                    paddingAngle={5} dataKey="value"
                    stroke="none"
                  >
                    {sections.plans.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
              <PieLegend data={sections.plans} colors={pieColors} />
            </div>
          </SectionCard>

          <SectionCard title="Leave Analytics">
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={sections.leaves}
                    cx="50%" cy="50%"
                    innerRadius={70} outerRadius={100}
                    paddingAngle={5} dataKey="value"
                    stroke="none"
                  >
                    {sections.leaves.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
              <PieLegend data={sections.leaves} colors={pieColors} />
            </div>
          </SectionCard>

          <SectionCard title="Department Pulse">
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={sections.depts}
                    cx="50%" cy="50%"
                    innerRadius={70} outerRadius={100}
                    paddingAngle={5} dataKey="value"
                    stroke="none"
                  >
                    {sections.depts.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
              <PieLegend data={sections.depts} colors={pieColors} />
            </div>
          </SectionCard>

          <SectionCard title="Sponsors">
             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 text-center">
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block mb-1">Sponsors</span>
                    <span className="text-2xl font-black text-red-600 italic">{summary.sponsorSummary?.totalSponsors}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 text-center">
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block mb-1">Events</span>
                    <span className="text-2xl font-black text-indigo-600 italic">{summary.sponsorSummary?.totalSponsoredEvents}</span>
                </div>
            </div>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sections.sponsors}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={85}
                    paddingAngle={5} dataKey="value"
                    stroke="none"
                  >
                    {sections.sponsors.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
              <PieLegend data={sections.sponsors} colors={pieColors} />
            </div>
          </SectionCard>

          <SectionCard title="Stalls">
             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 text-center">
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block mb-1">Total Stalls</span>
                    <span className="text-2xl font-black text-red-600 italic">{summary.stallSummary?.totalStalls}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 text-center">
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block mb-1">Host Events</span>
                    <span className="text-2xl font-black text-indigo-600 italic">{summary.stallSummary?.totalStallEvents}</span>
                </div>
            </div>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sections.stalls}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={85}
                    paddingAngle={5} dataKey="value"
                    stroke="none"
                  >
                    {sections.stalls.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
              <PieLegend data={sections.stalls} colors={pieColors} />
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
};

export default AdminSummary;