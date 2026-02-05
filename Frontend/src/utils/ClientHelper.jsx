import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, Eye } from "lucide-react";
import { useState } from "react";

/* ================= PREMIUM CONFIRM DELETE ================= */
const ConfirmDeleteAlert = ({ onConfirm, onCancel }) => {
  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-red-100 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />

          <div className="p-6 flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-bold">
              !
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-700">
                Delete Client
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                This action cannot be undone. Are you sure you want to continue?
              </p>
            </div>
          </div>

          <div className="flex gap-3 px-6 pb-6">
            <button
              onClick={onCancel}
              className="w-1/2 py-2.5 rounded-xl border hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90 transition cursor-pointer"
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
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-red-100 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />

          <div className="p-6 flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              ✓
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-700">
                Client Deleted
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                The client has been removed successfully.
              </p>
            </div>
          </div>

          <div className="px-6 pb-5">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90 transition"
            >
              Okay, got it
            </button>
          </div>
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
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/client/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setShowConfirm(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        if (refresh) refresh();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Failed to delete client");
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

      <div className="flex gap-2 justify-end">
        {/* View */}
        <button
          onClick={() => navigate(`/admin-dashboard/clients/${id}`)}
          className="p-2 rounded-lg border border-red-400 text-red-600 
                     hover:bg-red-100 transition text-sm font-medium cursor-pointer"
        >
          <Eye size={16} />
        </button>

        {/* Edit */}
        <button
          onClick={() => navigate(`/admin-dashboard/clients/edit/${id}`)}
          className="p-2 rounded-lg border border-red-400 text-red-600 
                     hover:bg-red-100 transition text-sm font-medium cursor-pointer"
        >
          <Edit2 size={16} />
        </button>

        {/* Delete */}
        <button
          onClick={() => setShowConfirm(true)}
          className="p-2 rounded-lg bg-red-600 text-white
                     hover:bg-red-700 shadow-md transition
                     text-sm font-semibold cursor-pointer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </>
  );
};

/* ✅ Helper function like fetchDepartments */
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

    if (res.data.success) {
      return res.data.clients;
    }
  } catch (error) {
    console.error("Client fetch failed:", error.response?.data || error);
  }

  return [];
};