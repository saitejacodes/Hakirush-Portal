import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, Edit2, UserX, UserCheck, Plane, Receipt, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { apiErrorCode, apiErrorMessage } from "./apiError";

/* ================= CONFIGURATION =================
   Same editorial system as the rest of the admin area —
   deep garnet + antique gold on warm paper.
*/
const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#C6A15B";
const HAIRLINE = "#E7DFD2";

const displayFont = { fontFamily: "'Playfair Display', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

/* ================= CONFIRM DEACTIVATE =================
   DELETE /api/employee/:id is retention-safe: it deactivates the account
   (sign-in blocked, sessions revoked) and keeps payroll/attendance/leave history. */
const ConfirmDeleteAlert = ({ onConfirm, onCancel, busy }) => {
  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] animate-in fade-in bg-[#1C1A17]/40 backdrop-blur-md duration-300" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm animate-in zoom-in-95 overflow-hidden rounded-[2.25rem] border border-[#E7DFD2] bg-white shadow-[0_35px_70px_-15px_rgba(28,26,23,0.35)] duration-200"
          style={bodyFont}
        >
          <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${GARNET}, ${GOLD} 45%, ${GARNET})` }} />

          <div className="p-8 text-center">
            <span
              className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
              style={{ borderColor: `${GARNET}40`, color: GARNET, backgroundColor: `${GARNET}0A` }}
            >
              <span
                className="absolute inset-0 animate-ping-slow rounded-full"
                style={{ backgroundColor: `${GARNET}14` }}
              />
              <AlertTriangle size={30} strokeWidth={1.5} className="relative" />
            </span>

            <h3
              className="text-2xl leading-none tracking-tight text-[#1C1A17]"
              style={{ ...displayFont, fontWeight: 700 }}
            >
              Deactivate employee<span className="italic text-[#7A2233]">?</span>
            </h3>
            <p className="mt-3 text-[12px] font-medium leading-relaxed text-[#8A8378]">
              They will no longer be able to sign in and all of their sessions end.
              Payroll, attendance and leave history are retained.
            </p>
          </div>

          <div className="flex gap-3 px-8 pb-8">
            <button
              onClick={onCancel}
              className="w-1/2 cursor-pointer rounded-2xl border py-3.5 text-[10px] font-semibold uppercase tracking-widest text-[#8A8378] transition-all duration-300 hover:border-[#D9C79A] hover:text-[#1C1A17] active:scale-95"
              style={{ borderColor: HAIRLINE, backgroundColor: "#FBF8F3" }}
            >
              Abort
            </button>
            <button
              onClick={onConfirm}
              disabled={busy}
              className="w-1/2 cursor-pointer rounded-2xl py-3.5 text-[10px] font-semibold uppercase tracking-widest text-white shadow-[0_16px_32px_-12px_rgba(122,34,51,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_38px_-12px_rgba(122,34,51,0.55)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
            >
              {busy ? "Working…" : "Deactivate"}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

/* ================= PREMIUM SUCCESS ALERT ================= */
const DeleteSuccessAlert = ({ onClose }) => {
  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] animate-in fade-in bg-[#1C1A17]/20 backdrop-blur-sm" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm animate-in zoom-in-95 overflow-hidden rounded-[2.25rem] border border-[#E7DFD2] bg-white p-8 text-center shadow-[0_35px_70px_-15px_rgba(28,26,23,0.35)]"
          style={bodyFont}
        >
          <span
            className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
            style={{ borderColor: "#3F5B5440", color: "#3F5B54", backgroundColor: "#3F5B540A" }}
          >
            <span
              className="absolute inset-0 animate-ping-slow rounded-full"
              style={{ backgroundColor: "#3F5B5414" }}
            />
            <CheckCircle2 size={30} strokeWidth={1.5} className="relative" />
          </span>

          <h3
            className="text-2xl leading-none tracking-tight text-[#1C1A17]"
            style={{ ...displayFont, fontWeight: 700 }}
          >
            <span className="italic text-[#7A2233]">Deactivated</span>
          </h3>
          <p className="mt-2 mb-6 text-[10.5px] font-semibold uppercase tracking-widest text-[#B4ADA0]">
            Account disabled. History retained.
          </p>
          <button
            onClick={onClose}
            className="w-full cursor-pointer rounded-2xl py-3.5 text-[10px] font-semibold uppercase tracking-widest text-white shadow-[0_16px_32px_-12px_rgba(28,26,23,0.35)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
          >
            Acknowledged
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};

/* ================= CONFIRM REACTIVATE ================= */
const ConfirmReactivateAlert = ({ onConfirm, onCancel, busy }) => {
  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] animate-in fade-in bg-[#1C1A17]/40 backdrop-blur-md duration-300" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm animate-in zoom-in-95 overflow-hidden rounded-[2.25rem] border border-[#E7DFD2] bg-white shadow-[0_35px_70px_-15px_rgba(28,26,23,0.35)] duration-200"
          style={bodyFont}
        >
          <div className="h-[3px]" style={{ background: `linear-gradient(90deg, #3F5B54, ${GOLD} 45%, #3F5B54)` }} />

          <div className="p-8 text-center">
            <span
              className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
              style={{ borderColor: "#3F5B5440", color: "#3F5B54", backgroundColor: "#3F5B540A" }}
            >
              <span
                className="absolute inset-0 animate-ping-slow rounded-full"
                style={{ backgroundColor: "#3F5B5414" }}
              />
              <UserCheck size={30} strokeWidth={1.5} className="relative" />
            </span>

            <h3
              className="text-2xl leading-none tracking-tight text-[#1C1A17]"
              style={{ ...displayFont, fontWeight: 700 }}
            >
              Reactivate employee<span className="italic text-[#3F5B54]">?</span>
            </h3>
            <p className="mt-3 text-[12px] font-medium leading-relaxed text-[#8A8378]">
              They will be able to sign in again and access the portal.
              All existing history remains intact.
            </p>
          </div>

          <div className="flex gap-3 px-8 pb-8">
            <button
              onClick={onCancel}
              className="w-1/2 cursor-pointer rounded-2xl border py-3.5 text-[10px] font-semibold uppercase tracking-widest text-[#8A8378] transition-all duration-300 hover:border-[#D9C79A] hover:text-[#1C1A17] active:scale-95"
              style={{ borderColor: HAIRLINE, backgroundColor: "#FBF8F3" }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={busy}
              className="w-1/2 cursor-pointer rounded-2xl py-3.5 text-[10px] font-semibold uppercase tracking-widest text-white shadow-[0_16px_32px_-12px_rgba(63,91,84,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_38px_-12px_rgba(63,91,84,0.55)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "linear-gradient(155deg, #1C1A17 0%, #3F5B54 100%)" }}
            >
              {busy ? "Working…" : "Reactivate"}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

/* ================= REACTIVATE SUCCESS ALERT ================= */
const ReactivateSuccessAlert = ({ onClose }) => {
  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] animate-in fade-in bg-[#1C1A17]/20 backdrop-blur-sm" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm animate-in zoom-in-95 overflow-hidden rounded-[2.25rem] border border-[#E7DFD2] bg-white p-8 text-center shadow-[0_35px_70px_-15px_rgba(28,26,23,0.35)]"
          style={bodyFont}
        >
          <span
            className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
            style={{ borderColor: "#3F5B5440", color: "#3F5B54", backgroundColor: "#3F5B540A" }}
          >
            <span
              className="absolute inset-0 animate-ping-slow rounded-full"
              style={{ backgroundColor: "#3F5B5414" }}
            />
            <CheckCircle2 size={30} strokeWidth={1.5} className="relative" />
          </span>

          <h3
            className="text-2xl leading-none tracking-tight text-[#1C1A17]"
            style={{ ...displayFont, fontWeight: 700 }}
          >
            <span className="italic text-[#3F5B54]">Reactivated</span>
          </h3>
          <p className="mt-2 mb-6 text-[10.5px] font-semibold uppercase tracking-widest text-[#B4ADA0]">
            Account restored. Employee can sign in.
          </p>
          <button
            onClick={onClose}
            className="w-full cursor-pointer rounded-2xl py-3.5 text-[10px] font-semibold uppercase tracking-widest text-white shadow-[0_16px_32px_-12px_rgba(28,26,23,0.35)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            style={{ background: "linear-gradient(155deg, #1C1A17 0%, #3F5B54 100%)" }}
          >
            Acknowledged
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};

/* ================= ICON BUTTON WITH TOOLTIP ================= */
const IconButton = ({ icon, label, onClick, variant = "default" }) => {
  const [hovered, setHovered] = useState(false);

  const base =
    "group relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition-all duration-300 active:scale-90";

  const variants = {
    default: {
      className: `${base} text-[#B4ADA0] hover:text-[#7A2233] hover:shadow-[0_10px_20px_-8px_rgba(198,161,91,0.35)]`,
      style: { borderColor: HAIRLINE, backgroundColor: "white" },
      hoverStyle: { borderColor: "#D9C79A" },
    },
    danger: {
      className: `${base} border-transparent text-[#C9C2B4] hover:text-white hover:shadow-[0_10px_22px_-8px_rgba(122,34,51,0.45)]`,
      style: { backgroundColor: "#FBF8F3" },
      hoverStyle: { backgroundColor: GARNET },
    },
  };

  const v = variants[variant];

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={v.className}
        style={hovered ? { ...v.style, ...v.hoverStyle } : v.style}
        aria-label={label}
      >
        {icon}
      </button>

      {/* CUSTOM TOOLTIP */}
      <span
        className={`pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-widest text-white transition-all duration-200 ${
          hovered ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}
        style={{ backgroundColor: INK, ...bodyFont }}
      >
        {label}
        <span
          className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent"
          style={{ borderTopColor: INK }}
        />
      </span>
    </div>
  );
};

/* ================= MAIN ACTION COMPONENT ================= */
export const EmployeeButtons = ({ id, refresh, isActive }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReactivateConfirm, setShowReactivateConfirm] = useState(false);
  const [showReactivateSuccess, setShowReactivateSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const sendDeactivate = (clearManager = false) =>
    axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      ...(clearManager ? { data: { clearManager: true } } : {}),
    });

  const sendReactivate = () =>
    axios.patch(
      `${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}/status`,
      { isActive: true },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

  const deactivateEmployee = async () => {
    if (busy) return;
    setBusy(true);
    try {
      let res;
      try {
        res = await sendDeactivate(false);
      } catch (err) {
        // The employee currently manages a department: offer to clear it.
        if (apiErrorCode(err) !== "MANAGER_REASSIGNMENT_REQUIRED") throw err;
        const ok = window.confirm(
          `${apiErrorMessage(err, "This employee is the manager of their department.")}\n\n` +
            "Clear the department's manager assignment and deactivate this employee?"
        );
        if (!ok) {
          setShowConfirm(false);
          return;
        }
        res = await sendDeactivate(true);
      }

      if (res.data.success) {
        setShowConfirm(false);
        setShowSuccess(true);

        // Immediate background refresh for smooth data transition
        if (refresh) refresh();

        // Auto-clear success modal
        setTimeout(() => {
          setShowSuccess(false);
        }, 1500);
      }
    } catch (err) {
      console.error("Employee deactivation failed.", err);
      setShowConfirm(false);
      alert(apiErrorMessage(err, "Unable to deactivate this employee."));
    } finally {
      setBusy(false);
    }
  };

  const reactivateEmployee = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await sendReactivate();
      if (res.data.success) {
        setShowReactivateConfirm(false);
        setShowReactivateSuccess(true);

        if (refresh) refresh();

        setTimeout(() => {
          setShowReactivateSuccess(false);
        }, 1500);
      }
    } catch (err) {
      console.error("Employee reactivation failed.", err);
      setShowReactivateConfirm(false);
      alert(apiErrorMessage(err, "Unable to reactivate this employee."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {showConfirm && (
        <ConfirmDeleteAlert
          onConfirm={deactivateEmployee}
          onCancel={() => setShowConfirm(false)}
          busy={busy}
        />
      )}

      {showSuccess && (
        <DeleteSuccessAlert onClose={() => setShowSuccess(false)} />
      )}

      {showReactivateConfirm && (
        <ConfirmReactivateAlert
          onConfirm={reactivateEmployee}
          onCancel={() => setShowReactivateConfirm(false)}
          busy={busy}
        />
      )}

      {showReactivateSuccess && (
        <ReactivateSuccessAlert onClose={() => setShowReactivateSuccess(false)} />
      )}

      <div className="flex items-center justify-end gap-2">
        <IconButton
          variant="default"
          label="View profile"
          icon={<Eye size={16} strokeWidth={1.75} />}
          onClick={() => navigate(`/admin-dashboard/employees/${id}`)}
        />

        <IconButton
          variant="default"
          label="Edit details"
          icon={<Edit2 size={15} strokeWidth={1.75} />}
          onClick={() => navigate(`/admin-dashboard/employees/edit/${id}`)}
        />

        <IconButton
          variant="default"
          label="Leaves"
          icon={<Plane size={15} strokeWidth={1.75} />}
          onClick={() => navigate(`/admin-dashboard/employees/leaves/${id}`)}
        />

        <IconButton
          variant="default"
          label="Payslip"
          icon={<Receipt size={15} strokeWidth={1.75} />}
          onClick={() => navigate(`/admin-dashboard/employees/payslip/${id}`)}
        />

        {isActive === false ? (
          <IconButton
            variant="default"
            label="Reactivate"
            icon={<UserCheck size={15} strokeWidth={1.75} />}
            onClick={() => setShowReactivateConfirm(true)}
          />
        ) : (
          <IconButton
            variant="danger"
            label="Deactivate"
            icon={<UserX size={15} strokeWidth={1.75} />}
            onClick={() => setShowConfirm(true)}
          />
        )}
      </div>
    </>
  );
};

/* ================= API HELPERS ================= */

/**
 * Fetches the master employee list
 */
export const fetchEmployees = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/employee`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res.data.success ? res.data.employees : [];
  } catch (error) {
    console.error("Sync Error: Failed to fetch employees.", error.response?.data || error);
    return [];
  }
};

/**
 * Fetches departments for the onboarding form
 */
export const fetchDepartments = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/department`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.data.success) {
      return response.data.departments;
    }
  } catch (error) {
    console.error("Sync Error: Failed to fetch departments.", error.response?.data || error);
  }
  return [];
};
