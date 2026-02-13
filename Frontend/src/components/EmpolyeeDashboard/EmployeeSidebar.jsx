import React from "react";
import Logo from "/favicon.png";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building,
  CalendarCheck,
  Settings,
  X,
  FileText,
} from "lucide-react";
import { useAuth } from "../../context/authContext";
import { useSidebar } from "../../context/sidebarContext";

const EmployeeSidebar = () => {
  const { user } = useAuth();
  const { open, setOpen } = useSidebar();

  const sidebar = [
    { link: "/employee-dashboard", icon: LayoutDashboard, title: "Dashboard" },
    { link: `/employee-dashboard/profile/${user?._id}`, icon: Building, title: "My Profile" },
    { link: `/employee-dashboard/leaves/${user?._id}`, icon: CalendarCheck, title: "Leaves" },
    { link: `/employee-dashboard/payslips/${user?._id}`, icon: FileText, title: "Payslips" },
    { link: "/employee-dashboard/setting", icon: Settings, title: "Settings" },
  ];

  return (
    <>
      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 h-screen
          bg-white/90 backdrop-blur-xl
          border-r border-red-100
          shadow-2xl
          transition-all duration-300 ease-in-out
          ${open ? "translate-x-0 w-72" : "-translate-x-full w-72"}
          md:translate-x-0 md:w-20 md:hover:w-72
          overflow-hidden
          group
        `}
      >
        {/* HEADER */}
        <div className="h-16 flex items-center gap-3 px-4
          bg-gradient-to-r from-red-700 via-red-600 to-red-500 text-white">

          <img src={Logo} className="w-10 h-10 rounded-xl shadow shrink-0" />

          <span className="text-lg font-extrabold tracking-wide whitespace-nowrap uppercase block md:hidden md:group-hover:block">
            Hakirush Portal
          </span>

          <button
            className="ml-auto md:hidden p-2 rounded-lg hover:bg-white/20"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>

        {/* MENU */}
        <nav className="mt-6 px-3 space-y-1">
          {sidebar.map((item, i) => (
            <NavLink
              key={i}
              to={item.link}
              end
              onClick={() => {
                setOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={({ isActive }) =>
                `
                flex items-center gap-4 p-3 rounded-xl
                text-sm font-semibold
                transition-all duration-200
                ${
                  isActive
                    ? "bg-red-600 text-white shadow-lg scale-[1.02]"
                    : "text-gray-700 hover:bg-red-50 hover:text-red-700"
                }
                `
              }
            >
              <div className="w-8 flex justify-center shrink-0">
                <item.icon size={20} />
              </div>

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

export default EmployeeSidebar;
