import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, Eye, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

/* ================= PREMIUM CONFIRM DELETE ================= */
const ConfirmDeleteAlert = ({ onConfirm, onCancel }) => {
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] animate-in fade-in duration-300" />
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 animate-in zoom-in-95 duration-200">
        <div className="w-full max-w-md rounded-[2.5rem] bg-white shadow-2xl border border-white overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />
          
          <div className="p-8">
            <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center text-red-600 mb-6 mx-auto shadow-inner">
              <AlertCircle size={32} strokeWidth={2.5} />
            </div>

            <div className="text-center space-y-2 mb-8">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">
                Terminate Stall<span className="text-red-600">?</span>
              </h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                This stall asset will be permanently purged from the system registry.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="w-1/2 py-4 rounded-2xl border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
              >
                Abort
              </button>
              <button
                onClick={onConfirm}
                className="w-1/2 py-4 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-600 shadow-lg shadow-slate-200 hover:shadow-red-200 transition-all active:scale-95 cursor-pointer"
              >
                Confirm Purge
              </button>
            </div>
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
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] animate-in fade-in" />
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 animate-in zoom-in-95">
        <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-white overflow-hidden p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-green-50 flex items-center justify-center text-green-500 mb-6 mx-auto">
            <CheckCircle2 size={32} strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic mb-2">
            Asset Purged<span className="text-green-500">.</span>
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
            The stall registry has been updated successfully.
          </p>
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </>
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
      alert("System Error: Unable to purge stall record.");
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

      <div className="flex gap-2 justify-end items-center">
        {/* View Action */}
        <button
          onClick={() => navigate(`/admin-dashboard/stalls/${id}`)}
          className="group p-2.5 rounded-full bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-100 hover:shadow-lg hover:shadow-red-50 transition-all duration-300 active:scale-90 cursor-pointer"
          title="View Details"
        >
          <Eye size={16} strokeWidth={2.5} />
        </button>

        {/* Edit Action */}
        <button
          onClick={() => navigate(`/admin-dashboard/stalls/edit/${id}`)}
          className="group p-2.5 rounded-full bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-200 hover:shadow-lg transition-all duration-300 active:scale-90 cursor-pointer"
          title="Modify Stall"
        >
          <Edit2 size={16} strokeWidth={2.5} />
        </button>

        {/* Delete Action */}
        <button
          onClick={() => setShowConfirm(true)}
          className="group p-2.5 rounded-full bg-slate-50 text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-300 active:scale-90 cursor-pointer"
          title="Delete Permanent"
        >
          <Trash2 size={16} strokeWidth={2.5} />
        </button>
      </div>
    </>
  );
};