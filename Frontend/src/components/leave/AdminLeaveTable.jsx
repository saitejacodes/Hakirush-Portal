import axios from "axios";
import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ===== STATUS COLORS ===== */
const getStatusClass = (status) => {
  if (!status) return "bg-gray-100 text-gray-700";
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "approved":
      return "bg-green-100 text-green-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

/* ===== MOBILE CARD ===== */
const MobileLeaveCard = ({ leave, index, handleView }) => (
  <div className="bg-white rounded-2xl shadow-md border border-red-100 p-3">
    <div className="flex justify-between items-start gap-3">
      <div className="flex-1">
        <p className="font-semibold text-gray-900 text-sm">
          {index + 1}. {leave.leaveType}
        </p>
        <p className="text-xs text-gray-500">
          {leave.employeeId} • {leave.name}
        </p>
        <p className="text-xs text-gray-400">
          {leave.department}
        </p>
        <p className="text-xs font-bold text-red-600 mt-1">
          {leave.days} Working Days
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
            leave.status
          )}`}
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

const AdminLeaveTable = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleView = (id) => navigate(`/admin-dashboard/leaves/${id}`);

  /* ===== FETCH LEAVES ===== */
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/leave`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        const data = res.data.leaves.map((leave, index) => ({
          _id: leave._id,
          sno: index + 1,
          employeeId: leave.employeeId?.employeeId || "N/A",
          name: leave.employeeId?.userId?.name || "N/A",
          leaveType: leave.leaveType,
          department: leave.employeeId?.department?.dep_name || "N/A",
          days: leave.days, // Using the backend-calculated work days directly
          status: leave.status,
        }));

        setLeaves(data);
        setFilteredLeaves(data);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  /* ===== FILTER LOGIC ===== */
  useEffect(() => {
    let result = leaves;

    if (statusFilter !== "All") {
      result = result.filter((l) => l.status === statusFilter);
    }

    if (search.trim()) {
      result = result.filter((l) =>
        l.employeeId.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredLeaves(result);
  }, [search, statusFilter, leaves]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 md:mb-8 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-red-700">
            Leave Requests
          </h3>
          <p className="text-red-500 mt-2">
            Review and manage employee leave applications
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100 backdrop-blur">
          {/* TOP BAR */}
          <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <input
              type="text"
              placeholder="Search Employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-1/3 rounded-xl border border-red-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500"
            />

            <div className="flex flex-wrap gap-2 justify-center">
              {["All", "Pending", "Approved", "Rejected"].map((item) => (
                <button
                  key={item}
                  onClick={() => setStatusFilter(item)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${
                    statusFilter === item
                      ? "bg-red-600 text-white"
                      : "bg-white border border-red-200 text-gray-700 hover:bg-red-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="p-10 text-center text-red-600 font-semibold">
              Loading leave records...
            </div>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="md:hidden grid grid-cols-1 gap-5 px-4 pb-6">
                {filteredLeaves.length ? (
                  filteredLeaves.map((leave, index) => (
                    <MobileLeaveCard
                      key={leave._id}
                      leave={leave}
                      index={index}
                      handleView={handleView}
                    />
                  ))
                ) : (
                  <div className="text-center text-red-400 py-20">
                    No leave records found
                  </div>
                )}
              </div>

              {/* DESKTOP VIEW */}
              <div className="hidden md:block max-h-[60vh] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-red-50 z-10">
                    <tr className="text-red-700 uppercase text-xs">
                      <th className="px-4 py-4 text-left">S No</th>
                      <th className="px-4 py-4 text-left">Emp ID</th>
                      <th className="px-4 py-4 text-left">Name</th>
                      <th className="px-4 py-4 text-left">Type</th>
                      <th className="px-4 py-4 text-left">Dept</th>
                      <th className="px-4 py-4 text-left">Work Days</th>
                      <th className="px-4 py-4 text-center">Status</th>
                      <th className="px-4 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-50">
                    {filteredLeaves.map((leave, index) => (
                      <tr key={leave._id} className="hover:bg-red-50/50 transition-colors">
                        <td className="px-4 py-4">{index + 1}</td>
                        <td className="px-4 py-4 font-medium">{leave.employeeId}</td>
                        <td className="px-4 py-4">{leave.name}</td>
                        <td className="px-4 py-4">{leave.leaveType}</td>
                        <td className="px-4 py-4 text-gray-500">{leave.department}</td>
                        <td className="px-4 py-4 font-bold text-red-600">{leave.days}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(leave.status)}`}>
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => handleView(leave._id)}
                            className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                            title="View Details"
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