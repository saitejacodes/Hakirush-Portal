import axios from "axios";
import { Edit2, Eye, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

/* ================= PREMIUM CONFIRM ALERT ================= */
const ConfirmDeleteAlert = ({ onConfirm, onCancel }) => {
  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] animate-fade-in bg-[#1C1A17]/40 backdrop-blur-md" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm animate-pop overflow-hidden rounded-[2.25rem] border border-[#E7DFD2] bg-white shadow-[0_35px_70px_-15px_rgba(28,26,23,0.35)]"
          style={bodyFont}
        >
          <div className="p-8 text-center">
            <span
              className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
              style={{ borderColor: `${GARNET}40`, color: GARNET, backgroundColor: `${GARNET}0A` }}
            >
              <span
                className="absolute inset-0 animate-ping-slow rounded-full"
                style={{ backgroundColor: `${GARNET}14` }}
              />
              <AlertCircle size={30} strokeWidth={1.5} className="relative" />
            </span>

            <h3
              className="text-2xl leading-none tracking-tight text-[#1C1A17]"
              style={{ ...displayFont, fontWeight: 700 }}
            >
              Wait, <span className="italic text-[#7A2233]">delete?</span>
            </h3>
            <p className="mt-2 text-[10.5px] font-semibold uppercase leading-relaxed tracking-widest text-[#B4ADA0]">
              This will permanently remove the <br /> department from the system.
              <br />
              Only departments with no employees can be deleted.
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
              className="w-1/2 cursor-pointer rounded-2xl py-3.5 text-[10px] font-semibold uppercase tracking-widest text-white shadow-[0_16px_32px_-12px_rgba(122,34,51,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_38px_-12px_rgba(122,34,51,0.55)] active:scale-95"
              style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
            >
              Delete
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
      <div className="fixed inset-0 z-[100] animate-fade-in bg-[#1C1A17]/20 backdrop-blur-sm" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm animate-pop overflow-hidden rounded-[2.25rem] border border-[#E7DFD2] bg-white shadow-[0_35px_70px_-15px_rgba(28,26,23,0.35)]"
          style={bodyFont}
        >
          <div className="p-8 text-center">
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
              <span className="italic text-[#7A2233]">Removed!</span>
            </h3>
            <p className="mt-2 text-[10.5px] font-semibold uppercase tracking-widest text-[#B4ADA0]">
              The record has been updated.
            </p>
          </div>
          <div className="px-8 pb-8">
            <button
              onClick={onClose}
              className="w-full cursor-pointer rounded-2xl py-3.5 text-[10px] font-semibold uppercase tracking-widest text-white shadow-[0_16px_32px_-12px_rgba(28,26,23,0.35)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
              style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
            >
              Okay, Got It
            </button>
          </div>
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
    edit: {
      className: `${base} text-[#B4ADA0] hover:text-[#1C1A17] hover:shadow-[0_10px_20px_-8px_rgba(28,26,23,0.2)]`,
      style: { borderColor: HAIRLINE, backgroundColor: "white" },
      hoverStyle: { borderColor: "rgba(28,26,23,0.2)" },
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

/* ================= MAIN BUTTONS ================= */
export const DepartmentButtons = ({ id, onDepartmentDelete }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/department/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data?.success) {
        setShowConfirm(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onDepartmentDelete?.();
        }, 1500);
      }
    } catch (err) {
      setShowConfirm(false);
      if (apiErrorCode(err) === "DEPARTMENT_NOT_EMPTY") {
        alert(
          apiErrorMessage(
            err,
            "This department still has employees. Move or deactivate them before deleting it."
          )
        );
      } else {
        alert(apiErrorMessage(err, "Failed to delete"));
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {showConfirm && (
        <ConfirmDeleteAlert
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {showSuccess && (
        <DeleteSuccessAlert onClose={() => setShowSuccess(false)} />
      )}

      <div className="flex justify-end gap-2">
        <IconButton
          variant="default"
          label="View employees"
          icon={<Eye size={15} strokeWidth={1.75} />}
          onClick={() => navigate(`/admin-dashboard/department/${id}/employees`)}
        />

        <IconButton
          variant="edit"
          label="Edit department"
          icon={<Edit2 size={15} strokeWidth={1.75} />}
          onClick={() => navigate(`/admin-dashboard/department/${id}`)}
        />

        <IconButton
          variant="danger"
          label="Delete department"
          icon={<Trash2 size={15} strokeWidth={1.75} />}
          onClick={() => setShowConfirm(true)}
        />
      </div>
    </>
  );
};
