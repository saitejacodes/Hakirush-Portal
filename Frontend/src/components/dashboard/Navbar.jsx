import React, { useEffect, useState } from "react";
import { 
  Menu, LogOut, X, Mail, User, ShieldCheck, 
  ChevronDown, Copy, Check, Briefcase
} from "lucide-react";
import { useAuth } from "../../context/authContext";
import { useSidebar } from "../../context/sidebarContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { setOpen } = useSidebar();
  const [scrolled, setScrolled] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const displayEmployeeId = user?.employeeId || "NO ID";

  const handleCopyId = () => {
    if (user?.employeeId) {
      navigator.clipboard.writeText(user.employeeId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");
    return imagePath.startsWith("/") ? `${baseUrl}${imagePath}` : `${baseUrl}/${imagePath}`;
  };

  const userImg = user?.profileImage || user?.clientImage || user?.image || user?.avatar;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 px-4 sm:px-8 py-2.5 ${
          scrolled 
            ? "glass-effect shadow-[0_4px_24px_rgba(153,27,27,0.10)] border-b border-red-100/30" 
            : "bg-white border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* LEFT: Welcome Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpen(true)}
              className="md:hidden p-2.5 rounded-2xl bg-slate-50 text-slate-600 hover:text-red-600 transition-all active:scale-90"
            >
              <Menu size={20} />
            </button>

            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                Welcome,&nbsp;
                <span className="text-red-600 italic uppercase font-black">{user?.name}</span>
              </h1>
            </div>
          </div>

          {/* RIGHT: Icon-Only Profile Trigger */}
          <div className="flex items-center gap-3">
            
            {/* Minimalist Profile Trigger */}
            <button
              onClick={() => setShowAvatar(true)}
              className="group relative p-0.5 rounded-full bg-transparent transition-all active:scale-90 cursor-pointer"
            >
              <div className="relative">
                {userImg ? (
                  <img
                    src={getImageUrl(userImg)}
                    alt="profile"
        
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shadow-sm group-hover:shadow-red-200 group-hover:ring-2 group-hover:ring-red-500/20 transition-all"
                  />
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white text-xs font-black shadow-lg">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
    
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse shadow-sm" />
              </div>
            </button>

            {/* Logout Icon */}
            <button
              onClick={logout}
              className="p-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-90 group cursor-pointer"
            >
              <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* 🌟 PROFILE MODAL */}
      {showAvatar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" 
            onClick={() => setShowAvatar(false)} 
          />
          
          <div className="relative w-full max-w-sm glass-effect rounded-[2.5rem] shadow-premium overflow-hidden animate-pop border border-white">
            
            <div className="h-24 bg-gradient-to-r from-red-600 to-rose-500 relative">
               <button
                onClick={() => setShowAvatar(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/20 cursor-pointer transition-all active:scale-90"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex justify-center -mt-12 relative z-10">
              <div className="p-1.5 rounded-[2rem] bg-white shadow-xl">
                {userImg ? (
                  <img
                    src={getImageUrl(userImg)}
                    alt="profile-lg"
                    className="w-24 h-24 rounded-[1.7rem] object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-[1.7rem] bg-slate-900 flex items-center justify-center text-white text-3xl font-black italic">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 pt-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter italic uppercase">{user?.name}</h2>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100/50">
                    <ShieldCheck size={12} strokeWidth={3} /> {user?.role}
                  </span>
                </div>
              </div>

              {/* DETAILS SECTION */}
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-red-500 border border-slate-50">
                    <Mail size={18} />
                  </div>
                  <div className="flex-1 overflow-hidden text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Official Email</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{user?.email || "N/A"}</p>
                  </div>
                </div>

                <div className="group flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-red-500 border border-slate-50">
                    <User size={18} />
                  </div>
                  <div className="flex-1 overflow-hidden text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Personnel Badge</p>
                    <code className="text-[12px] font-mono font-black text-red-700 uppercase">
                        {displayEmployeeId}
                    </code>
                  </div>
                  
                  <button 
                    onClick={handleCopyId}
                    className={`p-2 rounded-lg transition-all active:scale-90 ${copied ? 'bg-green-50 text-green-500' : 'bg-white shadow-sm text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100'}`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full mt-8 py-4 rounded-2xl bg-red-800 text-white font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-red-600 transition-all active:scale-95 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;