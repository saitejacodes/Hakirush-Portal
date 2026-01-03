import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { DepartmentButtons } from "../../utils/DepartmentHelper";

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [depLoading, setDepLoading] = useState(false);
  const [filteredDepartments, setFilteredDepartments] = useState([]);

  const onDepartmentDelete = () => {
     fetchDepartments()
  };

  const fetchDepartments = async () => {
      setDepLoading(true);

      try {
        const response = await axios.get(
          "http://localhost:5000/api/department",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          let sno = 1;

          const data = response.data.departments.map((dep) => ({
            _id: dep._id,
            sno: sno++,
            dep_name: dep.dep_name,
          }));

          setDepartments(data);
          setFilteredDepartments(data);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        } else {
          console.error(error);
        }
      } finally {
        setDepLoading(false);
      }
    };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // 🔴 FIX: renamed this (was conflicting with state name)
  const handleFilter = (e) => {
    const value = e.target.value.toLowerCase();

    const records = departments.filter((dep) =>
      dep.dep_name.toLowerCase().includes(value)
    );

    setFilteredDepartments(records);
  };

  return (
    <>
      {depLoading ? (
        <div className="flex justify-center items-center min-h-screen text-red-600 text-xl font-semibold">
          Loading...
        </div>
      ) : (
        <div className="min-h-screen bg-red-50 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 text-center">
              <h3 className="text-4xl font-extrabold text-red-700">
                Manage Departments
              </h3>
              <p className="text-red-500 mt-2">
                View, search and add new departments
              </p>
            </div>

            <div className="bg-white shadow-xl rounded-2xl p-6 border border-red-100">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <input
                  type="text"
                  placeholder="Search department..."
                  className="w-full sm:w-1/2 rounded-xl border border-red-300 px-4 py-2.5 outline-none
                             focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  onChange={handleFilter}
                />

                <Link
                  to="/admin-dashboard/add-department"
                  className="inline-block text-center rounded-xl bg-red-600 px-6 py-2.5 
                             font-semibold text-white shadow-md hover:bg-red-700 hover:shadow-lg transition"
                >
                  + Add Department
                </Link>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-red-100">
                      <th className="px-4 py-3 font-semibold text-red-700">S No</th>
                      <th className="px-4 py-3 font-semibold text-red-700">
                        Department Name
                      </th>
                      <th className="px-4 py-3 font-semibold text-red-700 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredDepartments.length > 0 ? (
                      filteredDepartments.map((dep) => (
                        <tr
                          key={dep._id}
                          className="border-b hover:bg-red-50 transition"
                        >
                          <td className="px-4 py-3">{dep.sno}</td>
                          <td className="px-4 py-3 font-medium">
                            {dep.dep_name}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DepartmentButtons
                              id={dep._id}
                              onDepartmentDelete={onDepartmentDelete}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-4 py-10 text-center text-red-400"
                        >
                          No departments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DepartmentList;
