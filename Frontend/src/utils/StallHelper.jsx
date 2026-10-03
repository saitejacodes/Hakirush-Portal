import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, Eye, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { apiErrorMessage } from "./apiError";

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#C6A15B";
const HAIRLINE = "#E7DFD2";

const displayFont = { fontFamily: "'Playfair Display', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

/* ================= PREMIUM CONFIRM DELETE ================= */
const ConfirmDeleteAlert = ({ onConfirm, onCancel }) => {
  return createPortal(
    <>
      <div className="fixed inset-0 z-[60] bg-[#1C1A17]/40 backdrop-blur-md animate-in fade-in duration-300" />
      <div className="fixed inset-0 z-[70] flex animate-in zoom-in-95 items-center justify-center px-4 duration-200">
        <div
          className="w-full max-w-md overflow-hidden rounded-[1.75rem] border bg-white shadow-[0_30px_60px_-24px_rgba(28,26,23,0.35)]"
          style={{ borderColor: HAIRLINE }}
        >
          <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${GARNET}, ${GOLD} 45%, ${GARNET})` }} />

          <div className="p-8 text-center" style={bodyFont}>
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
              style={{ borderColor: GOLD, color: GARNET }}
            >
              <AlertCircle size={28} strokeWidth={1.5} />
            </div>

            <h3
              className="text-2xl leading-none tracking-tight text-[#1C1A17]"
              style={{ ...displayFont, fontWeight: 700 }}
            >
              Terminate <span className="italic" style={{ color: GARNET }}>Stall?</span>
            </h3>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-[#8A8378]">
              This asset will be permanently removed from the registry.
            </p>

            <div className="mt-8 flex gap-3">
              <button
                onClick={onCancel}
                className="w-1/2 cursor-pointer rounded-2xl border py-4 text-[10px] font-semibold uppercase tracking-widest text-[#8A8378] transition-colors hover:border-[#D9C79A] active:scale-95"
                style={{ borderColor: HAIRLINE }}
              >
                Abort
              </button>
              <button
                onClick={onConfirm}
                className="w-1/2 cursor-pointer rounded-2xl py-4 text-[10px] font-semibold uppercase tracking-widest text-white shadow-[0_14px_28px_-10px_rgba(122,34,51,0.45)] transition-all hover:-translate-y-0.5 active:scale-95"
                style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
              >
                Confirm Purge
              </button>
            </div>
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
      <div className="fixed inset-0 z-[60] bg-[#1C1A17]/20 backdrop-blur-sm animate-in fade-in" />
      <div className="fixed inset-0 z-[70] flex animate-in zoom-in-95 items-center justify-center px-4">
        <div
          className="w-full max-w-sm overflow-hidden rounded-[1.75rem] border bg-white p-8 text-center shadow-[0_30px_60px_-24px_rgba(28,26,23,0.35)]"
          style={{ borderColor: HAIRLINE }}
        >
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
            style={{ borderColor: GOLD, color: "#3F5B54" }}
          >
            <CheckCircle2 size={28} strokeWidth={1.5} />
          </div>
          <h3
            className="mb-2 text-xl leading-none tracking-tight text-[#1C1A17]"
            style={{ ...displayFont, fontWeight: 700 }}
          >
            Asset Purged.
          </h3>
          <p className="mb-6 text-[10px] font-semibold uppercase tracking-widest text-[#8A8378]">
            The stall registry has been updated.
          </p>
          <button
            onClick={onClose}
            className="w-full cursor-pointer rounded-2xl border py-4 text-[10px] font-semibold uppercase tracking-widest text-[#8A8378] transition-colors hover:border-[#D9C79A] active:scale-95"
            style={{ borderColor: HAIRLINE }}
          >
            Acknowledge
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
    "group relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border bg-white shadow-sm transition-all duration-300 active:scale-90";

  const variants = {
    view: {
      className: `${base} text-[#8A8378] hover:text-[#7A2233]`,
      style: { borderColor: HAIRLINE },
      hoverStyle: { borderColor: "#D9C79A" },
    },
    edit: {
      className: `${base} text-[#8A8378] hover:text-[#1C1A17]`,
      style: { borderColor: HAIRLINE },
      hoverStyle: { borderColor: "#D9C79A" },
    },
    danger: {
      className: "cursor-pointer rounded-full p-2.5 transition-colors duration-300 active:scale-90",
      style: { backgroundColor: "#F6F2EA", color: "#8A8378" },
      hoverStyle: { backgroundColor: GARNET, color: "#fff" },
      isDanger: true,
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

/* ================= MAIN STALL BUTTONS ================= */
export const StallButtons = ({ id, refresh }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const deleteStall = async () => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/stalls/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setShowConfirm(false);
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          if (refresh) refresh();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      alert(apiErrorMessage(err, "System Error: Unable to purge stall record."));
    }
  };

  return (
    <>
      {showConfirm && (
        <ConfirmDeleteAlert
          onConfirm={deleteStall}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {showSuccess && (
        <DeleteSuccessAlert onClose={() => setShowSuccess(false)} />
      )}

      <div className="flex items-center justify-end gap-2">
        <IconButton
          variant="view"
          label="View details"
          icon={<Eye size={16} strokeWidth={1.75} />}
          onClick={() => navigate(`/admin-dashboard/stalls/${id}`)}
        />

        <IconButton
          variant="edit"
          label="Modify stall"
          icon={<Edit2 size={16} strokeWidth={1.75} />}
          onClick={() => navigate(`/admin-dashboard/stalls/edit/${id}`)}
        />

        <IconButton
          variant="danger"
          label="Delete record"
          icon={<Trash2 size={16} strokeWidth={1.75} />}
          onClick={() => setShowConfirm(true)}
        />
      </div>
    </>
  );
};

/* ✅ API Helper */
export const fetchStalls = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/stalls`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res.data.success ? res.data.stalls : [];
  } catch (error) {
    console.error("Core Sync Error:", error.response?.data || error);
    return [];
  }
};