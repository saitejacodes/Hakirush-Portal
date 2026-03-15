import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Loader2, CalendarClock } from "lucide-react";

/* ================= PREMIUM STATUS ALERT ================= */
const StatusAlert = ({ type, onClose }) => {
  const isApproved = type === "approved";

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white p-8 animate-pop">
          <div className="flex flex-col items-center text-center">
            <div className={`p-4 rounded-full ${isApproved ? "bg-green-100" : "bg-red-100"}`}>
              {isApproved 
                ? <CheckCircle size={48} className="text-green-600" />
                : <XCircle size={48} className="text-red-600" />
              }
            </div>
            
            <h3 className={`text-3xl font-black uppercase tracking-tighter mt-6 ${
                isApproved ? "text-green-700" : "text-red-700"
              }`}
            >
              {isApproved ? "Leave Approved" : "Leave Rejected"}
            </h3>
            
            <p className="text-slate-500 mt-2 font-medium max-w-sm">
              {isApproved
                ? "The employee's leave balance has been updated successfully."
                : "The leave request has been marked as rejected."}
            </p>

            <button
              onClick={onClose}
              className={`w-full mt-8 py-4 rounded-2xl text-white font-black uppercase tracking-widest shadow-lg transition active:scale-95 ${
                isApproved
                  ? "bg-green-600 shadow-green-100 hover:bg-green-700"
                  : "bg-red-600 shadow-red-100 hover:bg-red-700"
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ================= MAIN COMPONENT ================= */
const LeaveDetails = () => {
  const { id } = useParams();
  const [leave, setLeave] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertType, setAlertType] = useState(null);
  const navigate = useNavigate();

  // Memoized fetch to prevent unnecessary re-renders
  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      
      const [leaveRes, holidayRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/leave/detail/${id}`, { headers }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/all`, { headers })
      ]);

      if (leaveRes.data?.success) setLeave(leaveRes.data.leave);
      if (holidayRes.data?.success) setHolidays(holidayRes.data.holidays);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  /* --- NET DAYS CALCULATION (Excluding Sat, Sun & Holidays) --- */
  const toLocalYMD = (dateInput) => {
    const d = new Date(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const calculateNetDays = useCallback((start, end, holidayList) => {
    if (!start || !end) return 0;
    let count = 0;
    const s = new Date(start);
    const e = new Date(end);
    let current = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    const last = new Date(e.getFullYear(), e.getMonth(), e.getDate());
    const holidayStrings = holidayList.map(h => toLocalYMD(h.date));
    while (current <= last) {
      const dateStr = toLocalYMD(current);
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayStrings.includes(dateStr)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }, []);

  const changeStatus = async (leaveId, status) => {
    try {
      setActionLoading(true);
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/leave/${leaveId}`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (response.data?.success) {
        setAlertType(status.toLowerCase());
      }
    } catch (error) {
      alert(error?.response?.data?.error || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${import.meta.env.VITE_BACKEND_URL}/${imagePath.replace(/^\/+/, "")}`;
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-red-600 gap-4">
      <Loader2 size={48} className="animate-spin" />
      <p className="font-black uppercase tracking-widest text-sm">Syncing Details...</p>
    </div>
  );

  if (!leave) return (
    <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">
      Leave request not found.
    </div>
  );

  const status = (leave?.status || "").toLowerCase();
  const isPending = status === "pending";
  const netDays = calculateNetDays(leave.startDate, leave.endDate, holidays);

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

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          
          {/* TOP NAV */}
          <button 
            onClick={() => navigate("/admin-dashboard/leaves")}
            className="flex items-center gap-2 text-slate-500 hover:text-red-600 mb-6 group cursor-pointer transition-colors"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-xs uppercase tracking-widest">Back to List</span>
          </button>

          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 md:p-10 border border-white relative overflow-hidden">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-slate-100">
              <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl overflow-hidden ring-1 ring-slate-100">
                <img
                  src={getImageUrl(leave?.employeeId?.userId?.profileImage)}
                  alt="profile"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                  {leave?.employeeId?.userId?.name || "Employee"}
                </h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                  <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                    ID: {leave?.employeeId?.employeeId}
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest border border-red-100">
                    {leave?.employeeId?.department?.dep_name || "Staff"}
                  </span>
                </div>
              </div>

              <div className={`px-6 py-2 rounded-full border font-black uppercase tracking-widest text-xs ${statusStyle}`}>
                {leave?.status}
              </div>
            </div>

            {/* Details Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Info label="Email Address" value={leave?.employeeId?.userId?.email} />
              <Info label="Leave Type" value={leave?.leaveType} highlight />
              <Info 
                label="Duration" 
                value={`${netDays} Work Days`} 
                subValue="Excludes weekends & holidays"
                icon={<CalendarClock size={16}/>}
                isRed
              />
              <Info label="From Date" value={new Date(leave.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric'})} />
              <Info label="To Date" value={new Date(leave.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric'})} />
              <Info label="Designation" value={leave?.employeeId?.designation} />

              <div className="sm:col-span-2 lg:col-span-3">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-2">Reason</p>
                  <p className="text-slate-700 font-medium leading-relaxed italic">
                    "{leave?.reason || "No description provided."}"
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {isPending && (
              <div className="mt-10 pt-8 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => changeStatus(leave._id, "Approved")}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-600 text-white font-black uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle size={20}/>}
                    Approve Request
                  </button>
                  <button
                    onClick={() => changeStatus(leave._id, "Rejected")}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                     {actionLoading ? <Loader2 className="animate-spin" size={20}/> : <XCircle size={20}/>}
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

const Info = ({ label, value, subValue, highlight, isRed, icon }) => (
  <div className={`rounded-2xl p-5 border transition-all ${
    isRed ? "bg-red-50/50 border-red-100" : "bg-white border-slate-100"
  }`}>
    <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-black ${isRed ? "text-red-400" : "text-slate-400"}`}>
        {icon}
        {label}
    </div>
    <p className={`text-lg font-bold mt-1.5 tracking-tight ${
      highlight ? "text-red-600" : isRed ? "text-red-700" : "text-slate-900"
    }`}>
      {value ?? "—"}
    </p>
    {subValue && <p className="text-[10px] font-bold text-red-400 uppercase mt-0.5">{subValue}</p>}
  </div>
);

export default LeaveDetails;