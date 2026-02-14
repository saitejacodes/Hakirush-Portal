import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";

import {
  CalendarDays,
  LineChart,
  Rocket,
  ClipboardList,
  Star,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Target,
  Zap,
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
        console.error("Connection Interrupted: Strategy data unavailable.");
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Analyzing Relationship Matrix...</p>
    </div>
  );

  if (!client) return (
    <div className="min-h-screen flex items-center justify-center text-red-600 font-black uppercase tracking-widest">
      Unauthorized Access: Dossier Restricted
    </div>
  );

  const plan = client.planType;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 pb-20">
      {/* STRATEGIC HEADER */}
      <div className="relative bg-slate-950 pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#450a0a_0%,_transparent_70%)] opacity-40" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-red-500" size={18} />
                <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em]">Official Partnership Dossier</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-none">
                Relationship <span className="text-red-600">Blueprint</span>
              </h1>
            </div>

            <div className="flex flex-wrap gap-4">
              <HeaderBadge label="Partnership Level" value={plan} />
              <HeaderBadge label="Stakeholder" value={client?.userId?.name} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20">
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-900/5 border border-slate-100 p-8 md:p-12 transition-all">
          {plan === "Annual" ? <AnnualPlan /> : <QuarterlyPlan />}
        </div>
      </div>
    </div>
  );
};

/* ================= HEADER BADGE ================= */
const HeaderBadge = ({ label, value }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-3xl min-w-[160px]">
    <p className="text-[8px] font-black uppercase text-red-500 tracking-widest mb-1">{label}</p>
    <p className="text-lg font-bold text-white uppercase italic truncate">{value}</p>
  </div>
);

/* ================= ANNUAL PLAN ================= */
const AnnualPlan = () => (
  <div className="space-y-12">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <InfoCard icon={<CalendarDays />} title="Engagement Period" text="Full Annual Partnership" />
      <InfoCard icon={<LineChart />} title="Engagement Level" text="Strategic Partner" />
      <InfoCard icon={<Star />} title="Success Focus" text="Long-term Growth" />
    </div>

    <div className="space-y-8">
      <SectionTitle icon={<Target />} text="Partnership Objectives" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          "Strengthen strategic collaboration via monthly reviews",
          "Advanced service delivery and 24/7 priority support",
          "Drive long-term digital & physical innovation",
          "Comprehensive wellness & sports engagement ecosystem",
          "KPI-driven employee participation & happiness growth",
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 group hover:border-red-500/20 transition-all">
            <CheckCircle2 className="text-red-600 shrink-0" size={20} />
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 group-hover:text-slate-900 transition-colors">{item}</span>
          </div>
        ))}
      </div>
    </div>

    <CTA />
  </div>
);

/* ================= QUARTERLY PLAN ================= */
const QuarterlyPlan = () => (
  <div className="space-y-10">
    <SectionTitle icon={<Zap />} text="Quarter-wise Relationship Strategy" />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Roadmap 
        quarter="Q1" 
        title="Onboarding & Kickoff"
        points={["Requirement workshops", "Governance setup", "Process mapping"]} 
      />
      <Roadmap 
        quarter="Q2" 
        title="Engagement & Adoption"
        points={["Employee activities", "Quarterly sports", "Performance review"]} 
      />
      <Roadmap 
        quarter="Q3" 
        title="Optimization"
        points={["ROI tracking", "Wellness measurement", "Engagement scaling"]} 
      />
      <Roadmap 
        quarter="Q4" 
        title="Renewal & Growth"
        points={["Renewal strategy", "Future roadmap", "Leadership review"]} 
      />
    </div>

    <CTA />
  </div>
);

/* ================= UI SUB-COMPONENTS ================= */
const SectionTitle = ({ icon, text }) => (
  <div className="flex items-center gap-4">
    <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-600/20">
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
      {text}
    </h2>
  </div>
);

const InfoCard = ({ icon, title, text }) => (
  <div className="group bg-slate-50 rounded-[2rem] p-8 border border-slate-100 hover:scale-[1.02] transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white rounded-xl shadow-sm text-red-600">{icon}</div>
      <div className="h-1 w-8 bg-slate-200 group-hover:bg-red-500 transition-colors mt-4" />
    </div>
    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1">{title}</h3>
    <p className="font-bold text-slate-900 uppercase italic">{text}</p>
  </div>
);

const Roadmap = ({ quarter, title, points }) => (
  <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 relative overflow-hidden group hover:border-red-500/20 transition-all">
    <span className="absolute -right-4 -top-4 text-8xl font-black italic text-slate-200/50 group-hover:text-red-500/10 transition-colors pointer-events-none">
      {quarter}
    </span>
    <p className="font-black text-red-600 text-[10px] tracking-[0.3em] uppercase mb-1">{quarter} Directive</p>
    <h4 className="text-lg font-black uppercase italic tracking-tight text-slate-900 mb-6">{title}</h4>
    <ul className="space-y-3">
      {points.map((p, i) => (
        <li key={i} className="flex gap-3 items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
          {p}
        </li>
      ))}
    </ul>
  </div>
);

const CTA = () => (
  <div className="relative bg-slate-900 rounded-[3rem] p-10 md:p-16 text-center overflow-hidden shadow-2xl shadow-slate-900/40">
    <div className="absolute inset-0 bg-gradient-to-br from-red-950/50 to-transparent" />
    
    <div className="relative z-10 space-y-6">
      <div className="inline-flex p-4 bg-white/10 backdrop-blur-xl rounded-3xl mb-4 border border-white/10">
        <Rocket className="text-red-500 animate-pulse" size={40} />
      </div>
      
      <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
        Ready to Elevate <br className="hidden md:block" /> Our Partnership?
      </h2>
      
      <p className="max-w-md mx-auto text-slate-400 text-xs font-bold uppercase tracking-[0.2em] leading-relaxed">
        Synchronize with your dedicated relationship manager to finalize next-gen strategy.
      </p>

      <button className="group mt-6 px-10 py-5 rounded-full bg-gradient-to-r from-red-800 to-red-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all flex items-center gap-4 mx-auto border border-red-500/50">
        Initiate Strategy Session 
        <ArrowRight className="group-hover:translate-x-2 transition-transform" size={18} />
      </button>
    </div>
  </div>
);

export default ClientRelationship;