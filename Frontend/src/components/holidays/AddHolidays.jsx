import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, CheckCircle2, X, Loader2, Calendar } from "lucide-react";

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => {
  return (
    <>
      {/* Deep Overlay */}
      <div className="fixed inset-0 bg-red-950/40 backdrop-blur-md z-[60] animate-in fade-in duration-300" />

      {/* Alert Container */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-[0_35px_60px_-15px_rgba(153,27,27,0.3)] border border-white overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="h-2 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={40} strokeWidth={1.5} />
            </div>

            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-red-950">
              Protocol <span className="text-red-600">Locked</span>
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 leading-relaxed">
              The new holiday directive has been <br /> successfully integrated into the system.
            </p>
          </div>

          <div className="px-8 pb-8">
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-red-950 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-900/20"
            >
              Continue Execution
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const AddHoliday = () => {
  const [holiday, setHoliday] = useState({ title: "", date: "" });
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHoliday((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/holiday/add`,
        holiday,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data?.success) {
        setShowAlert(true);
        setTimeout(() => {
          navigate("/admin-dashboard/holidays");
        }, 2000);
      }
    } catch (error) {
      console.error(error.response?.data?.error || "Directive Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl relative">
          
          {/* Decorative Elements */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-rose-200/40 rounded-full blur-3xl" />

          <div className="relative bg-white/70 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] border border-white">
            
            {/* HEADER */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest mb-4">
                <CalendarPlus size={12} fill="currentColor" /> Registry Access
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-red-950">
                New <span className="text-red-600">Holiday</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Log Regional Observation Date</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                
                {/* Title Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-red-900/40 ml-4">Event Identity</label>
                  <input
                    name="title"
                    placeholder="E.G. INDEPENDENCE DAY"
                    required
                    autoComplete="off"
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-transparent focus:border-red-500 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-wider outline-none transition-all shadow-inner placeholder:text-slate-300"
                  />
                </div>

                {/* Date Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-red-900/40 ml-4">System Timeline</label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-red-400 pointer-events-none" size={18} />
                    <input
                      type="date"
                      name="date"
                      required
                      onChange={handleChange}
                      className="w-full bg-white border-2 border-transparent focus:border-red-500 rounded-2xl pl-14 pr-6 py-4 text-xs font-bold uppercase tracking-wider outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-6">
                <button
                  disabled={loading}
                  className={`w-full py-5 rounded-[2rem] text-white font-black uppercase tracking-[0.4em] text-xs shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer
                    ${
                      loading
                        ? "bg-slate-300 cursor-not-allowed"
                        : "bg-red-950 hover:bg-red-600 shadow-red-900/20"
                    }`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Syncing Archive...
                    </>
                  ) : (
                    "Authorize Holiday"
                  )}
                </button>
              </div>

              {/* BACK LINK */}
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="w-full text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                Terminate Operation & Return
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddHoliday;