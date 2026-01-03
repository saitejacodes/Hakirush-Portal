import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const AdminLeaveTable = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const handleView = (id) => {
    navigate(`/admin-dashboard/leaves/${id}`);
  };

  const fetchLeaves = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/leave", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        const data = response.data.leaves.map((leave, index) => {
          const start = new Date(leave.startDate);
          const end = new Date(leave.endDate);
          const days =
            Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

          return {
            _id: leave._id,
            sno: index + 1,
            employeeId: leave.employeeId?.employeeId || "N/A",
            name: leave.employeeId?.userId?.name || "N/A",
            leaveType: leave.leaveType,
            department: leave.employeeId?.department?.dep_name || "N/A",
            days,
            status: leave.status,
          };
        });

        setLeaves(data);
        setFilteredLeaves(data);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // SEARCH + FILTER
  useEffect(() => {
    let result = leaves;

    if (statusFilter !== "All") {
      result = result.filter((l) => l.status === statusFilter);
    }

    if (search.trim() !== "") {
      result = result.filter((l) =>
        l.employeeId?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredLeaves(result);
  }, [search, statusFilter, leaves]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-red-700">
            Leave Requests
          </h1>
          <p className="text-gray-500 mt-2">
            Review & manage employee leave applications
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">

          <input
            type="text"
            placeholder="🔎 Search Employee ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 rounded-xl border focus:ring-2 focus:ring-red-400 outline-none"
          />

          <div className="flex flex-wrap gap-3">
            {["All", "Pending", "Approved", "Rejected"].map((item) => (
              <button
                key={item}
                onClick={() => setStatusFilter(item)}
                className={`px-5 py-2 rounded-xl font-semibold transition-all 
                ${
                  statusFilter === item
                    ? "bg-red-600 text-white shadow"
                    : "bg-white border hover:bg-red-50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/80 backdrop-blur-xl border rounded-2xl shadow-xl p-4">

          {loading ? (
            <p className="text-center py-10 text-gray-500 animate-pulse">
              Loading leave records...
            </p>
          ) : filteredLeaves.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-2xl font-bold text-gray-400">
                No Leave Records Found
              </p>
              <p className="text-gray-500 mt-2">
                Try changing filters or search again
              </p>
            </div>
          ) : (
            <div className="overflow-auto max-h-[70vh] rounded-xl">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-red-600 text-white shadow">
                  <tr>
                    <th className="px-4 py-3">S.No</th>
                    <th className="px-4 py-3">Emp Id</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Leave Type</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Days</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLeaves.map((leave) => (
                    <tr
                      key={leave._id}
                      className="border-b hover:bg-red-50 transition"
                    >
                      <td className="px-4 py-3 text-center">{leave.sno}</td>
                      <td className="px-4 py-3 text-center">
                        {leave.employeeId}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">
                        {leave.name}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {leave.leaveType}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {leave.department}
                      </td>
                      <td className="px-4 py-3 text-center">{leave.days}</td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            statusColors[leave.status] || "bg-gray-100"
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleView(leave._id)}
                          className="px-4 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLeaveTable;
