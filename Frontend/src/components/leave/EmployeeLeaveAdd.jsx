import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-200 overflow-hidden animate-pop">
        <div className="h-1.5 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600" />
        <div className="p-6 flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 text-xl font-bold">✓</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-rose-700">Leave Submitted</h3>
            <p className="text-sm text-slate-500 mt-1">Your leave request has been submitted successfully.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-600 transition">✕</button>
        </div>
        <div className="px-6 pb-5">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold hover:opacity-90 transition">Okay, got it</button>
        </div>
      </div>
    </div>
  </>
);

const EmployeeLeaveAdd = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [leave, setLeave] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [balance, setBalance] = useState({ casual: 0, sick: 0 });
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  /* FETCH CURRENT BALANCE */
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/leave/balance/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setBalance({
          casual: res?.data?.casual?.balance ?? 0,
          sick: res?.data?.sick?.balance ?? 0,
        });
      } catch (error) {
        setBalance({ casual: 0, sick: 0 });
      }
    };
    fetchBalance();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeave((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- HANDLE FORM SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);

    if (end < start) {
      return alert("End date must be after start date");
    }

    try {
      setLoading(true);

      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/leave/add`, leave, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data?.success) {
        setShowAlert(true);
        setTimeout(() => {
          navigate(`/employee-dashboard/leaves/${user._id}`);
        }, 1800);
      }
    } catch (error) {
      alert(error?.response?.data?.error || "Leave submit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}

      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-rose-100 p-6">
        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border p-8">
          <h3 className="text-center text-3xl font-extrabold text-rose-600 mb-2 uppercase italic tracking-tighter">
            Request for Leave
          </h3>

          {/* BALANCE DISPLAY */}
          <div className="flex flex-col sm:flex-row items-center justify-center text-slate-600 font-semibold mb-6 gap-3">
            <div className="flex items-center gap-3 bg-red-50 px-6 py-2 rounded-2xl border border-red-100 w-full sm:w-auto">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              <p className="text-xs uppercase font-black">Casual: <span className="text-red-600 text-lg">{balance.casual}</span></p>
            </div>
            <div className="flex items-center gap-3 bg-blue-50 px-6 py-2 rounded-2xl border border-blue-100 w-full sm:w-auto">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <p className="text-xs uppercase font-black">Sick: <span className="text-blue-600 text-lg">{balance.sick}</span></p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Leave Type</label>
              <select 
                name="leaveType" 
                onChange={handleChange} 
                required 
                className="w-full p-4 rounded-2xl border-slate-100 bg-slate-50 font-bold focus:ring-2 ring-rose-500 outline-none transition-all cursor-pointer"
              >
                <option value="">Select Type</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Casual Leave">Casual Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">From Date</label>
                <input 
                  type="date" 
                  name="startDate" 
                  onChange={handleChange} 
                  required 
                  className="w-full p-4 rounded-2xl border-slate-100 bg-slate-50 font-bold focus:ring-2 ring-rose-500 outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">To Date</label>
                <input 
                  type="date" 
                  name="endDate" 
                  onChange={handleChange} 
                  required 
                  className="w-full p-4 rounded-2xl border-slate-100 bg-slate-50 font-bold focus:ring-2 ring-rose-500 outline-none" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Description</label>
              <textarea 
                name="reason" 
                rows="4" 
                onChange={handleChange} 
                className="w-full p-4 rounded-2xl border-slate-100 bg-slate-50 font-bold focus:ring-2 ring-rose-500 outline-none" 
                placeholder="Reason for leave..." 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 rounded-[2rem] bg-rose-600 text-white font-black uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Submit Leave Request"}
            </button>
            <p className="text-[10px] text-center text-slate-400 uppercase font-bold">
              * Saturdays, Sundays, and Public Holidays are automatically excluded from balance deduction.
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default EmployeeLeaveAdd;