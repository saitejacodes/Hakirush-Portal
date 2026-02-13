import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/authContext";

/* ================= STATUS COLOR ================= */
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

/* ================= DATE FORMAT ================= */
const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ================= MOBILE CARD ================= */
const MobileLeaveCard = ({ leave, index }) => (
  <div className="bg-white rounded-2xl shadow-md border border-red-100 p-4">
    <div className="flex justify-between gap-3 mb-2">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
            #{index + 1}
          </span>
          <p className="font-bold text-gray-900 text-sm">{leave.leaveType}</p>
        </div>
        <p className="text-xs text-gray-500 font-medium">
          {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
        </p>
      </div>
      <span
        className={`px-3 py-1 h-fit rounded-full text-[10px] uppercase font-black tracking-wider ${getStatusClass(
          leave.status
        )}`}
      >
        {leave.status}
      </span>
    </div>

    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <p className="text-xs text-gray-600 italic">"{leave.reason || "No reason provided"}"</p>
    </div>

    <div className="mt-3 flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
      <p className="text-[10px] text-gray-400 font-bold uppercase">
        Applied: {formatDate(leave.createdAt)}
      </p>
      <p className="text-xs font-black text-red-600">
        {leave.days} Work Days
      </p>
    </div>
  </div>
);

const EmployeeLeaveList = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= FETCH LEAVES ================= */
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
          // Sort by newest first
          const sortedData = (res.data.leaves || []).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setLeaves(sortedData);
          setFilteredLeaves(sortedData);
        }
      } catch {
        console.error("Failed to fetch leaves");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [id, user.role]);

  /* ================= SEARCH ================= */
  useEffect(() => {
    setFilteredLeaves(
      leaves.filter((l) =>
        (l.leaveType || "").toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, leaves]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 text-center md:text-left flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-red-700 tracking-tight">
              My Leave Requests
            </h3>
            <p className="text-red-500 font-medium">Track and manage your time-off applications</p>
          </div>
          {user.role === "employee" && (
            <Link
              to="/employee-dashboard/add-leave"
              className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-red-200 hover:bg-red-700 hover:-translate-y-0.5 transition-all"
            >
              + Apply New Leave
            </Link>
          )}
        </div>

        {/* SEARCH BAR */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by leave type (e.g. Sick, Casual)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/3 rounded-2xl border border-red-200 bg-white/80 backdrop-blur px-5 py-3 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all shadow-sm"
          />
        </div>

        {/* CONTENT AREA */}
        <div className="bg-white/90 rounded-[2rem] shadow-2xl shadow-red-900/5 border border-white overflow-hidden">
          {loading ? (
            <div className="p-20 text-center">
              <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-red-600 rounded-full mb-4"></div>
              <p className="text-red-600 font-bold uppercase tracking-widest text-xs">Loading records...</p>
            </div>
          ) : (
            <>
              {/* MOBILE GRID */}
              <div className="md:hidden grid gap-4 p-4 pb-20">
                {filteredLeaves.length ? (
                  filteredLeaves.map((leave, index) => (
                    <MobileLeaveCard key={leave._id} leave={leave} index={index} />
                  ))
                ) : (
                  <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">No leave applications found.</p>
                  </div>
                )}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-red-50/50 border-b border-red-100">
                      <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-red-800">S No</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-red-800">Type</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-red-800">Duration</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-red-800">Net Days</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-red-800">Reason</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-red-800">Applied</th>
                      <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-red-800">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredLeaves.map((leave, index) => (
                      <tr key={leave._id} className="hover:bg-red-50/30 transition-colors group">
                        <td className="px-6 py-5">
                          <span className="text-xs font-bold text-gray-400 group-hover:text-red-500 transition-colors">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </td>
                        <td className="px-6 py-5 font-bold text-gray-800">{leave.leaveType}</td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-700">
                              {formatDate(leave.startDate)}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">To {formatDate(leave.endDate)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-black bg-red-50 text-red-700 border border-red-100">
                            {leave.days}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs text-gray-500 max-w-[200px] truncate font-medium" title={leave.reason}>
                            {leave.reason || "—"}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-xs font-medium text-gray-400">
                          {formatDate(leave.createdAt)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${getStatusClass(leave.status)}`}>
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