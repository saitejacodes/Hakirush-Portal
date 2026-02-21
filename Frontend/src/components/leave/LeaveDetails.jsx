import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* ================= PREMIUM STATUS ALERT ================= */
const StatusAlert = ({ type, onClose }) => {
  const isApproved = type === "approved";

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border overflow-hidden animate-pop">
          <div
            className={`h-1.5 ${
              isApproved
                ? "bg-gradient-to-r from-green-600 to-green-400"
                : "bg-gradient-to-r from-red-600 to-red-400"
            }`}
          />
          <div className="p-6 flex gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                isApproved
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {isApproved ? "✓" : "✕"}
            </div>
            <div className="flex-1">
              <h3
                className={`text-lg font-black uppercase tracking-tight ${
                  isApproved ? "text-green-700" : "text-red-700"
                }`}
              >
                {isApproved ? "Leave Approved" : "Leave Rejected"}
              </h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                {isApproved
                  ? "The employee's leave balance has been updated successfully."
                  : "The leave request has been marked as rejected."}
              </p>
            </div>
          </div>
          <div className="px-6 pb-5">
            <button
              onClick={onClose}
              className={`w-full py-3 rounded-xl text-white font-black uppercase tracking-widest shadow-lg transition active:scale-95 ${
                isApproved
                  ? "bg-green-600 shadow-green-100 hover:bg-green-700"
                  : "bg-red-600 shadow-red-100 hover:bg-red-700"
              }`}
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const LeaveDetails = () => {
  const { id } = useParams();
  const [leave, setLeave] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertType, setAlertType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };

        const [leaveRes, holidayRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/leave/detail/${id}`, { headers }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/all`, { headers })
        ]);

        if (leaveRes.data?.success) {
          setLeave(leaveRes.data.leave);
        }
        if (holidayRes.data?.success) {
          setHolidays(holidayRes.data.holidays);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  /* --- UPDATED NET DAYS CALCULATION (Excluding Sat & Sun) --- */
  const calculateNetDays = (start, end, holidayList) => {
    if (!start || !end) return 0;
    
    let count = 0;
    let current = new Date(start);
    const lastDate = new Date(end);
    
    current.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    const holidayStrings = holidayList.map(h => 
      new Date(h.date).toISOString().split('T')[0]
    );

    while (current <= lastDate) {
      const dayOfWeek = current.getDay(); 
      const dateStr = current.toISOString().split('T')[0];
      
      // 0 is Sunday, 6 is Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayStrings.includes(dateStr)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const changeStatus = async (leaveId, status) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/leave/${leaveId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data?.success) {
        setAlertType(status.toLowerCase());
        setTimeout(() => {
          navigate("/admin-dashboard/leaves");
        }, 1800);
      }
    } catch (error) {
      alert(error?.response?.data?.error || "Failed to update status");
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${import.meta.env.VITE_BACKEND_URL}/${imagePath.replace(/^\/+/, "")}`;
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-black uppercase tracking-widest animate-pulse">
        Fetching Leave Details...
      </div>
    );

  if (!leave)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">
        Leave request not found.
      </div>
    );

  const status = (leave?.status || "").toLowerCase();
  const isPending = status === "pending";

  const statusStyle =
    status === "approved"
      ? "bg-green-100 text-green-700 border-green-200"
      : status === "rejected"
      ? "bg-red-100 text-red-700 border-red-200"
      : "bg-yellow-100 text-yellow-700 border-yellow-200";

  return (
    <>
      {alertType && (
        <StatusAlert
          type={alertType}
          onClose={() => navigate("/admin-dashboard/leaves")}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-black text-center text-red-700 mb-8 uppercase italic tracking-tighter">
            Leave Application Detail
          </h3>

          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 md:p-10 border border-white relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-red-50">
              <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl overflow-hidden">
                <img
                  src={getImageUrl(leave?.employeeId?.userId?.profileImage)}
                  alt="profile"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-black text-gray-800 tracking-tight">
                  {leave?.employeeId?.userId?.name || "Employee"}
                </h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                  <span className="px-3 py-1 rounded-lg bg-red-600 text-white text-[10px] font-black uppercase tracking-widest">
                    {leave?.employeeId?.employeeId}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                    {leave?.employeeId?.department?.dep_name || "Staff"}
                  </span>
                </div>
              </div>

              <div className={`px-6 py-2 rounded-2xl border font-black uppercase tracking-widest text-xs ${statusStyle}`}>
                {leave?.status}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Info label="Email Address" value={leave?.employeeId?.userId?.email} />
              <Info label="Leave Type" value={leave?.leaveType} highlight />
              <Info 
                label="Days" 
                value={`${calculateNetDays(leave.startDate, leave.endDate, holidays)} Days`} 
                subValue="Excluding Sat, Sun & Holidays"
                isRed
              />
              <Info label="From Date" value={new Date(leave.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric'})} />
              <Info label="To Date" value={new Date(leave.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric'})} />
              <Info label="Designation" value={leave?.employeeId?.designation} />

              <div className="sm:col-span-2 lg:col-span-3">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-2">Reason for Leave</p>
                  <p className="text-gray-700 font-medium leading-relaxed italic">
                    "{leave?.reason || "No description provided."}"
                  </p>
                </div>
              </div>
            </div>

            {isPending && (
              <div className="mt-10 pt-8 border-t border-red-50">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => changeStatus(leave._id, "Approved")}
                    className="flex-1 py-4 rounded-2xl bg-green-600 text-white font-black uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 active:scale-95 transition-all cursor-pointer"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => changeStatus(leave._id, "Rejected")}
                    className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
                  >
                    Reject Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const Info = ({ label, value, subValue, highlight, isRed }) => (
  <div className={`rounded-2xl p-4 border transition-all ${
    isRed ? "bg-red-50 border-red-100" : "bg-white border-slate-100 hover:border-red-200"
  }`}>
    <p className={`text-[10px] uppercase tracking-widest font-black ${isRed ? "text-red-400" : "text-slate-400"}`}>
      {label}
    </p>
    <p className={`text-lg font-bold mt-1 tracking-tight ${
      highlight ? "text-red-600" : isRed ? "text-red-700" : "text-slate-800"
    }`}>
      {value ?? "—"}
    </p>
    {subValue && <p className="text-[9px] font-bold text-red-400 uppercase mt-0.5">{subValue}</p>}
  </div>
);

export default LeaveDetails;