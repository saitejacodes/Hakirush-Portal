import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Building2, Calendar, ChevronLeft, 
  ShieldCheck, ArrowUpRight, Zap,
  Globe, Users, Store, Activity, Edit
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
      } catch (error) {
        console.error("Critical failure in asset retrieval.", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStall();
  }, [id]);

  const getImageUrl = (url) => {
    if (!url) return "/default-avatar.png";
    if (url.startsWith("http")) return url;
    return `${import.meta.env.VITE_BACKEND_URL}/${url.replace(/^\/+/, "")}`;
  };

  if (loading) return <LoadingPulse />;
  if (!stall) return <ErrorView />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 text-slate-900 font-sans p-4 lg:p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: IDENTITY CARD --- */}
        <div className="lg:col-span-4">
          <div className="sticky top-10 bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-35 h-35 rounded-[3.5rem] overflow-hidden ring-4 ring-slate-50 p-1 transition-transform duration-500 group-hover:scale-105">
                  <img
                    src={getImageUrl(stall.logo)}
                    className="w-full h-full object-cover rounded-[3.2rem]"
                    alt="Stall Logo"
                    onError={(e) => (e.target.src = `https://ui-avatars.com/api/?name=${stall.name || 'Stall'}&background=f1f5f9&color=64748b`)}
                  />
                </div>
              </div>

              {/* Stall Name Mapping */}
              <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-800 text-center uppercase italic">
                {stall.name || "N/A"}
              </h1>
              
              <p className="text-red-600 font-black text-[8px] uppercase tracking-[0.3em] mt-2 bg-red-50 px-4 py-1 rounded-full">
                {stall.type || "Stall"}
              </p>

              <div className="flex gap-3 mt-8 w-full">
                <button 
                  onClick={() => navigate(-1)}
                  className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600 cursor-pointer"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button 
                  onClick={() => navigate(`/admin-dashboard/stalls/edit/${stall._id}`)}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-2xl transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-white cursor-pointer"
                >
                  <Edit size={16} /> Edit
                </button>
              </div>
            </div>

            <div className="mt-10 space-y-5 border-t border-slate-100 pt-8">
              <SidebarItem icon={<Store size={18}/>} label="Registry Number" value={stall.number} />
              <SidebarItem icon={<Calendar size={18}/>} label="Registry Date" value={stall.createdAt ? new Date(stall.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : "N/A"} />
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: BENTO CONTENT --- */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BentoCard title="Core Intelligence" icon={<Zap size={15} className="text-blue-500"/>}>
              <DataRow icon={<ShieldCheck size={16} className="text-blue-400"/>} label="Asset Name" value={stall.name} />
              <DataRow icon={<Store size={16} className="text-blue-400"/>} label="Registry Number" value={stall.number} />
            </BentoCard>

            <BentoCard title="Performance Metrics" icon={<Building2 size={15} className="text-emerald-500"/>}>
              <DataRow icon={<Activity size={16} className="text-emerald-400"/>} label="Operation Load" value={`${stall.eventCount || "0"} Events`} />
              <DataRow icon={<Users size={16} className="text-emerald-400"/>} label="Deployment" value={stall.type || "—"} />
            </BentoCard>
          </div>

          {/* MISSION PROTOCOLS (LARGE) */}
          <div className="bg-white border border-slate-200 p-10 rounded-[3rem] shadow-sm">
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Mission Protocols</p>
              <div className="flex flex-wrap gap-3">
                {stall.plans && stall.plans.length ? (
                  stall.plans.map((plan, i) => (
                    <span key={i} className="px-5 py-2.5 bg-red-50 text-red-700 border border-red-100 rounded-full text-xs font-black uppercase tracking-wider shadow-inner italic">
                        {plan}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm font-bold">No mission protocols assigned.</p>
                )}
              </div>
          </div>

          {/* STATUS HIGHLIGHTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatusTile icon={<ShieldCheck size={20} />} label="Security" value="Verified" color="text-emerald-600" bgColor="bg-emerald-50" />
            <StatusTile icon={<ArrowUpRight size={20} />} label="Status" value="Active" color="text-blue-600" bgColor="bg-blue-50" />
            <StatusTile icon={<Zap size={20} />} label="Asset Type" value={stall.type || "Standard"} color="text-purple-600" bgColor="bg-purple-50" />
          </div>
        </div>

      </div>
    </div>
  );
};

// --- SHARED COMPONENTS (Consistent with SponsorView) ---

const BentoCard = ({ title, icon, children }) => (
  <div className="bg-white border border-slate-200 p-8 rounded-[3rem] shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-center gap-3 mb-8">
      <div className="p-2.5 bg-slate-50 rounded-xl">{icon}</div>
      <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">{title}</h3>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const DataRow = ({ label, icon, value }) => (
  <div className="flex items-center gap-4">
    <div className="p-2 bg-slate-50 rounded-lg shrink-0">
      {icon}
    </div>
    <div className="overflow-hidden">
      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
      <p className="text-sm font-black text-slate-800 mt-0.5 truncate italic uppercase">
        {value || "—"}
      </p>
    </div>
  </div>
);

const SidebarItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 group cursor-default">
    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-red-50 group-hover:text-red-600 transition-all text-slate-400">
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="text-sm font-black text-slate-700 italic uppercase">{value || "—"}</p>
    </div>
  </div>
);

const StatusTile = ({ icon, label, value, color, bgColor }) => (
  <div className={`${bgColor} border border-white p-6 rounded-[2.5rem] flex flex-col gap-3 shadow-sm`}>
    <div className={`${color}`}>{icon}</div>
    <div>
      <p className="text-[9px] font-black uppercase tracking-tighter text-slate-500 opacity-70">{label}</p>
      <p className={`text-sm font-black uppercase italic ${color}`}>{value}</p>
    </div>
  </div>
);

const LoadingPulse = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin"></div>
    <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[10px]">Syncing Records</p>
  </div>
);

const ErrorView = () => (
  <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-red-50">
      <h2 className="text-2xl font-black text-slate-800 italic uppercase">Not Found</h2>
      <button onClick={() => window.history.back()} className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Go Back</button>
    </div>
  </div>
);

export default StallView;