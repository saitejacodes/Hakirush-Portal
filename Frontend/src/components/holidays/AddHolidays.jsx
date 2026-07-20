import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, CalendarPlus, X } from "lucide-react";

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#B8912E";
const SAGE = "#3F6B52";

/* ================= PROTOCOL: SUCCESS ================= */
const SuccessAlert = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" />
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-[#E7E1D3] overflow-hidden animate-in zoom-in-95 duration-300 text-center p-8">
        <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: SAGE }} />
        <h3 className="text-xl font-black uppercase tracking-tighter text-[#1C1A17]">Record Locked</h3>
        <p className="text-[10px] font-bold text-[#8A8478] uppercase tracking-widest mt-2 mb-6">Archive has been updated.</p>
        <button onClick={onClose} className="w-full py-4 rounded-2xl bg-[#1C1A17] text-[#F6F3EC] text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-[#B8912E] hover:text-[#1C1A17] transition-all">Acknowledge</button>
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
    <div className="min-h-screen bg-[#F6F3EC] flex items-center justify-center p-4 sm:p-6">
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}

      <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-[3rem] shadow-sm border border-[#E7E1D3]">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-4xl font-black text-[#1C1A17] uppercase tracking-tighter leading-none">
              New <span className="text-[#B8912E]">Directive</span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A8478] mt-2">Initialize Holiday System</p>
          </div>
          <button
            onClick={() => navigate("/admin-dashboard/holidays")}
            className="p-3 rounded-2xl bg-[#F6F3EC] text-[#8A8478] hover:bg-[#FBF3E3] hover:text-[#B8912E] transition-all cursor-pointer active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#8A8478] ml-1">Event Title</label>
            <input
              type="text"
              placeholder="e.g. Independence Day"
              className="w-full p-4 bg-white border border-[#E7E1D3] rounded-2xl text-[13px] font-bold uppercase tracking-wide outline-none focus:border-[#B8912E] transition-colors text-[#1C1A17] placeholder:text-[#C9C2AE]"
              onChange={e => setHoliday({...holiday, title: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#8A8478] ml-1">Date</label>
            <input
              type="date"
              className="w-full p-4 bg-white border border-[#E7E1D3] rounded-2xl text-[13px] font-bold uppercase tracking-wide outline-none focus:border-[#B8912E] transition-colors text-[#1C1A17]"
              onChange={e => setHoliday({...holiday, date: e.target.value})}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 bg-[#1C1A17] text-[#F6F3EC] font-black rounded-2xl uppercase tracking-widest text-[11px] hover:bg-[#B8912E] hover:text-[#1C1A17] transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
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