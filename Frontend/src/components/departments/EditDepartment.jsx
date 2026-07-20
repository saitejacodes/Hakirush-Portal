import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  Building2,
  FileText,
  ChevronLeft,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#C6A15B";
const HAIRLINE = "#E7DFD2";

const displayFont = { fontFamily: "'Playfair Display', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

const GRAIN_URI =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='140'%20height='140'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23n)'%20opacity='0.5'/%3E%3C/svg%3E";

/* ================= COMPACT SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => {
  return (
    <>
      <div className="fixed inset-0 z-[100] animate-in fade-in bg-[#1C1A17]/60 backdrop-blur-sm duration-300" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm transform animate-in overflow-hidden rounded-[2.5rem] border border-[#E7DFD2] bg-white shadow-[0_35px_70px_-15px_rgba(28,26,23,0.35)] zoom-in-95 transition-all duration-300"
          style={bodyFont}
        >
          <div className="p-10 text-center">
            <span
              className="mx-auto mb-8 flex h-18 w-18 items-center justify-center rounded-full border"
              style={{ borderColor: "#3F5B5440", color: "#3F5B54", backgroundColor: "#3F5B540A" }}
            >
              <CheckCircle2 size={36} strokeWidth={1.5} />
            </span>

            <h3
              className="text-3xl leading-none tracking-tight text-[#1C1A17]"
              style={{ ...displayFont, fontWeight: 700 }}
            >
              Unit <span className="italic text-[#7A2233]">Updated</span>
            </h3>
            <p className="mt-4 text-[10px] font-semibold uppercase leading-relaxed tracking-widest text-[#B4ADA0]">
              The department details have been <br /> successfully synchronized.
            </p>
          </div>

          <div className="px-10 pb-10">
            <button
              onClick={onClose}
              className="w-full cursor-pointer rounded-2xl py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-white shadow-[0_16px_32px_-12px_rgba(28,26,23,0.35)] transition-all duration-300 active:scale-95"
              style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ================= EDIT DEPARTMENT COMPONENT ================= */
const EditDepartment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State Management
  const [department, setDepartment] = useState({ dep_name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState("");

  // Fetch Department Data
  useEffect(() => {
    const fetchDepartment = async () => {
      setFetching(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/department/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        if (response.data.success) {
          setDepartment(response.data.department);
        }
      } catch (err) {
        setError("Failed to load department data");
        console.error("Fetch Error:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchDepartment();
  }, [id]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartment((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/department/${id}`,
        department,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      if (response.data.success) {
        setShowAlert(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Update failed");
      console.error("Update Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Conditional Rendering of Alert */}
      {showAlert && (
        <SuccessAlert onClose={() => navigate("/admin-dashboard/departments")} />
      )}

      <div
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-white via-red-50 to-pink-100 px-4 py-12"
        style={bodyFont}
      >
        {/* faint paper grain, matching the rest of the app */}
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] mix-blend-multiply"
          style={{ backgroundImage: `url("${GRAIN_URI}")` }}
        />
        {/* masthead rule */}
        <div
          className="fixed top-0 left-0 z-10 h-[3px] w-full"
          style={{ background: `linear-gradient(90deg, ${GARNET}, ${GOLD} 45%, ${GARNET})` }}
        />

        <div className="relative z-10 w-full max-w-xl">

          {/* TOP BACK BUTTON */}
          <div className="mb-6 ml-2">
            <button
              onClick={() => navigate(-1)}
              className="group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition-all"
            >
              <ChevronLeft
                size={17}
                strokeWidth={1.75}
                className="text-[#B4ADA0] transition-all group-hover:-translate-x-1 group-hover:text-[#7A2233]"
              />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#B4ADA0] transition-colors group-hover:text-[#7A2233]">
                Cancel & Return
              </span>
            </button>
          </div>

          {/* FORM CONTAINER */}
          <div className="relative rounded-[2.25rem] border border-[#E7DFD2] bg-white/75 p-6 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_40px_80px_-24px_rgba(28,26,23,0.20)] backdrop-blur-md sm:p-9">

            {/* Header Area */}
            <div className="mb-11 flex flex-col items-center text-center">
              <span
                className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-[0_20px_40px_-14px_rgba(28,26,23,0.4)]"
                style={{ background: `linear-gradient(155deg, ${INK} 0%, #3A342C 100%)` }}
              >
                <Building2 size={26} strokeWidth={1.5} />
              </span>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-px w-6" style={{ backgroundColor: GOLD }} />
                <p className="text-[9px] font-semibold uppercase tracking-[0.4em]" style={{ color: GOLD }}>
                  Modify Entity Properties
                </p>
                <div className="h-px w-6" style={{ backgroundColor: GOLD }} />
              </div>
              <h2
                className="text-xl leading-none tracking-tight text-[#1C1A17] sm:text-2xl"
                style={{ ...displayFont, fontWeight: 700 }}
              >
                Edit <span className="italic text-[#7A2233]">Department</span>
              </h2>
            </div>

            {/* Loading / Error States */}
            {fetching && (
              <div className="py-10 text-center">
                <Loader2 className="mx-auto animate-spin" size={28} strokeWidth={1.75} style={{ color: GARNET }} />
              </div>
            )}

            {error && (
              <div
                className="mb-8 flex items-center gap-3 rounded-2xl border p-4"
                style={{ borderColor: "#7A223330", backgroundColor: "#7A22330A", color: GARNET }}
              >
                <AlertCircle size={17} strokeWidth={1.75} />
                <span className="text-[10px] font-semibold uppercase tracking-widest">{error}</span>
              </div>
            )}

            {!fetching && (
              <form onSubmit={handleSubmit} className="space-y-9">

                {/* Department Name Input */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[9px] font-semibold uppercase tracking-widest text-[#B4ADA0]">
                      Official Identity
                    </label>
                    <span className="text-[8.5px] font-semibold uppercase italic tracking-wide" style={{ color: GARNET }}>
                      Required
                    </span>
                  </div>
                  <div
                    className="group relative flex items-center rounded-2xl border px-5 transition-all focus-within:border-[#C6A15B]/50 focus-within:bg-white"
                    style={{ borderColor: HAIRLINE, backgroundColor: "#FBF8F3" }}
                  >
                    <Building2 className="text-[#B4ADA0] transition-colors group-focus-within:text-[#7A2233]" size={16} strokeWidth={1.75} />
                    <input
                      name="dep_name"
                      required
                      value={department.dep_name}
                      placeholder="e.g. Strategic Growth"
                      onChange={handleChange}
                      autoComplete="off"
                      className="w-full bg-transparent py-4 pl-4 text-[12px] font-medium tracking-wide text-[#1C1A17] outline-none placeholder:text-[#B4ADA0]"
                    />
                  </div>
                </div>

                {/* Description Textarea */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[9px] font-semibold uppercase tracking-widest text-[#B4ADA0]">
                      Scope of Operations
                    </label>
                    <span className="text-[8.5px] font-semibold uppercase italic tracking-widest text-[#C9C2B4]">
                      Markdown supported
                    </span>
                  </div>
                  <div
                    className="group relative flex items-start rounded-2xl border px-5 py-4 transition-all focus-within:border-[#C6A15B]/50 focus-within:bg-white"
                    style={{ borderColor: HAIRLINE, backgroundColor: "#FBF8F3" }}
                  >
                    <FileText className="mt-1 text-[#B4ADA0] transition-colors group-focus-within:text-[#7A2233]" size={16} strokeWidth={1.75} />
                    <textarea
                      rows={4}
                      name="description"
                      required
                      value={department.description}
                      placeholder="Briefly define the responsibilities and operational goals of this department…"
                      onChange={handleChange}
                      className="w-full resize-none bg-transparent pl-4 text-[12.5px] leading-relaxed text-[#4A453D] outline-none placeholder:text-[#B4ADA0]"
                    />
                  </div>
                </div>

                {/* Action Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-white shadow-[0_20px_40px_-14px_rgba(122,34,51,0.45)] transition-all duration-300 hover:shadow-[0_24px_48px_-14px_rgba(122,34,51,0.55)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale"
                    style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={15} strokeWidth={1.75} />
                        <span>Updating Unit…</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} strokeWidth={1.75} className="transition-transform group-hover:-translate-y-0.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                    <span
                      className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{ background: `linear-gradient(90deg, transparent, ${GOLD}22, transparent)` }}
                    />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EditDepartment;