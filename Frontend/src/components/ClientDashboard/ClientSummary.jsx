import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Users,
  Medal,
  X,
  MapPin,
  Calendar,
  ChevronRight,
  Zap,
  Target,
  ShieldCheck,
  Activity,
  BarChart3,
  Bell
} from "lucide-react";

/* ================= THEME UTILS ================= */
const getStatusBadgeClass = (status) => {
  switch ((status || "").toLowerCase()) {
    case "upcoming": return "text-amber-600 border-amber-200 bg-amber-50";
    case "ongoing": return "text-emerald-600 border-emerald-200 bg-emerald-50";
    case "completed": return "text-slate-400 border-slate-100 bg-slate-50";
    default: return "text-red-600 border-red-100 bg-red-50";
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
        console.error("Connection Interrupted");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-16 h-16 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin" />
      <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Loading Environment...</p>
    </div>
  );

  if (!client) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-12 bg-white rounded-[3rem] shadow-xl">
        <ShieldCheck size={48} className="text-slate-200 mx-auto mb-4" />
        <h2 className="text-slate-900 font-black uppercase italic text-2xl tracking-tighter">Access Pending</h2>
        <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-bold">Awaiting Dossier Assignment</p>
      </div>
    </div>
  );

  const plan = client.planType;

  return (
    <div className="h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 text-slate-900 font-sans overflow-hidden selection:bg-red-100">
      {/* Container swapped to flex-row (Main Left, Sidebar Right) */}
      <div className="flex flex-col lg:flex-row h-full">
        
        {/* MAIN: OPERATIONS (Now on the Left) */}
        <main className="flex-1 overflow-y-auto bg-white/80 backdrop-blur-2xl relative border-r border-slate-100 shadow-[0_8px_32px_0_rgba(220,38,38,0.06)]">
          {/* HEADER HUD */}
          <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 py-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_2px_12px_rgba(220,38,38,0.04)]">
            <div className="flex items-center gap-8">
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Organization</p>
                    <p className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">{client?.userId?.name}</p>
                </div>
                <div className="h-8 w-px bg-slate-100 hidden md:block" />
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tier Level</p>
                    <p className="text-xl font-black text-red-600 italic uppercase tracking-tighter">{plan}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Target size={16} className="text-red-600" />
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] italic">Status: Online</span>
            </div>
          </div>

          <div className="p-10 lg:p-16 max-w-6xl mx-auto">
            {plan === "Annual" ? <AnnualLayout /> : <QuarterlyLayout />}
          </div>
        </main>

        {/* SIDEBAR: INTEL FEED (Now on the Right) */}
        <aside className="w-full lg:w-[400px] bg-white/70 backdrop-blur-2xl flex flex-col z-20 shadow-[-10px_0_48px_rgba(220,38,38,0.06)] border-l border-red-100/40">
          <div className="p-10 border-b border-slate-100 bg-white/90 backdrop-blur rounded-b-3xl shadow-[0_4px_24px_rgba(220,38,38,0.08)]">
            <div className="flex items-center gap-2 mb-3">
              <Bell size={14} className="text-red-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">Updates Feed</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {announcements.map((a, idx) => (
              <motion.button
                whileHover={{ x: -5 }} 
                key={a._id}
                onClick={() => setActiveAnnouncement(a)}
                className="w-full text-left p-6 rounded-[2.2rem] bg-white/90 backdrop-blur border border-slate-100 hover:border-red-200 hover:shadow-xl hover:shadow-red-900/10 transition-all group"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{a.date}</span>
                  <Zap size={12} className="text-slate-200 group-hover:text-red-500" />
                </div>
                <p className="text-md font-black text-slate-800 uppercase italic tracking-tight group-hover:text-red-600 transition-colors">
                  {a.title}
                </p>
              </motion.button>
            ))}
          </div>
        </aside>
      </div>

      {/* MODAL SYSTEM (Remains Center) */}
      <AnimatePresence>
        {activeAnnouncement && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveAnnouncement(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white/90 backdrop-blur-2xl w-full max-w-3xl rounded-[3.5rem] overflow-hidden shadow-[0_16px_64px_rgba(220,38,38,0.10)] border border-white/40"
            >
                <div className="relative h-64 bg-slate-100">
                    {activeAnnouncement.image && (
                        <img src={activeAnnouncement.image} className="w-full h-full object-cover" alt="" />
                    )}
                    <button onClick={() => setActiveAnnouncement(null)} className="absolute top-8 right-8 p-3 bg-white/90 hover:bg-red-600 hover:text-white rounded-full transition-all shadow-xl">
                      <X size={20}/>
                    </button>
                    <div className="absolute bottom-0 left-0 p-10 w-full bg-gradient-to-t from-white to-transparent">
                        <span className={`inline-block px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border ${getStatusBadgeClass(activeAnnouncement.status)} mb-4`}>
                            {activeAnnouncement.status}
                        </span>
                        <h3 className="text-4xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">{activeAnnouncement.title}</h3>
                    </div>
                </div>
                <div className="p-10">
                    <div className="flex flex-wrap gap-8 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-100 pb-8">
                        <span className="flex items-center gap-2"><Calendar size={14} className="text-red-600"/> {activeAnnouncement.date}</span>
                        <span className="flex items-center gap-2"><MapPin size={14} className="text-red-600"/> {activeAnnouncement.venue}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium text-lg italic bg-slate-50/80 p-8 rounded-3xl">
                      "{activeAnnouncement.description}"
                    </p>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ================= COMPONENTS (Left-Aligned Visuals) ================= */

const AnnualLayout = () => {
  const events = [
    { title: "Cricket Premier League", date: "JULY 2026", sub: "Global Series" },
    { title: "Badminton Championship", date: "SEPT 2026", sub: "Elite Tournament" },
    { title: "Volleyball Masters", date: "OCT 2026", sub: "Corporate Cup" },
    { title: "Corporate Marathon", date: "DEC 2026", sub: "Wellness Initiative" },
  ];

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="border-l-8 border-red-600 pl-8">
          <h2 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">Annual<br/><span className="text-red-600 text-6xl">Plan</span></h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] mt-3">Strategic Calendar 2026</p>
        </div>
        <div className="flex gap-4">
            <KPI label="Personnel" value="500+" />
            <KPI label="Operations" value="05" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((e, i) => (
          <motion.div whileHover={{ y: -8 }} key={i} className="bg-slate-50/50 border border-slate-100 p-10 rounded-[3rem] group hover:bg-white hover:border-red-200 hover:shadow-xl hover:shadow-red-900/5 transition-all flex flex-col justify-between h-[220px]">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white shadow-sm text-red-600 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-all">
                  <Trophy size={20} />
                </div>
                <ChevronRight size={20} className="text-slate-200 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-xl font-black uppercase italic text-slate-900 tracking-tight leading-tight group-hover:text-red-600 transition-colors">{e.title}</h4>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{e.sub}</p>
            </div>
            <span className="text-sm font-black text-red-600 uppercase tracking-[0.2em]">{e.date}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const QuarterlyLayout = () => {
    const quarters = [
        { q: "Q1", game: "Table Tennis", status: "Completed", icon: <Activity className="text-red-600"/> },
        { q: "Q2", game: "Badminton Doubles", status: "Scheduled", icon: <Target className="text-red-600"/> },
        { q: "Q3", game: "Football 5v5", status: "Planned", icon: <Trophy className="text-red-600"/> },
        { q: "Q4", game: "Indoor Sports", status: "Upcoming", icon: <BarChart3 className="text-red-600"/> },
    ];

    return (
        <div className="space-y-16">
            <div className="border-l-8 border-red-600 pl-8">
                <h2 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">Quarterly<br/><span className="text-red-600 text-6xl">Matrix</span></h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] mt-3">Engagement Cycles</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {quarters.map((q) => (
                    <div key={q.q} className="bg-white border-2 border-slate-50 p-10 rounded-[3rem] relative overflow-hidden group hover:border-red-100 transition-all shadow-sm hover:shadow-xl">
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <span className="text-7xl font-black italic text-slate-100 leading-none group-hover:text-red-50 transition-colors">{q.q}</span>
                            <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase border ${getStatusBadgeClass(q.status)}`}>{q.status}</span>
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="p-3 bg-slate-50 rounded-xl">{q.icon}</div>
                          <h4 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter">{q.game}</h4>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const KPI = ({ label, value }) => (
    <div className="bg-white border border-slate-100 px-8 py-6 rounded-[2rem] text-center min-w-[140px] shadow-sm">
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mb-1">{label}</p>
        <span className="text-3xl font-black italic text-slate-900 tracking-tighter">{value}</span>
    </div>
)

export default ClientSportsPlan;