import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2, Calendar, ChevronLeft, ShieldCheck,
  Globe, Users, Trophy, Activity, Edit, Fingerprint
} from "lucide-react";

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#C6A15B";
const HAIRLINE = "#E7DFD2";

const displayFont = { fontFamily: "'Playfair Display', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

const GRAIN_URI =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='140'%20height='140'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23n)'%20opacity='0.5'/%3E%3C/svg%3E";

const SponsorView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sponsor, setSponsor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsor = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/sponsors/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.data?.success) setSponsor(res.data.sponsor);
      } catch (error) {
        console.error("Failed to load sponsor record.", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSponsor();
  }, [id]);

  const getImageUrl = (url) => {
    if (!url) return "/default-avatar.png";
    if (url.startsWith("http")) return url;
    return `${import.meta.env.VITE_BACKEND_URL}/${url.replace(/^\/+/, "")}`;
  };

  const initials = React.useMemo(() => {
    const name = sponsor?.name || "";
    return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  }, [sponsor]);

  if (loading) return <LoadingPulse />;
  if (!sponsor) return <ErrorView />;

  return (
    <div
      className="relative min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-100 p-4 text-[#1C1A17] lg:p-10"
      style={bodyFont}
    >
      {/* faint paper grain */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] mix-blend-multiply"
        style={{ backgroundImage: `url("${GRAIN_URI}")` }}
      />
      {/* masthead rule */}
      <div
        className="relative z-10 -m-4 mb-8 h-[3px] w-[calc(100%+2rem)] lg:-m-10 lg:mb-10 lg:w-[calc(100%+5rem)]"
        style={{ background: `linear-gradient(90deg, ${GARNET}, ${GOLD} 45%, ${GARNET})` }}
      />

      <div className="relative z-10 mx-auto max-w-3xl">

        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex cursor-pointer items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#8A8378] transition-colors hover:text-[#1C1A17]"
        >
          <ChevronLeft size={14} strokeWidth={1.75} /> Back
        </button>

        <div
          className="overflow-hidden rounded-[2rem] border bg-white/80 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_40px_90px_-32px_rgba(28,26,23,0.28)] backdrop-blur-md"
          style={{ borderColor: HAIRLINE }}
        >
          {/* ============ NAMEPLATE ============ */}
          <div className="flex flex-col items-center px-8 pb-10 pt-12 text-center sm:px-14">
            <div
              className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2"
              style={{ borderColor: HAIRLINE }}
            >
              <img
                src={getImageUrl(sponsor.logo)}
                className="h-full w-full object-cover"
                alt="Sponsor Logo"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>

            <div className="mt-6 flex items-center gap-2">
              <div className="h-px w-6" style={{ backgroundColor: GOLD }} />
              <p className="text-[9px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
                {sponsor.collaboration || "Partner"}
              </p>
              <div className="h-px w-6" style={{ backgroundColor: GOLD }} />
            </div>
            <h1
              className="mt-3 text-4xl leading-none tracking-tight text-[#1C1A17] sm:text-5xl"
              style={{ ...displayFont, fontWeight: 700 }}
            >
              {sponsor.name || "N/A"}
            </h1>

            <button
              onClick={() => navigate(`/admin-dashboard/sponsors/edit/${sponsor._id}`)}
              className="mt-6 flex cursor-pointer items-center gap-2 rounded-full px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_28px_-10px_rgba(122,34,51,0.45)] transition-all hover:-translate-y-0.5 active:scale-95"
              style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
            >
              <Edit size={13} strokeWidth={1.75} /> Edit Record
            </button>
          </div>

          <GoldRule />

          {/* ============ DOSSIER ============ */}
          <div className="grid grid-cols-1 gap-x-10 gap-y-8 px-8 py-10 sm:grid-cols-2 sm:px-14">
            <Field icon={<Fingerprint size={14} strokeWidth={1.5} />} label="Legal Entity" value={sponsor.name} />
            <Field icon={<Users size={14} strokeWidth={1.5} />} label="Collaboration" value={sponsor.collaboration} />
            <Field icon={<Activity size={14} strokeWidth={1.5} />} label="Events Sponsored" value={sponsor.eventsSponsored || "0"} />
            <Field icon={<Globe size={14} strokeWidth={1.5} />} label="Market Reach" value={sponsor.reach || "—"} />
            <Field
              icon={<Calendar size={14} strokeWidth={1.5} />}
              label="Registry Date"
              value={sponsor.createdAt ? new Date(sponsor.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : "N/A"}
            />
            <Field icon={<ShieldCheck size={14} strokeWidth={1.5} />} label="Status" value="Verified" />
          </div>

          <GoldRule />

          {/* ============ UPCOMING OPERATIONS ============ */}
          <div className="flex flex-col items-start gap-4 px-8 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-14">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
                Upcoming Operations
              </p>
              <h2 className="mt-2 text-xl leading-snug" style={{ ...displayFont, fontWeight: 500 }}>
                {sponsor.upcomingEvents || "No future operations scheduled."}
              </h2>
            </div>
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white"
              style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
            >
              <Globe size={20} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[9px] uppercase tracking-[0.28em] text-[#8A8378]">
          Verified &nbsp;·&nbsp; Active &nbsp;·&nbsp; {sponsor.collaboration?.split(' ')[0] || "Basic"} Tier
        </p>
      </div>
    </div>
  );
};

/* ===== SUPPORTING COMPONENTS ===== */

const GoldRule = () => (
  <div className="px-8 sm:px-14">
    <div className="h-px" style={{ backgroundColor: "rgba(198,161,91,0.35)" }} />
  </div>
);

const Field = ({ icon, label, value }) => (
  <div>
    <div className="flex items-center gap-2" style={{ color: GOLD }}>
      {icon}
      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A8378]">{label}</span>
    </div>
    <p className="mt-1.5 truncate text-base text-[#1C1A17]" style={{ ...displayFont, fontWeight: 700 }}>
      {value || "—"}
    </p>
  </div>
);

const LoadingPulse = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-white via-red-50 to-pink-100">
    <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#E7DFD2] border-t-[#7A2233]"></div>
    <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-[#8A8378]">Syncing Records</p>
  </div>
);

const ErrorView = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-red-50 to-pink-100 p-6 text-center">
    <div className="rounded-[1.75rem] border border-[#E7DFD2] bg-white/85 px-12 py-14 shadow-[0_30px_60px_-24px_rgba(28,26,23,0.28)] backdrop-blur-md">
      <h2 className="text-3xl leading-none text-[#1C1A17]" style={{ ...displayFont, fontWeight: 700 }}>
        Not Found
      </h2>
      <button
        onClick={() => window.history.back()}
        className="mt-6 cursor-pointer rounded-full px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white"
        style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
      >
        Go Back
      </button>
    </div>
  </div>
);

export default SponsorView;