import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  Building2,
  FileText,
  ChevronLeft,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserCog,
  RefreshCw
} from "lucide-react";
import { apiErrorCode, apiErrorMessage } from "../../utils/apiError";

// managerEmployeeId may arrive as an id string or a populated document
const idOf = (value) => {
  if (!value) return "";
  if (typeof value === "object") return String(value._id || value.employeeRecordId || "");
  return String(value);
};

const managerLabel = (m) =>
  [m?.name || "Unnamed employee", m?.employeeCode, m?.designation].filter(Boolean).join(" · ");

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
  const [stale, setStale] = useState(false);

  // Manager assignment (admin only - this route lives under /admin-dashboard)
  const [originalManagerId, setOriginalManagerId] = useState("");
  const [managerId, setManagerId] = useState("");
  const [currentManager, setCurrentManager] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [eligible, setEligible] = useState([]);
  const [eligibleState, setEligibleState] = useState({ loading: true, error: "" });

  const fetchDepartment = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const [depRes, eligibleRes] = await Promise.allSettled([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/department/${id}`, { headers }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/department/${id}/eligible-managers`, { headers })
      ]);

      if (depRes.status === "fulfilled" && depRes.value.data?.success) {
        const dep = depRes.value.data.department || {};
        const mgrId = idOf(dep.managerEmployeeId) || idOf(dep.manager?.employeeRecordId);
        setDepartment({ dep_name: dep.dep_name || "", description: dep.description || "" });
        setOriginalManagerId(mgrId);
        setManagerId(mgrId);
        setCurrentManager(dep.manager || null);
        setUpdatedAt(dep.updatedAt || null);
        setError("");
      } else {
        setError(
          depRes.status === "rejected"
            ? apiErrorMessage(depRes.reason, "Failed to load department data")
            : "Failed to load department data"
        );
      }

      if (eligibleRes.status === "fulfilled") {
        const list = eligibleRes.value.data?.employees;
        setEligible(Array.isArray(list) ? list : []);
        setEligibleState({ loading: false, error: "" });
      } else {
        setEligible([]);
        setEligibleState({
          loading: false,
          error: apiErrorMessage(eligibleRes.reason, "Couldn't load eligible managers")
        });
      }
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDepartment();
  }, [fetchDepartment]);

  const reload = () => {
    setStale(false);
    setError("");
    setFetching(true);
    setEligibleState({ loading: true, error: "" });
    fetchDepartment();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setStale(false);
    try {
      const payload = {
        dep_name: department.dep_name.trim(),
        description: department.description
      };
      // Only send the manager when the admin changed it ("" -> null clears it).
      if (managerId !== originalManagerId) {
        payload.managerEmployeeId = managerId || null;
      }
      if (updatedAt) payload.expectedUpdatedAt = updatedAt;

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/department/${id}`,
        payload,
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
      const code = apiErrorCode(err);
      if (code === "STALE_UPDATE") {
        setStale(true);
        setError(
          apiErrorMessage(err, "This department was changed by someone else.") +
            " Reload to see the latest version before saving again."
        );
      } else {
        const details = err.response?.data?.details;
        const detailText =
          details && typeof details === "object" && !Array.isArray(details)
            ? Object.values(details).filter((v) => typeof v === "string").join(" ")
            : "";
        setError([apiErrorMessage(err, "Update failed"), detailText].filter(Boolean).join(" "));
      }
      console.error("Update Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentInEligible = eligible.some((m) => String(m.employeeRecordId) === originalManagerId);

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
                      <span className="text-[12.5px] font-medium flex-1">{error}</span>
                      {stale && (
                        <button
                          type="button"
                          onClick={reload}
                          className="form-focusable flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11.5px] font-semibold"
                          style={{ backgroundColor: `${RUST}1A`, color: RUST }}
                        >
                          <RefreshCw size={13} strokeWidth={2} /> Reload
                        </button>
                      )}
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

                    {/* Manager (admin only) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="dept-manager" className="text-[12.5px] font-semibold" style={{ color: "#14161B" }}>
                          Department manager
                        </label>
                        <span className="text-[10.5px] font-medium" style={{ color: SLATE }}>
                          Active members only
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-3 rounded-lg px-4 transition-colors focus-within:ring-2"
                        style={{ backgroundColor: PAPER_DIM }}
                      >
                        <UserCog size={16} strokeWidth={1.75} color={SLATE} />
                        <select
                          id="dept-manager"
                          value={managerId}
                          onChange={(e) => setManagerId(e.target.value)}
                          disabled={eligibleState.loading}
                          className="form-focusable w-full bg-transparent py-3.5 text-[14px] font-medium outline-none disabled:opacity-60"
                          style={{ color: "#14161B" }}
                        >
                          <option value="">No manager</option>
                          {originalManagerId && !currentInEligible && (
                            <option value={originalManagerId}>
                              {currentManager ? managerLabel(currentManager) : "Current manager"} (current - no longer eligible)
                            </option>
                          )}
                          {eligible.map((m) => (
                            <option key={m.employeeRecordId} value={String(m.employeeRecordId)}>
                              {managerLabel(m)}
                            </option>
                          ))}
                        </select>
                      </div>
                      {eligibleState.loading && (
                        <p className="text-[11.5px]" style={{ color: SLATE }}>Loading eligible employees…</p>
                      )}
                      {eligibleState.error && (
                        <p className="text-[11.5px] font-medium" style={{ color: RUST }}>{eligibleState.error}</p>
                      )}
                      {!eligibleState.loading && !eligibleState.error && eligible.length === 0 && (
                        <p className="text-[11.5px]" style={{ color: SLATE }}>
                          No active employees in this department yet. Add employees to the department first,
                          then assign a manager.
                        </p>
                      )}
                      {managerId !== originalManagerId && (
                        <p className="text-[11.5px] font-medium" style={{ color: BRASS }}>
                          {managerId ? "Manager will change when you save." : "The manager assignment will be cleared when you save."}
                        </p>
                      )}
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
