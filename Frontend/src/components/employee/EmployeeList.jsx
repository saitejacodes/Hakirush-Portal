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
        <img
          src={getImageUrl(emp.profileImage)}
          onError={(e) => (e.target.src = "/default-avatar.png")}
          className="w-12 h-12 rounded-full object-cover border shrink-0"
        />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-xs truncate">
            {emp.name}
          </p>
          <p className="text-xs text-red-600 truncate">
            {emp.dep_name}
          </p>
          <p className="text-[11px] text-gray-500 truncate">
            {emp.designation}
          </p>
        </div>

        <div className="shrink-0">
          <EmployeeButtons id={emp._id} />
        </div>
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 5;

const List = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /* ===== FETCH EMPLOYEES ===== */
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
            designation: emp.designation || "N/A",
            name: emp.userId?.name || "Unknown",
            dob: emp.dob ? new Date(emp.dob).toDateString() : "N/A",
            profileImage: emp.userId?.profileImage || "",
          }));

          setEmployees(data);
          setFilteredEmployees(data);
        }
      } catch (error) {
        alert("Failed to load employees");
      } finally {
        setEmpLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  /* ===== SEARCH ===== */
  useEffect(() => {
    const result = employees.filter((emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredEmployees(result);
    setCurrentPage(1);
  }, [search, employees]);

  /* ===== PAGINATION ===== */
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  /* ===== IMAGE HANDLER (FIXED) ===== */
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    return "/default-avatar.png";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-red-700 drop-shadow-sm">Manage Employees</h3>
          <p className="text-red-500 mt-2 text-base">View, search and manage employee records</p>
        </div>
        <div className="bg-white/95 rounded-3xl shadow-2xl border border-red-100">
          {/* TOP BAR */}
          <div className="p-5 md:p-7 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" size={20} />
              <input
                type="text"
                placeholder="Search employee..."
                className="w-full rounded-xl border border-red-300 pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-red-500 text-base shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Link
              to="/admin-dashboard/add-employee"
              className="rounded-xl bg-gradient-to-br from-red-600 to-red-500 px-7 py-3 font-semibold text-white shadow-lg hover:scale-105 hover:bg-red-700 transition-all text-base"
            >
              + Add Employee
            </Link>
          </div>
          {empLoading ? (
            <div className="p-12 text-center text-red-600 font-semibold text-lg">Loading employees...</div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden grid grid-cols-1 gap-6 px-4 pb-8">
                {paginatedEmployees.length ? (
                  paginatedEmployees.map((emp) => (
                    <MobileEmployeeCard key={emp._id} emp={emp} getImageUrl={getImageUrl} />
                  ))
                ) : (
                  <div className="text-center text-red-400 py-20 text-lg">No employees found</div>
                )}
              </div>
              {/* DESKTOP */}
              <div className="hidden md:block max-h-[60vh] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-red-50 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-700 font-bold tracking-wide">S No</th>
                      <th className="px-4 py-3 text-left text-gray-700 font-bold tracking-wide">Image</th>
                      <th className="px-4 py-3 text-left text-gray-700 font-bold tracking-wide">Name</th>
                      <th className="px-4 py-3 text-left text-gray-700 font-bold tracking-wide">Department</th>
                      <th className="px-4 py-3 text-left text-gray-700 font-bold tracking-wide">Designation</th>
                      <th className="px-4 py-3 text-right text-gray-700 font-bold tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEmployees.map((emp) => (
                      <tr key={emp._id} className="hover:bg-red-50 transition">
                        <td className="px-4 py-3 text-base">{emp.sno}</td>
                        <td className="px-4 py-3"><img src={getImageUrl(emp.profileImage)} onError={(e) => (e.target.src = "/default-avatar.png") } className="w-12 h-12 rounded-full border object-cover" /></td>
                        <td className="px-4 py-3 text-base">{emp.name}</td>
                        <td className="px-4 py-3 text-base">{emp.dep_name}</td>
                        <td className="px-4 py-3 text-base">{emp.designation}</td>
                        <td className="px-4 py-3 text-right"><EmployeeButtons id={emp._id} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* PAGINATION */}
              {filteredEmployees.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between px-4 py-5 border-t bg-white/80 rounded-b-3xl">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 ${currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                  >
                    ◀ Previous
                  </button>
                  <span className="text-base font-semibold text-gray-600">Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 ${currentPage === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"}`}
                  >
                    Next ▶
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default List;