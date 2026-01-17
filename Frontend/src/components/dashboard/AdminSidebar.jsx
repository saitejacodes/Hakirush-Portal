import React from "react";
import Logo from "/favicon.png";
import { NavLink } from "react-router-dom";
import { Bell, X } from "lucide-react";
import { useSidebar } from "../../context/sidebarContext";
import {
  LayoutDashboard,
  Building,
  User,
  UserSquare,
  UserCheck,
  ClipboardList,
  CalendarCheck,
  PartyPopper,
  BadgeDollarSign,
  Store,
} from "lucide-react";

const sidebar = [
  { link: "/admin-dashboard", icon: LayoutDashboard, title: "Dashboard" },
  { link: "/admin-dashboard/departments", icon: Building, title: "Departments" },
  { link: "/admin-dashboard/employees", icon: User, title: "Employees" },
  { link: "/admin-dashboard/clients", icon: UserSquare, title: "Clients" },
  { link: "/admin-dashboard/attendance", icon: UserCheck, title: "Attendance" },
  { link: "/admin-dashboard/attendance-report", icon: ClipboardList, title: "Attendance Report" },
  { link: "/admin-dashboard/leaves", icon: CalendarCheck, title: "Leaves" },
  { link: "/admin-dashboard/holidays", icon: PartyPopper, title: "Holidays" },
  { link: "/admin-dashboard/sponsors", icon: BadgeDollarSign, title: "Sponsors" },
  { link: "/admin-dashboard/stalls", icon: Store, title: "Stalls" },
  { link: "/admin-dashboard/announcement", icon: Bell, title: "Announcement" },
];

const AdminSidebar = () => {
  const { open, setOpen } = useSidebar();

  return (
    <>
      {/* Mobile Overlay */}
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
          overflow-hidden
          group
        `}
      >
        {/* HEADER */}
        <div className="h-16 flex items-center gap-3 px-4 bg-gradient-to-r from-black to-gray-900 text-white">
          <img src={Logo} className="w-10 h-10 rounded-xl shrink-0" />

          <span className="text-lg font-extrabold whitespace-nowrap text-yellow-500 uppercase hidden md:group-hover:block">
            Hakirush Portal
          </span>

          <button className="ml-auto md:hidden" onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        {/* MENU */}
        <nav className="mt-6 px-2 space-y-1">
          {sidebar.map((item, i) => (
            <NavLink
              key={i}
              to={item.link}
              onClick={() => setOpen(false)}
              end
              className={({ isActive }) =>
                `
                flex items-center gap-4 px-4 py-3 rounded-xl
                transition-all duration-200
                ${
                  isActive
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-red-50"
                }
                `
              }
            >
              {/* ICON — always visible */}
              <div className="w-8 flex justify-center shrink-0">
                <item.icon size={20} />
              </div>

              {/* TEXT — only visible on expand */}
              <span className="whitespace-nowrap block md:hidden md:group-hover:block">
                {item.title}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
