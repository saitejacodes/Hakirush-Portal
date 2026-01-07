import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, Edit2, Trash2, Plane } from "lucide-react";

export const EmployeeButtons = ({ id, refresh }) => {
  const navigate = useNavigate();

  const deleteEmployee = async () => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/employee/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (refresh) refresh();
      alert("Employee deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete employee");
    }
  };

  return (
    <div className="flex gap-2 justify-end">

      {/* VIEW */}
      <button
        title="View Employee"
        onClick={() => navigate(`/admin-dashboard/employees/${id}`)}
        className="p-2 rounded-xl border border-red-200 text-red-600
                   hover:bg-red-100/70 hover:shadow transition-all
                   active:scale-95 backdrop-blur"
      >
        <Eye size={16} />
      </button>

      {/* EDIT */}
      <button
        title="Edit Employee"
        onClick={() => navigate(`/admin-dashboard/employees/edit/${id}`)}
        className="p-2 rounded-xl border border-red-200 text-red-600
                   hover:bg-red-100/70 hover:shadow transition-all
                   active:scale-95 backdrop-blur"
      >
        <Edit2 size={16} />
      </button>

      {/* LEAVES */}
      <button
        title="Employee Leaves"
        onClick={() => navigate(`/admin-dashboard/employees/leaves/${id}`)}
        className="p-2 rounded-xl border border-red-200 text-red-600
                   hover:bg-red-100/70 hover:shadow transition-all
                   active:scale-95 backdrop-blur"
      >
        <Plane size={16} />
      </button>

      {/* DELETE */}
      <button
        title="Delete Employee"
        onClick={deleteEmployee}
        className="p-2 rounded-xl bg-red-600/90 text-white
                   hover:bg-red-700 hover:shadow transition-all
                   active:scale-95 backdrop-blur"
      >
        <Trash2 size={16} />
      </button>

    </div>
  );
};

/* ✅ FIXED fetchDepartments */
export const fetchDepartments = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/department`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.data.success) {
      return response.data.departments;
    }
  } catch (error) {
    console.error("Department fetch failed:", error.response?.data || error);
  }

  return [];
};
