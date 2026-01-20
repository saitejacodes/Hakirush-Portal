import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/authContext";

/* ===== STATUS COLORS (OLD ONE) ===== */
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

/* ===== DATE FORMAT ===== */
const formatDate = (value) => {
  if (!value) return "—";

  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [d, m, y] = value.split("-");
    value = `${y}-${m}-${d}`;
  }

  const d = new Date(value);
  if (isNaN(d)) return "—";

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ================= MOBILE CARD ================= */
const MobileLeaveCard = ({ leave, index }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-red-100 p-3">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">
            {index + 1}. {leave.leaveType}
          </p>

          <p className="text-xs text-gray-500">
            {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
          </p>

          <p className="text-xs text-gray-400">
            Applied:{" "}
            {formatDate(
              leave.appliedDate ||
                leave.appliedOn ||
                leave.createdAt
            )}
          </p>

          <p className="text-sm text-gray-700 mt-1">
            {leave.reason || "—"}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
            leave.status
          )}`}
        >
          {leave.status}
        </span>
      </div>
    </div>
  );
};

const EmployeeLeaveList = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* ===== FETCH LEAVES ===== */
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/leave/${id}/${user.role}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data.success) {
          setLeaves(res.data.leaves || []);
          setFilteredLeaves(res.data.leaves || []);
        }
      } catch (error) {
        console.error(error);
        alert("Failed to fetch leaves");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [id, user.role]);

  /* ===== SEARCH FILTER ===== */
  useEffect(() => {
    const result = leaves.filter((l) =>
      (l.leaveType || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFilteredLeaves(result);
  }, [search, leaves]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-6 md:mb-8 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-red-700">
            My Leave Requests
          </h3>
          <p className="text-red-500 mt-2">
            Track your leave applications
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white/90 rounded-3xl shadow-xl border border-red-100 backdrop-blur">

          {/* TOP BAR */}
          <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <input
              type="text"
              placeholder="Search leave type..."
              className="w-full md:w-1/2 rounded-xl border border-red-300 px-4 py-2.5
                         outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {user.role === "employee" && (
              <Link
                to="/employee-dashboard/add-leave"
                className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white
                           shadow-md hover:bg-red-700 transition active:scale-95 text-center"
              >
                + Apply Leave
              </Link>
            )}
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="p-10 text-center text-red-600 font-semibold">
              Loading leaves...
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden grid grid-cols-1 gap-5 px-4 pb-24">
                {filteredLeaves.length ? (
                  filteredLeaves.map((leave, index) => (
                    <MobileLeaveCard
                      key={leave._id}
                      leave={leave}
                      index={index}
                    />
                  ))
                ) : (
                  <div className="text-center text-red-400 py-20">
                    No leave records found
                  </div>
                )}
              </div>

              {/* DESKTOP – SAME AS MANAGE EMPLOYEES */}
              <div className="hidden md:block max-h-[60vh] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-red-50">
                    <tr>
                      <th className="px-4 py-3 text-left">S No</th>
                      <th className="px-4 py-3 text-left">Leave Type</th>
                      <th className="px-4 py-3 text-left">From</th>
                      <th className="px-4 py-3 text-left">To</th>
                      <th className="px-4 py-3 text-left">Reason</th>
                      <th className="px-4 py-3 text-left">Applied On</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLeaves.map((leave, index) => (
                      <tr key={leave._id} className="hover:bg-red-50">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{leave.leaveType}</td>
                        <td className="px-4 py-3">{formatDate(leave.startDate)}</td>
                        <td className="px-4 py-3">{formatDate(leave.endDate)}</td>
                        <td className="px-4 py-3 max-w-xs truncate">
                          {leave.reason || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {formatDate(
                            leave.appliedDate ||
                              leave.appliedOn ||
                              leave.createdAt
                          )}
                        </td>

                        {/* ✅ OLD STATUS STYLE */}
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(
                              leave.status
                            )}`}
                          >
                            {leave.status}
                          </span>
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

export default EmployeeLeaveList;