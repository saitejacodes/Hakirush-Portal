import React from "react"
import Logo from "/favicon.png"
import { NavLink } from "react-router-dom"
import { Building, CalendarCheck, LayoutDashboard, Settings } from "lucide-react"
import { useAuth } from "../../context/authContext"

const EmployeeSidebar = () => {
  const { user } = useAuth()

  const sidebar = [
    { link: "/employee-dashboard", icon: <LayoutDashboard size={20} />, title: "Dashboard" },
    { link: `/employee-dashboard/profile/${user?._id}`, icon: <Building size={20} />, title: "My Profile" },
    { link: `/employee-dashboard/leaves/${user._id}`, icon: <CalendarCheck size={20} />, title: "Leaves" },
    { link: "/employee-dashboard/setting", icon: <Settings size={20} />, title: "Settings" },
  ]

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
                  ${
                    isActive
                      ? "bg-red-500 text-white shadow-lg"
                      : "text-gray-700 hover:bg-red-100 hover:text-red-600"
                  }
                  `
                }
                end
              >
                {({ isActive }) => (
                  <>
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

export default EmployeeSidebar
