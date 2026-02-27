import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, Edit2, Trash2, Plane, Receipt, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

/* ================= PREMIUM CONFIRM DELETE ================= */
const ConfirmDeleteAlert = ({ onConfirm, onCancel }) => {
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] animate-in fade-in duration-300" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="h-2 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />
          
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-6 shadow-inner">
              <AlertTriangle size={32} strokeWidth={2.5} />
            </div>
            
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
              Terminate Record<span className="text-red-600">?</span>
            </h3>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2 leading-relaxed">
              This action is permanent and <br/> cannot be reversed.
            </p>
          </div>

          <div className="flex gap-3 px-8 pb-8">
            <button
              onClick={onCancel}
              className="w-1/2 py-4 rounded-2xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-200 active:scale-95 cursor-pointer"
            >
              Abort
            </button>
            <button
              onClick={onConfirm}
              className="w-1/2 py-4 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-xl shadow-slate-200 cursor-pointer"
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
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100] animate-in fade-in" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-green-50 flex items-center justify-center text-green-500 mx-auto mb-6 shadow-inner">
            <CheckCircle2 size={32} strokeWidth={2.5} />
          </div>
          
          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
            Removed<span className="text-green-500">!</span>
          </h3>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2 mb-6">
            Personnel database updated.
          </p>
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-xl shadow-slate-200 cursor-pointer"
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

  const btnStyle = "p-2 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-200 hover:shadow-md transition-all active:scale-90 bg-white shadow-sm cursor-pointer";

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

      <div className="flex gap-2 justify-end items-center">
        {/* VIEW PROFILE */}
        <button
          title="View Profile"
          onClick={() => navigate(`/admin-dashboard/employees/${id}`)}
          className={btnStyle}
        >
          <Eye size={16} strokeWidth={2.5} />
        </button>

        {/* EDIT DETAILS */}
        <button
          title="Edit Details"
          onClick={() => navigate(`/admin-dashboard/employees/edit/${id}`)}
          className={btnStyle}
        >
          <Edit2 size={15} strokeWidth={2.5} />
        </button>

        {/* LEAVE MANAGEMENT */}
        <button
          title="Leaves"
          onClick={() => navigate(`/admin-dashboard/employees/leaves/${id}`)}
          className={btnStyle}
        >
          <Plane size={15} strokeWidth={2.5} />
        </button>

        {/* PAYROLL/PAYSLIP */}
        <button
          title="Payslip"
          onClick={() => navigate(`/admin-dashboard/employees/payslip/${id}`)}
          className={btnStyle}
        >
          <Receipt size={15} strokeWidth={2.5} />
        </button>

        {/* DANGER: TERMINATE */}
        <button
          title="Delete Personnel"
          onClick={() => setShowConfirm(true)}
          className="group p-2.5 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-300 active:scale-90 cursor-pointer shadow-sm hover:shadow-red-200"
        > 
          <Trash2 size={15} strokeWidth={2.5} />
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