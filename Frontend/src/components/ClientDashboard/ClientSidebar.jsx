import React from "react";
import Logo from "/favicon.png";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Handshake,
  Settings,
  X,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../../context/authContext";
import { useSidebar } from "../../context/sidebarContext";

const ClientSidebar = () => {
  const { user } = useAuth();
  const { open, setOpen } = useSidebar();

  const sidebarLinks = [
    { link: "/client-dashboard", icon: LayoutDashboard, title: "Dashboard" },
    {
      link: `/client-dashboard/ourrelationship/${user?._id}`,
      icon: Handshake,
      title: "Our Relationship",
    },
    { link: "/client-dashboard/setting", icon: Settings, title: "Settings" },
  ];

  return (
    <>
      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-red-950/40 backdrop-blur-md z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 h-screen
          bg-white/80 backdrop-blur-2xl
          border-r border-red-100/50
          shadow-[20px_0_50px_rgba(0,0,0,0.05)]
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${open ? "translate-x-0 w-72" : "-translate-x-full w-72"}
          md:translate-x-0 md:w-24 md:hover:w-72
          overflow-hidden group/sidebar
        `}
      >
        {/* HEADER / LOGO SECTION */}
        <div className="h-16 flex items-center gap-4 px-5 mb-4 relative overflow-hidden">
          {/* Decorative Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-900 via-red-700 to-red-600" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/20">
              <img
                src={Logo}
                className="w-9 h-9 rounded-xl object-contain shadow-lg"
                alt="Logo"
              />
            </div>

            <div className="flex flex-col md:opacity-0 md:group-hover/sidebar:opacity-100 transition-opacity duration-300">
              <span className="text-white text-[13px] font-black uppercase tracking-[0.2em] italic leading-none">
                Hakirush
              </span>
              <span className="text-red-200 text-[9px] font-bold uppercase tracking-widest mt-1">
                Client Terminal
              </span>
            </div>
          </div>

          <button
            className="relative z-10 ml-auto md:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION SYSTEM */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar pb-10">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4 md:opacity-0 md:group-hover/sidebar:opacity-100 transition-opacity">
            Partnership Portal
          </p>
          
          {sidebarLinks.map((item, i) => (
            <NavLink
              key={i}
              to={item.link}
              onClick={() => {
                if (window.innerWidth < 768) setOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              end
            >
              {({ isActive }) => (
                <div
                  className={`
                    relative flex items-center gap-4 p-3.5 rounded-2xl
                    text-[11px] font-black uppercase tracking-widest
                    transition-all duration-300 group/item
                    ${
                      isActive
                        ? "bg-gradient-to-br from-red-950 to-red-600 text-white shadow-[0_10px_20px_rgba(153,27,27,0.3)] scale-[1.02]"
                        : "text-slate-500 hover:bg-red-50 hover:text-red-700"
                    }
                  `}
                >
                  {/* ICON CONTAINER */}
                  <div className="w-10 flex justify-center shrink-0">
                    <item.icon 
                      size={22} 
                      strokeWidth={isActive ? 2.5 : 2} 
                      className="group-hover/item:rotate-12 transition-transform duration-300" 
                    />
                  </div>

                  {/* LABEL */}
                  <span className="whitespace-nowrap opacity-100 md:opacity-0 md:group-hover/sidebar:opacity-100 transition-all duration-300 translate-x-0 md:-translate-x-4 md:group-hover/sidebar:translate-x-0">
                    {item.title}
                  </span>

                  {/* ACTIVE INDICATOR ARROW */}
                  <ChevronRight 
                    size={14} 
                    className={`ml-auto transition-all duration-300 
                      ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0"} 
                      md:hidden lg:block
                    `} 
                  />
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER DECORATION */}
        <div className="absolute bottom-4 left-0 w-full px-8 md:opacity-0 md:group-hover/sidebar:opacity-100 transition-all duration-500">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-red-100 to-transparent w-full mb-4" />
          <div className="flex items-center gap-3 text-slate-400">
            <ShieldCheck size={12} className="text-emerald-500 shadow-sm" />
            <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Secure Connection</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ClientSidebar;