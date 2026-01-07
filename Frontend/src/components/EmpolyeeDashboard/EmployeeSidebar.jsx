import React from "react"
import Logo from "/favicon.png"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Building,
  CalendarCheck,
  Settings
} from "lucide-react"
import { useAuth } from "../../context/authContext"

const EmployeeSidebar = () => {
  const { user } = useAuth()

  const sidebar = [
    { link: "/employee-dashboard", icon: LayoutDashboard, title: "Dashboard" },
    { link: `/employee-dashboard/profile/${user?._id}`, icon: Building, title: "My Profile" },
    { link: `/employee-dashboard/leaves/${user?._id}`, icon: CalendarCheck, title: "Leaves" },
    { link: "/employee-dashboard/setting", icon: Settings, title: "Settings" },
  ]

  return (
    <aside className="sticky top-0 z-50 group h-screen w-20 hover:w-72 transition-all duration-300 bg-white border-r shadow-xl flex flex-col">

      {/* HEADER */}
      <div className="p-4 flex items-center gap-3 bg-black/80">
        <img src={Logo} className="w-10 h-10 rounded-xl" />

        {/* Title shows only when expanded */}
        <span className="opacity-0 group-hover:opacity-100 transition-all text-xl font-black whitespace-nowrap text-yellow-500">
          Hakirush Portal
        </span>
      </div>

      {/* MENU */}
      <nav className="my-5 flex-1 px-2 space-y-1">
        {sidebar.map((item, i) => (
          <NavLink
            key={i}
            to={item.link}
            end
            className={({ isActive }) =>
              `
              flex items-center gap-4 px-4 py-3 rounded-2xl
              transition-all duration-200
              ${isActive
                ? "bg-red-500 text-white shadow-lg"
                : "hover:bg-red-50 text-gray-700"}
              `
            }
          >
            {/* ICON ALWAYS VISIBLE */}
            <item.icon className="min-w-5" />

            {/* TEXT ONLY WHEN EXPANDED */}
            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all">
              {item.title}
            </span>
          </NavLink>
        ))}
      </nav>

    </aside>
  )
}

export default EmployeeSidebar