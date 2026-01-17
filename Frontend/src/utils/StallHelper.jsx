import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, Edit2, Trash2 } from "lucide-react";

export const StallButtons = ({ id, refresh }) => {
  const navigate = useNavigate();

  /* ================= DELETE ================= */
  const deleteStall = async () => {
    if (!window.confirm("Are you sure you want to delete this stall?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/stalls/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (refresh) refresh();
      alert("Stall deleted successfully 🎉");
    } catch (err) {
      console.error("DELETE STALL ERROR:", err.response || err);
      alert("Failed to delete stall");
    }
  };

  return (
    <div className="flex gap-2 justify-end">

      {/* VIEW */}
      <button
        title="View Stall"
        onClick={() => navigate(`/admin-dashboard/stalls/${id}`)}
        className="p-2 rounded-xl border border-red-200 text-red-600
                   hover:bg-red-100/70 hover:shadow transition-all
                   active:scale-95 backdrop-blur"
      >
        <Eye size={16} />
      </button>

      {/* EDIT */}
      <button
        title="Edit Stall"
        onClick={() => navigate(`/admin-dashboard/stalls/edit/${id}`)}
        className="p-2 rounded-xl border border-red-200 text-red-600
                   hover:bg-red-100/70 hover:shadow transition-all
                   active:scale-95 backdrop-blur"
      >
        <Edit2 size={16} />
      </button>

      {/* DELETE */}
      <button
        title="Delete Stall"
        onClick={deleteStall}
        className="p-2 rounded-xl bg-red-600/90 text-white
                   hover:bg-red-700 hover:shadow transition-all
                   active:scale-95 backdrop-blur"
      >
        <Trash2 size={16} />
      </button>

    </div>
  );
};