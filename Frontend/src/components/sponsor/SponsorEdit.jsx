import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Upload, 
  ChevronLeft, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Users, 
  Loader2, 
  CheckCircle2, 
  RefreshCcw 
} from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/* ================= IMAGE HELPER ================= */
const getImageUrl = (url) => {
  if (!url) return "/default-avatar.png";
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_BACKEND_URL}/${url}`;
};

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
            Update <span className="text-red-600">Synced</span>
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
            The sponsor intelligence has been <br /> successfully reconfigured.
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

const SponsorEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [sponsor, setSponsor] = useState({
    name: "",
    collaboration: "",
    eventsSponsored: "",
    reach: "",
    upcomingEvents: "",
  });

  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    fetchSponsor();
  }, [id]);

  const fetchSponsor = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/sponsors/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data.success) {
        const s = res.data.sponsor;
        setSponsor({
          name: s.name || "",
          collaboration: s.collaboration || "",
          eventsSponsored: s.eventsSponsored || "",
          reach: s.reach || "",
          upcomingEvents: s.upcomingEvents || "",
        });
        setPreview(s.logo || null);
      }
    } catch {
      alert("Failed to load sponsor intelligence");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo") {
      const file = files?.[0];
      if (!file) return;
      if (file.size > MAX_FILE_SIZE) {
        alert("Image size must be less than 10MB");
        return;
      }
      setLogo(file);
      setPreview(URL.createObjectURL(file));
      return;
    }
    setSponsor((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    Object.keys(sponsor).forEach((key) => {
      fd.append(key, sponsor[key]);
    });
    if (logo) fd.append("logo", logo);

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/sponsors/${id}`,
        fd,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data.success) {
        setShowAlert(true);
        setTimeout(() => navigate("/admin-dashboard/sponsors"), 1800);
      }
    } catch (error) {
      alert(error.response?.data?.error || "Update protocol failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-4 md:p-10">
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}
      
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-8 hover:text-red-700 transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Return to Registry
        </button>

        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(220,38,38,0.1)] border border-white overflow-hidden">
          {/* HEADER */}
          <div className="p-8 md:p-12 border-b border-red-50 bg-gradient-to-b from-red-50/50 to-transparent">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-1 bg-red-600 rounded-full" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Modifier Mode</p>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-slate-900 leading-[0.8]">
              Edit <span className="text-red-600">Protocol</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
            {/* LOGO SECTION */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-red-50 border-4 border-white shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  <img
                    src={getImageUrl(preview)}
                    className="w-full h-full object-cover"
                    alt="preview"
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                  />
                </div>
                <label className="absolute -bottom-2 -right-2 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg cursor-pointer hover:bg-red-600 hover:rotate-12 transition-all">
                  <RefreshCcw size={20} />
                  <input ref={fileInputRef} type="file" name="logo" accept="image/*" className="hidden" onChange={handleChange} />
                </label>
              </div>
              
              <div className="flex-1 space-y-2 text-center md:text-left">
                <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-800">Visual Identifier</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 max-w-xs">
                  Modifying the logo will update all public instances of this partner across the dashboard.
                </p>
              </div>
            </div>

            {/* FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">
                  <ShieldCheck size={14} /> Corporate Name
                </label>
                <input
                  name="name"
                  value={sponsor.name}
                  placeholder="SPONSOR NAME"
                  required
                  onChange={handleChange}
                  className="w-full bg-red-50/30 border-b-2 border-red-100 py-4 px-2 text-[12px] font-black uppercase tracking-widest focus:outline-none focus:border-red-600 focus:bg-red-50 transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">
                  <Zap size={14} /> Partnership Tier
                </label>
                <select
                  name="collaboration"
                  value={sponsor.collaboration}
                  required
                  onChange={handleChange}
                  className="w-full bg-red-50/30 border-b-2 border-red-100 py-4 px-2 text-[12px] font-black uppercase tracking-widest focus:outline-none focus:border-red-600 transition-all appearance-none cursor-pointer"
                >
                  <option value="">SELECT TIER</option>
                  <option value="Title Sponsor">Title Sponsor</option>
                  <option value="Associate Sponsor">Associate Sponsor</option>
                  <option value="Event Sponsor">Event Sponsor</option>
                  <option value="Media Partner">Media Partner</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">
                  Counter
                </label>
                <input
                  type="number"
                  name="eventsSponsored"
                  value={sponsor.eventsSponsored}
                  placeholder="TOTAL EVENTS"
                  onChange={handleChange}
                  className="w-full bg-red-50/30 border-b-2 border-red-100 py-4 px-2 text-[12px] font-black uppercase tracking-widest focus:outline-none focus:border-red-600 transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">
                  <Users size={14} /> Exposure Metrics
                </label>
                <input
                  name="reach"
                  value={sponsor.reach}
                  placeholder="E.G. 5M REACH"
                  onChange={handleChange}
                  className="w-full bg-red-50/30 border-b-2 border-red-100 py-4 px-2 text-[12px] font-black uppercase tracking-widest focus:outline-none focus:border-red-600 transition-all"
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">
                  <Globe size={14} /> Pipeline Description
                </label>
                <input
                  name="upcomingEvents"
                  value={sponsor.upcomingEvents}
                  placeholder="RECONFIGURE UPCOMING COLLABORATIONS..."
                  onChange={handleChange}
                  className="w-full bg-red-50/30 border-b-2 border-red-100 py-4 px-2 text-[12px] font-black uppercase tracking-widest focus:outline-none focus:border-red-600 transition-all"
                />
              </div>
            </div>

            {/* BUTTON */}
            <div className="pt-8">
              <button
                disabled={loading}
                className={`group w-full relative overflow-hidden py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.5em] transition-all cursor-pointer shadow-2xl shadow-red-100
                  ${loading 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-red-600 text-white hover:bg-red-500 hover:scale-[1.02] active:scale-95"
                  }`}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Reconfiguring Intelligence...
                    </>
                  ) : (
                    "Execute Update Protocol"
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

export default SponsorEdit;