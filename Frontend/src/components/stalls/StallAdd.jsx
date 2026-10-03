import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, Camera, Check, Plus, Trash2 } from "lucide-react";

const PAGE_BG = "bg-gradient-to-br from-white via-red-50 to-pink-50";

const CHARCOAL = "#1A1A1D";
const GOLD = "#AD8A56";
const SLATE = "#7A756C";
const GARNET = "#722F37";
const HAIRLINE = "rgba(26,26,29,0.12)";
const GOLD_HAIRLINE = "rgba(173,138,86,0.4)";

const displayFont = { fontFamily: "'Cormorant Garamond', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

const MAX_FILE_SIZE = 5 * 1024 * 1024; // matches server limit (5MB)

/* ================= CONFIRMATION DIALOG ================= */
const SuccessAlert = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-[#1A1A1D]/30 backdrop-blur-md" />
    <div
      className="relative w-full max-w-sm rounded-[1.25rem] border bg-white/95 p-10 text-center shadow-[0_40px_90px_-32px_rgba(26,26,29,0.4)] backdrop-blur-md"
      style={{ borderColor: HAIRLINE, ...bodyFont }}
    >
      <div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
        style={{ borderColor: GOLD_HAIRLINE, color: GOLD }}
      >
        <Check size={26} strokeWidth={1.75} />
      </div>
      <h3 className="text-2xl leading-none" style={{ ...displayFont, fontWeight: 500, color: CHARCOAL }}>
        Asset Initialized
      </h3>
      <p className="mt-3 text-xs leading-relaxed" style={{ color: SLATE }}>
        The stall record has been created in the registry.
      </p>
      <button
        onClick={onClose}
        className="mt-8 w-full cursor-pointer rounded-full py-3.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white transition-colors"
        style={{ backgroundColor: CHARCOAL }}
      >
        Back to List
      </button>
    </div>
  </div>
);

/* ================= MAIN COMPONENT ================= */
const StallAdd = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    number: "",
    type: "",
    eventCount: "",
    plans: [""],
    logo: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo") {
      const file = files?.[0];
      if (!file || file.size > MAX_FILE_SIZE) return;
      setForm((p) => ({ ...p, logo: file }));
      setPreview(URL.createObjectURL(file));
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
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

    try {
      const fd = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === "plans") {
          form.plans.forEach((p) => fd.append("plans", p));
        } else if (form[key] !== undefined && form[key] !== null && form[key] !== "") {
          fd.append(key, form[key]);
        }
      });

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/stalls`,
        fd,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data?.success) {
        setShowAlert(true);
        setTimeout(() => navigate("/admin-dashboard/stalls"), 1800);
      }
    } catch (error) {
      alert(error.response?.data?.error || "Failed to add stall");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${PAGE_BG} p-4 text-[#1A1A1D] lg:p-10`} style={bodyFont}>
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}

      <div className="mx-auto max-w-5xl">
        <div
          className="overflow-hidden rounded-[1.25rem] border bg-white/80 shadow-[0_1px_2px_rgba(26,26,29,0.04),0_40px_90px_-32px_rgba(26,26,29,0.24)] backdrop-blur-md"
          style={{ borderColor: HAIRLINE }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* ============ LOGO SIDEBAR ============ */}
            <div
              className="flex flex-col items-center justify-center border-b p-10 text-center lg:col-span-4 lg:border-b-0 lg:border-r"
              style={{ borderColor: HAIRLINE }}
            >
              <div className="relative mb-6">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border" style={{ borderColor: GOLD_HAIRLINE }}>
                  <img src={preview || "/default-avatar.png"} alt="preview" className="h-full w-full object-cover" />
                </div>
                <label
                  className="absolute -bottom-1 -right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white shadow-[0_8px_20px_-6px_rgba(26,26,29,0.6)]"
                  style={{ backgroundColor: CHARCOAL }}
                >
                  <Camera size={16} strokeWidth={1.75} />
                  <input type="file" name="logo" accept="image/*" className="hidden" onChange={handleChange} />
                </label>
              </div>
              <h2
                className="mt-3 text-4xl leading-none tracking-tight text-[#1C1A17]"
                style={{ ...displayFont, fontWeight: 700 }}
              >
                New <span className="italic" style={{ color: GARNET }}>Employee</span>
              </h2>
              <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.28em]" style={{ color: GOLD }}>
                Initialize Asset Entry
              </p>
            </div>

            {/* ============ FORM AREA ============ */}
            <div className="p-8 lg:col-span-8 lg:p-12">
              <form onSubmit={handleSubmit} className="space-y-10">

                {/* IDENTIFICATION */}
                <section>
                  <SectionHeading icon={<LayoutGrid size={13} strokeWidth={1.5} />} label="Asset Identification" />
                  <div className="grid grid-cols-1 gap-x-8 gap-y-7 md:grid-cols-2">
                    <EditField label="Stall Name" name="name" placeholder="Stall name" required onChange={handleChange} />
                    <EditField label="Stall Number" name="number" placeholder="ST-001" required onChange={handleChange} />
                    <EditField label="Deployment Type" name="type" placeholder="Premium / Standard" required onChange={handleChange} />
                    <EditField label="Operation Load (Events)" name="eventCount" type="number" placeholder="0" min="0" onChange={handleChange} />
                  </div>
                </section>

                <GoldRule />

                {/* OPERATIONAL PLANS */}
                <section>
                  <div className="mb-6 flex items-center justify-between">
                    <SectionHeading label="Operational Plans" muted />
                    <button
                      type="button"
                      onClick={addPlan}
                      className="flex cursor-pointer items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors"
                      style={{ color: GOLD }}
                    >
                      <Plus size={14} strokeWidth={1.75} /> Add Plan
                    </button>
                  </div>

                  <div className="space-y-6">
                    {form.plans.map((plan, idx) => (
                      <div key={idx} className="flex items-end gap-3">
                        <div className="flex-1">
                          <FieldLabel label={`Plan ${idx + 1}`} />
                          <input
                            value={plan}
                            onChange={(e) => handlePlanChange(idx, e.target.value)}
                            placeholder="Describe plan"
                            className="mt-2 w-full border-b bg-transparent pb-2 text-base outline-none transition-colors"
                            style={{ ...displayFont, fontWeight: 500, borderColor: HAIRLINE, color: CHARCOAL }}
                            onFocus={(e) => (e.target.style.borderColor = GOLD)}
                            onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
                          />
                        </div>
                        {form.plans.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePlan(idx)}
                            className="cursor-pointer pb-2 transition-colors"
                            style={{ color: SLATE }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = CHARCOAL)}
                            onMouseLeave={(e) => (e.currentTarget.style.color = SLATE)}
                          >
                            <Trash2 size={16} strokeWidth={1.75} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* ACTIONS */}
                <div className="flex items-center gap-6 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="cursor-pointer text-[10px] font-medium uppercase tracking-[0.2em] transition-colors"
                    style={{ color: SLATE }}
                  >
                    Discard
                  </button>
                  <button
                    disabled={loading}
                    className="flex-1 cursor-pointer rounded-full py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: CHARCOAL }}
                  >
                    {loading ? "Initializing…" : "Execute Onboarding"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== SUPPORTING COMPONENTS ===== */

const GoldRule = () => <div className="h-px" style={{ backgroundColor: GOLD_HAIRLINE }} />;

const SectionHeading = ({ icon, label, muted }) => (
  <h3
    className="mb-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em]"
    style={{ color: muted ? SLATE : GOLD }}
  >
    {icon}
    {label}
  </h3>
);

const FieldLabel = ({ label }) => (
  <span className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: SLATE }}>{label}</span>
);

const EditField = ({ label, ...props }) => (
  <div>
    <FieldLabel label={label} />
    <input
      {...props}
      className="mt-2 w-full border-b bg-transparent pb-2 text-base outline-none transition-colors"
      style={{ ...displayFont, fontWeight: 500, borderColor: HAIRLINE, color: CHARCOAL }}
      onFocus={(e) => (e.target.style.borderColor = GOLD)}
      onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
    />
  </div>
);

export default StallAdd;