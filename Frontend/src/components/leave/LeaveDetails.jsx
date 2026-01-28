import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const LeaveDetails = () => {
  const { id } = useParams();
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeave = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/leave/detail/${id}`,
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
        `${import.meta.env.VITE_BACKEND_URL}/api/leave/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data?.success) {
        navigate("/admin-dashboard/leaves");
      }
    } catch (error) {
      alert(error?.response?.data?.error || "Failed to update status");
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
    if (imagePath.startsWith("uploads/"))
      return `${import.meta.env.VITE_BACKEND_URL}/${imagePath}`;
    return `${import.meta.env.VITE_BACKEND_URL}/uploads/${imagePath}`;
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

  const status = (leave?.status || "").toLowerCase();
  const isPending = status === "pending";

  const statusColor =
    status === "approved"
      ? "bg-green-100 text-green-700"
      : status === "rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-red-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h3 className="text-4xl font-extrabold text-center text-red-700 mb-8">
          Leave Details
        </h3>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-red-100">
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-full border-4 border-red-200 shadow-lg overflow-hidden">
              <img
                src={getImageUrl(leave?.employeeId?.userId?.profileImage)}
                alt="profile"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "/default-avatar.png")}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              {leave?.employeeId?.userId?.name || "Employee"}
            </h2>

            <span className="px-4 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
              {leave?.employeeId?.designation || "No Designation"}
            </span>

            <span
              className={`px-4 py-1 rounded-full text-sm font-semibold ${statusColor}`}
            >
              {leave?.status || "Pending"}
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Info label="Employee Name" value={leave?.employeeId?.userId?.name} />

            <Info
              label="Email"
              value={
                leave?.employeeId?.userId?.email ??
                leave?.employeeId?.email ??
                leave?.userId?.email ??
                "—"
              }
            />

            <Info label="Employee ID" value={leave?.employeeId?.employeeId} />

            <Info label="Leave Type" value={leave?.leaveType} />

            <Info
              label="Start Date"
              value={
                leave?.startDate
                  ? new Date(leave.startDate).toDateString()
                  : "N/A"
              }
            />

            <Info
              label="End Date"
              value={
                leave?.endDate
                  ? new Date(leave.endDate).toDateString()
                  : "N/A"
              }
            />

            <div className="sm:col-span-2">
              <Info
                label="Reason"
                value={leave?.reason || "No reason provided"}
              />
            </div>

            <div className="bg-red-50 rounded-xl p-4 border border-red-100 col-span-1 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-red-500 font-semibold">
                {isPending ? "Action" : "Status"}
              </p>

              {isPending ? (
                <div className="flex gap-3 mt-2">
                  <button
                    className="px-4 py-2 rounded bg-green-600 text-white font-medium"
                    onClick={() => changeStatus(leave._id, "Approved")}
                  >
                    Approve
                  </button>

                  <button
                    className="px-4 py-2 rounded bg-red-600 text-white font-medium"
                    onClick={() => changeStatus(leave._id, "Rejected")}
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <p className="text-lg font-bold mt-2 capitalize">
                  {leave?.status}
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
    <p className="text-gray-800 text-lg font-bold mt-1">{value ?? "—"}</p>
  </div>
);

export default LeaveDetails;
