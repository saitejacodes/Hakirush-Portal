import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EmployeeButtons } from "../../utils/EmployeeHelper";

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
          "http://localhost:5000/api/employee",
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
      (emp.name || "")
        .toString()
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    setFilteredEmployees(result);
  }, [search, employees]);


  // smart URL builder for images
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";

    // already full URL
    if (imagePath.startsWith("http")) return imagePath;

    // /uploads/abc.jpg
    if (imagePath.startsWith("/"))
      return `http://localhost:5000${imagePath}`;

    // uploads/abc.jpg
    if (imagePath.startsWith("uploads/"))
      return `http://localhost:5000/${imagePath}`;

    // just filename -> assume uploads folder
    return `http://localhost:5000/uploads/${imagePath}`;
  };


  return (
    <div className="min-h-screen bg-red-50 p-6">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8 text-center">
          <h3 className="text-4xl font-extrabold text-red-700">
            Manage Employees
          </h3>
          <p className="text-red-500 mt-2">
            View, search and add new employees
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-6 border border-red-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <input
              type="text"
              placeholder="Search employee..."
              className="w-full sm:w-1/2 rounded-xl border border-red-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Link
              to="/admin-dashboard/add-employee"
              className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white shadow-md hover:bg-red-700 hover:shadow-lg transition"
            >
              + Add Employee
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto">
            {empLoading ? (
              <p className="text-center text-red-500 py-10">
                Loading employees...
              </p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-red-100">
                    <th className="px-4 py-3 font-semibold text-red-700">S No</th>
                    <th className="px-4 py-3 font-semibold text-red-700">Image</th>
                    <th className="px-4 py-3 font-semibold text-red-700">Name</th>
                    <th className="px-4 py-3 font-semibold text-red-700">Department</th>
                    <th className="px-4 py-3 font-semibold text-red-700 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => (
                      <tr key={emp._id} className="border-b hover:bg-red-50 transition">
                        <td className="px-4 py-3">{emp.sno}</td>

                        <td className="px-4 py-3">
                          <img
                            src={getImageUrl(emp.profileImage)}
                            alt={emp.name}
                            className="w-12 h-12 rounded-full object-cover border"
                            onError={(e) => (e.target.src = "/default-avatar.png")}
                          />
                        </td>

                        <td className="px-4 py-3 font-medium">{emp.name}</td>

                        <td className="px-4 py-3 font-medium">{emp.dep_name}</td>

                        <td className="px-4 py-3 text-right">
                          <EmployeeButtons id={emp._id} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-10 text-center text-red-400">
                        No employees found.
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
