import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, Eye } from "lucide-react";

export const ClientButtons = ({ id, refresh }) => {
  const navigate = useNavigate();

  const deleteClient = async () => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/client/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Client deleted successfully");
      if (refresh) refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete client");
    }
  };

  return (
    <div className="flex gap-2 justify-end">

      {/* View */}
      <button
        onClick={() => navigate(`/admin-dashboard/clients/${id}`)}
        className="p-2 rounded-lg border border-red-400 text-red-600 
                   hover:bg-red-100 transition text-sm font-medium"
      >
        <Eye size={16} />
      </button>

      {/* Edit */}
      <button
        onClick={() => navigate(`/admin-dashboard/clients/edit/${id}`)}
        className="p-2 rounded-lg border border-red-400 text-red-600 
                   hover:bg-red-100 transition text-sm font-medium"
      >
        <Edit2 size={16} />
      </button>

      {/* Delete */}
      <button
        onClick={deleteClient}
        className="p-2 rounded-lg bg-red-600 text-white
                   hover:bg-red-700 shadow-md transition text-sm font-semibold"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

/* ✅ Helper function like fetchDepartments */
export const fetchClients = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/client`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (res.data.success) {
      return res.data.clients;
    }
  } catch (error) {
    console.error("Client fetch failed:", error.response?.data || error);
  }

  return [];
};
