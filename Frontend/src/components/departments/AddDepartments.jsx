import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  FileText,
  ChevronLeft,
  PlusCircle,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => {
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[3rem] bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border border-white overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
          <div className="p-10 text-center">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-500 mx-auto mb-8 shadow-inner ring-8 ring-emerald-50/50">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>
            
            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-800">
              Unit Created
            </h3>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-4 leading-relaxed">
              The new department has been <br/> successfully synchronized.
            </p>
          </div>

          <div className="px-10 pb-10">
            <button
              onClick={onClose}
              className="w-full py-5 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-red-600 active:scale-95 shadow-xl shadow-slate-200 cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ================= MAIN COMPONENT ================= */
const AddDepartments = () => {
  const [department, setDepartment] = useState({
    dep_name: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setDepartment({ ...department, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/department/add`,
        department,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (res.data.success) {
        setShowAlert(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showAlert && (
        <SuccessAlert onClose={() => navigate("/admin-dashboard/departments")} />
      )}

      <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-rose-50 flex justify-center items-center px-4 py-12 relative overflow-hidden">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rose-200/20 rounded-full blur-3xl" />

        <div className="w-full max-w-xl relative">
          
          {/* TOP BACK BUTTON */}
          <div className="mb-8 ml-4">
            <button 
              onClick={() => navigate(-1)} 
              className="group flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              <ChevronLeft size={18} className="text-slate-400 group-hover:text-red-600 group-hover:-translate-x-1 transition-all" strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-600 transition-colors">
                Cancel & Return
              </span>
            </button>
          </div>

          {/* FORM CONTAINER */}
          <div className="bg-white/80 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(220,38,38,0.15)] p-6 sm:p-8 border border-white relative">
            
            {/* Header Area */}
            <div className="flex flex-col items-center text-center mb-12">
              <div className="w-15 h-15 rounded-[1rem] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-2xl shadow-red-200 mb-6 transform">
                <Building2 size={28} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-red-800 uppercase tracking-tighter italic leading-none">
                Add New Department
              </h2>
              <p className="text-[6px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2 bg-slate-100 px-4 py-1.5 rounded-full">
                Global Org Structure
              </p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-shake">
                <AlertCircle size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Department Name Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Official Identity
                  </label>
                  <span className="text-[7px] font-bold text-red-500 uppercase italic">Required</span>
                </div>
                <div className="group relative flex items-center bg-slate-50/50 border-2 border-transparent rounded-[2rem] px-6 focus-within:border-red-500/20 focus-within:bg-white transition-all shadow-inner">
                  <Building2 className="text-slate-300 group-focus-within:text-red-600 transition-colors" size={15} />
                  <input
                    name="dep_name"
                    required
                    placeholder="Department Name (e.g., Human Resources, IT Support, etc.)"
                    onChange={handleChange}
                    autoComplete="off"
                    className="w-full py-4 pl-5 outline-none bg-transparent text-[9px] font-black uppercase tracking-[0.1em] text-slate-800 placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Description Textarea */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Scope of Operations
                  </label>
                  <span className="text-[7px] font-bold text-slate-300 uppercase italic tracking-widest font-mono">MD-Editor</span>
                </div>
                <div className="group relative flex items-start bg-slate-50/50 border-2 border-transparent rounded-[2rem] px-6 py-5 focus-within:border-red-500/20 focus-within:bg-white transition-all shadow-inner">
                  <FileText className="text-slate-300 group-focus-within:text-red-600 mt-1 transition-colors" size={15} />
                  <textarea
                    rows={4}
                    name="description"
                    required
                    placeholder="Briefly define the responsibilities and operational goals of this department..."
                    onChange={handleChange}
                    className="w-full pl-5 outline-none bg-transparent resize-none text-[9px] font-medium text-slate-600 placeholder:text-slate-300 leading-relaxed"
                  />
                </div>
              </div>

              {/* Action Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-4 py-4 rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 hover:from-red-600 hover:to-rose-500 text-[11px] font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-red-200 transition-all hover:scale-[1.02] hover:shadow-red-300 active:scale-95 disabled:opacity-50 disabled:grayscale cursor-pointer overflow-hidden relative group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={15} strokeWidth={3} />
                      <span>Syncing Unit...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
                      <span>Register Department</span>
                    </>
                  )}
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/10 opacity-40 group-hover:animate-shine" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddDepartments;