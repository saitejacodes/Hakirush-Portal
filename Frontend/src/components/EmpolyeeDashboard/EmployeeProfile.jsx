import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  User, Calendar, CreditCard, ChevronLeft, 
  ShieldCheck, Heart, ArrowUpRight, Globe, Fingerprint,
  Phone, Mail, Droplets, Briefcase,
  Edit
} from "lucide-react";

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.data?.success) setEmployee(res.data.employee);
      } catch {
        console.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${import.meta.env.VITE_BACKEND_URL}/${imagePath.replace(/^\/+/, "")}`;
  };

  if (loading) return <LoadingPulse />;
  if (!employee) return <ErrorView />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 text-slate-900 font-sans p-4 lg:p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: IDENTITY CARD (FULL SIZE) --- */}
        <div className="lg:col-span-4">
          <div className="sticky top-10 bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-35 h-35 rounded-[3.5rem] overflow-hidden ring-4 ring-slate-50 p-1 transition-transform duration-500 group-hover:scale-105">
                  <img
                    src={getImageUrl(employee?.userId?.profileImage)}
                    className="w-full h-full object-cover rounded-[3.2rem]"
                    alt="Profile"
                    onError={(e) => (e.target.src = `https://ui-avatars.com/api/?name=${employee?.userId?.name}&background=f1f5f9&color=64748b`)}
                  />
                </div>
              </div>

              <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-800 text-center uppercase italic">
                {employee?.userId?.name}
              </h1>
              <p className="text-red-600 font-black text-[8px] uppercase tracking-[0.3em] mt-2 bg-red-50 px-4 py-1 rounded-full">
                {employee?.designation || "Executive Member"}
              </p>

              <div className="flex gap-3 mt-8 w-full">
                <button 
                  onClick={() => navigate(`/employee-dashboard/profile/${employee._id}/edit`)}
                  className="flex-1 py-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest hover:from-red-600 hover:to-rose-500 text-white cursor-pointer"
                >
                  <Edit size={16} /> Edit
                </button>
              </div>
            </div>

            <div className="mt-10 space-y-5 border-t border-slate-100 pt-8">
               <SidebarItem icon={<Fingerprint size={18}/>} label="Employee ID" value={employee.employeeId} />
               <SidebarItem icon={<Globe size={18}/>} label="Department" value={employee.department?.dep_name} />
               <SidebarItem icon={<Calendar size={18}/>} label="Official Join Date" value={new Date(employee.dateOfJoining).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} />
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: BENTO CONTENT --- */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BentoCard title="General Identity" icon={<User size={15} className="text-blue-500"/>}>
              <DataRow icon={<Mail size={16} className="text-blue-400"/>} label="Email Address" value={employee.userId?.email} isEmail />
              <DataRow icon={<User size={16} className="text-blue-400"/>} label="Gender" value={employee.gender} />
              <DataRow icon={<Droplets size={16} className="text-blue-400"/>} label="Blood Group" value={employee.bloodGroup} />
            </BentoCard>

            <BentoCard title="Life History" icon={<Heart size={15} className="text-rose-500"/>}>
              <DataRow icon={<Calendar size={16} className="text-rose-400"/>} label="Date of Birth" value={new Date(employee.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />
              <DataRow icon={<Heart size={16} className="text-rose-400"/>} label="Marital Status" value={employee.maritalStatus} />
              <DataRow icon={<Briefcase size={16} className="text-rose-400"/>} label="Total Experience" value={`${employee.experience} Years`} />
            </BentoCard>
          </div>

          {/* FINANCIAL STRIP */}
          <div className="bg-white border border-slate-200 p-10 rounded-[3rem] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Financial Records</p>
              <h2 className="text-4xl font-black text-red-600 tracking-tighter italic">
                ₹{Number(employee.salary || 0).toLocaleString('en-IN')}
                <span className="text-sm text-slate-400 font-medium ml-2">/year</span>
              </h2>
            </div>
            <div className="p-5 bg-red-50 rounded-[2rem] text-red-600 shadow-inner">
              <CreditCard size={24} />
            </div>
          </div>

          {/* STATUS TILES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatusTile icon={<ShieldCheck size={20} />} label="Verification" value="Certified" color="text-emerald-600" bgColor="bg-emerald-50" />
            <StatusTile icon={<ArrowUpRight size={20} />} label="System Status" value="Active" color="text-blue-600" bgColor="bg-blue-50" />
            <StatusTile icon={<Phone size={20} />} label="Availability" value="On-Site" color="text-purple-600" bgColor="bg-purple-50" />
          </div>
        </div>

      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

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

const DataRow = ({ label, icon, value, isEmail }) => (
  <div className="flex items-center gap-4">
    <div className="p-2 bg-slate-50 rounded-lg shrink-0 text-slate-400">
      {icon}
    </div>
    <div className="overflow-hidden">
      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
      <p className={`text-sm font-black text-slate-800 mt-0.5 truncate italic ${isEmail ? 'lowercase' : 'uppercase'}`}>
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

export default EmployeeProfile;