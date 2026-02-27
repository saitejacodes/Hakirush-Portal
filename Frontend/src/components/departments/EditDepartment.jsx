import axios from "axios";
import {
  ArrowLeft,
  Building2,
  FileText,
  Loader2,
  CheckCircle2,
  Save
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* ================= PREMIUM SUCCESS ALERT (SCALED) ================= */
const SuccessAlert = ({ onClose }) => {
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] animate-fade-in" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div className="w-full max-w-[320px] rounded-[2rem] bg-white shadow-2xl border border-white overflow-hidden animate-pop">
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 mx-auto mb-4 shadow-inner">
              <CheckCircle2 size={24} strokeWidth={2.5} />
            </div>
            
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">
              Update Saved!
            </h3>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2 leading-relaxed">
              The department details have been <br/> successfully modified.
            </p>
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-red-600 text-[9px] font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              Okay, Great
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ================= MAIN COMPONENT (SCALED DOWN) ================= */
const EditDepartment = () => {
  const { id } = useParams();
  const [department, setDepartment] = useState({
    dep_name: "",
    description: ""
  });
  const [depLoading, setDepLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setDepartment({ ...department, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchDepartment = async () => {
      setDepLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/department/${id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }
        );
        if (res.data.success) setDepartment(res.data.department);
      } finally {
        setDepLoading(false);
      }
    };
    fetchDepartment();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/department/${id}`,
        department,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );
      setShowAlert(true);
      setTimeout(() => {
        navigate("/admin-dashboard/departments");
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  if (depLoading)
    return (
      <div className="h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 flex flex-col justify-center items-center">
        <Loader2 className="animate-spin text-red-500 mb-4" size={32} />
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Fetching Data...</span>
      </div>
    );

  return (
    <>
      {showAlert && (
        <SuccessAlert onClose={() => navigate("/admin-dashboard/departments")} />
      )}

      <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 flex justify-center items-center px-4 py-8">
        <div className="w-full max-w-lg bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-6 sm:p-10 border border-white">
          
          {/* Header - EXACT SAME UI, REDUCED SCALE */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200 mb-4">
              <Building2 size={24} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-red-700 uppercase tracking-tighter italic leading-none">
              Edit Dept
            </h2>
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mt-3">
              Modify organizational unit properties
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Department Name
              </label>
              <div className="group relative flex items-center bg-slate-50 border-2 border-transparent rounded-[1.2rem] px-4 focus-within:border-red-500/20 focus-within:bg-white transition-all shadow-inner">
                <Building2 className="text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                <input
                  name="dep_name"
                  value={department.dep_name}
                  onChange={handleChange}
                  required
                  placeholder="DEPARTMENT NAME"
                  className="w-full py-4 pl-3 outline-none bg-transparent text-[11px] font-black uppercase tracking-widest text-slate-700 placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Description Input */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Mission & Description
              </label>
              <div className="group relative flex items-start bg-slate-50 border-2 border-transparent rounded-[1.2rem] px-4 py-3 focus-within:border-red-500/20 focus-within:bg-white transition-all shadow-inner">
                <FileText className="text-slate-300 group-focus-within:text-red-500 mt-1 transition-colors" size={18} />
                <textarea
                  rows={3}
                  name="description"
                  value={department.description}
                  onChange={handleChange}
                  required
                  placeholder="ENTER NEW DESCRIPTION..."
                  className="w-full pl-3 outline-none bg-transparent resize-none text-[11px] font-bold text-slate-600 placeholder:text-slate-300 leading-relaxed"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-1/3 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white border border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft size={14} strokeWidth={3} /> Cancel
              </button>

              <button
                type="submit"
                disabled={saveLoading}
                className="flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl bg-gradient-to-br from-red-600 to-rose-500 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-red-100 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {saveLoading ? (
                  <Loader2 className="animate-spin" size={16} strokeWidth={3} />
                ) : (
                  <>
                    <Save size={16} strokeWidth={3} /> Save Changes
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

export default EditDepartment;