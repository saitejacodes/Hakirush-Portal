import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const LeaveDetails = () => {
  const { id } = useParams();
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLeave = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/leave/detail/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data?.success) {
          setLeave(response.data.leave);
        }
      } catch (error) {
        alert(error?.response?.data?.error || "Failed to load leave details");
      } finally {
        setLoading(false);
      }
    };

    fetchLeave();
  }, [id]);

  const changeStatus = async (id, status) => {
      try {
        const response = await axios.put(
          `http://localhost:5000/api/leave/${id}`, {status},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data?.success) {
          navigate('/admin-dashboard/leaves')
        }
      } catch (error) {
        alert(error?.response?.data?.error || "Failed to load leave details");
      }
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return `http://localhost:5000${imagePath}`;
    if (imagePath.startsWith("uploads/"))
      return `http://localhost:5000/${imagePath}`;
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        Loading leave details…
      </div>
    );

  if (!leave)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        Leave not found
      </div>
    );

  // normalize status safely
  const status = (leave?.status || "").toLowerCase();
  const isPending = status === "pending";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
      <div className="max-w-3xl mx-auto">

        <h3 className="text-4xl font-extrabold text-center text-red-700 mb-8">
          Leave Details
        </h3>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-red-100">
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-full border-4 border-red-200 shadow-lg overflow-hidden hover:scale-105 transition">
              <img
                src={getImageUrl(leave?.employeeId?.userId?.profileImage)}
                alt="profile"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "/default-avatar.png")}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              {leave?.employeeId?.employeeId || "N/A"}
            </h2>

            <span className="px-4 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
              {leave?.employeeId?.department?.dep_name || "No Department"}
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">

            <Info label="Employee Name" value={leave?.employeeId?.userId?.name} />
            <Info label="Email" value={leave?.employeeId?.userId?.email} />
            <Info label="Leave Type" value={leave?.leaveType} />
            <Info label="Start Date" value={leave?.startDate ? new Date(leave.startDate).toDateString() : "N/A"} />
            <Info label="End Date" value={leave?.endDate ? new Date(leave.endDate).toDateString() : "N/A"} />

            {/* ACTION / STATUS BLOCK FIXED */}
            <div className="bg-red-50 rounded-xl p-4 border border-red-100 col-span-1 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-red-500 font-semibold">
                {isPending ? "Action" : "Status"}
              </p>

              {isPending ? (
                <div className="flex gap-3 mt-2">
                  <button className="px-3 py-1 rounded bg-green-600 text-white"
                  onClick={() => changeStatus(leave._id, "Approved")}>
                    Approve
                  </button>
                  <button className="px-3 py-1 rounded bg-red-600 text-white"
                  onClick={() => changeStatus(leave._id, "Rejected")}>
                    Reject
                  </button>
                </div>
              ) : (
                <p className="text-lg font-bold mt-1">
                  {leave?.status || "N/A"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
    <p className="text-xs uppercase tracking-wide text-red-500 font-semibold">
      {label}
    </p>
    <p className="text-gray-800 text-lg font-bold mt-1">{value || "—"}</p>
  </div>
);

export default LeaveDetails;
