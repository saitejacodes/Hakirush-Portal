import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  FileText,
  ArrowLeft,
  PlusCircle,
  Loader2,
  CheckCircle2
} from "lucide-react";

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => {
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] animate-fade-in" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-white overflow-hidden animate-pop">
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-3xl bg-green-50 flex items-center justify-center text-green-500 mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={32} strokeWidth={2.5} />
            </div>
            
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
              Department Created!
            </h3>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2 leading-relaxed">
              The new department has been <br/> added to your organization.
            </p>
          </div>

          <div className="px-8 pb-8">
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-red-600 text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-xl shadow-slate-200"
            >
              Back to List
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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setDepartment({ ...department, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
        setTimeout(() => {
          navigate("/admin-dashboard/departments");
        }, 1800);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showAlert && (
        <SuccessAlert onClose={() => navigate("/admin-dashboard/departments")} />
      )}

      <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 flex justify-center items-center px-4 py-12">
        <div className="w-full max-w-xl bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl p-8 sm:p-12 border border-white">
          
          {/* Header */}
          <div className="flex items-center justify-center gap-4 mb-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-100 shrink-0">
              <Building2 size={24} strokeWidth={2.5} />
            </div>
            
            <div className="text-left">
              <h2 className="text-xl sm:text-3xl font-black text-red-700 uppercase tracking-tighter italic leading-none">
                Add New Dept
              </h2>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">
                Define a new business unit
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Department Name
              </label>
              <div className="group relative flex items-center bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-5 focus-within:border-red-500/20 focus-within:bg-white transition-all shadow-inner">
                <Building2 className="text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
                <input
                  name="dep_name"
                  required
                  placeholder="E.G. TECHNICAL OPERATIONS"
                  onChange={handleChange}
                  className="w-full py-5 pl-4 outline-none bg-transparent text-[12px] font-black uppercase tracking-widest text-slate-700 placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Description & Responsibilities
              </label>
              <div className="group relative flex items-start bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-5 py-4 focus-within:border-red-500/20 focus-within:bg-white transition-all shadow-inner">
                <FileText className="text-slate-300 group-focus-within:text-red-500 mt-1 transition-colors" size={20} />
                <textarea
                  rows={4}
                  name="description"
                  required
                  placeholder="DESCRIBE THE ROLE OF THIS UNIT..."
                  onChange={handleChange}
                  className="w-full pl-4 outline-none bg-transparent resize-none text-[12px] font-bold text-slate-600 placeholder:text-slate-300 leading-relaxed"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-1/3 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft size={16} strokeWidth={3} /> Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-br from-red-600 to-rose-500 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-red-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} strokeWidth={3} /> Processing
                  </>
                ) : (
                  <>
                    <PlusCircle size={18} strokeWidth={3} /> Create Department
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddDepartments;