import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, Edit2, Trash2, Calendar } from "lucide-react";

export const SponsorButtons = ({ id, refresh }) => {
  const navigate = useNavigate();

  /* ================= DELETE ================= */
  const deleteSponsor = async () => {
    if (!window.confirm("Are you sure you want to delete this sponsor?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/sponsors/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (refresh) refresh();
      alert("Sponsor deleted successfully 🎉");
    } catch (err) {
      console.error("DELETE SPONSOR ERROR:", err.response || err);
      alert("Failed to delete sponsor");
    }
  };

  return (
    <div className="flex gap-2 justify-end">

      {/* VIEW */}
      <button
        title="View Sponsor"
        onClick={() => navigate(`/admin-dashboard/sponsors/${id}`)}
        className="p-2 rounded-xl border border-red-200 text-red-600
                   hover:bg-red-100/70 hover:shadow transition-all
                   active:scale-95 backdrop-blur"
      >
        <Eye size={16} />
      </button>

      {/* EDIT */}
      <button
        title="Edit Sponsor"
        onClick={() => navigate(`/admin-dashboard/sponsors/edit/${id}`)}
        className="p-2 rounded-xl border border-red-200 text-red-600
                   hover:bg-red-100/70 hover:shadow transition-all
                   active:scale-95 backdrop-blur"
      >
        <Edit2 size={16} />
      </button>
      
      {/* DELETE */}
      <button
        title="Delete Sponsor"
        onClick={deleteSponsor}
        className="p-2 rounded-xl bg-red-600/90 text-white
                   hover:bg-red-700 hover:shadow transition-all
                   active:scale-95 backdrop-blur"
      >
        <Trash2 size={16} />
      </button>

    </div>
  );
};