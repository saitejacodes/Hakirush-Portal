import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Mail, Calendar, CreditCard, DollarSign, ArrowLeft, ShieldCheck } from "lucide-react";

const ViewClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/client/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data?.success) {
          setClient(res.data.client);
        }
      } catch (error) {
        console.error("Profile Retrieval Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    // Ensure this matches your backend static folder path if not using full URLs
    if (imagePath.startsWith("http")) return imagePath;
    return `${import.meta.env.VITE_BACKEND_URL}/${imagePath}`;
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
      </div>
    );

  if (!client)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-800">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Record Not Found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-red-600 font-bold uppercase text-xs tracking-widest hover:underline">Return to Dashboard</button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-4 sm:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(220,38,38,0.15)] border border-white overflow-hidden">
        
        <div className="grid grid-cols-1 md:grid-cols-12">
          
          {/* BRANDING SIDEBAR (Consistency with Add Page) */}
          <div className="md:col-span-4 bg-gradient-to-b from-red-700 to-red-900 p-10 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <div className="relative z-10">
              <button 
                onClick={() => navigate(-1)}
                className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-12 hover:bg-white/20 transition-all border border-white/10 group"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform cursor-pointer" />
              </button>
              
              <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-[0.9] mb-4">
                Partner <br /> <span className="text-red-200 font-normal not-italic">Profile</span>
              </h1>
              <div className="h-1 w-12 bg-red-400 rounded-full mb-4" />
              <p className="text-red-100/60 text-[10px] font-bold uppercase tracking-[0.3em]">Record ID: {id.slice(-6).toUpperCase()}</p>
            </div>
            
            <div className="relative z-10 flex items-center gap-2 text-[9px] text-red-200/50 font-bold uppercase tracking-widest">
              <ShieldCheck size={14} /> Authorized Personnel Access Only
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="md:col-span-8 p-8 sm:p-14 bg-white/50">
            
            {/* PROFILE HEADER */}
            <div className="flex flex-col items-center mb-12">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-red-50 shadow-2xl bg-white">
                  <img
                    src={getImageUrl(client.companyLogo)}
                    alt="logo"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                  <ShieldCheck size={18} />
                </div>
              </div>
              
              <h2 className="mt-6 text-3xl font-black uppercase italic tracking-tighter text-slate-800 text-center leading-none">
                {client.userId?.name || "N/A"}
              </h2>
              <div className="mt-2 px-4 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100">
                {client.planType || "Unassigned Plan"}
              </div>
            </div>

            {/* INFO TILES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoCard 
                icon={<Mail size={18} />} 
                label="Communication" 
                value={client.userId?.email} 
              />
              <InfoCard 
                icon={<DollarSign size={18} />} 
                label="Financial Budget" 
                value={`₹ ${Number(client.budget || 0).toLocaleString('en-IN')}`} 
              />
              <InfoCard 
                icon={<CreditCard size={18} />} 
                label="Billing Tier" 
                value={client.planType} 
              />
              <InfoCard 
                icon={<Calendar size={18} />} 
                label="Partner Since" 
                value={client.dateOfJoining ? new Date(client.dateOfJoining).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"} 
              />
            </div>

            {/* ACTION FOOTER */}
            <div className="mt-12 flex justify-center">
              <button 
                onClick={() => navigate(`/admin-dashboard/clients/edit/${id}`)}
                className="px-8 py-4 bg-red-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 transition-all active:scale-95 cursor-pointer"
              >
                Modify Record Details
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

/* PREMIUM INFO CARD SUB-COMPONENT */
const InfoCard = ({ icon, label, value }) => (
  <div className="group bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all duration-300">
    <div className="flex items-center gap-3 mb-2 text-red-500">
      <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-400 transition-colors">
        {label}
      </span>
    </div>
    <div className="pl-11">
      <p className="text-slate-800 font-bold text-sm tracking-tight break-all">
        {value || "—"}
      </p>
    </div>
  </div>
);

export default ViewClient;