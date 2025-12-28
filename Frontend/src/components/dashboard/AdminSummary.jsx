import React from "react"
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
  Wallet,
  XCircle
} from "lucide-react"

const AdminSummary = () => {
  return (
    <div className="p-8">
      <h3 className="text-4xl font-black text-red-600 tracking-tight">
        Dashboard Overview
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <SummaryCard icon={<Users />} text="Total Employees" number={126} />
        <SummaryCard icon={<Building />} text="Total Departments" number={9} />
        <SummaryCard icon={<Wallet />} text="Total Monthly Salary" number="₹ 4,50,000" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <SummaryCard icon={<BriefcaseBusiness />} text="Total Clients" number={42} />
        <SummaryCard icon={<CalendarRange />} text="Annual Tournaments" number={3} />
        <SummaryCard icon={<Trophy />} text="Quarterly Tournaments" number={6} />
      </div>

      <h3 className="pt-12 pb-4 text-center text-2xl font-bold text-red-600">
        Leave Details
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard icon={<Send />} text="Leave Applied" number={20} />
        <SummaryCard icon={<Clock />} text="Leave Pending" number={5} />
        <SummaryCard icon={<CheckCircle />} text="Leave Accepted" number={12} />
        <SummaryCard icon={<XCircle />} text="Leave Rejected" number={3} />
      </div>
    </div>
  )
}

export default AdminSummary
