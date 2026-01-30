import axios from "axios";
import { Edit2, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DepartmentButtons = ({ id, onDepartmentDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm("Do you want to delete this department?")) return;

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
        onDepartmentDelete?.();
      }
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to delete");
    }
  };

  return (
    <div className="flex gap-2 justify-end">

      <button
        title="View Department Employees"
        onClick={() => {
          console.log("Navigating with ID:", id);
          navigate(`/admin-dashboard/department/${id}/employees`);
        }}
        className="p-2 rounded-xl border border-red-200 text-red-600 
                   hover:bg-red-100/70 hover:shadow transition-all
                   active:scale-95 backdrop-blur"
      >
        <Eye size={16} />
      </button>

      <button
        title="Edit Department"
        onClick={() => navigate(`/admin-dashboard/department/${id}`)}
        className="p-2 rounded-xl border border-red-200 text-red-600 
                   hover:bg-red-100/70 hover:shadow transition-all
                   active:scale-95 backdrop-blur"
      >
        <Edit2 size={16} />
      </button>

      <button
        title="Delete Department"
        onClick={handleDelete}
        className="p-2 rounded-xl bg-red-600/90 text-white
                   hover:bg-red-700 hover:shadow transition-all
                   active:scale-95 backdrop-blur"
      >
        <Trash2 size={16} />
      </button>

    </div>
  );
};