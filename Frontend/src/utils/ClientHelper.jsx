import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, Eye, AlertCircle, Check } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { apiErrorMessage } from "./apiError";

const CHARCOAL = "#1A1A1D";
const GOLD = "#AD8A56";
const CRIMSON = "#9E2B3E";
const IVORY = "#F6F2EA";
const SLATE = "#7A756C";
const HAIRLINE = "rgba(26,26,29,0.12)";
const GOLD_HAIRLINE = "rgba(173,138,86,0.35)";

const displayFont = { fontFamily: "'Cormorant Garamond', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

/* ================= CONFIRM DELETE ================= */
const ConfirmDeleteAlert = ({ onConfirm, onCancel }) => {
  return createPortal(
    <>
      <div className="fixed inset-0 z-[60] bg-[#1A1A1D]/30 backdrop-blur-md" />
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
        <div
          className="w-full max-w-md overflow-hidden rounded-[1.25rem] border bg-white/95 shadow-[0_40px_90px_-32px_rgba(26,26,29,0.4)] backdrop-blur-md"
          style={{ borderColor: HAIRLINE, ...bodyFont }}
        >
          <div className="px-8 pb-8 pt-10">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
              style={{ borderColor: "rgba(158,43,62,0.3)", color: CRIMSON }}
            >
              <AlertCircle size={26} strokeWidth={1.75} />
            </div>

            <div className="mb-8 space-y-2 text-center">
              <h3 className="text-2xl leading-none" style={{ ...displayFont, fontWeight: 500, color: CHARCOAL }}>
                Remove Client Record?
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: SLATE }}>
                This will permanently delete the record from the registry.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="w-1/2 cursor-pointer rounded-full border py-3.5 text-[10px] font-semibold uppercase tracking-widest transition-colors"
                style={{ borderColor: HAIRLINE, color: SLATE }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="w-1/2 cursor-pointer rounded-full py-3.5 text-[10px] font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: CRIMSON }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

/* ================= SUCCESS ================= */
const DeleteSuccessAlert = ({ onClose }) => {
  return createPortal(
    <>
      <div className="fixed inset-0 z-[60] bg-[#1A1A1D]/20 backdrop-blur-sm" />
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm overflow-hidden rounded-[1.25rem] border bg-white/95 p-8 text-center shadow-[0_40px_90px_-32px_rgba(26,26,29,0.4)] backdrop-blur-md"
          style={{ borderColor: HAIRLINE, ...bodyFont }}
        >
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
            style={{ borderColor: GOLD_HAIRLINE, color: GOLD }}
          >
            <Check size={26} strokeWidth={1.75} />
          </div>
          <h3 className="mb-2 text-xl leading-none" style={{ ...displayFont, fontWeight: 500, color: CHARCOAL }}>
            Record Removed
          </h3>
          <p className="mb-6 text-xs" style={{ color: SLATE }}>
            The registry has been updated.
          </p>
          <button
            onClick={onClose}
            className="w-full cursor-pointer rounded-full py-3.5 text-[10px] font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: CHARCOAL }}
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
const IconButton = ({ icon, label, onClick, variant = "view" }) => {
  const [hovered, setHovered] = useState(false);

  const variants = {
    view: {
      style: { borderColor: HAIRLINE, color: SLATE, backgroundColor: "transparent" },
      hoverStyle: { borderColor: GOLD_HAIRLINE, color: GOLD, backgroundColor: "transparent" },
      base: "cursor-pointer rounded-full border p-2.5 transition-colors",
    },
    edit: {
      style: { borderColor: HAIRLINE, color: SLATE, backgroundColor: "transparent" },
      hoverStyle: { borderColor: "rgba(26,26,29,0.3)", color: CHARCOAL, backgroundColor: "transparent" },
      base: "cursor-pointer rounded-full border p-2.5 transition-colors",
    },
    danger: {
      style: { color: SLATE, backgroundColor: IVORY },
      hoverStyle: { color: "#fff", backgroundColor: CRIMSON },
      base: "cursor-pointer rounded-full p-2.5 transition-colors",
    },
  };

  const v = variants[variant];

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={v.base}
        style={hovered ? v.hoverStyle : v.style}
        aria-label={label}
      >
        {icon}
      </button>

      <span
        className={`pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-widest text-white transition-all duration-200 ${
          hovered ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}
        style={{ backgroundColor: CHARCOAL, ...bodyFont }}
      >
        {label}
        <span
          className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent"
          style={{ borderTopColor: CHARCOAL }}
        />
      </span>
    </div>
  );
};

/* ================= MAIN BUTTONS ================= */
export const ClientButtons = ({ id, refresh }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const deleteClient = async () => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/client/${id}`,
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
      alert(apiErrorMessage(err, "System Error: Unable to delete client record."));
    }
  };

  return (
    <>
      {showConfirm && (
        <ConfirmDeleteAlert
          onConfirm={deleteClient}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {showSuccess && (
        <DeleteSuccessAlert onClose={() => setShowSuccess(false)} />
      )}

      <div className="flex items-center justify-end gap-2">
        <IconButton
          variant="view"
          label="View profile"
          icon={<Eye size={15} strokeWidth={1.75} />}
          onClick={() => navigate(`/admin-dashboard/clients/${id}`)}
        />

        <IconButton
          variant="edit"
          label="Edit record"
          icon={<Edit2 size={15} strokeWidth={1.75} />}
          onClick={() => navigate(`/admin-dashboard/clients/edit/${id}`)}
        />

        <IconButton
          variant="danger"
          label="Delete record"
          icon={<Trash2 size={15} strokeWidth={1.75} />}
          onClick={() => setShowConfirm(true)}
        />
      </div>
    </>
  );
};

/* API Helper — unchanged */
export const fetchClients = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/client`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res.data.success ? res.data.clients : [];
  } catch (error) {
    console.error("Core Sync Error:", error.response?.data || error);
    return [];
  }
};