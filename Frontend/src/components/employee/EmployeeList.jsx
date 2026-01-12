import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EmployeeButtons } from "../../utils/EmployeeHelper";
import { Search } from "lucide-react";

/* ================= MOBILE CARD ================= */
const MobileEmployeeCard = ({ emp, getImageUrl }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-red-100 p-3">
      <div className="flex items-center gap-3">

        {/* Avatar */}
        <img
          src={getImageUrl(emp.profileImage)}
          onError={(e) => (e.target.src = "/default-avatar.png")}
          className="w-12 h-12 rounded-full object-cover border shrink-0"
        />

        {/* Name + Department */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-xs truncate">
            {emp.name}
          </p>
          <p className="text-xs text-red-600 truncate">
            {emp.dep_name}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="shrink-0">
          <EmployeeButtons id={emp._id} />
        </div>

      </div>
    </div>
  );
};


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
          `${import.meta.env.VITE_BACKEND_URL}/api/employee`,
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

  /* ===== SEARCH FILTER ===== */
  useEffect(() => {
    const result = employees.filter((emp) =>
      (emp.name || "").toLowerCase().includes(search.toLowerCase())
    );
    setFilteredEmployees(result);
  }, [search, employees]);

  /* ===== SMART IMAGE ===== */
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/"))
      return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
    if (imagePath.startsWith("uploads/"))
      return `${import.meta.env.VITE_BACKEND_URL}/${imagePath}`;
    return `${import.meta.env.VITE_BACKEND_URL}/uploads/${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-6 md:mb-8 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-red-700">
            Manage Employees
          </h3>
          <p className="text-red-500 mt-2">
            View, search and manage employee records
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100 backdrop-blur">

          {/* TOP BAR */}
          <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" size={18} />
              <input
                type="text"
                placeholder="Search employee..."
                className="w-full rounded-xl border border-red-300 pl-10 pr-4 py-2.5
                           outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Link
              to="/admin-dashboard/add-employee"
              className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white
                         shadow-md hover:bg-red-700 transition active:scale-95 text-center"
            >
              + Add Employee
            </Link>
          </div>

          {/* CONTENT */}
          {empLoading ? (
            <div className="p-10 text-center text-red-600 font-semibold">
              Loading employees...
            </div>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="md:hidden grid grid-cols-1 gap-5 px-4 pb-24">
                {filteredEmployees.length ? (
                  filteredEmployees.map((emp) => (
                    <MobileEmployeeCard
                      key={emp._id}
                      emp={emp}
                      getImageUrl={getImageUrl}
                    />
                  ))
                ) : (
                  <div className="text-center text-red-400 py-20">
                    No employees found
                  </div>
                )}
              </div>

              {/* DESKTOP VIEW */}
              <div className="hidden md:block max-h-[60vh] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-red-50">
                    <tr>
                      <th className="px-4 py-3 text-left">S No</th>
                      <th className="px-4 py-3 text-left">Image</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Department</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEmployees.map((emp) => (
                      <tr key={emp._id} className="hover:bg-red-50">
                        <td className="px-4 py-3">{emp.sno}</td>
                        <td className="px-4 py-3">
                          <img
                            src={getImageUrl(emp.profileImage)}
                            onError={(e) => (e.target.src = "/default-avatar.png")}
                            className="w-12 h-12 rounded-full border object-cover"
                          />
                        </td>
                        <td className="px-4 py-3">{emp.name}</td>
                        <td className="px-4 py-3">{emp.dep_name}</td>
                        <td className="px-4 py-3 text-right">
                          <EmployeeButtons id={emp._id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default List;