import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, Eye, AlertCircle, Check } from "lucide-react";
import { useState } from "react";

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
  return (
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
    </>
  );
};

/* ================= SUCCESS ================= */
const DeleteSuccessAlert = ({ onClose }) => {
  return (
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
    </>
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
      alert("System Error: Unable to delete client record.");
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
        {/* View */}
        <button
          onClick={() => navigate(`/admin-dashboard/clients/${id}`)}
          className="cursor-pointer rounded-full border p-2.5 transition-colors"
          style={{ borderColor: HAIRLINE, color: SLATE }}
          onMouseEnter={(e) => { e.currentTarget.style.color = GOLD; e.currentTarget.style.borderColor = GOLD_HAIRLINE; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = SLATE; e.currentTarget.style.borderColor = HAIRLINE; }}
          title="View Profile"
        >
          <Eye size={15} strokeWidth={1.75} />
        </button>

        {/* Edit */}
        <button
          onClick={() => navigate(`/admin-dashboard/clients/edit/${id}`)}
          className="cursor-pointer rounded-full border p-2.5 transition-colors"
          style={{ borderColor: HAIRLINE, color: SLATE }}
          onMouseEnter={(e) => { e.currentTarget.style.color = CHARCOAL; e.currentTarget.style.borderColor = "rgba(26,26,29,0.3)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = SLATE; e.currentTarget.style.borderColor = HAIRLINE; }}
          title="Edit Record"
        >
          <Edit2 size={15} strokeWidth={1.75} />
        </button>

        {/* Delete */}
        <button
          onClick={() => setShowConfirm(true)}
          className="cursor-pointer rounded-full p-2.5 transition-colors"
          style={{ backgroundColor: IVORY, color: SLATE }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = CRIMSON; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = IVORY; e.currentTarget.style.color = SLATE; }}
          title="Delete Record"
        >
          <Trash2 size={15} strokeWidth={1.75} />
        </button>
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