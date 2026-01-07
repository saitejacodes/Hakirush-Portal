import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search } from "lucide-react";
import { DepartmentButtons } from "../../utils/DepartmentHelper";

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [depLoading, setDepLoading] = useState(false);
  const [filteredDepartments, setFilteredDepartments] = useState([]);

  const fetchDepartments = async () => {
    setDepLoading(true);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/department`,
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
      console.error(err);
    } finally {
      setDepLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleFilter = (e) => {
    const value = e.target.value.toLowerCase();
    const records = departments.filter((dep) =>
      dep.dep_name.toLowerCase().includes(value)
    );
    setFilteredDepartments(records);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h3 className="text-4xl font-extrabold text-red-800 tracking-tight">
            Manage Departments
          </h3>
          <p className="text-red-500 mt-2">
            View, search and add new departments
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100 backdrop-blur">

          {/* TOP BAR */}
          <div className="p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">

            {/* SEARCH BAR */}
            <div className="relative w-full sm:w-1/2">
              <Search className="absolute left-3 top-3 text-red-400" size={18} />
              <input
                type="text"
                placeholder="Search department..."
                onChange={handleFilter}
                className="w-full rounded-xl pl-9 border border-red-300 px-4 py-2.5
                           outline-none focus:ring-2 focus:ring-red-500
                           transition shadow-sm bg-white"
              />
            </div>

            {/* ADD BUTTON */}
            <Link
              to="/admin-dashboard/add-department"
              className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white
                         shadow-md hover:bg-red-700 hover:shadow-lg transition active:scale-95"
            >
              + Add Department
            </Link>
          </div>

          {/* TABLE WRAPPER */}
          <div className="max-h-[60vh] overflow-auto rounded-b-3xl">

            {/* LOADING STATE */}
            {depLoading ? (
              <div className="p-10 text-center text-red-600 font-semibold text-lg">
                Loading departments...
              </div>
            ) : (
              <table className="w-full border-collapse">

                {/* Sticky Header */}
                <thead className="sticky top-0 z-10 bg-red-50/80 backdrop-blur-xl shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">
                      S No
                    </th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">
                      Department Name
                    </th>
                    <th className="px-6 py-3 text-right text-red-800 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-red-100/70">

                  {filteredDepartments.length ? (
                    filteredDepartments.map((dep, i) => (
                      <tr
                        key={dep._id}
                        className="transition-all duration-200 hover:bg-red-50"
                      >
                        <td className="px-4 py-3">{i + 1}</td>

                        <td className="px-4 py-3 font-medium text-gray-900">
                          <span className="inline-flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-400"></span>
                            {dep.dep_name}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <DepartmentButtons
                            id={dep._id}
                            onDepartmentDelete={fetchDepartments}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-4 py-16 text-center text-red-400 text-lg"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-4xl">📂</span>
                          No departments found
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

export default DepartmentList;
