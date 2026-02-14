import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ChevronLeft, 
  Loader2, 
  Settings2,
  AlertCircle
} from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/* ================= IMAGE HELPER ================= */
const getImageUrl = (url) => {
  if (!url) return "/default-avatar.png";
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("http")) return `${url}?t=${Date.now()}`;
  return `${import.meta.env.VITE_BACKEND_URL}/${url}`;
};

/* ================= PREMIUM SUCCESS ALERT (NO BLACK) ================= */
const SuccessAlert = ({ onClose }) => {
  return (
    <>
      <div className="fixed inset-0 bg-red-950/40 backdrop-blur-md z-[60]" />
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[2.5rem] bg-white shadow-[0_32px_64px_-16px_rgba(153,27,27,0.3)] border border-red-50 overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="h-2 bg-gradient-to-r from-red-800 via-red-500 to-red-800" />
          <div className="p-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-600 mb-6 shadow-inner">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-red-950">Update Complete</h3>
            <p className="text-sm font-bold text-red-400/80 uppercase tracking-widest mt-2">Asset Parameters Synchronized</p>
            <button
              onClick={onClose}
              className="w-full mt-8 py-4 rounded-2xl bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-red-700 transition-all shadow-lg active:scale-95"
            >
              Confirm & Return
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const StallEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    number: "",
    type: "",
    eventCount: 0,
    plans: [""],
  });

  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const fetchStall = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/stalls/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (res.data.success && res.data.stall) {
          const s = res.data.stall;
          setForm({
            name: s.name || "",
            number: s.number || "",
            type: s.type || "",
            eventCount: s.eventCount || 0,
            plans: s.plans && s.plans.length ? s.plans : [""],
          });
          setPreview(s.logo || null);
        }
      } catch {
        setError("Critical Error: Asset Retrieval Failed");
      } finally {
        setFetching(false);
      }
    };
    fetchStall();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo") {
      const file = files?.[0];
      if (!file || file.size > MAX_FILE_SIZE) return;
      setLogo(file);
      setPreview(URL.createObjectURL(file));
      return;
    }
    setForm((p) => ({ ...p, [name]: name === "eventCount" ? Number(value) : value }));
  };

  const handlePlanChange = (idx, value) => {
    const plans = [...form.plans];
    plans[idx] = value;
    setForm((p) => ({ ...p, plans }));
  };

  const addPlan = () => setForm((p) => ({ ...p, plans: [...p.plans, ""] }));
  const removePlan = (idx) => setForm((p) => ({ ...p, plans: p.plans.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === "plans") {
          form.plans.forEach((p) => fd.append("plans", p));
        } else {
          fd.append(key, form[key]);
        }
      });
      if (logo) fd.append("logo", logo);

      const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/stalls/${id}`, fd, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.success) {
        setShowAlert(true);
        setTimeout(() => navigate("/admin-dashboard/stalls"), 1800);
      }
    } catch {
      setError("Protocol Failure: Modification Rejected");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Accessing Core Database...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-4 md:p-10 flex flex-col items-center">
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}

      <div className="w-full max-w-4xl">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-400 mb-8 hover:text-red-600 transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Discard Changes
        </button>

        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(220,38,38,0.1)] border border-white overflow-hidden">
          
          <div className="p-10 md:p-14 border-b border-red-50 bg-gradient-to-b from-red-50/50 to-transparent flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest mb-6">
              <Settings2 size={12} fill="currentColor" /> System Modification
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-red-950 leading-none">
              Edit <span className="text-red-600">Asset</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-12">
            
            <div className="flex flex-col items-center group">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white shadow-2xl p-2 border border-red-50 rotate-3 overflow-hidden transition-transform group-hover:rotate-0">
                  <img
                    src={getImageUrl(preview)}
                    alt="preview"
                    className="w-full h-full object-cover rounded-[2rem]"
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                  />
                </div>
                <label className="absolute -bottom-2 -right-2 bg-red-600 text-white p-4 rounded-2xl shadow-lg cursor-pointer hover:bg-red-950 transition-colors">
                  <Upload size={20} />
                  <input ref={fileInputRef} type="file" name="logo" accept="image/*" className="hidden" onChange={handleChange} />
                </label>
              </div>
              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Modify Visual Identity</p>
            </div>

            <div className="space-y-6">
              <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-red-600 flex items-center gap-3">
                <div className="w-8 h-[2px] bg-red-600" /> Identity Matrix
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomInput label="Asset Name" name="name" value={form.name} onChange={handleChange} required />
                <CustomInput label="Registry Code" name="number" value={form.number} onChange={handleChange} required />
                <CustomInput label="Unit Class" name="type" value={form.type} onChange={handleChange} required />
                <CustomInput label="Mission History" name="eventCount" type="number" value={form.eventCount} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-red-600 flex items-center gap-3">
                  <div className="w-8 h-[2px] bg-red-600" /> Operational Protocols
                </h3>
                <button type="button" onClick={addPlan} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700">
                  <Plus size={14} strokeWidth={3} /> New Protocol
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {form.plans.map((plan, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <input
                      value={plan}
                      onChange={(e) => handlePlanChange(idx, e.target.value)}
                      className="w-full bg-red-50/50 border-2 border-transparent focus:border-red-600 focus:bg-white rounded-2xl px-6 py-4 outline-none text-sm font-bold text-red-950 placeholder-red-200 transition-all uppercase tracking-wider shadow-inner"
                      placeholder={`PROTOCOL ${idx + 1}`}
                    />
                    {form.plans.length > 1 && (
                      <button type="button" onClick={() => removePlan(idx)} className="bg-red-50 text-red-400 hover:bg-red-600 hover:text-white p-4 rounded-2xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <button
                disabled={loading}
                className={`group w-full relative overflow-hidden py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.5em] transition-all cursor-pointer shadow-2xl shadow-red-200
                  ${loading ? "bg-red-200 text-red-400" : "bg-gradient-to-r from-red-800 via-red-600 to-red-800 text-white hover:scale-[1.02] active:scale-95"}`}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? <Loader2 size={20} className="animate-spin" /> : "Re-Deploy Asset"}
                </div>
              </button>

              {error && (
                <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center gap-3">
                  <AlertCircle size={16} className="text-red-600" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-600">{error}</p>
                </div>
              )}
            </div>
          </form>

          <div className="p-8 bg-red-950 flex justify-between items-center">
            <p className="text-[9px] font-bold text-red-400/50 uppercase tracking-[0.3em]">
              Security Clearance: Admin • Registry v3.0
            </p>
            <div className="flex gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
               <div className="w-1.5 h-1.5 rounded-full bg-red-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomInput = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400 ml-2">{label}</label>
    <input {...props} className="w-full bg-red-50/50 border-2 border-transparent focus:border-red-600 focus:bg-white rounded-2xl px-6 py-4 outline-none text-sm font-bold text-red-950 placeholder-red-200 transition-all uppercase tracking-wider shadow-inner" />
  </div>
);

export default StallEdit;