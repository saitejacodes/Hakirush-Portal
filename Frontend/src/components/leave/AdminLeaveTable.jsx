import axios from "axios";
import { Eye } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

/* ========== MOBILE CARD ========== */
const MobileLeaveCard = ({ leave, handleView }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-red-100 p-3">
      <div className="flex justify-between items-start">

        <div>
          <p className="font-semibold text-gray-900">
            {leave.name}
          </p>
          <p className="text-xs text-gray-500">
            {leave.employeeId} • {leave.department}
          </p>

          <div className="mt-1 flex gap-2 text-xs">
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
              {leave.leaveType}
            </span>
            <span className="px-2 py-0.5 bg-gray-100 rounded-full">
              {leave.days} days
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[leave.status]}`}
          >
            {leave.status}
          </span>

          <button
            onClick={() => handleView(leave._id)}
            className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-100"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminLeaveTable = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleView = (id) => navigate(`/admin-dashboard/leaves/${id}`);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/leave`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        const data = response.data.leaves.map((leave, index) => {
          const start = new Date(leave.startDate);
          const end = new Date(leave.endDate);
          const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    let result = leaves;
    if (statusFilter !== "All") {
      result = result.filter((l) => l.status === statusFilter);
    }
    if (search.trim()) {
      result = result.filter((l) =>
        l.employeeId?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredLeaves(result);
  }, [search, statusFilter, leaves]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 px-3 py-4 md:p-6">
      <div className="w-full max-w-7xl mx-auto">

        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-extrabold text-red-700">
            Leave Requests
          </h1>
          <p className="text-red-500 mt-1">
            Review and manage employee leave applications
          </p>
        </div>

        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100 backdrop-blur">

          {/* FILTER BAR */}
          <div className="p-4 md:p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              type="text"
              placeholder="Search Employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-80 px-4 py-2.5 rounded-xl border border-red-300 focus:ring-2 focus:ring-red-500"
            />

            <div className="flex flex-wrap gap-2">
              {["All", "Pending", "Approved", "Rejected"].map((item) => (
                <button
                  key={item}
                  onClick={() => setStatusFilter(item)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                    statusFilter === item
                      ? "bg-red-600 text-white"
                      : "bg-white border"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-red-600">
              Loading leave records...
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden grid gap-3 px-2 pb-24">
                {filteredLeaves.length ? (
                  filteredLeaves.map((leave) => (
                    <MobileLeaveCard
                      key={leave._id}
                      leave={leave}
                      handleView={handleView}
                    />
                  ))
                ) : (
                  <div className="text-center text-red-400 py-20">
                    No leave records found
                  </div>
                )}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block max-h-[65vh] overflow-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-red-50">
                    <tr>
                      <th className="px-4 py-3 text-left">S No</th>
                      <th className="px-4 py-3 text-left">Emp ID</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Leave Type</th>
                      <th className="px-4 py-3 text-left">Department</th>
                      <th className="px-4 py-3 text-left">Days</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLeaves.map((leave) => (
                      <tr key={leave._id} className="hover:bg-red-50">
                        <td className="px-4 py-3">{leave.sno}</td>
                        <td className="px-4 py-3">{leave.employeeId}</td>
                        <td className="px-4 py-3">{leave.name}</td>
                        <td className="px-4 py-3">{leave.leaveType}</td>
                        <td className="px-4 py-3">{leave.department}</td>
                        <td className="px-4 py-3">{leave.days}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[leave.status]}`}
                          >
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleView(leave._id)}
                            className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-100"
                          >
                            <Eye size={16} />
                          </button>
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

export default AdminLeaveTable;