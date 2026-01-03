import axios from "axios";
import { useNavigate } from "react-router-dom";

export const columns = [
  {
    name: "S No",
    selector: (row) => row.sno,
    sortable: true,
    width: "100px"
  },
  {
    name: "Department Name",
    selector: (row) => row.dep_name,
    sortable: true,
  },
  {
    name: "Action",
    cell: (row) => <DepartmentButtons Id={row._id} />,
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  }
];

export const DepartmentButtons = ({ id, onDepartmentDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm("Do you want to delete?")) return;

    try {
      const res = await axios.delete(
        `http://localhost:5000/api/department/${id}`,
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
        onClick={() => navigate(`/admin-dashboard/department/${id}`)}
        className="px-3 py-1.5 rounded-lg border border-red-400 text-red-600
                   hover:bg-red-100 transition text-sm font-medium"
      >
        Edit
      </button>

      <button
        onClick={handleDelete}
        className="px-3 py-1.5 rounded-lg bg-red-600 text-white 
                   hover:bg-red-700 shadow-sm transition text-sm font-medium"
      >
        Delete
      </button>
    </div>
  );
};
