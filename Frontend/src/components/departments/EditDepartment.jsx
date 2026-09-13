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

const INK = "#4A1015";        
const INK_SOFT = "#5C161C";    
const PAPER = "#F7F4EC";       
const PAPER_DIM = "#EFEBE0";   
const BRASS = "#A9853C";
const BRASS_LIGHT = "#D7B978";
const RUST = "#B4432E";   
const SAGE = "#3F5B54";       
const SLATE = "#6B7280";       
const FOG = "#C7A9A6";       
const HAIRLINE_DARK = "#6B262C";
const HAIRLINE_LIGHT = "#E4DECE";

const displayFont = { fontFamily: "'Fraunces', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

/* ================= SUCCESS MODAL ================= */
const SuccessAlert = ({ onClose }) => {
  return (
    <>
      <div className="fixed inset-0 z-[100] bg-[#14161B]/70 backdrop-blur-sm" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm overflow-hidden rounded-2xl border"
          style={{ backgroundColor: PAPER, borderColor: HAIRLINE_LIGHT, ...bodyFont }}
        >
          <div className="p-9 text-center">
            <span
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${SAGE}12`, color: SAGE }}
            >
              <CheckCircle2 size={30} strokeWidth={1.5} />
            </span>

            <h3
              className="text-[24px] leading-none tracking-tight"
              style={{ ...displayFont, fontWeight: 600, color: "#14161B" }}
            >
              Changes saved
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed" style={{ color: SLATE }}>
              The department details are up to date.
            </p>
          </div>

          <div className="px-9 pb-9">
            <button
              onClick={onClose}
              className="form-focusable w-full cursor-pointer rounded-lg py-3.5 text-[13.5px] font-semibold text-[#14161B] transition-transform active:scale-[0.98]"
              style={{ backgroundColor: BRASS_LIGHT }}
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

  const [department, setDepartment] = useState({ dep_name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState("");

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartment((prev) => ({ ...prev, [name]: value }));
  };

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
      {showAlert && (
        <SuccessAlert onClose={() => navigate("/admin-dashboard/departments")} />
      )}

      <div
        className="flex min-h-screen items-center justify-center px-4 py-12"
        style={{ backgroundColor: PAPER_DIM, ...bodyFont }}
      >

        <div className="w-full max-w-lg">
          {/* BACK BUTTON */}
          <div className="mb-4 ml-1">
            <button
              onClick={() => navigate(-1)}
              className="form-focusable group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2"
            >
              <ChevronLeft
                size={17}
                strokeWidth={1.75}
                style={{ color: SLATE }}
                className="transition-all group-hover:-translate-x-1"
              />
              <span className="text-[12px] font-medium" style={{ color: SLATE }}>
                Cancel and return
              </span>
            </button>
          </div>

          {/* THE BOARD */}
          <div className="overflow-hidden rounded-2xl border" style={{ backgroundColor: INK, borderColor: HAIRLINE_DARK }}>
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="mb-8 flex flex-col items-center text-center">
                <span
                  className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg border-2"
                  style={{ backgroundColor: INK_SOFT, borderColor: BRASS }}
                >
                  <Building2 size={24} strokeWidth={1.5} color={BRASS_LIGHT} />
                </span>
                <p className="mb-1.5 text-[11.5px] font-semibold" style={{ color: FOG }}>
                  Organization registry
                </p>
                <h2
                  className="text-[22px] leading-none tracking-tight sm:text-[26px]"
                  style={{ ...displayFont, fontWeight: 600, color: PAPER }}
                >
                  Edit department
                </h2>
              </div>

              {/* Fetching state */}
              {fetching ? (
                <div className="flex flex-col items-center gap-3 py-14">
                  <Loader2 className="animate-spin" size={24} strokeWidth={1.75} color={BRASS_LIGHT} />
                  <p className="text-[12.5px] font-medium" style={{ color: FOG }}>
                    Loading department details…
                  </p>
                </div>
              ) : (
                <div className="rounded-xl p-5 sm:p-7" style={{ backgroundColor: PAPER }}>
                  {error && (
                    <div
                      className="mb-6 flex items-center gap-3 rounded-lg px-4 py-3"
                      style={{ backgroundColor: `${RUST}0F`, color: RUST }}
                    >
                      <AlertCircle size={16} strokeWidth={1.75} className="shrink-0" />
                      <span className="text-[12.5px] font-medium">{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Department Name */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[12.5px] font-semibold" style={{ color: "#14161B" }}>
                          Department name
                        </label>
                        <span className="text-[10.5px] font-medium" style={{ color: BRASS }}>
                          Required
                        </span>
                      </div>
                      <div
                        className="group flex items-center gap-3 rounded-lg px-4 transition-colors focus-within:ring-2"
                        style={{ backgroundColor: PAPER_DIM }}
                      >
                        <Building2 size={16} strokeWidth={1.75} color={SLATE} />
                        <input
                          name="dep_name"
                          required
                          value={department.dep_name}
                          placeholder="e.g. Strategic Growth"
                          onChange={handleChange}
                          autoComplete="off"
                          className="form-focusable w-full bg-transparent py-3.5 text-[14px] font-medium outline-none placeholder:text-[#9CA3AF]"
                          style={{ color: "#14161B" }}
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[12.5px] font-semibold" style={{ color: "#14161B" }}>
                          Description
                        </label>
                        <span className="text-[10.5px] font-medium" style={{ color: SLATE }}>
                          Markdown supported
                        </span>
                      </div>
                      <div
                        className="flex items-start gap-3 rounded-lg px-4 py-3.5 transition-colors focus-within:ring-2"
                        style={{ backgroundColor: PAPER_DIM }}
                      >
                        <FileText size={16} strokeWidth={1.75} color={SLATE} className="mt-0.5 shrink-0" />
                        <textarea
                          rows={4}
                          name="description"
                          required
                          value={department.description}
                          placeholder="Briefly describe what this department is responsible for…"
                          onChange={handleChange}
                          className="form-focusable w-full resize-none bg-transparent text-[14px] leading-relaxed outline-none placeholder:text-[#9CA3AF]"
                          style={{ color: "#14161B" }}
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="form-focusable flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg py-3.5 text-[14px] font-semibold text-[#14161B] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ backgroundColor: BRASS_LIGHT }}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={16} strokeWidth={2} />
                          Saving changes…
                        </>
                      ) : (
                        <>
                          <Save size={17} strokeWidth={1.75} />
                          Save changes
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditDepartment;
