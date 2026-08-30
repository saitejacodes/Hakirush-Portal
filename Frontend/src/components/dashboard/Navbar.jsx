import React, { useEffect, useRef, useState } from "react";
import {
  Menu, LogOut, X, Mail, User, ShieldCheck,
  Copy, Check
} from "lucide-react";
import { useAuth } from "../../context/authContext";
import { useSidebar } from "../../context/sidebarContext";

const CHARCOAL = "#1A1A1D";
const GOLD = "#AD8A56";
const GOLD_DEEP = "#8C6D3F";
const IVORY = "#F6F2EA";
const SLATE = "#7A756C";
const HAIRLINE = "rgba(26,26,29,0.10)";
const GOLD_HAIRLINE = "rgba(173,138,86,0.35)";
const GOLD_WASH = "rgba(173,138,86,0.08)";

/* Profile / checkout accent — matches the red used on checkout */
const RED = "#C0362C";
const RED_DEEP = "#9C2B23";
const RED_HAIRLINE = "rgba(192,54,44,0.35)";
const RED_WASH = "rgba(192,54,44,0.08)";

const displayFont = { fontFamily: "'Cormorant Garamond', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };
const monoFont = { fontFamily: "'IBM Plex Mono', monospace" };

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Working late";
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { setOpen } = useSidebar();
  const [scrolled, setScrolled] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!panelOpen) return;
    const handleClick = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setPanelOpen(false);
      }
    };
    const handleKey = (e) => { if (e.key === "Escape") setPanelOpen(false); };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [panelOpen]);

  const displayEmployeeId = user?.employeeId || "NO ID";

  const handleCopyId = () => {
    if (user?.employeeId) {
      navigator.clipboard.writeText(user.employeeId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");
    return imagePath.startsWith("/") ? `${baseUrl}${imagePath}` : `${baseUrl}/${imagePath}`;
  };

  const userImg = user?.profileImage || user?.clientImage || user?.image || user?.avatar;
  const showImg = userImg && !imgError;
  const initial = user?.name?.[0]?.toUpperCase() || "?";

  return (
    <>
      <style>{`
        @keyframes navPanelIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .nav-panel { animation: none !important; }
        }
        .nav-focus:focus-visible {
          outline: 2px solid ${GOLD};
          outline-offset: 2px;
        }
      `}</style>

      <header
        className="sticky top-0 z-50 bg-white/90 px-4 py-3 backdrop-blur-xl transition-all duration-500 sm:px-8"
        style={{
          borderBottom: `1px solid ${scrolled ? GOLD_HAIRLINE : "transparent"}`,
          boxShadow: scrolled ? "0 4px 24px rgba(26,26,29,0.06)" : "none",
          ...bodyFont,
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          {/* LEFT: Greeting */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpen(true)}
              className="nav-focus rounded-xl p-2.5 transition-colors md:hidden"
              style={{ backgroundColor: IVORY, color: SLATE }}
              aria-label="Open menu"
            >
              <Menu size={19} strokeWidth={1.75} />
            </button>

            <div className="hidden sm:block">
              <p
                className="text-[9px] font-semibold uppercase tracking-[0.24em]"
                style={{ color: GOLD }}
              >
                {getGreeting()}
              </p>
              <h1
                className="mt-0.5 text-xl leading-none"
                style={{ ...displayFont, fontWeight: 500, color: CHARCOAL }}
              >
                {user?.name}
              </h1>
            </div>
          </div>

          {/* RIGHT: Avatar trigger */}
          <div className="relative flex items-center gap-3">
            <button
              ref={triggerRef}
              onClick={() => setPanelOpen((v) => !v)}
              className="nav-focus group relative cursor-pointer rounded-full transition-transform active:scale-95"
              aria-haspopup="true"
              aria-expanded={panelOpen}
              aria-label="Open account menu"
            >
              <div className="relative">
                <div
                  className="rounded-full p-[2px] transition-colors"
                  style={{
                    background: panelOpen
                      ? `linear-gradient(135deg, ${RED}, ${RED_DEEP})`
                      : "transparent",
                  }}
                >
                  {showImg ? (
                    <img
                      src={getImageUrl(userImg)}
                      alt=""
                      onError={() => setImgError(true)}
                      className="h-9 w-9 rounded-full border object-cover sm:h-10 sm:w-10"
                      style={{ borderColor: panelOpen ? "transparent" : RED_HAIRLINE }}
                    />
                  ) : (
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full border text-sm sm:h-10 sm:w-10"
                      style={{
                        borderColor: panelOpen ? "transparent" : RED_HAIRLINE,
                        backgroundColor: panelOpen ? "transparent" : "#fff",
                        color: CHARCOAL,
                        ...displayFont,
                        fontWeight: 500,
                      }}
                    >
                      {initial}
                    </div>
                  )}
                </div>
                <span
                  className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white"
                  style={{ backgroundColor: RED }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* ============ ACCOUNT PANEL ============ */}
        {panelOpen && (
          <div
            ref={panelRef}
            className="nav-panel absolute right-4 top-full z-[100] mt-3 w-[320px] overflow-hidden rounded-[1.1rem] border bg-white shadow-[0_28px_70px_-24px_rgba(26,26,29,0.35)] sm:right-8"
            style={{
              borderColor: RED_HAIRLINE,
              animation: "navPanelIn 0.16s ease-out",
              transformOrigin: "top right",
              ...bodyFont,
            }}
            role="menu"
          >
            <button
              onClick={() => setPanelOpen(false)}
              className="nav-focus absolute right-3 top-3 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors"
              style={{ backgroundColor: IVORY, color: SLATE }}
              aria-label="Close account menu"
            >
              <X size={13} strokeWidth={1.75} />
            </button>

            <div
              className="flex items-center gap-3 px-6 pb-5 pt-6"
              style={{ backgroundColor: RED_WASH }}
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border" style={{ borderColor: RED_HAIRLINE }}>
                {showImg ? (
                  <img src={getImageUrl(userImg)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-xl"
                    style={{ backgroundColor: CHARCOAL, color: RED, ...displayFont, fontWeight: 500 }}
                  >
                    {initial}
                  </div>
                )}
              </div>
              <div className="min-w-0 text-left">
                <h2
                  className="truncate text-lg leading-tight"
                  style={{ ...displayFont, fontWeight: 500, color: CHARCOAL }}
                >
                  {user?.name}
                </h2>
                <span
                  className="mt-1 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em]"
                  style={{ borderColor: RED_HAIRLINE, color: RED_DEEP, backgroundColor: "#fff" }}
                >
                  <ShieldCheck size={11} strokeWidth={1.75} /> {user?.role}
                </span>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="space-y-4">
                <DetailRow icon={<Mail size={15} strokeWidth={1.5} />} label="Official Email" value={user?.email || "N/A"} accent={RED} />

                <div className="flex items-center gap-3">
                  <span style={{ color: RED }}><User size={15} strokeWidth={1.5} /></span>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: SLATE }}>
                      Personnel Badge
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold" style={{ color: CHARCOAL, ...monoFont }}>
                      {displayEmployeeId}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyId}
                    className="nav-focus shrink-0 cursor-pointer rounded-full p-2 transition-colors"
                    style={{ color: copied ? RED : SLATE, backgroundColor: copied ? RED_WASH : "transparent" }}
                    aria-label="Copy personnel badge"
                  >
                    {copied ? <Check size={14} strokeWidth={1.75} /> : <Copy size={14} strokeWidth={1.75} />}
                  </button>
                </div>
              </div>

              <button
                onClick={logout}
                className="nav-focus mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-3.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white transition-colors"
                style={{ backgroundColor: CHARCOAL }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = RED_DEEP; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = CHARCOAL; }}
              >
                <LogOut size={14} strokeWidth={1.75} />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

const DetailRow = ({ icon, label, value, accent = GOLD }) => (
  <div className="flex items-center gap-3">
    <span style={{ color: accent }}>{icon}</span>
    <div className="min-w-0 flex-1 text-left">
      <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: SLATE }}>{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold" style={{ color: CHARCOAL }}>{value}</p>
    </div>
  </div>
);

export default Navbar;
