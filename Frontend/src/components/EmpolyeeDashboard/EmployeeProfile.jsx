import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.data?.success) {
          setEmployee(res.data.employee);
        }
      } catch {
        console.error("Failed to load employee profile");
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

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <p className="text-red-600 font-black uppercase tracking-widest text-xs">Loading Secure Profile...</p>
        </div>
      </div>
    );

  if (!employee)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">
        Profile Data Unavailable
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* TOP NAVIGATION / HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-red-700 tracking-tight uppercase">
              Personnel File
            </h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Employee Management System</p>
          </div>
          <button
            onClick={() => navigate(`/employee-dashboard/profile/${employee._id}/edit`)}
            className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-red-100 text-red-600 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-900/5 hover:bg-red-600 hover:text-white transition-all active:scale-95 cursor-pointer"
          >
            Edit Profile
          </button>
        </div>

        {/* MAIN PROFILE CARD */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
          
          {/* BANNER / BACKGROUND ACCENT */}
          <div className="h-32 bg-gradient-to-r from-red-600 to-rose-500 w-full" />

          <div className="px-6 md:px-12 pb-12">
            {/* PROFILE HEADER OVERLAP */}
            <div className="relative -mt-16 flex flex-col md:flex-row items-center md:items-end gap-6 mb-10 text-center md:text-left">
              <div className="w-40 h-40 rounded-[2.5rem] border-8 border-white bg-white shadow-2xl overflow-hidden shadow-red-900/20">
                <img
                  src={getImageUrl(employee?.userId?.profileImage)}
                  alt="profile"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                />
              </div>
              <div className="flex-1 pb-2">
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                  {employee?.userId?.name}
                </h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                  <span className="px-4 py-1.5 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100">
                    {employee?.designation || "Executive"}
                  </span>
                  <span className="px-4 py-1.5 rounded-xl bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest">
                    ID: {employee.employeeId}
                  </span>
                </div>
              </div>
            </div>

            {/* DATA SECTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* PRIMARY INFO */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Identity & Status</h4>
                <div className="grid grid-cols-1 gap-3">
                  <InfoItem label="Official Email" value={employee.userId?.email} />
                  <div className="grid grid-cols-2 gap-3">
                    <InfoItem label="Gender" value={employee.gender} />
                    <InfoItem label="Marital Status" value={employee.maritalStatus} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoItem label="Birth Date" value={formatDate(employee?.dob)} />
                    <InfoItem label="Blood Group" value={employee.bloodGroup} />
                  </div>
                </div>
              </section>

              {/* PROFESSIONAL INFO */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Employment Details</h4>
                <div className="grid grid-cols-1 gap-3">
                  <InfoItem label="Department" value={employee.department?.dep_name} isHighlight />
                  <div className="grid grid-cols-2 gap-3">
                    <InfoItem label="Joining Date" value={formatDate(employee?.dateOfJoining)} />
                    <InfoItem label="Experience" value={`${employee.experience} Years`} />
                  </div>
                  <div className="p-5 rounded-3xl bg-red-600 text-white shadow-lg shadow-red-200">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Salary</p>
                    <p className="text-2xl font-black mt-1">₹ {Number(employee.salary || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, isHighlight }) => (
  <div className={`p-5 rounded-[1.5rem] border transition-all ${
    isHighlight 
      ? "bg-red-50 border-red-100 shadow-inner" 
      : "bg-slate-50 border-slate-100"
  }`}>
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <p className={`text-sm font-bold tracking-tight ${isHighlight ? "text-red-700" : "text-slate-700"}`}>
      {value || "—"}
    </p>
  </div>
);

export default EmployeeProfile;