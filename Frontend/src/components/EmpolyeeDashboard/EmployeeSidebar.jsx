import React from "react"
import Logo from "/favicon.png"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Building,
  CalendarCheck,
  Settings,
  X,
  Bell
} from "lucide-react"
import { useAuth } from "../../context/authContext"
import { useSidebar } from "../../context/sidebarContext"

const EmployeeSidebar = () => {
  const { user } = useAuth()
  const { open, setOpen } = useSidebar()

  const sidebar = [
    { link: "/employee-dashboard", icon: LayoutDashboard, title: "Dashboard" },
    { link: `/employee-dashboard/profile/${user?._id}`, icon: Building, title: "My Profile" },
    { link: `/employee-dashboard/leaves/${user?._id}`, icon: CalendarCheck, title: "Leaves" },
    { link: "/employee-dashboard/setting", icon: Settings, title: "Settings" },
  ]

  return (
    <>
      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 h-screen
          bg-white border-r shadow-xl
          transition-all duration-300
          ${open ? "translate-x-0 w-72" : "-translate-x-full w-72"}
          md:translate-x-0 md:w-20 md:hover:w-72
          group
        `}
      >
        {/* HEADER */}
        <div className="h-16 px-4 flex items-center gap-3
          bg-gradient-to-r from-black to-gray-900 text-white">
          
          <img src={Logo} className="w-10 h-10 rounded-xl" />

          <span
            className="
              text-lg font-extrabold whitespace-nowrap
              opacity-100 md:opacity-0 md:group-hover:opacity-100
              transition uppercase
              text-yellow-500
            "
          >
            Hakirush Portal
          </span>

          {/* CLOSE BUTTON (MOBILE) */}
          <button
            className="ml-auto md:hidden"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>

        {/* MENU */}
        <nav className="mt-6 px-2 space-y-1">
          {sidebar.map((item, i) => (
            <NavLink
              key={i}
              to={item.link}
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `
                flex items-center gap-4 px-4 py-3 rounded-xl
                transition-all duration-200
                ${isActive
                  ? "bg-red-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-red-50"}
                `
              }
            >
              {/* ICON */}
              <item.icon size={20} className="min-w-[20px]" />

              {/* TITLE */}
              <span
                className="
                  whitespace-nowrap
                  opacity-100 md:opacity-0 md:group-hover:opacity-100
                  transition
                "
              >
                {item.title}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default EmployeeSidebar