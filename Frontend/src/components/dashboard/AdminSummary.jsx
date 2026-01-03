import React, { useEffect, useState } from "react"
import SummaryCard from "./SummaryCard"
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
} from "lucide-react"
import axios from "axios"

const AdminSummary = () => {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/dashboard/summary",
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

  if (!summary) return <div className="p-10 text-center text-gray-500">Loading dashboard…</div>

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-5xl font-black text-red-600 tracking-tight">
          Dashboard Overview
        </h3>
        <p className="text-gray-500 mt-2">
          Quick insight into employees, departments, and leave activity
        </p>
      </div>

      {/* Top Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard
          icon={<Users />}
          text="Total Employees"
          number={summary.totalEmployees}
        />

        <SummaryCard
          icon={<Building />}
          text="Total Departments"
          number={summary.totalDepartments}
        />

      </div>

      {/* Other counts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <SummaryCard icon={<BriefcaseBusiness />} text="Total Clients" number={42} />
        <SummaryCard icon={<CalendarRange />} text="Annual Tournaments" number={3} />
        <SummaryCard icon={<Trophy />} text="Quarterly Tournaments" number={6} />
      </div>

      {/* Leave Section */}
      <h3 className="pt-12 pb-4 text-center text-3xl font-extrabold text-red-600">
        Leave Summary
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          icon={<Send />}
          text="Leave Applied"
          number={summary.leaveSummary.appliedFor}
        />

        <SummaryCard
          icon={<Clock />}
          text="Leave Pending"
          number={summary.leaveSummary.pending}
        />

        <SummaryCard
          icon={<CheckCircle />}
          text="Leave Approved"
          number={summary.leaveSummary.approved}
        />

        <SummaryCard
          icon={<XCircle />}
          text="Leave Rejected"
          number={summary.leaveSummary.rejected}
        />
      </div>
    </div>
  )
}

export default AdminSummary
