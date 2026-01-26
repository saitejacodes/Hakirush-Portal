import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search } from "lucide-react";
import { DepartmentButtons } from "../../utils/DepartmentHelper";

/* ================= MOBILE CARD ================= */
const MobileDepartmentCard = ({ dep }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-red-100 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400 font-semibold">Department</p>
          <p className="font-semibold text-gray-900 text-sm truncate">
            {dep.dep_name}
          </p>
        </div>

        <DepartmentButtons id={dep._id} />
      </div>
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-6 md:mb-8 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-red-700">
            Manage Departments
          </h3>
          <p className="text-red-500 mt-2">
            View, search and manage departments
          </p>
        </div>

        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100">

          {/* TOP BAR */}
          <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="relative w-full md:w-1/2">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search department..."
                className="w-full rounded-xl border border-red-300 pl-10 pr-4 py-2.5
                           outline-none focus:ring-2 focus:ring-red-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Link
              to="/admin-dashboard/add-department"
              className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white
                         shadow-md hover:bg-red-700 transition"
            >
              + Add Department
            </Link>
          </div>

          {depLoading ? (
            <div className="p-10 text-center text-red-600 font-semibold">
              Loading departments...
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden grid grid-cols-1 gap-5 px-4 pb-6">
                {paginatedDepartments.length ? (
                  paginatedDepartments.map((dep) => (
                    <MobileDepartmentCard key={dep._id} dep={dep} />
                  ))
                ) : (
                  <div className="text-center text-red-400 py-20">
                    No departments found
                  </div>
                )}
              </div>

              {/* DESKTOP */}
              <div className="hidden md:block max-h-[60vh] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-red-50">
                    <tr>
                      <th className="px-4 py-3 text-left">S No</th>
                      <th className="px-4 py-3 text-left">Department Name</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedDepartments.map((dep) => (
                      <tr
                        key={dep._id}
                        className="hover:bg-red-50 transition"
                      >
                        <td className="px-4 py-3">{dep.sno}</td>
                        <td className="px-4 py-3 font-medium">
                          {dep.dep_name}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DepartmentButtons
                            id={dep._id}
                            onDepartmentDelete={fetchDepartments}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {filteredDepartments.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-1 rounded-lg font-semibold
                      ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                  >
                    ◀ Previous
                  </button>

                  <span className="text-sm font-semibold text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-4 py-1 rounded-lg font-semibold
                      ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
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
