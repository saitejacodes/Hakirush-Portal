import React, { useEffect, useState } from "react";
import {
  Menu, LogOut, X, Mail, User, ShieldCheck,
  Copy, Check
} from "lucide-react";
import { useAuth } from "../../context/authContext";
import { useSidebar } from "../../context/sidebarContext";

const CHARCOAL = "#1A1A1D";
const GOLD = "#AD8A56";
const IVORY = "#F6F2EA";
const SLATE = "#7A756C";
const HAIRLINE = "rgba(26,26,29,0.10)";
const GOLD_HAIRLINE = "rgba(173,138,86,0.35)";

const displayFont = { fontFamily: "'Cormorant Garamond', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

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
        className="sticky top-0 z-50 bg-white/90 px-4 py-3 backdrop-blur-xl transition-all duration-500 sm:px-8"
        style={{
          borderBottom: `1px solid ${scrolled ? HAIRLINE : "transparent"}`,
          boxShadow: scrolled ? "0 4px 24px rgba(26,26,29,0.05)" : "none",
          ...bodyFont,
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          {/* LEFT: Welcome */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpen(true)}
              className="rounded-xl p-2.5 transition-colors md:hidden"
              style={{ backgroundColor: IVORY, color: SLATE }}
            >
              <Menu size={19} strokeWidth={1.75} />
            </button>

            <div className="hidden sm:block">
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em]" style={{ color: GOLD }}>Welcome back</p>
              <h1 className="mt-0.5 text-xl leading-none" style={{ ...displayFont, fontWeight: 500, color: CHARCOAL }}>
                {user?.name}
              </h1>
            </div>
          </div>

          {/* RIGHT: Avatar + Logout */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAvatar(true)}
              className="group relative cursor-pointer rounded-full transition-transform active:scale-95"
            >
              <div className="relative">
                {userImg ? (
                  <img
                    src={getImageUrl(userImg)}
                    alt="profile"
                    className="h-9 w-9 rounded-full border object-cover transition-colors sm:h-10 sm:w-10"
                    style={{ borderColor: GOLD_HAIRLINE }}
                  />
                ) : (
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full border text-sm sm:h-10 sm:w-10"
                    style={{ borderColor: GOLD_HAIRLINE, color: CHARCOAL, ...displayFont, fontWeight: 500 }}
                  >
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white" style={{ backgroundColor: GOLD }} />
              </div>
            </button>

            <button
              onClick={logout}
              className="group flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest transition-colors"
              style={{ borderColor: HAIRLINE, color: SLATE }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = CHARCOAL; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = CHARCOAL; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = SLATE; e.currentTarget.style.borderColor = HAIRLINE; }}
            >
              <LogOut size={15} strokeWidth={1.75} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============ PROFILE MODAL ============ */}
      {showAvatar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#1A1A1D]/30 backdrop-blur-md"
            onClick={() => setShowAvatar(false)}
          />

          <div
            className="relative w-full max-w-sm overflow-hidden rounded-[1.25rem] border bg-white/95 shadow-[0_40px_90px_-32px_rgba(26,26,29,0.4)] backdrop-blur-md"
            style={{ borderColor: HAIRLINE, ...bodyFont }}
          >
            <button
              onClick={() => setShowAvatar(false)}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors"
              style={{ backgroundColor: IVORY, color: SLATE }}
            >
              <X size={15} strokeWidth={1.75} />
            </button>

            <div className="flex flex-col items-center px-8 pb-8 pt-12 text-center">
              <div className="h-24 w-24 overflow-hidden rounded-full border" style={{ borderColor: GOLD_HAIRLINE }}>
                {userImg ? (
                  <img src={getImageUrl(userImg)} alt="profile-lg" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl" style={{ backgroundColor: CHARCOAL, color: GOLD, ...displayFont, fontWeight: 500 }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              <h2 className="mt-5 text-2xl leading-none" style={{ ...displayFont, fontWeight: 500, color: CHARCOAL }}>
                {user?.name}
              </h2>
              <span
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[9.5px] font-semibold uppercase tracking-[0.2em]"
                style={{ borderColor: GOLD_HAIRLINE, color: GOLD }}
              >
                <ShieldCheck size={12} strokeWidth={1.75} /> {user?.role}
              </span>
            </div>

            <div className="px-8 pb-8">
              <div className="h-px" style={{ backgroundColor: GOLD_HAIRLINE }} />

              <div className="mt-6 space-y-5">
                <DetailRow icon={<Mail size={15} strokeWidth={1.5} />} label="Official Email" value={user?.email || "N/A"} />

                <div className="group flex items-center gap-3">
                  <span style={{ color: GOLD }}><User size={15} strokeWidth={1.5} /></span>
                  <div className="flex-1 overflow-hidden text-left">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: SLATE }}>Personnel Badge</p>
                    <p className="mt-0.5 truncate text-sm font-semibold" style={{ color: CHARCOAL, fontFamily: "'IBM Plex Mono', monospace" }}>
                      {displayEmployeeId}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyId}
                    className="cursor-pointer rounded-full p-2 transition-colors"
                    style={{ color: copied ? GOLD : SLATE }}
                  >
                    {copied ? <Check size={14} strokeWidth={1.75} /> : <Copy size={14} strokeWidth={1.75} />}
                  </button>
                </div>
              </div>

              <button
                onClick={logout}
                className="mt-8 w-full cursor-pointer rounded-full py-3.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: CHARCOAL }}
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

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <span style={{ color: "#AD8A56" }}>{icon}</span>
    <div className="flex-1 overflow-hidden text-left">
      <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#7A756C" }}>{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold" style={{ color: "#1A1A1D" }}>{value}</p>
    </div>
  </div>
);

export default Navbar;