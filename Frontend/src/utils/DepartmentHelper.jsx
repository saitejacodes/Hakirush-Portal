import axios from "axios";
import { Edit2, Eye, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

/* ================= PREMIUM CONFIRM ALERT ================= */
const ConfirmDeleteAlert = ({ onConfirm, onCancel }) => {
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] animate-fade-in" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-white overflow-hidden animate-pop">
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-6 shadow-inner">
              <AlertCircle size={32} strokeWidth={2.5} />
            </div>
            
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
              Wait! Delete?
            </h3>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2 leading-relaxed">
              This will permanently remove the <br/> department from the system.
            </p>
          </div>

          <div className="flex gap-3 px-8 pb-8">
            <button
              onClick={onCancel}
              className="w-1/2 py-4 rounded-2xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-all cursor-pointer active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="w-1/2 py-4 rounded-2xl bg-gradient-to-br from-red-600 to-rose-500 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-red-200 transition-all cursor-pointer active:scale-95 hover:opacity-90"
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
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100] animate-fade-in" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-white overflow-hidden animate-pop">
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-3xl bg-green-50 flex items-center justify-center text-green-500 mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={32} strokeWidth={2.5} />
            </div>
            
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
              Removed!
            </h3>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">
              The record has been updated.
            </p>
          </div>
          <div className="px-8 pb-8">
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-xl"
            >
              Okay, Got it
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

      <div className="flex gap-2 justify-end">
        {/* VIEW BUTTON */}
        <button
          title="View Employees"
          onClick={() => navigate(`/admin-dashboard/department/${id}/employees`)}
          className="group p-2 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-100 hover:shadow-lg hover:shadow-red-50 transition-all duration-300 active:scale-90 cursor-pointer"
        >
          <Eye size={15} strokeWidth={2.5} />
        </button>

        {/* EDIT BUTTON */}
        <button
          title="Edit Department"
          onClick={() => navigate(`/admin-dashboard/department/${id}`)}
          className="group p-2 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-200 hover:shadow-lg transition-all duration-300 active:scale-90 cursor-pointer"
        >
          <Edit2 size={15} strokeWidth={2.5} />
        </button>

        {/* DELETE BUTTON */}
        <button
          title="Delete Department"
          onClick={() => setShowConfirm(true)}
          className="group p-2 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-300 active:scale-90 cursor-pointer"
        >
          <Trash2 size={15} strokeWidth={2.5} />
        </button>
      </div>
    </>
  );
};