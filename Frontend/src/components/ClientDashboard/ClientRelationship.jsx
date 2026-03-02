import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import { motion } from "framer-motion";
import {
  CalendarDays,
  LineChart,
  Rocket,
  Star,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Target,
  Zap,
  ChevronRight,
  Award,
  Users,
  Briefcase,
  Activity
} from "lucide-react";

const ClientRelationship = () => {
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    const fetchClient = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/client`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const found = res.data.clients.find((c) => c.userId?._id === user._id);
        setClient(found || null);
      } catch {
        console.error("Strategy data unavailable.");
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin" />
      <p className="mt-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 text-center px-6">Analyzing Partnership Matrix...</p>
    </div>
  );

  if (!client) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="text-center p-8 md:p-12 bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl w-full max-w-md">
        <ShieldCheck size={40} className="text-slate-200 mx-auto mb-4" />
        <h2 className="text-slate-900 font-black uppercase italic text-xl md:text-2xl tracking-tighter">Identity Not Found</h2>
        <p className="text-slate-400 text-[10px] mt-2 uppercase tracking-widest font-bold">Partnership Dossier Restricted</p>
      </div>
    </div>
  );

  const plan = client.planType;

  return (
    // Removed h-screen and overflow-hidden for mobile scrolling
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 text-slate-900 font-sans selection:bg-red-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* MAIN CONTENT (LEFT/TOP) */}
        <main className="flex-1 bg-white/80 backdrop-blur-2xl relative border-r border-slate-100 shadow-[0_8px_32px_0_rgba(220,38,38,0.06)] order-2 lg:order-1">
          
          {/* HEADER HUD - Responsive padding and stacking */}
          <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-5 md:px-10 md:py-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-[0_2px_12px_rgba(220,38,38,0.04)]">
            <div className="flex items-center gap-4 md:gap-8">
              <div>
                <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Strategic_Partner</p>
                <p className="text-lg md:text-xl font-black text-slate-900 italic uppercase tracking-tighter truncate max-w-[150px] sm:max-w-none">
                  {client?.userId?.name}
                </p>
              </div>
              <div className="h-8 w-px bg-slate-100" />
              <div>
                <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Tier</p>
                <p className="text-lg md:text-xl font-black text-red-600 italic uppercase tracking-tighter">{plan}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <ShieldCheck size={14} className="text-red-600" />
              <span className="text-[8px] md:text-[9px] font-black text-slate-900 uppercase tracking-widest italic whitespace-nowrap">Verified</span>
            </div>
          </div>

          <div className="p-6 md:p-10 lg:p-16 max-w-4xl mx-auto">
             <div className="mb-12 md:mb-16">
                <div className="border-l-4 md:border-l-8 border-red-600 pl-4 md:pl-8 mb-8 md:mb-12">
                   <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900 leading-[0.9]">
                     Relationship<br/>
                     <span className="text-red-600 text-4xl md:text-6xl">Blueprint</span>
                   </h2>
                   <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-3">Confidential Directive</p>
                </div>
                
                {plan?.toLowerCase() === "annual" ? <AnnualStrategy /> : <QuarterlyStrategy />}
             </div>
             
             <CTA />
          </div>
        </main>

        {/* SIDEBAR/METRICS SUMMARY (RIGHT/BOTTOM) */}
        {/* On mobile, this acts as the top summary or bottom footer */}
        <aside className="w-full lg:w-[350px] xl:w-[400px] bg-white/70 backdrop-blur-2xl flex flex-col z-20 order-1 lg:order-2 lg:sticky lg:top-0 lg:h-screen shadow-[-10px_0_48px_rgba(220,38,38,0.06)] border-l border-red-100/40">
          <div className="p-6 md:p-10 border-b border-slate-100 bg-white/90 backdrop-blur rounded-b-3xl shadow-[0_4px_24px_rgba(220,38,38,0.08)]">
            <div className="flex items-center gap-2 mb-2">
              <Award size={12} className="text-red-600" />
              <span className="text-[9px] font-black uppercase tracking-widest text-red-600">Performance Index</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">Success</h1>
          </div>

          {/* Metric Tiles - Side scrolling on very small screens or grid on tablets */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 md:gap-4 overflow-y-auto lg:flex-1">
            <MetricTile icon={<Users />} label="Adoption" value="84%" />
            <MetricTile icon={<Activity />} label="Score" value="Elite" />
            <MetricTile icon={<Briefcase />} label="Completed" value="12/12" />
            <div className="sm:col-span-3 lg:col-span-1 mt-4 md:mt-6 p-6 md:p-8 bg-red-600/90 backdrop-blur rounded-[1.7rem] md:rounded-[2.2rem] text-white shadow-xl shadow-red-200 relative overflow-hidden group border border-white/20">
              <div className="absolute top-[-20%] right-[-10%] opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                <Zap size={120} />
              </div>
              <Zap className="mb-4 text-white" size={24} />
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Next Milestone</p>
              <h4 className="text-lg md:text-xl font-black uppercase italic leading-tight">Q3 Executive <br className="hidden md:block"/>Review Session</h4>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter cursor-pointer hover:gap-4 transition-all">
                <span>Schedule Now</span>
                <ChevronRight size={14} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

/* ================= SUB-MODULES - Updated for Responsive ================= */

const AnnualStrategy = () => (
  <div className="space-y-8 md:space-y-12">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
      <InfoCard icon={<CalendarDays />} title="Cycle" value="12 Months" />
      <InfoCard icon={<LineChart />} title="Role" value="Strategic" />
      <InfoCard icon={<Star />} title="Priority" value="High Growth" />
    </div>

    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3 mb-2 md:mb-4">
         <Target className="text-red-600" size={20} md={24} />
         <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Operational Objectives</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 md:gap-4">
        {[
          "Bi-annual Innovation Workshops",
          "Dedicated 24/7 Concierge",
          "Employee Wellness Analytics",
          "Custom Multi-Sport Roadmap",
        ].map((item, i) => (
          <motion.div 
            whileHover={{ x: 5 }}
            key={i} 
            className="flex items-center gap-4 bg-white border border-slate-100 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm hover:border-red-200 transition-all"
          >
            <CheckCircle2 className="text-red-600 flex-shrink-0" size={18} md={22} />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-600 leading-tight">{item}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

const QuarterlyStrategy = () => (
  <div className="grid grid-cols-1 gap-4 md:gap-6">
    <RoadmapStep q="Q1" title="Onboarding" points={["Asset Audit", "Gov Setup"]} />
    <RoadmapStep q="Q2" title="Adoption" points={["Event Launch", "Tracking"]} />
    <RoadmapStep q="Q3" title="Optimization" points={["Scaling", "ROI Review"]} />
    <RoadmapStep q="Q4" title="Expansion" points={["Renewal", "Next-Gen"]} />
  </div>
);

const InfoCard = ({ icon, title, value }) => (
  <div className="bg-white/80 backdrop-blur border border-slate-100 p-6 md:p-8 rounded-[1.7rem] md:rounded-[2.5rem] hover:bg-white hover:shadow-xl hover:shadow-red-900/5 transition-all">
    <div className="text-red-600 mb-3 md:mb-4">{icon}</div>
    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
    <p className="text-lg md:text-xl font-black uppercase italic text-slate-900 tracking-tight">{value}</p>
  </div>
);

const RoadmapStep = ({ q, title, points }) => (
  <div className="bg-white/90 backdrop-blur border-2 border-slate-50 p-6 md:p-8 rounded-[1.7rem] md:rounded-[3rem] group hover:border-red-100 transition-all flex flex-row justify-between items-center gap-4 shadow-sm hover:shadow-xl">
    <div className="flex-1">
      <span className="text-red-600 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1 md:mb-2 block">{q} Directive</span>
      <h4 className="text-xl md:text-2xl font-black uppercase italic text-slate-900 leading-tight">{title}</h4>
      <div className="flex flex-wrap gap-2 mt-3">
         {points.map((p, i) => (
           <span key={i} className="text-[7px] md:text-[9px] font-bold uppercase tracking-tighter bg-slate-100 px-2 md:px-3 py-1 rounded-full text-slate-500 whitespace-nowrap">{p}</span>
         ))}
      </div>
    </div>
    <div className="text-4xl md:text-6xl font-black italic text-slate-100 group-hover:text-red-50 transition-colors leading-none">{q}</div>
  </div>
);

const MetricTile = ({ icon, label, value }) => (
  <div className="bg-white/90 backdrop-blur border border-slate-100 p-4 md:p-6 rounded-2xl md:rounded-[2rem] flex items-center justify-between group hover:shadow-md transition-all">
    <div className="flex items-center gap-3 md:gap-4">
      <div className="p-2 bg-slate-50 text-slate-400 group-hover:text-red-600 transition-colors rounded-lg">{icon}</div>
      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
    </div>
    <span className="text-base md:text-lg font-black italic text-slate-900">{value}</span>
  </div>
);

const CTA = () => (
  <div className="relative bg-slate-900 rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-12 text-center overflow-hidden shadow-2xl mt-8">
    <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent" />
    <div className="relative z-10">
      <Rocket className="text-red-500 mx-auto mb-4 md:mb-6" size={32} md={48} />
      <h2 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-4 leading-tight">Ready to Amplify<br/>Results?</h2>
      <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-6 md:mb-8 max-w-[250px] md:max-w-sm mx-auto">Sync with your partner lead to activate next-gen protocols.</p>
      <button className="bg-red-600 hover:bg-red-700 text-white px-6 md:px-10 py-4 md:py-5 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all flex items-center gap-3 md:gap-4 mx-auto active:scale-95">
        Activate Session <ArrowRight size={16} />
      </button>
    </div>
  </div>
);

export default ClientRelationship;