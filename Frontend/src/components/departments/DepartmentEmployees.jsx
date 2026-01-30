import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";

const DepartmentEmployees = () => {
  const { id } = useParams();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || id === ":id") {
      setError("Invalid department ID");
      setLoading(false);
      return;
    }

    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/employee/department/${id}/employees`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data?.success) {
          setEmployees(res.data.employees || []);
        } else {
          setError("Failed to load employees");
        }
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            "Something went wrong while loading employees"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-100 text-red-600">
              <Users size={22} />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Department Employees
            </h2>
          </div>

          <Link
            to="/admin-dashboard/departments"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-red-50 transition"
          >
            <ArrowLeft size={18} />
            Back to Departments
          </Link>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="p-5 md:p-6">

          {/* LOADING */}
          {loading && (
            <div className="text-center py-10 text-red-600 font-semibold animate-pulse">
              Loading employees...
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="text-center py-8 text-red-600 font-semibold bg-red-50 rounded-xl">
              {error}
            </div>
          )}

          {/* ================= MOBILE VIEW ================= */}
          {!loading && !error && employees.length > 0 && (
            <div className="md:hidden space-y-4">
              {employees.map((emp, index) => (
                <div
                  key={emp._id}
                  className="rounded-2xl border bg-white shadow-sm p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-gray-500">
                      Employee #{index + 1}
                    </span>
                    <span className="px-3 py-1 text-xs rounded-full bg-red-50 text-red-600 font-medium">
                      {emp.designation || "—"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-gray-800">
                      {emp.userId?.name || "—"}
                    </p>
                    <p className="text-gray-600 break-all">
                      {emp.userId?.email || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ================= DESKTOP TABLE ================= */}
          {!loading && !error && employees.length > 0 && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border rounded-xl overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 w-20">
                      S.No
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      Designation
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((emp, index) => (
                    <tr
                      key={emp._id}
                      className="border-t hover:bg-red-50 transition"
                    >
                      <td className="p-4 font-medium text-gray-700">
                        {index + 1}
                      </td>
                      <td className="p-4 font-semibold text-gray-800">
                        {emp.userId?.name || "—"}
                      </td>
                      <td className="p-4 text-gray-600">
                        {emp.userId?.email || "—"}
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          {emp.designation || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && employees.length === 0 && (
            <div className="text-center py-12 text-gray-500 font-medium">
              No employees found in this department
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentEmployees;