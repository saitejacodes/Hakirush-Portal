import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, CalendarPlus, X } from "lucide-react";

/* ================= PROTOCOL: SUCCESS ================= */
const SuccessAlert = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-red-950/20 backdrop-blur-sm z-[60]" />
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-300 text-center p-8">
        <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
        <h3 className="text-xl font-black uppercase italic tracking-tighter text-red-950">Record Locked</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 mb-6">Archive has been updated.</p>
        <button onClick={onClose} className="w-full py-4 rounded-2xl bg-red-950 text-white text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-900 transition-all">Acknowledge</button>
      </div>
    </div>
  </>
);

const AddHoliday = () => {
  const [holiday, setHoliday] = useState({ title: "", date: "" });
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!holiday.title || !holiday.date) return;
    
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/add`, holiday, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        navigate("/admin-dashboard/holidays");
      }, 1500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-rose-100 flex items-center justify-center p-4 sm:p-6">
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}
      
      <div className="w-full max-w-lg bg-white/70 backdrop-blur-2xl p-8 sm:p-10 rounded-[3rem] shadow-2xl border border-white">
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-4xl font-black text-red-700 uppercase italic tracking-tighter leading-none">
              New <span className="text-slate-900">Directive</span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">Initialize Holiday System</p>
          </div>
          <button 
            onClick={() => navigate("/admin-dashboard/holidays")}
            className="p-3 rounded-2xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Event Title</label>
            <input 
              type="text"
              placeholder="e.g. Independence Day" 
              className="w-full p-4 bg-white border border-slate-100 rounded-2xl text-[13px] font-bold uppercase tracking-wide outline-none focus:border-red-500 shadow-sm"
              onChange={e => setHoliday({...holiday, title: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Date</label>
            <input 
              type="date" 
              className="w-full p-4 bg-white border border-slate-100 rounded-2xl text-[13px] font-bold uppercase tracking-wide outline-none focus:border-red-500 shadow-sm text-slate-600" 
              onChange={e => setHoliday({...holiday, date: e.target.value})}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white font-black rounded-2xl uppercase tracking-widest text-[11px] hover:from-red-600 hover:to-rose-500 transition-all shadow-xl shadow-red-100 active:scale-95 disabled:bg-slate-300 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <CalendarPlus size={18} />
                Authorize Directive
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
export default AddHoliday;