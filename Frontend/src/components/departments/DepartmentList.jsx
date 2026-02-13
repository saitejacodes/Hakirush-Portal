import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search } from "lucide-react";
import { DepartmentButtons } from "../../utils/DepartmentHelper";

/* ================= MOBILE CARD ================= */
const MobileDepartmentCard = ({ dep }) => {
  return (
    <div className="bg-white/90 rounded-2xl shadow-lg border border-red-100 p-5 flex items-center justify-between gap-3 hover:scale-[1.02] transition-all">
      <div>
        <p className="text-xs text-gray-400 font-semibold tracking-widest mb-1">Department</p>
        <p className="font-semibold text-gray-800 text-base truncate drop-shadow-sm">{dep.dep_name}</p>
      </div>
      <DepartmentButtons id={dep._id} />
    </div>
  );
};

const ITEMS_PER_PAGE = 5;

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [depLoading, setDepLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /* ===== FETCH DEPARTMENTS ===== */
  const fetchDepartments = async () => {
    setDepLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/department`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        let sno = 1;
        const data = res.data.departments.map((dep) => ({
          _id: dep._id,
          sno: sno++,
          dep_name: dep.dep_name,
        }));

        setDepartments(data);
        setFilteredDepartments(data);
      }
    } catch (err) {
      alert("Failed to load departments");
    } finally {
      setDepLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  /* ===== SEARCH ===== */
  useEffect(() => {
    const result = departments.filter((dep) =>
      dep.dep_name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredDepartments(result);
    setCurrentPage(1);
  }, [search, departments]);

  /* ===== PAGINATION ===== */
  const totalPages = Math.ceil(filteredDepartments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDepartments = filteredDepartments.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-red-700 drop-shadow-sm">Manage Departments</h3>
          <p className="text-red-500 mt-2 text-base">View, search and manage departments</p>
        </div>
        <div className="bg-white/95 rounded-3xl shadow-2xl border border-red-100">
          {/* TOP BAR */}
          <div className="p-5 md:p-7 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" size={20} />
              <input
                type="text"
                placeholder="Search department..."
                className="w-full rounded-xl border border-red-300 pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-red-500 text-base shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Link
              to="/admin-dashboard/add-department"
              className="rounded-xl bg-gradient-to-br from-red-600 to-red-500 px-7 py-3 font-semibold text-white shadow-lg hover:scale-105 hover:bg-red-700 transition-all text-base"
            >
              + Add Department
            </Link>
          </div>
          {depLoading ? (
            <div className="p-12 text-center text-red-600 font-semibold text-lg">Loading departments...</div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden grid grid-cols-1 gap-6 px-4 pb-8">
                {paginatedDepartments.length ? (
                  paginatedDepartments.map((dep) => (
                    <MobileDepartmentCard key={dep._id} dep={dep} />
                  ))
                ) : (
                  <div className="text-center text-red-400 py-20 text-lg">No departments found</div>
                )}
              </div>
              {/* DESKTOP */}
              <div className="hidden md:block max-h-[60vh] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-red-50 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-700 font-bold tracking-wide">S No</th>
                      <th className="px-4 py-3 text-left text-gray-700 font-bold tracking-wide">Department Name</th>
                      <th className="px-4 py-3 text-right text-gray-700 font-bold tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDepartments.map((dep) => (
                      <tr key={dep._id} className="hover:bg-red-50 transition">
                        <td className="px-4 py-3 text-base">{dep.sno}</td>
                        <td className="px-4 py-3 font-medium text-base">{dep.dep_name}</td>
                        <td className="px-4 py-3 text-right">
                          <DepartmentButtons id={dep._id} onDepartmentDelete={fetchDepartments} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* PAGINATION */}
              {filteredDepartments.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between px-4 py-5 border-t bg-white/80 rounded-b-3xl">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 ${currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"}`}
                  >
                    ◀ Previous
                  </button>
                  <span className="text-base font-semibold text-gray-600">Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 ${currentPage === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700 cursor-pointer"}`}
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

export default DepartmentList;