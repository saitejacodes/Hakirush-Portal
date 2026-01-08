import React, { useEffect, useState } from "react"
import axios from "axios"
import {
  BriefcaseBusiness,
  Building,
  CalendarRange,
  CheckCircle,
  Clock,
  Send,
  Trophy,
  Users,
  XCircle,
  Handshake,
} from "lucide-react"

import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend,
} from "recharts"

// ====== STAT CARD ======
const StatCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl p-6 shadow-xl bg-white/70 border backdrop-blur-lg hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <h2 className="text-3xl font-black mt-1">{value ?? 0}</h2>
    </div>

    <div className="p-4 rounded-2xl bg-red-800 text-white shadow">
      <Icon size={28} />
    </div>
  </div>
)

// ====== SECTION WRAPPER ======
const SectionCard = ({ title, children }) => (
  <div className="rounded-3xl p-8 shadow-xl bg-white/70 border backdrop-blur-xl">
    <h2 className="text-2xl font-bold text-red-800 text-center mb-6">
      {title}
    </h2>
    {children}
  </div>
)

const AdminSummary = () => {
  const [summary, setSummary] = useState(null)

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
        )
        setSummary(res.data)
      } catch (error) {
        console.log(error)
        alert(error?.response?.data?.error || "Failed to load dashboard")
      }
    }

    fetchSummary()
  }, [])

  if (!summary)
    return (
      <p className="text-center mt-20 text-lg text-gray-500">
        Loading dashboard…
      </p>
    )

  // ====== SAFE SPONSOR FALLBACK ======
  const sponsorSummary = summary?.sponsorSummary || {
    totalSponsors: 0,
    totalSponsoredEvents: 0,
    collaborationSummary: {},
  }

  // ====== CHART DATA ======
  const planData = [
    { name: "Annual", value: summary.totalAnnual || 0 },
    { name: "Quarterly", value: summary.totalQuarterly || 0 },
  ]

  const leaveData = [
    { name: "Applied", value: summary.leaveSummary?.appliedFor || 0 },
    { name: "Pending", value: summary.leaveSummary?.pending || 0 },
    { name: "Approved", value: summary.leaveSummary?.approved || 0 },
    { name: "Rejected", value: summary.leaveSummary?.rejected || 0 },
  ]

  const departmentData =
    summary?.departmentSummary?.map((d) => ({
      name: d.department,
      value: d.employees,
    })) || []

  const sponsorCollaborationData = Object.entries(
    sponsorSummary.collaborationSummary || {}
  ).map(([name, value]) => ({ name, value }))

  const colors = ["#991b1b", "#121212", "#22c55e", "#FFD700", "#6366f1"]

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-rose-100 via-white to-red-200">

      {/* HEADER */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-black text-red-800 drop-shadow">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Smart insights about your organization — at a glance
        </p>
      </div>

      {/* ====== TOP STATS ====== */}
      <SectionCard title="Organization Overview">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={Users} label="Total Employees" value={summary.totalEmployees} />
          <StatCard icon={Building} label="Departments" value={summary.totalDepartments} />
          <StatCard icon={BriefcaseBusiness} label="Total Clients" value={summary.totalClients} />
        </div>
      </SectionCard>

      {/* ====== PLAN DISTRIBUTION ====== */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">

        <SectionCard title="Client Packages">
          <div className="grid grid-cols-1 gap-6">
            <StatCard icon={CalendarRange} label="Annual Clients" value={summary.totalAnnual} />
            <StatCard icon={Trophy} label="Quarterly Clients" value={summary.totalQuarterly} />
          </div>
        </SectionCard>

        <div className="rounded-3xl p-8 shadow-xl bg-white/70 border backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-red-800 text-center mb-6">
            Plan Chart
          </h2>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={planData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {planData.map((_, index) => (
                  <Cell key={index} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ====== LEAVE SUMMARY ====== */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">

        <SectionCard title="Leave Summary">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            <div className="rounded-2xl p-6 shadow-xl bg-red-800 text-white">
              <div className="flex justify-between items-center">
                <p className="font-semibold">Applied</p>
                <Send />
              </div>
              <h2 className="text-4xl font-black mt-2">
                {summary.leaveSummary.appliedFor}
              </h2>
            </div>

            <div className="rounded-2xl p-6 shadow-xl bg-white border">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-yellow-600">Pending</p>
                <Clock className="text-yellow-600" />
              </div>
              <h2 className="text-4xl font-black mt-2">
                {summary.leaveSummary.pending}
              </h2>
            </div>

            <div className="rounded-2xl p-6 shadow-xl bg-white border">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-green-600">Approved</p>
                <CheckCircle className="text-green-600" />
              </div>
              <h2 className="text-4xl font-black mt-2">
                {summary.leaveSummary.approved}
              </h2>
            </div>

            <div className="rounded-2xl p-6 shadow-xl bg-white border">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-red-800">Rejected</p>
                <XCircle className="text-red-800" />
              </div>
              <h2 className="text-4xl font-black mt-2">
                {summary.leaveSummary.rejected}
              </h2>
            </div>

          </div>
        </SectionCard>

        <div className="rounded-3xl p-8 shadow-xl bg-white/70 border backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-red-800 text-center mb-6">
            Leave Chart
          </h2>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={leaveData} cx="50%" cy="50%" outerRadius={110} dataKey="value">
                {leaveData.map((_, index) => (
                  <Cell key={index} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ====== DEPARTMENT SUMMARY ====== */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">

        <SectionCard title="Department – Employees">
          <table className="w-full">
            <tbody>
              {summary.departmentSummary.map((dept, i) => (
                <tr key={i} className="border-b">
                  <td className="p-3 flex items-center gap-2">
                    <Building size={16} className="text-rose-600" />
                    {dept.department}
                  </td>
                  <td className="p-3 text-right font-bold">
                    {dept.employees}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <div className="rounded-3xl p-8 shadow-xl bg-white/70 border backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-red-800 text-center mb-6">
            Department Employee Chart
          </h2>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={departmentData} cx="50%" cy="50%" outerRadius={115} dataKey="value">
                {departmentData.map((_, index) => (
                  <Cell key={index} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ====== SPONSOR SECTION (ADDED) ====== */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">

        <SectionCard title="Sponsor Overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              icon={Handshake}
              label="Total Sponsors"
              value={sponsorSummary.totalSponsors}
            />
            <StatCard
              icon={Trophy}
              label="Events Sponsored"
              value={sponsorSummary.totalSponsoredEvents}
            />
          </div>
        </SectionCard>

        <div className="rounded-3xl p-8 shadow-xl bg-white/70 border backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-red-800 text-center mb-6">
            Sponsor Collaboration Chart
          </h2>

          {sponsorCollaborationData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={sponsorCollaborationData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  dataKey="value"
                >
                  {sponsorCollaborationData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 mt-20">
              No sponsor data available
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

export default AdminSummary