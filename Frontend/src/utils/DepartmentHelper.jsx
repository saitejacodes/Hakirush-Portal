import axios from "axios";
import { Edit2, Eye, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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
  return (
    <>
      <div className="fixed inset-0 z-[100] animate-fade-in bg-[#1C1A17]/40 backdrop-blur-md" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm animate-pop overflow-hidden rounded-[2.25rem] border border-[#E7DFD2] bg-white shadow-[0_35px_70px_-15px_rgba(28,26,23,0.35)]"
          style={bodyFont}
        >
          <div className="p-8 text-center">
            <span
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
              style={{ borderColor: `${GARNET}40`, color: GARNET, backgroundColor: `${GARNET}0A` }}
            >
              <AlertCircle size={30} strokeWidth={1.5} />
            </span>

            <h3
              className="text-2xl leading-none tracking-tight text-[#1C1A17]"
              style={{ ...displayFont, fontWeight: 700 }}
            >
              Wait, <span className="italic text-[#7A2233]">delete?</span>
            </h3>
            <p className="mt-2 text-[10.5px] font-semibold uppercase leading-relaxed tracking-widest text-[#B4ADA0]">
              This will permanently remove the <br /> department from the system.
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
              className="w-1/2 cursor-pointer rounded-2xl py-3.5 text-[10px] font-semibold uppercase tracking-widest text-white shadow-[0_16px_32px_-12px_rgba(122,34,51,0.45)] transition-all duration-300 hover:opacity-90 active:scale-95"
              style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ================= PREMIUM SUCCESS ALERT ================= */
const DeleteSuccessAlert = ({ onClose }) => {
  return (
    <>
      <div className="fixed inset-0 z-[100] animate-fade-in bg-[#1C1A17]/20 backdrop-blur-sm" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm animate-pop overflow-hidden rounded-[2.25rem] border border-[#E7DFD2] bg-white shadow-[0_35px_70px_-15px_rgba(28,26,23,0.35)]"
          style={bodyFont}
        >
          <div className="p-8 text-center">
            <span
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
              style={{ borderColor: "#3F5B5440", color: "#3F5B54", backgroundColor: "#3F5B540A" }}
            >
              <CheckCircle2 size={30} strokeWidth={1.5} />
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
              className="w-full cursor-pointer rounded-2xl py-3.5 text-[10px] font-semibold uppercase tracking-widest text-white shadow-[0_16px_32px_-12px_rgba(28,26,23,0.35)] transition-all duration-300 active:scale-95"
              style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
            >
              Okay, Got It
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ================= MAIN BUTTONS ================= */
export const DepartmentButtons = ({ id, onDepartmentDelete }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDelete = async () => {
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
      alert(err?.response?.data?.error || "Failed to delete");
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
        {/* VIEW BUTTON */}
        <button
          title="View Employees"
          onClick={() => navigate(`/admin-dashboard/department/${id}/employees`)}
          className="group cursor-pointer rounded-full border p-2 text-[#B4ADA0] transition-all duration-300 hover:border-[#D9C79A] hover:text-[#7A2233] hover:shadow-[0_10px_20px_-8px_rgba(198,161,91,0.35)] active:scale-90"
          style={{ borderColor: HAIRLINE, backgroundColor: "white" }}
        >
          <Eye size={15} strokeWidth={1.75} />
        </button>

        {/* EDIT BUTTON */}
        <button
          title="Edit Department"
          onClick={() => navigate(`/admin-dashboard/department/${id}`)}
          className="group cursor-pointer rounded-full border p-2 text-[#B4ADA0] transition-all duration-300 hover:border-[#1C1A17]/20 hover:text-[#1C1A17] hover:shadow-[0_10px_20px_-8px_rgba(28,26,23,0.2)] active:scale-90"
          style={{ borderColor: HAIRLINE, backgroundColor: "white" }}
        >
          <Edit2 size={15} strokeWidth={1.75} />
        </button>

        {/* DELETE BUTTON */}
        <button
          title="Delete Department"
          onClick={() => setShowConfirm(true)}
          className="group cursor-pointer rounded-full p-2 text-[#C9C2B4] transition-all duration-300 active:scale-90"
          style={{ backgroundColor: "#FBF8F3" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = GARNET;
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#FBF8F3";
            e.currentTarget.style.color = "#C9C2B4";
          }}
        >
          <Trash2 size={15} strokeWidth={1.75} />
        </button>
      </div>
    </>
  );
};