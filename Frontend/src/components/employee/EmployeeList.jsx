import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EmployeeButtons } from "../../utils/EmployeeHelper";
import { Search } from "lucide-react";

const List = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      setEmpLoading(true);

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/employee`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          let sno = 1;

          const data = response.data.employees.map((emp) => ({
            _id: emp._id,
            sno: sno++,
            dep_name: emp.department?.dep_name || "N/A",
            name: emp.userId?.name || "Unknown",
            dob: emp.dob ? new Date(emp.dob).toDateString() : "N/A",
            profileImage: emp.userId?.profileImage || "",
          }));

          setEmployees(data);
          setFilteredEmployees(data);
        }
      } catch (error) {
        console.error(error);
        alert("Failed to load employees");
      } finally {
        setEmpLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // search filter
  useEffect(() => {
    const result = employees.filter((emp) =>
      (emp.name || "").toLowerCase().includes(search.toLowerCase())
    );

    setFilteredEmployees(result);
  }, [search, employees]);

  // smart image url
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return `http://localhost:5000${imagePath}`;
    if (imagePath.startsWith("uploads/"))
      return `http://localhost:5000/${imagePath}`;
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h3 className="text-4xl font-extrabold text-red-700 tracking-tight">
            Manage Employees
          </h3>
          <p className="text-red-500 mt-2">
            View, search and manage employee records
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100 backdrop-blur">

          <div className="p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">

            {/* Search box with icon */}
            <div className="relative w-full sm:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" size={18} />

              <input
                type="text"
                placeholder="Search employee..."
                className="w-full rounded-xl border border-red-300 pl-10 pr-4 py-2.5
                           outline-none focus:ring-2 focus:ring-red-500 transition shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Add Employee Button */}
            <Link
              to="/admin-dashboard/add-employee"
              className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white
                         shadow-md hover:bg-red-700 hover:shadow-lg transition active:scale-95 text-center"
            >
              + Add Employee
            </Link>
          </div>
          {/* TABLE WRAPPER */}
          <div className="max-h-[60vh] overflow-auto rounded-b-3xl">

            {/* LOADING */}
            {empLoading ? (
              <div className="p-10 text-center text-red-600 font-semibold text-lg">
                Loading employees...
              </div>
            ) : (
              <table className="w-full border-collapse">

                {/* STICKY HEADER */}
                <thead className="sticky top-0 z-10 bg-red-50/80 backdrop-blur-xl shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-red-800 font-semibold text-left">S No</th>
                    <th className="px-4 py-3 text-red-800 font-semibold text-left">Image</th>
                    <th className="px-4 py-3 text-red-800 font-semibold text-left">Name</th>
                    <th className="px-4 py-3 text-red-800 font-semibold text-left">Department</th>
                    <th className="px-4 py-3 text-red-800 font-semibold text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-red-100/70">

                  {filteredEmployees.length ? (
                    filteredEmployees.map((emp) => (
                      <tr
                        key={emp._id}
                        className="transition-all duration-200 hover:bg-red-50"
                      >
                        <td className="px-4 py-3">{emp.sno}</td>

                        <td className="px-4 py-3">
                          <img
                            src={getImageUrl(emp.profileImage)}
                            alt={emp.name}
                            className="w-12 h-12 rounded-full object-cover border shadow-sm"
                            onError={(e) =>
                              (e.target.src = "/default-avatar.png")
                            }
                          />
                        </td>

                        <td className="px-4 py-3 font-medium text-gray-900">
                          {emp.name}
                        </td>

                        <td className="px-4 py-3 text-gray-700">
                          {emp.dep_name}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <EmployeeButtons id={emp._id} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-16 text-center text-red-400 text-lg"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-4xl">👤</span>
                          No employees found
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;