import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import {
  Trophy,
  CalendarDays,
  Star,
  Flag,
  Users,
  Medal,
  X,
  MapPin,
  Calendar,
  ChevronRight,
  Zap,
} from "lucide-react";

/* ================= PRESTIGE UTILS ================= */
const getStatusBadgeClass = (status) => {
  switch ((status || "").toLowerCase()) {
    case "upcoming":
      return "bg-amber-500/10 text-amber-600 border-amber-200";
    case "ongoing":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
    case "completed":
      return "bg-slate-100 text-slate-500 border-slate-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

const ClientSportsPlan = () => {
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);

  useEffect(() => {
    if (!user?._id) return;
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        const [clientRes, annRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/client`, { headers }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/announcements`, { headers })
        ]);

        const found = clientRes.data.clients.find((c) => c.userId?._id === user._id);
        setClient(found || null);
        setAnnouncements(annRes.data.announcements || []);
      } catch (err) {
        console.error("System Error: Failed to retrieve dossiers.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-900/40">Synchronizing Global Plan...</p>
    </div>
  );

  if (!client) return <div className="min-h-screen flex items-center justify-center font-black uppercase text-red-600 tracking-widest">Client Profile Restricted</div>;

  const plan = client.planType;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-20">
      {/* HEADER SECTION */}
      <div className="relative bg-red-950 pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-600/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[1px] w-12 bg-red-500" />
                <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">Corporate Excellence</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-none">
                Sports <span className="text-red-500">Dossier</span>
              </h1>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl min-w-[140px]">
                <p className="text-[8px] font-black uppercase text-red-500 tracking-widest mb-1">Tier Level</p>
                <p className="text-xl font-bold text-white uppercase italic">{plan}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl min-w-[140px]">
                <p className="text-[8px] font-black uppercase text-red-500 tracking-widest mb-1">Organization</p>
                <p className="text-xl font-bold text-white truncate">{client?.userId?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: PLAN DETAILS */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-red-900/5 border border-slate-100 p-8 md:p-12 transition-all">
              {plan === "Annual" ? <AnnualPlan /> : <QuarterlyPlan />}
            </div>
          </div>

          {/* RIGHT: ANNOUNCEMENTS SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white sticky top-24 shadow-2xl shadow-slate-900/20">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black uppercase italic tracking-tight">Intelligence Brief</h2>
                <Zap size={18} className="text-red-500" />
              </div>

              {announcements.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">No active directives</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((a) => (
                    <button
                      key={a._id}
                      onClick={() => setActiveAnnouncement(a)}
                      className="group w-full text-left bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-4 transition-all"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wide text-white group-hover:text-red-400 transition-colors mb-2 line-clamp-1">{a.title}</p>
                      <div className="flex items-center gap-3 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                        <span>{a.date}</span>
                        <span className="w-1 h-1 bg-red-500 rounded-full" />
                        <span className="truncate">{a.venue}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ANNOUNCEMENT MODAL */}
      {activeAnnouncement && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-red-950/60 backdrop-blur-xl" onClick={() => setActiveAnnouncement(null)} />
          <div className="relative bg-white max-w-2xl w-full rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setActiveAnnouncement(null)}
              className="absolute top-6 right-6 z-10 p-3 bg-black/10 hover:bg-red-600 hover:text-white rounded-full transition-all"
            >
              <X size={20} />
            </button>

            {activeAnnouncement.image && (
              <div className="h-64 relative">
                <img src={activeAnnouncement.image} className="w-full h-full object-cover" alt="Briefing" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent" />
              </div>
            )}

            <div className="p-10 -mt-12 relative">
              <span className={`inline-block px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${getStatusBadgeClass(activeAnnouncement.status)} mb-4`}>
                {activeAnnouncement.status}
              </span>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 mb-2">
                {activeAnnouncement.title}
              </h3>
              <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 pb-6 border-b border-slate-100">
                <span className="flex items-center gap-1"><Calendar size={12}/> {activeAnnouncement.date}</span>
                <span className="flex items-center gap-1"><MapPin size={12}/> {activeAnnouncement.venue}</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                {activeAnnouncement.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= PRESTIGE SUB-COMPONENTS ================= */

const AnnualPlan = () => {
  const events = [
    { title: "Corporate Cricket Premier League", date: "JULY 2026" },
    { title: "Annual Badminton Championship", date: "SEPT 2026" },
    { title: "Corporate Volleyball Cup", date: "OCT 2026" },
    { title: "Global Corporate Marathon", date: "DEC 2026" },
    { title: "Elite Athletics Meet", date: "FEB 2027" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <SectionTitle icon={<Trophy />} text="Tournament Deployment" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Full-Scale Annual Operational Calendar</p>
      </div>

      <KPIGrid />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((e, i) => (
          <div key={i} className="group relative bg-slate-50 hover:bg-red-950 rounded-2xl p-6 transition-all duration-300">
            <div className="flex justify-between items-start">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 group-hover:text-white transition-colors max-w-[180px]">{e.title}</h4>
              <ChevronRight size={16} className="text-red-500 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="mt-4 text-[9px] font-bold text-red-600 group-hover:text-red-400 tracking-widest uppercase">{e.date}</p>
          </div>
        ))}
      </div>

      <Highlight icon={<Flag />} text="Command Lead: Corporate Cricket Premier League • July 2026 Deployment" />
    </div>
  );
};

const QuarterlyPlan = () => {
  const quarters = [
    { q: "Q1", game: "Table Tennis Tournament", status: "Completed", note: "Final Rankings Issued" },
    { q: "Q2", game: "Badminton Doubles League", status: "Scheduled", note: "Registry Open" },
    { q: "Q3", game: "Football 5v5 Elite", status: "Planned", note: "Venue TBA" },
    { q: "Q4", game: "Indoor Sports Festival", status: "Upcoming", note: "E-Invitations Pending" },
  ];

  return (
    <div className="space-y-10">
      <SectionTitle icon={<CalendarDays />} text="Quarterly Engagement Matrix" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {quarters.map((q) => (
          <div key={q.q} className="border-2 border-slate-100 rounded-[2rem] p-8 hover:border-red-500/20 transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="text-3xl font-black italic text-red-600">{q.q}</span>
              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${getStatusBadgeClass(q.status)}`}>
                {q.status}
              </span>
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-1">{q.game}</h4>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{q.note}</p>
          </div>
        ))}
      </div>

      <Highlight icon={<Medal />} text="Quarterly protocols ensure sustained wellness and organizational cohesion." />
    </div>
  );
};

const SectionTitle = ({ icon, text }) => (
  <h2 className="text-3xl font-black flex items-center gap-4 text-slate-900 uppercase italic tracking-tighter">
    <span className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-600/20">{icon}</span>
    {text}
  </h2>
);

const Highlight = ({ icon, text }) => (
  <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-6 flex items-center gap-4">
    <div className="h-10 w-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
        {icon}
    </div>
    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-900 leading-relaxed">{text}</p>
  </div>
);

const KPIGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
    <KPI icon={<Users />} label="Target Personnel" value="500+" />
    <KPI icon={<Trophy />} label="Major Operations" value="05" />
    <KPI icon={<Star />} label="Honorarium" value="25+" />
  </div>
);

const KPI = ({ icon, label, value }) => (
  <div className="group bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:scale-[1.02] transition-all">
    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</p>
    <div className="flex justify-between items-center">
      <span className="text-4xl font-black italic text-slate-900 group-hover:text-red-600 transition-colors">{value}</span>
      <span className="text-red-500 bg-white p-3 rounded-xl shadow-sm">{icon}</span>
    </div>
  </div>
);

export default ClientSportsPlan;