import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Store, 
  Layers, 
  Activity, 
  Calendar, 
  ShieldCheck, 
  MapPin,
  ClipboardList,
  Loader2
} from "lucide-react";

const StallView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stall, setStall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStall = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/stalls/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.data?.success) setStall(res.data.stall);
      } catch {
        console.error("Critical failure in asset retrieval.");
      } finally {
        setLoading(false);
      }
    };
    fetchStall();
  }, [id]);

  const getImageUrl = (url) => {
    if (!url) return "/default-avatar.png";
    if (url.startsWith("http")) return url;
    return `${import.meta.env.VITE_BACKEND_URL}/${url}`;
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Syncing Intelligence...</p>
    </div>
  );

  if (!stall) return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <p className="text-red-600 font-black uppercase tracking-widest text-center">
        Protocol Error: <br/> Asset Not Found
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* TOP NAVIGATION */}
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-400 mb-8 hover:text-red-600 transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Terminal
        </button>

        <div className="relative bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(153,27,27,0.15)] border border-white overflow-hidden">
          
          {/* HEADER SECTION */}
          <div className="relative p-8 md:p-12 border-b border-red-50">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-white shadow-2xl p-2 border border-red-50 rotate-3 overflow-hidden group hover:rotate-0 transition-transform duration-500">
                  <img
                    src={getImageUrl(stall.logo)}
                    alt="Stall Logo"
                    className="w-full h-full object-cover rounded-[2rem]"
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-3 rounded-2xl shadow-lg">
                  <Store size={20} />
                </div>
              </div>

              {/* Title Info */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck size={12} fill="currentColor" /> Verified Stall
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-red-950 leading-none">
                  {stall.name}
                </h1>
                <p className="text-[11px] font-bold text-red-300 uppercase tracking-[0.2em]">
                  Stall Registry: {stall.number} • Status: Active
                </p>
              </div>
            </div>
          </div>

          {/* METRICS STRIP */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-red-50 bg-red-50/30">
            <StatCard icon={<MapPin size={18} />} label="Location" value={stall.number || "N/A"} color="text-red-600" />
            <StatCard icon={<Activity size={18} />} label="Events" value={stall.eventCount || "0"} color="text-red-950" />
            <StatCard icon={<Layers size={18} />} label="Type" value={stall.type || "Standard"} color="text-red-950" />
            <StatCard icon={<Calendar size={18} />} label="Year" value={new Date(stall.createdAt).getFullYear()} color="text-red-950" />
          </div>

          {/* DETAILED DATA SECTION */}
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              
              {/* Left Column: Core Data */}
              <div className="space-y-8">
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-red-600 flex items-center gap-3">
                  <div className="w-8 h-[2px] bg-red-600" /> Technical Specs
                </h3>
                <div className="space-y-6">
                  <DataRow label="Assigned Name" value={stall.name} icon={<Store size={16}/>} />
                  <DataRow label="Deployment Type" value={stall.type} icon={<Layers size={16}/>} />
                  <DataRow label="System Logged" value={new Date(stall.createdAt).toDateString()} icon={<Calendar size={16}/>} />
                </div>
              </div>

              {/* Right Column: Plans */}
              <div className="space-y-8">
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-red-600 flex items-center gap-3">
                  <div className="w-8 h-[2px] bg-red-600" /> Mission Protocols
                </h3>
                <div className="bg-red-50/50 rounded-3xl p-8 border border-red-100 min-h-[160px] flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-red-600 mb-4">
                    <ClipboardList size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Active Plans</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stall.plans && stall.plans.length ? (
                      stall.plans.map((plan, i) => (
                        <span key={i} className="px-4 py-2 bg-white border border-red-100 rounded-xl text-xs font-black uppercase tracking-wider text-red-900 shadow-sm italic">
                          "{plan}"
                        </span>
                      ))
                    ) : (
                      <p className="text-red-300 text-xs italic font-bold">No mission protocols assigned.</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* FOOTER ACTION (DEEP RED) */}
          <div className="p-8 bg-red-950 flex justify-between items-center">
            <p className="text-[9px] font-bold text-red-400/50 uppercase tracking-[0.2em]">
              Authorized Access Only • Dashboard V3.0
            </p>
            <div className="flex gap-4">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <div className="w-2 h-2 rounded-full bg-red-600" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

/* HELPER COMPONENTS */
const StatCard = ({ icon, label, value, color }) => (
  <div className="p-6 md:p-8 flex flex-col items-center justify-center border-r border-red-50 last:border-none text-center">
    <div className={`${color} mb-2 opacity-60`}>{icon}</div>
    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-300 mb-1">{label}</p>
    <p className={`text-xl font-black uppercase tracking-tighter ${color}`}>{value}</p>
  </div>
);

const DataRow = ({ label, value, icon }) => (
  <div className="group border-b border-red-50 pb-4">
    <div className="flex items-center gap-3 text-red-500/50 mb-1">
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-red-950 font-bold text-lg pl-7">{value || "—"}</p>
  </div>
);

export default StallView;