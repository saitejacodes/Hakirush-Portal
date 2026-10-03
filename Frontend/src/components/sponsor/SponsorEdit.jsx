import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, CheckCircle2, X, Building2, Zap, Globe, ChevronLeft } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // matches server limit (5MB)

const PAGE_BG = "bg-gradient-to-br from-white via-red-50 to-pink-100";

const CHARCOAL = "#1A1A1D";
const GOLD = "#AD8A56";
const SLATE = "#7A756C";
const GARNET = "#722F37";
const HAIRLINE = "rgba(26,26,29,0.10)";
const GOLD_HAIRLINE = "rgba(173,138,86,0.35)";

const displayFont = { fontFamily: "'Cormorant Garamond', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

/* ================= SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-[#1A1A1D]/30 backdrop-blur-md z-50 animate-in fade-in duration-300" />
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div
        className="w-full max-w-sm rounded-[1.25rem] border bg-white/90 shadow-[0_40px_90px_-32px_rgba(26,26,29,0.28)] backdrop-blur-md overflow-hidden animate-in zoom-in-95 duration-300"
        style={{ borderColor: HAIRLINE }}
      >
        <div className="p-10 text-center" style={bodyFont}>
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full border mx-auto mb-6"
            style={{ borderColor: GOLD_HAIRLINE, color: GOLD }}
          >
            <CheckCircle2 size={30} strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl" style={{ ...displayFont, fontWeight: 500 }}>
            Update Verified
          </h3>
          <p className="text-xs mt-3 leading-relaxed" style={{ color: SLATE }}>
            The sponsor record has been synchronized with your new details.
          </p>
          <button
            onClick={onClose}
            className="w-full mt-8 cursor-pointer rounded-full px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors"
            style={{ backgroundColor: CHARCOAL }}
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  </>
);

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
  const [preview, setPreview] = useState("/default-avatar.png");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchSponsor = async () => {
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
          if (s.logo) {
            setPreview(s.logo.startsWith("http") ? s.logo : `${import.meta.env.VITE_BACKEND_URL}/${s.logo}`);
          }
        }
      } catch (err) {
        console.error("Failed to load sponsor data", err);
        alert("Failed to load sponsor record.");
      } finally {
        setLoading(false);
      }
    };
    fetchSponsor();
  }, [id]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSponsor((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || file.size > MAX_FILE_SIZE) {
      alert("File too large. Max 5MB");
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
      Object.keys(sponsor).forEach((key) => fd.append(key, sponsor[key]));
      if (logo) fd.append("logo", logo);

      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/sponsors/${id}`,
        fd,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data.success) {
        setShowAlert(true);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPulse />;

  return (
    <div className={`relative min-h-screen ${PAGE_BG} p-4 text-[#1A1A1D] lg:p-10`} style={bodyFont}>
      {showAlert && (
        <SuccessAlert onClose={() => navigate("/admin-dashboard/sponsors")} />
      )}

      <div className="relative z-10 mx-auto max-w-3xl">

        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex cursor-pointer items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors hover:text-[#1A1A1D]"
            style={{ color: SLATE }}
          >
            <ChevronLeft size={14} strokeWidth={1.75} /> Back
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[1.25rem] border bg-white/80 shadow-[0_1px_2px_rgba(26,26,29,0.04),0_40px_90px_-32px_rgba(26,26,29,0.28)] backdrop-blur-md"
          style={{ borderColor: HAIRLINE }}
        >
          {/* ============ NAMEPLATE / AVATAR ============ */}
          <div className="flex flex-col items-center px-8 pb-10 pt-12 text-center sm:px-14">
            <div className="relative">
              <div
                className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border"
                style={{ borderColor: GOLD_HAIRLINE }}
              >
                <img src={preview} alt="preview" className="h-full w-full object-cover" />
              </div>
              <label
                className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white shadow-md transition-colors"
                style={{ backgroundColor: CHARCOAL }}
              >
                <Camera size={14} strokeWidth={1.75} />
                <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleImageChange} />
              </label>
            </div>

            <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
              HAKIRUSH · Editing Record
            </p>
            <h2
                className="mt-3 text-5xl leading-none tracking-tight text-[#1C1A17]"
                style={{ ...displayFont, fontWeight: 700 }}
              >
                Edit <span className="italic" style={{ color: GARNET }}>Sponsor</span>
            </h2>
          </div>

          <GoldRule />

          {/* ============ FORM FIELDS ============ */}
          <div className="px-8 py-10 sm:px-14">
            <div className="mb-8 flex items-center gap-2" style={{ color: GOLD }}>
              <Building2 size={14} strokeWidth={1.5} />
              <span className="text-[9px] font-semibold uppercase tracking-[0.32em]" style={{ color: SLATE }}>
                Sponsor Registry
              </span>
            </div>

            <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
              <FormField label="Sponsor Name" icon={<Building2 size={14} strokeWidth={1.5} />}>
                <input
                  name="name"
                  value={sponsor.name}
                  onChange={handleChange}
                  placeholder="Enter sponsor name"
                  required
                  className="w-full bg-transparent outline-none text-base"
                  style={{ ...displayFont, fontWeight: 500 }}
                />
              </FormField>

              <FormField label="Collaboration Type" icon={<Zap size={14} strokeWidth={1.5} />}>
                <select
                  name="collaboration"
                  value={sponsor.collaboration}
                  onChange={handleChange}
                  required
                  className="w-full cursor-pointer bg-transparent outline-none text-base"
                  style={{ ...displayFont, fontWeight: 500 }}
                >
                  <option value="">Choose Variant</option>
                  <option value="Title Sponsor">Title Sponsor</option>
                  <option value="Associate Sponsor">Associate Sponsor</option>
                  <option value="Event Sponsor">Event Sponsor</option>
                  <option value="Media Partner">Media Partner</option>
                </select>
              </FormField>

              <FormField label="Events Sponsored" icon={<Zap size={14} strokeWidth={1.5} />}>
                <input
                  type="number"
                  name="eventsSponsored"
                  value={sponsor.eventsSponsored}
                  onChange={handleChange}
                  placeholder="Enter count"
                  className="w-full bg-transparent outline-none text-base"
                  style={{ ...displayFont, fontWeight: 500 }}
                />
              </FormField>

              <FormField label="Market Reach" icon={<Globe size={14} strokeWidth={1.5} />}>
                <input
                  name="reach"
                  value={sponsor.reach}
                  onChange={handleChange}
                  placeholder="e.g. 5M reach"
                  className="w-full bg-transparent outline-none text-base"
                  style={{ ...displayFont, fontWeight: 500 }}
                />
              </FormField>
            </div>
          </div>

          <GoldRule />

          {/* ============ FUTURE PIPELINE ============ */}
          <div className="px-8 py-10 sm:px-14">
            <div className="mb-8 flex items-center gap-2" style={{ color: GOLD }}>
              <Globe size={14} strokeWidth={1.5} />
              <span className="text-[9px] font-semibold uppercase tracking-[0.32em]" style={{ color: SLATE }}>
                Future Pipeline
              </span>
            </div>
            <FormField label="Upcoming Operations" icon={<Globe size={14} strokeWidth={1.5} />}>
              <input
                name="upcomingEvents"
                value={sponsor.upcomingEvents}
                onChange={handleChange}
                placeholder="Reconfigure upcoming collaborations…"
                className="w-full bg-transparent outline-none text-base"
                style={{ ...displayFont, fontWeight: 500 }}
              />
            </FormField>
          </div>

          <GoldRule />

          {/* ============ ACTION FOOTER ============ */}
          <div className="flex flex-col items-center justify-center gap-4 px-8 py-10 sm:px-14">
            <button
              type="submit"
              disabled={saving}
              className="w-full cursor-pointer rounded-full px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: CHARCOAL }}
            >
              {saving ? "Synchronizing..." : "Authorize & Commit Changes"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-[9px] uppercase tracking-[0.28em]" style={{ color: SLATE }}>
          Secure &nbsp;·&nbsp; Encrypted &nbsp;·&nbsp; Admin Only
        </p>
      </div>
    </div>
  );
};

/* ===== SUPPORTING COMPONENTS ===== */

const GoldRule = () => (
  <div className="px-8 sm:px-14">
    <div className="h-px" style={{ backgroundColor: GOLD_HAIRLINE }} />
  </div>
);

const FormField = ({ label, icon, children }) => (
  <div className="border-b pb-3" style={{ borderColor: HAIRLINE }}>
    <div className="flex items-center gap-2" style={{ color: GOLD }}>
      {icon}
      <span className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: SLATE }}>
        {label}
      </span>
    </div>
    <div className="mt-1.5">{children}</div>
  </div>
);

const LoadingPulse = () => (
  <div className={`flex min-h-screen flex-col items-center justify-center gap-4 ${PAGE_BG}`}>
    <div className="h-9 w-9 animate-spin rounded-full border border-[#1A1A1D]/10 border-t-[#AD8A56]"></div>
    <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-[#1A1A1D]/50">Establishing Secure Session</p>
  </div>
);

export default SponsorEdit;