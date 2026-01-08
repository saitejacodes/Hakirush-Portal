import axios from "axios";
import { Eye } from "lucide-react";
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

  // search + filter combo
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

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-red-700 tracking-tight">
            Leave Requests
          </h1>
          <p className="text-red-500 mt-2">
            Review and manage employee leave applications
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100 backdrop-blur">

          {/* FILTER BAR */}
          <div className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search Employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-red-300
                         outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            />

            {/* STATUS FILTER BUTTONS */}
            <div className="flex flex-wrap gap-2">
              {["All", "Pending", "Approved", "Rejected"].map((item) => (
                <button
                  key={item}
                  onClick={() => setStatusFilter(item)}
                  className={`px-5 py-2 rounded-xl font-semibold transition
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

          {/* TABLE AREA */}
          <div className="max-h-[65vh] overflow-auto rounded-b-3xl">

            {loading ? (
              <div className="p-12 text-center text-red-600 font-semibold text-lg">
                Loading leave records...
              </div>
            ) : filteredLeaves.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-2xl font-bold text-red-400">
                  No leave records found
                </p>
                <p className="text-red-500 mt-1">
                  Try changing filters or search again
                </p>
              </div>
            ) : (
              <table className="w-full border-collapse">

                {/* STICKY HEADER */}
                <thead className="sticky top-0 bg-red-50/80 backdrop-blur-xl shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">S No</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Emp ID</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Leave Type</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Department</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Days</th>
                    <th className="px-4 py-3 text-left text-red-800 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right text-red-800 font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-red-100/70">
                  {filteredLeaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-red-50">
                      <td className="px-4 py-3">{leave.sno}</td>
                      <td className="px-4 py-3">{leave.employeeId}</td>
                      <td className="px-4 py-3 font-medium">{leave.name}</td>
                      <td className="px-4 py-3">{leave.leaveType}</td>
                      <td className="px-4 py-3">{leave.department}</td>
                      <td className="px-4 py-3">{leave.days}</td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold
                            ${statusColors[leave.status] || "bg-gray-100"}
                          `}
                        >
                          {leave.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleView(leave._id)}
                          className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-100/70 hover:shadow transition-all active:scale-95 backdrop-blur">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLeaveTable;
