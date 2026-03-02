import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, CheckCircle2, X, Store, Zap, Layers, Calendar, Trash2, Plus } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/* ================= PREMIUM SUCCESS ALERT (Matched to SponsorEdit) ================= */
const SuccessAlert = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-md z-50 animate-in fade-in duration-300" />
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10 text-center">
          <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            Update Verified
          </h3>
          <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed">
            The stall database has been synchronized with your new records.
          </p>
          <button
            onClick={onClose}
            className="w-full mt-8 py-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white font-black uppercase tracking-widest text-[11px] hover:from-red-600 hover:to-rose-500 transition-all shadow-xl active:scale-95 cursor-pointer"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  </>
);

const StallEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [stall, setStall] = useState({
    name: "",
    number: "",
    type: "",
    eventCount: "",
    plans: [""],
  });

  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState("/default-avatar.png");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchStall = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/stalls/${id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        if (res.data.success) {
          const s = res.data.stall;
          setStall({
            name: s.name || "",
            number: s.number || "",
            type: s.type || "",
            eventCount: s.eventCount || "",
            plans: s.plans && s.plans.length ? s.plans : [""],
          });
          if (s.logo) {
            setPreview(s.logo.startsWith("http") ? s.logo : `${import.meta.env.VITE_BACKEND_URL}/${s.logo}`);
          }
        }
      } catch (err) {
        console.error("Failed to load stall data", err);
        alert("Failed to load stall protocol.");
      } finally {
        setLoading(false);
      }
    };
    fetchStall();
  }, [id]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStall((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlanChange = (idx, value) => {
    const newPlans = [...stall.plans];
    newPlans[idx] = value;
    setStall((prev) => ({ ...prev, plans: newPlans }));
  };

  const addPlan = () => {
    setStall((prev) => ({ ...prev, plans: [...prev.plans, ""] }));
  };

  const removePlan = (idx) => {
    setStall((prev) => ({ ...prev, plans: stall.plans.filter((_, i) => i !== idx) }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || file.size > MAX_FILE_SIZE) {
      alert("File too large. Max 10MB");
      return;
    }
    setLogo(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const fd = new FormData();
      
      // Append basic fields
      Object.keys(stall).forEach((key) => {
        if (key !== "plans") {
          fd.append(key, stall[key]);
        }
      });
      
      // Append plans array
      stall.plans.forEach((plan) => fd.append("plans", plan));
      
      if (logo) fd.append("logo", logo);

      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/stalls/${id}`,
        fd,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data.success) {
        setShowAlert(true);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Update protocol failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPulse />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 text-slate-900 font-sans p-4 lg:p-12">
      {showAlert && (
        <SuccessAlert onClose={() => navigate("/admin-dashboard/stalls")} />
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10 px-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-1">Administration</p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Modify <span className="not-italic text-red-600">Stall</span></h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 transition-all cursor-pointer"
          >
            <X size={16} className="group-hover:rotate-90 transition-transform" /> Discard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT: AVATAR --- */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-[3.5rem] p-10 shadow-sm flex flex-col items-center">
              <div className="relative group">
                <div className="w-48 h-48 rounded-[4rem] overflow-hidden ring-8 ring-slate-50 p-1 shadow-inner">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-cover rounded-[3.5rem]"
                  />
                </div>
                <label className="absolute bottom-2 right-2 w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:bg-red-600 transition-all active:scale-90">
                  <Camera size={24} />
                  <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleImageChange} />
                </label>
              </div>

              <div className="mt-8 w-full">
                <InputItem
                  label="Stall Name"
                  icon={<Store size={14}/>}
                  name="name"
                  value={stall.name}
                  onChange={handleChange}
                  placeholder="Enter stall name"
                  required
                />
              </div>
            </div>
          </div>

          {/* --- RIGHT: FORM DATA --- */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[3.5rem] p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-2 border-b border-slate-50 pb-6">
                <div className="p-2.5 bg-red-50 text-red-600 rounded-xl"><Store size={14}/></div>
                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Stall Registry</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputItem
                  label="Stall Number"
                  icon={<Layers size={14}/>}
                  name="number"
                  value={stall.number}
                  onChange={handleChange}
                  placeholder="E.G. A-101"
                  required
                />
                
                <InputItem
                  label="Stall Type"
                  icon={<Zap size={14}/>}
                  name="type"
                  value={stall.type}
                  onChange={handleChange}
                  placeholder="E.G. Food, Tech"
                />

                <InputItem
                  label="Event Count"
                  icon={<Calendar size={14}/>}
                  type="number"
                  name="eventCount"
                  value={stall.eventCount}
                  onChange={handleChange}
                  placeholder="Enter count"
                />
              </div>
            </div>

            {/* PROTOCOLS SECTION (Replaces Pipeline Section) */}
            <div className="bg-white border border-slate-200 rounded-[3.5rem] p-10 shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-xl"><Zap size={14}/></div>
                  <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Operational Protocols</h3>
                </div>
                <button 
                  type="button" 
                  onClick={addPlan}
                  className="text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-500 flex items-center gap-2"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              
              <div className="space-y-4">
                {stall.plans.map((plan, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex-grow">
                      <InputItem
                        label={`Protocol ${index + 1}`}
                        icon={<Zap size={14}/>}
                        value={plan}
                        onChange={(e) => handlePlanChange(index, e.target.value)}
                        placeholder="Enter protocol details..."
                      />
                    </div>
                    {stall.plans.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePlan(index)}
                        className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-slate-200 hover:from-red-600 hover:to-rose-500 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Synchronizing..." : "Authorize & Commit Changes"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

/* ===== PREMIUM FORM COMPONENTS (Shared) ===== */

const InputItem = ({ label, icon, ...props }) => (
  <div className="group p-4 rounded-[2rem] bg-white border border-slate-200 focus-within:border-slate-900 focus-within:shadow-xl focus-within:shadow-slate-100 transition-all">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-slate-400 group-focus-within:text-slate-900 transition-colors">{icon}</span>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-slate-900">
        {label}
      </p>
    </div>
    <input
      {...props}
      className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 placeholder:text-slate-200 uppercase italic"
    />
  </div>
);

const LoadingPulse = () => (
  <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-6">
    <div className="w-16 h-16 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Establishing Secure Session</p>
  </div>
);

export default StallEdit;