import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, User, Mail, Hash, Briefcase, 
  Heart, Calendar, CreditCard, ShieldCheck, 
  MapPin, UserCheck, IndianRupee 
} from "lucide-react";

const View = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        if (response.data?.success) {
          setEmployee(response.data.employee);
        }
      } catch {
        console.error("Profile sync failed");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${import.meta.env.VITE_BACKEND_URL}/${imagePath}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Accessing Dossier...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 pb-12">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        
        {/* HEADER / BACK NAV */}
        <header className="flex justify-between items-center mb-10">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 rounded-2xl bg-gradient-to-br from-red-600 to-rose-500 px-6 py-4 font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-red-200 transition-all hover:scale-105 hover:shadow-red-300 active:scale-95 cursor-pointer border-none"
          >
            <ArrowLeft 
              size={16} 
              strokeWidth={3} 
              className="text-white group-hover:-translate-x-1 transition-transform" 
            /> 
            Back
          </button>
          <div className="text-right">
            <h1 className="text-4xl font-black text-red-700 uppercase tracking-tighter italic leading-none">
              Profile Detail
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">Personal Dossier</p>
          </div>
        </header>

        {/* MAIN CARD */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-white overflow-hidden">
          
          {/* TOP BANNER / AVATAR */}
          <div className="relative h-40 bg-gradient-to-r from-red-600 to-rose-500">
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0">
              <div className="w-36 h-36 rounded-[2.5rem] bg-white p-2 shadow-2xl">
                <img
                  src={getImageUrl(employee?.userId?.profileImage)}
                  alt="profile"
                  className="w-full h-full object-cover rounded-[2rem] border border-slate-50"
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                />
              </div>
            </div>
          </div>

          {/* NAME & DESIGNATION BLOCK */}
          <div className="pt-20 pb-8 px-8 md:px-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">
                {employee?.userId?.name}
              </h2>
              <p className="flex items-center justify-center md:justify-start gap-2 text-red-500 font-black uppercase tracking-widest text-[11px] mt-1">
                <Briefcase size={14} /> {employee?.designation}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <span className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                ID: {employee?.employeeId}
              </span>
            </div>
          </div>

          <hr className="border-slate-50 mx-8" />

          {/* INFO GRID */}
          <div className="p-8 md:p-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem icon={<Mail size={16}/>} label="Email Address" value={employee?.userId?.email} />
            <InfoItem icon={<User size={16}/>} label="Gender" value={employee?.gender} />
            <InfoItem icon={<Calendar size={16}/>} label="Birth Date" value={formatDate(employee?.dob)} />
            <InfoItem icon={<Heart size={16}/>} label="Blood Type" value={employee?.bloodGroup} />
            <InfoItem icon={<ShieldCheck size={16}/>} label="Department" value={employee?.department?.dep_name} />
            <InfoItem icon={<UserCheck size={16}/>} label="Marital Status" value={employee?.maritalStatus} />
            <InfoItem icon={<Hash size={16}/>} label="Experience" value={`${employee?.experience} Years`} />
            <InfoItem icon={<IndianRupee size={16}/>} label="Current Salary" value={employee?.salary} isSalary />
            <InfoItem icon={<MapPin size={16}/>} label="Joined Date" value={formatDate(employee?.dateOfJoining)} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* HELPER COMPONENT FOR INFO BOXES */
const InfoItem = ({ icon, label, value, isSalary }) => {
  // Check if the label is "Email Address" to prevent uppercase
  const isEmail = label.toLowerCase().includes("email");

  return (
    <div className="group bg-slate-50/50 p-5 rounded-[1.5rem] border border-transparent hover:border-red-100 hover:bg-white transition-all">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-red-500 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
          {label}
        </p>
      </div>
      <p className={`text-slate-800 font-black tracking-tight ${isSalary ? 'text-xl' : 'text-sm'} ${!isEmail ? 'uppercase italic' : 'lowercase'}`}>
        {isSalary && value ? "₹ " : ""}{value || "Not Set"}
      </p>
    </div>
  );
};

export default View;