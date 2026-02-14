import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Upload, ChevronLeft, ShieldCheck, Zap, Globe, Users, Loader2, CheckCircle2 } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => {
  return (
    <>
      <div className="fixed inset-0 bg-red-950/20 backdrop-blur-md z-[100] animate-in fade-in duration-300" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 animate-in zoom-in-95 duration-200">
        <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-white overflow-hidden p-8 text-center">
          <div className="h-2 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 absolute top-0 left-0 right-0" />
          <div className="w-16 h-16 rounded-3xl bg-green-50 flex items-center justify-center text-green-500 mb-6 mx-auto">
            <CheckCircle2 size={32} strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic mb-2">
            Asset <span className="text-red-600">Locked</span>
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
            The new sponsor has been successfully <br /> integrated into the system.
          </p>
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-red-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-red-100 cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </>
  );
};

const SponsorAdd = () => {
  const [formData, setFormData] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo") {
      const file = files?.[0];
      if (!file) return;
      if (file.size > MAX_FILE_SIZE) {
        alert("Image must be less than 10MB");
        return;
      }
      setFormData((p) => ({ ...p, logo: file }));
      setPreview(URL.createObjectURL(file));
      return;
    }
    setFormData((p) => ({
      ...p,
      [name]: name === "eventsSponsored" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== undefined && formData[key] !== "") {
        fd.append(key, formData[key]);
      }
    });

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/sponsors/add`,
        fd,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data?.success) {
        setShowAlert(true);
        setTimeout(() => navigate("/admin-dashboard/sponsors"), 1800);
      }
    } catch (error) {
      alert(error.response?.data?.error || "Failed to add sponsor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-4 md:p-10">
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}
      
      <div className="max-w-4xl mx-auto">
        {/* BACK NAVIGATION */}
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-8 hover:text-red-700 transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Intelligence
        </button>

        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(220,38,38,0.1)] border border-white overflow-hidden">
          {/* HEADER */}
          <div className="p-8 md:p-12 border-b border-red-50 bg-gradient-to-b from-red-50/50 to-transparent">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-1 bg-red-600 rounded-full" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">New Registration</p>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-slate-900 leading-[0.8]">
              Deploy <span className="text-red-600 font-outline-2">Partner</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
            {/* LOGO UPLOAD SECTION */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-red-50 border-4 border-white shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  <img
                    src={preview || "/default-avatar.png"}
                    className="w-full h-full object-cover"
                    alt="preview"
                  />
                  {!preview && <div className="absolute inset-0 flex items-center justify-center text-red-200"><Upload size={40} /></div>}
                </div>
                <label className="absolute -bottom-2 -right-2 w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg cursor-pointer hover:bg-red-700 hover:rotate-12 transition-all">
                  <Upload size={20} />
                  <input type="file" name="logo" accept="image/*" className="hidden" onChange={handleChange} />
                </label>
              </div>
              
              <div className="flex-1 space-y-2 text-center md:text-left">
                <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-800">Visual Identity</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 max-w-xs">
                  Upload high-resolution transparent PNG or SVG for optimal dashboard rendering (Max 10MB).
                </p>
              </div>
            </div>

            {/* FORM FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {/* Sponsor Name */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">
                  <ShieldCheck size={14} /> Corporate Identity
                </label>
                <input
                  name="name"
                  placeholder="ENTER SPONSOR LEGAL NAME..."
                  required
                  onChange={handleChange}
                  className="w-full bg-red-50/30 border-b-2 border-red-100 py-4 px-2 text-[12px] font-black uppercase tracking-widest focus:outline-none focus:border-red-600 focus:bg-red-50 transition-all"
                />
              </div>

              {/* Collaboration Type */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">
                  <Zap size={14} /> Strategic Tier
                </label>
                <select
                  name="collaboration"
                  required
                  onChange={handleChange}
                  className="w-full bg-red-50/30 border-b-2 border-red-100 py-4 px-2 text-[12px] font-black uppercase tracking-widest focus:outline-none focus:border-red-600 transition-all appearance-none cursor-pointer"
                >
                  <option value="">SELECT PARTNERSHIP LEVEL</option>
                  <option>Title Sponsor</option>
                  <option>Associate Sponsor</option>
                  <option>Event Sponsor</option>
                  <option>Media Partner</option>
                </select>
              </div>

              {/* Events Sponsored */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">
                   Counter
                </label>
                <input
                  type="number"
                  name="eventsSponsored"
                  placeholder="TOTAL EVENTS LOGGED"
                  min="0"
                  onChange={handleChange}
                  className="w-full bg-red-50/30 border-b-2 border-red-100 py-4 px-2 text-[12px] font-black uppercase tracking-widest focus:outline-none focus:border-red-600 transition-all"
                />
              </div>

              {/* Reach Metrics */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">
                  <Users size={14} /> Market Reach
                </label>
                <input
                  name="reach"
                  placeholder="E.G. 2.5M IMPRESSIONS"
                  onChange={handleChange}
                  className="w-full bg-red-50/30 border-b-2 border-red-100 py-4 px-2 text-[12px] font-black uppercase tracking-widest focus:outline-none focus:border-red-600 transition-all"
                />
              </div>

              {/* Upcoming Events */}
              <div className="md:col-span-2 space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">
                  <Globe size={14} /> Future Pipeline
                </label>
                <input
                  name="upcomingEvents"
                  placeholder="DESCRIBE UPCOMING COLLABORATIONS..."
                  onChange={handleChange}
                  className="w-full bg-red-50/30 border-b-2 border-red-100 py-4 px-2 text-[12px] font-black uppercase tracking-widest focus:outline-none focus:border-red-600 transition-all"
                />
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="pt-8">
              <button
                disabled={loading}
                className={`group w-full relative overflow-hidden py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.5em] transition-all cursor-pointer shadow-2xl shadow-red-200
                  ${loading 
                    ? "bg-slate-100 text-slate-400" 
                    : "bg-red-600 text-white hover:bg-red-500 hover:scale-[1.02] active:scale-95"
                  }`}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    "Authorize New Partner"
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SponsorAdd;