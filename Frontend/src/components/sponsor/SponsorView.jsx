import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Users, 
  Calendar, 
  Trophy, 
  Activity,
  ArrowUpRight
} from "lucide-react";

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
      } catch {
        console.error("Critical failure in asset retrieval.");
      } finally {
        setLoading(false);
      }
    };
    fetchSponsor();
  }, [id]);

  const getImageUrl = (url) => {
    if (!url) return "/default-avatar.png";
    if (url.startsWith("http")) return url;
    return `${import.meta.env.VITE_BACKEND_URL}/${url}`;
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Syncing Intelligence...</p>
    </div>
  );

  if (!sponsor) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-600 font-black uppercase tracking-widest">Protocol Error: Asset Not Found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* TOP NAVIGATION */}
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 hover:text-red-600 transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Terminal
        </button>

        <div className="relative bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] border border-white overflow-hidden">
          
          {/* HEADER SECTION */}
          <div className="relative p-8 md:p-12 border-b border-slate-100">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-white shadow-2xl p-2 border border-slate-50 rotate-3 overflow-hidden">
                  <img
                    src={getImageUrl(sponsor.logo)}
                    alt="Sponsor Logo"
                    className="w-full h-full object-cover rounded-[2rem]"
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-3 rounded-2xl shadow-lg">
                  <ShieldCheck size={20} />
                </div>
              </div>

              {/* Title Info */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest">
                  <Zap size={12} fill="currentColor" /> {sponsor.collaboration || "Partner"}
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
                  {sponsor.name}
                </h1>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Registry ID: {id.slice(-8).toUpperCase()} • Active Status: Verified
                </p>
              </div>
            </div>
          </div>

          {/* METRICS STRIP */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-100 bg-slate-50/50">
            <StatCard icon={<Trophy size={18} />} label="Events" value={sponsor.eventsSponsored || "0"} color="text-red-600" />
            <StatCard icon={<Activity size={18} />} label="Reach" value={sponsor.reach || "—"} color="text-slate-900" />
            <StatCard icon={<ArrowUpRight size={18} />} label="Tier" value={sponsor.collaboration?.split(' ')[0] || "Basic"} color="text-slate-900" />
            <StatCard icon={<Calendar size={18} />} label="Joined" value={new Date(sponsor.createdAt).getFullYear()} color="text-slate-900" />
          </div>

          {/* DETAILED DATA SECTION */}
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              
              {/* Left Column: Core Data */}
              <div className="space-y-8">
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-red-600 flex items-center gap-3">
                  <div className="w-8 h-[2px] bg-red-600" /> Core Intelligence
                </h3>
                <div className="space-y-6">
                  <DataRow label="Legal Entity" value={sponsor.name} icon={<ShieldCheck size={16}/>} />
                  <DataRow label="Collaboration" value={sponsor.collaboration} icon={<Zap size={16}/>} />
                  <DataRow label="System Logged" value={new Date(sponsor.createdAt).toDateString()} icon={<Calendar size={16}/>} />
                </div>
              </div>

              {/* Right Column: Roadmap */}
              <div className="space-y-8">
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-red-600 flex items-center gap-3">
                  <div className="w-8 h-[2px] bg-red-600" /> Mission Pipeline
                </h3>
                <div className="bg-red-50/50 rounded-3xl p-8 border border-red-100">
                  <div className="flex items-center gap-2 text-red-600 mb-4">
                    <Globe size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Upcoming Operations</span>
                  </div>
                  <p className="text-slate-700 text-lg font-bold leading-relaxed italic">
                    "{sponsor.upcomingEvents || "No future operations currently scheduled in the pipeline."}"
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* FOOTER ACTION */}
          <div className="p-8 bg-slate-900 flex justify-between items-center">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              Authorized Access Only • Dashboard V3.0
            </p>
            <div className="flex gap-4">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <div className="w-2 h-2 rounded-full bg-red-500" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

/* HELPER COMPONENTS */
const StatCard = ({ icon, label, value, color }) => (
  <div className="p-6 md:p-8 flex flex-col items-center justify-center border-r border-slate-100 last:border-none text-center">
    <div className={`${color} mb-2 opacity-60`}>{icon}</div>
    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
    <p className={`text-xl font-black uppercase tracking-tighter ${color}`}>{value}</p>
  </div>
);

const DataRow = ({ label, value, icon }) => (
  <div className="group border-b border-slate-100 pb-4">
    <div className="flex items-center gap-3 text-red-500/50 mb-1">
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-slate-800 font-bold text-lg pl-7">{value || "—"}</p>
  </div>
);

export default SponsorView;