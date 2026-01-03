import axios from "axios";
import { useNavigate } from "react-router-dom";

export const EmployeeButtons = ({ id }) => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-2 justify-end">
      <button
        onClick={() => navigate(`/admin-dashboard/employees/${id}`)}
        className="px-3 py-1.5 rounded-lg border border-red-400 text-red-600 hover:bg-red-100 transition text-sm font-medium"
      >
        View
      </button>

      <button
        onClick={() => navigate(`/admin-dashboard/employees/edit/${id}`)}
        className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-md transition text-sm font-semibold"
      >
        Edit
      </button>

      <button
        onClick={() => navigate(`/admin-dashboard/employees/leaves/${id}`)}
        className="px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 transition text-sm font-semibold"
      >
        Leaves
      </button>
    </div>
  );
};

/* ✅ FIXED fetchDepartments */
export const fetchDepartments = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/department", {
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
