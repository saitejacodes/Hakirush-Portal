import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, Edit2, Trash2, Plane, Receipt, AlertTriangle, CheckCircle2 } from "lucide-react";
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

/* ================= PREMIUM CONFIRM DELETE ================= */
const ConfirmDeleteAlert = ({ onConfirm, onCancel }) => {
  return (
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
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
              style={{ borderColor: `${GARNET}40`, color: GARNET, backgroundColor: `${GARNET}0A` }}
            >
              <AlertTriangle size={30} strokeWidth={1.5} />
            </span>

            <h3
              className="text-2xl leading-none tracking-tight text-[#1C1A17]"
              style={{ ...displayFont, fontWeight: 700 }}
            >
              Terminate Record<span className="italic text-[#7A2233]">?</span>
            </h3>
            <p className="mt-2 text-[10.5px] font-semibold uppercase leading-relaxed tracking-widest text-[#B4ADA0]">
              This action is permanent and <br /> cannot be reversed.
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
              className="w-1/2 cursor-pointer rounded-2xl py-3.5 text-[10px] font-semibold uppercase tracking-widest text-white shadow-[0_16px_32px_-12px_rgba(122,34,51,0.45)] transition-all duration-300 hover:opacity-90 active:scale-95"
              style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
            >
              Confirm
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
      <div className="fixed inset-0 z-[100] animate-in fade-in bg-[#1C1A17]/20 backdrop-blur-sm" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm animate-in zoom-in-95 overflow-hidden rounded-[2.25rem] border border-[#E7DFD2] bg-white p-8 text-center shadow-[0_35px_70px_-15px_rgba(28,26,23,0.35)]"
          style={bodyFont}
        >
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
          <p className="mt-2 mb-6 text-[10.5px] font-semibold uppercase tracking-widest text-[#B4ADA0]">
            Personnel database updated.
          </p>
          <button
            onClick={onClose}
            className="w-full cursor-pointer rounded-2xl py-3.5 text-[10px] font-semibold uppercase tracking-widest text-white shadow-[0_16px_32px_-12px_rgba(28,26,23,0.35)] transition-all duration-300 active:scale-95"
            style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
          >
            Acknowledged
          </button>
        </div>
      </div>
    </>
  );
};

/* ================= MAIN ACTION COMPONENT ================= */
export const EmployeeButtons = ({ id, refresh }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const deleteEmployee = async () => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

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
      console.error("Critical: Employee termination protocol failed.", err);
      alert("System Error: Unable to delete.");
    }
  };

  const btnStyle =
    "p-2 rounded-full border text-[#B4ADA0] transition-all duration-300 active:scale-90 bg-white shadow-sm cursor-pointer hover:border-[#D9C79A] hover:text-[#7A2233] hover:shadow-[0_10px_20px_-8px_rgba(198,161,91,0.35)]";
  const btnBorder = { borderColor: HAIRLINE };

  return (
    <>
      {showConfirm && (
        <ConfirmDeleteAlert
          onConfirm={deleteEmployee}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {showSuccess && (
        <DeleteSuccessAlert onClose={() => setShowSuccess(false)} />
      )}

      <div className="flex items-center justify-end gap-2">
        {/* VIEW PROFILE */}
        <button
          title="View Profile"
          onClick={() => navigate(`/admin-dashboard/employees/${id}`)}
          className={btnStyle}
          style={btnBorder}
        >
          <Eye size={16} strokeWidth={1.75} />
        </button>

        {/* EDIT DETAILS */}
        <button
          title="Edit Details"
          onClick={() => navigate(`/admin-dashboard/employees/edit/${id}`)}
          className={btnStyle}
          style={btnBorder}
        >
          <Edit2 size={15} strokeWidth={1.75} />
        </button>

        {/* LEAVE MANAGEMENT */}
        <button
          title="Leaves"
          onClick={() => navigate(`/admin-dashboard/employees/leaves/${id}`)}
          className={btnStyle}
          style={btnBorder}
        >
          <Plane size={15} strokeWidth={1.75} />
        </button>

        {/* PAYROLL/PAYSLIP */}
        <button
          title="Payslip"
          onClick={() => navigate(`/admin-dashboard/employees/payslip/${id}`)}
          className={btnStyle}
          style={btnBorder}
        >
          <Receipt size={15} strokeWidth={1.75} />
        </button>

        {/* DANGER: TERMINATE */}
        <button
          title="Delete Personnel"
          onClick={() => setShowConfirm(true)}
          className="group cursor-pointer rounded-full p-2.5 text-[#C9C2B4] shadow-sm transition-all duration-300 active:scale-90"
          style={{ backgroundColor: "#FBF8F3" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = GARNET;
            e.currentTarget.style.color = "white";
            e.currentTarget.style.boxShadow = "0 10px 20px -8px rgba(122,34,51,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#FBF8F3";
            e.currentTarget.style.color = "#C9C2B4";
            e.currentTarget.style.boxShadow = "";
          }}
        >
          <Trash2 size={15} strokeWidth={1.75} />
        </button>
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