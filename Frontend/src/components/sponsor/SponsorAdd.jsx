import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Camera, UserPlus, CheckCircle2 } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // matches server limit (5MB)

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#C6A15B";
const HAIRLINE = "#E7DFD2";

const displayFont = { fontFamily: "'Playfair Display', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

const GRAIN_URI =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='140'%20height='140'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23n)'%20opacity='0.5'/%3E%3C/svg%3E";

/* ================= SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-[#1C1A17]/40 backdrop-blur-sm animate-in fade-in duration-300" />
    <div
      className="relative w-full max-w-sm overflow-hidden rounded-[1.75rem] border bg-white p-8 text-center shadow-[0_30px_60px_-24px_rgba(28,26,23,0.35)] animate-in zoom-in-95 duration-300"
      style={{ borderColor: HAIRLINE }}
    >
      <div className="h-[3px] w-full -mt-8 mb-6" style={{ background: `linear-gradient(90deg, ${GARNET}, ${GOLD} 45%, ${GARNET})` }} />
      <div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
        style={{ borderColor: GOLD, color: "#3F5B54" }}
      >
        <CheckCircle2 size={28} strokeWidth={1.5} />
      </div>
      <h3 className="text-2xl leading-none tracking-tight text-[#1C1A17]" style={{ ...displayFont, fontWeight: 700 }}>
        Onboarded.
      </h3>
      <p className="mb-8 mt-3 text-[10px] font-semibold uppercase tracking-widest text-[#8A8378]">
        The sponsor record has been initialized.
      </p>
      <button
        onClick={onClose}
        className="w-full cursor-pointer rounded-2xl py-4 text-[10px] font-semibold uppercase tracking-widest text-white shadow-[0_14px_28px_-10px_rgba(122,34,51,0.45)] transition-all active:scale-95"
        style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
      >
        Back to List
      </button>
    </div>
  </div>
);

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
      if (!file || file.size > MAX_FILE_SIZE) return;
      setFormData((p) => ({ ...p, logo: file }));
      setPreview(URL.createObjectURL(file));
      return;
    }
    setFormData((p) => ({ ...p, [name]: value }));
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

  const labelCls = "mb-2 ml-1 block text-[9px] font-semibold uppercase tracking-[0.22em] text-[#8A8378]";
  const inputCls =
    "w-full rounded-2xl border bg-[#FBF8F3] px-5 py-3.5 text-sm outline-none transition-all placeholder:text-[#B4ADA0] focus:border-[#C6A15B]/50 focus:bg-white";

  return (
    <div
      className="relative min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-100 p-4 text-[#1C1A17] lg:p-10"
      style={bodyFont}
    >
      {/* faint paper grain */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] mix-blend-multiply"
        style={{ backgroundImage: `url("${GRAIN_URI}")` }}
      />
      {/* masthead rule */}
      <div
        className="relative z-10 -m-4 mb-8 h-[3px] w-[calc(100%+2rem)] lg:-m-10 lg:mb-10 lg:w-[calc(100%+5rem)]"
        style={{ background: `linear-gradient(90deg, ${GARNET}, ${GOLD} 45%, ${GARNET})` }}
      />

      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}

      <div className="relative z-10 mx-auto max-w-5xl">
        <div
          className="overflow-hidden rounded-[2rem] border bg-white/80 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_30px_60px_-24px_rgba(28,26,23,0.16)] backdrop-blur-md"
          style={{ borderColor: HAIRLINE }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* PHOTO SIDEBAR */}
            <div
              className="flex flex-col items-center justify-center border-b p-10 text-center lg:col-span-4 lg:border-b-0 lg:border-r"
              style={{ borderColor: HAIRLINE, backgroundColor: "#FBF8F3" }}
            >
              <div className="group relative mb-6">
                <div
                  className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 bg-white p-1 shadow-md"
                  style={{ borderColor: HAIRLINE }}
                >
                  <img
                    src={preview || "/default-avatar.png"}
                    alt="preview"
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
                <label
                  className="absolute -bottom-1 -right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white shadow-md transition-transform hover:scale-105"
                  style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
                >
                  <Camera size={16} strokeWidth={1.75} />
                  <input type="file" name="logo" accept="image/*" className="hidden" onChange={handleChange} />
                </label>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-px w-6" style={{ backgroundColor: GOLD }} />
                <p className="text-[9px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
                  Registry Entry
                </p>
              </div>
              <h2
                className="mt-3 text-3xl leading-none tracking-tight text-[#1C1A17]"
                style={{ ...displayFont, fontWeight: 700 }}
              >
                New <span className="italic" style={{ color: GARNET }}>Sponsor</span>
              </h2>
            </div>

            {/* FORM AREA */}
            <div className="p-8 lg:col-span-8 lg:p-12">
              <form onSubmit={handleSubmit} className="space-y-9">

                {/* IDENTIFICATION SECTION */}
                <section>
                  <h3
                    className="mb-6 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.3em]"
                    style={{ color: GARNET }}
                  >
                    <UserPlus size={13} strokeWidth={1.75} /> Primary Identification
                  </h3>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelCls}>Sponsor Name</label>
                      <input name="name" placeholder="Sponsor name" required onChange={handleChange} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Collaboration Type</label>
                      <select name="collaboration" required onChange={handleChange} className={`${inputCls} cursor-pointer`}>
                        <option value="">Select partnership level</option>
                        <option value="Title Sponsor">Title Sponsor</option>
                        <option value="Associate Sponsor">Associate Sponsor</option>
                        <option value="Event Sponsor">Event Sponsor</option>
                        <option value="Media Partner">Media Partner</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Events Sponsored</label>
                      <input type="number" name="eventsSponsored" placeholder="Total events logged" min="0" onChange={handleChange} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Market Reach</label>
                      <input name="reach" placeholder="e.g. 2.5M impressions" onChange={handleChange} className={inputCls} />
                    </div>
                  </div>
                </section>

                {/* PIPELINE SECTION */}
                <section>
                  <h3 className="mb-6 text-[9px] font-semibold uppercase tracking-[0.3em]" style={{ color: "#8A8378" }}>
                    Future Pipeline
                  </h3>
                  <div>
                    <label className={labelCls}>Upcoming Events</label>
                    <input name="upcomingEvents" placeholder="Describe upcoming collaborations…" onChange={handleChange} className={inputCls} />
                  </div>
                </section>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-4 border-t pt-8" style={{ borderColor: HAIRLINE }}>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="cursor-pointer rounded-2xl px-8 py-4 text-[10px] font-semibold uppercase tracking-widest transition-colors"
                    style={{ color: "#8A8378" }}
                  >
                    Discard
                  </button>
                  <button
                    disabled={loading}
                    className="flex-1 cursor-pointer rounded-2xl py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_28px_-10px_rgba(122,34,51,0.45)] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
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

export default SponsorAdd;