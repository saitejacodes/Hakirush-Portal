import React from "react"
import Logo from "/favicon.png"
import { NavLink } from "react-router-dom"
import { Building, CalendarCheck, ClipboardList, LayoutDashboard, Settings, User, UserCheck, UserSquare } from "lucide-react"

const sidebar = [
  { link: "/admin-dashboard", icon: <LayoutDashboard size={20} />, title: "Dashboard" },
  { link: "/admin-dashboard/departments", icon: <Building size={20} />, title: "Departments" },
  { link: "/admin-dashboard/employees", icon: <User size={20} />, title: "Employees" },
  { link: "/admin-dashboard/clients", icon: <UserSquare size={20} />, title: "Clients" },
  { link: "/admin-dashboard/attendance", icon: <UserCheck size={20} />, title: "Attendence" },
  { link: "/admin-dashboard/attendance-report", icon: <ClipboardList size={20} />, title: "Attendence Report" },
  { link: "/admin-dashboard/leaves", icon: <CalendarCheck size={20} />, title: "Leaves" },
  { link: "/admin-dashboard/setting", icon: <Settings size={20} />, title: "Settings" },
]

const AdminSidebar = () => {
  return (
    <aside className="h-250 w-72 bg-white/70 backdrop-blur-2xl border-r shadow-xl flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-3 p-6">
        <img src={Logo} className="w-10 h-10 rounded-xl shadow" />
        <span className="text-xl font-black tracking-tight text-red-600">
          Hakirush Portal
        </span>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <ul className="space-y-2">

          {sidebar.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.link}
                className={({ isActive }) =>
                  `
                  group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? "bg-red-500 text-white shadow-lg"
                    : "text-gray-700 hover:bg-red-100 hover:text-red-600"}
                  `
                } end
              >
                {({ isActive }) => (
                  <>
                    {/* Left bar indicator */}
                    <span
                      className={`w-1 h-6 rounded-full transition-all duration-200
                      ${isActive ? "bg-white" : "bg-transparent group-hover:bg-red-400"}
                    `} 
                    />
                    {item.icon}
                    <p>{item.title}</p>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

    </aside>
  )
}

export default AdminSidebar
