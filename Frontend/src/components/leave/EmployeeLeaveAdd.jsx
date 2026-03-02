import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, FileText, ArrowRight, CheckCircle2, 
  AlertTriangle, Clock, Briefcase, ShieldCheck, TrendingUp 
} from "lucide-react";

/* --- PREMIUM SUCCESS MODAL --- */
const SuccessAlert = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] animate-in fade-in duration-300" />
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border border-white overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="pt-12 pb-8 flex flex-col items-center text-center px-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
              <CheckCircle2 size={40} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Application Logged</h3>
          <p className="text-sm font-medium text-slate-400 mt-2 leading-relaxed">Your request has been synchronized with the central database.</p>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button onClick={onClose} className="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all active:scale-95 shadow-xl cursor-pointer">
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  </>
);

const EmployeeLeaveAdd = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [leave, setLeave] = useState({ leaveType: "", startDate: "", endDate: "", reason: "" });
  const [balance, setBalance] = useState({ casual: 12, sick: 12 });
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [daysCount, setDaysCount] = useState(0);

  // Helper: Format to YYYY-MM-DD using Local Time
  const toLocalYMD = (dateInput) => {
    const d = new Date(dateInput);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // Logic to calculate working days (Excluding Weekends & Holidays)
  const calculateWorkingDays = useCallback((start, end, holidayList) => {
    if (!start || !end) return 0;
    let count = 0;
    let cur = new Date(start);
    const stop = new Date(end);
    
    // Normalize to midnight local time
    cur.setHours(0,0,0,0);
    stop.setHours(0,0,0,0);
    
    // Memoize holiday strings for faster lookup
    const holidayStrings = new Set(holidayList.map(h => 
      typeof h === 'string' ? h : toLocalYMD(h.date || h)
    ));

    while (cur <= stop) {
      const dayOfWeek = cur.getDay(); // 0 = Sunday, 6 = Saturday
      const dateStr = toLocalYMD(cur);
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayStrings.has(dateStr)) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      try {
        setFetchingData(true);
        const [holidayRes, leaveHistoryRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/all`, { headers }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/leave/${user._id}/employee`, { headers })
        ]);
        
        const hData = holidayRes?.data?.holidays || [];
        setHolidays(hData);

        const approvedLeaves = leaveHistoryRes?.data?.leaves || [];
        
        const casualUsed = approvedLeaves
          .filter(l => l.status === "Approved" && l.leaveType === "Casual Leave")
          .reduce((total, l) => total + calculateWorkingDays(l.startDate, l.endDate, hData), 0);

        const sickUsed = approvedLeaves
          .filter(l => l.status === "Approved" && l.leaveType === "Sick Leave")
          .reduce((total, l) => total + calculateWorkingDays(l.startDate, l.endDate, hData), 0);

        setBalance({ 
          casual: Math.max(0, 12 - casualUsed), 
          sick: Math.max(0, 12 - sickUsed) 
        });
      } catch (e) { 
        console.error("Data Fetch Error:", e); 
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, [user?._id, calculateWorkingDays]);

  // Real-time days counter
  useEffect(() => {
    if (leave.startDate && leave.endDate) {
      const count = calculateWorkingDays(leave.startDate, leave.endDate, holidays);
      setDaysCount(count);
    } else {
      setDaysCount(0);
    }
  }, [leave.startDate, leave.endDate, holidays, calculateWorkingDays]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const currentBalance = leave.leaveType === "Sick Leave" ? balance.sick : balance.casual;
    if (daysCount > currentBalance) {
      alert("Insufficient leave balance.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/leave/add`, 
        { ...leave, days: daysCount, userId: user._id }, 
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.data?.success) {
        setShowAlert(true);
        setTimeout(() => navigate(`/employee-dashboard/leaves/${user._id}`), 2000);
      }
    } catch (err) { 
      alert(err?.response?.data?.error || "Submission failed. Please try again."); 
    } finally { 
      setLoading(false); 
    }
  };

  const isInsufficient = (leave.leaveType === "Sick Leave" && daysCount > balance.sick) || 
                         (leave.leaveType === "Casual Leave" && daysCount > balance.casual);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-slate-50 to-rose-50 flex items-center p-4 sm:p-10 selection:bg-rose-200">
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: STATS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-red-600 rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <ShieldCheck className="text-emerald-400 mb-4" size={20} />
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Registry Terminal</h2>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Active Session: {user?.name || "Verified"}</p>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-20">
              <TrendingUp size={150} className="text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Casual Leave Card */}
            <div className={`bg-white p-6 rounded-[2rem] border-2 transition-all duration-500 ${leave.leaveType === "Casual Leave" ? "border-rose-500 shadow-rose-100" : "border-transparent shadow-xl"}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Casual Balance</span>
                <div className={`w-2 h-2 rounded-full ${fetchingData ? 'animate-pulse bg-slate-200' : balance.casual > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              </div>
              <div className="text-3xl font-black text-slate-900 italic tracking-tighter">
                {fetchingData ? "..." : balance.casual}
              </div>
              <p className="text-[7px] font-bold text-slate-300 uppercase mt-1">Working Days Available</p>
            </div>

            {/* Sick Leave Card */}
            <div className={`bg-white p-6 rounded-[2rem] border-2 transition-all duration-500 ${leave.leaveType === "Sick Leave" ? "border-blue-500 shadow-blue-100" : "border-transparent shadow-xl"}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sick Balance</span>
                <div className={`w-2 h-2 rounded-full ${fetchingData ? 'animate-pulse bg-slate-200' : balance.sick > 0 ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              </div>
              <div className="text-3xl font-black text-slate-900 italic tracking-tighter">
                {fetchingData ? "..." : balance.sick}
              </div>
              <p className="text-[7px] font-bold text-slate-300 uppercase mt-1">Medical Credit Available</p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: FORM */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="flex justify-between items-end mb-10">
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">New Application</h3>
              <div className="text-right">
                <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Total Working Days</p>
                <p className={`text-xl font-black leading-none transition-colors ${isInsufficient ? 'text-red-600' : 'text-emerald-600'}`}>
                  {daysCount} Days
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Category Select */}
              <div className="relative">
                <label className="absolute -top-3 left-1 bg-white px-2 text-[8px] font-black uppercase text-rose-600 tracking-widest z-10">Leave Category</label>
                <select 
                  name="leaveType" 
                  value={leave.leaveType} 
                  onChange={(e) => setLeave(p => ({...p, leaveType: e.target.value}))} 
                  required 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-100 focus:bg-white p-4 rounded-2xl font-bold text-slate-700 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Category</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                </select>
                <Briefcase size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black uppercase text-slate-400 tracking-widest z-10">Start Date</label>
                  <input 
                    type="date" 
                    min={toLocalYMD(new Date())}
                    value={leave.startDate} 
                    onChange={(e) => setLeave(p => ({...p, startDate: e.target.value}))} 
                    required 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-100 focus:bg-white p-5 rounded-2xl font-bold text-slate-700 outline-none transition-all" 
                  />
                </div>
                <div className="relative">
                  <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black uppercase text-slate-400 tracking-widest z-10">End Date</label>
                  <input 
                    type="date" 
                    min={leave.startDate || toLocalYMD(new Date())}
                    value={leave.endDate} 
                    onChange={(e) => setLeave(p => ({...p, endDate: e.target.value}))} 
                    required 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-100 focus:bg-white p-5 rounded-2xl font-bold text-slate-700 outline-none transition-all" 
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="relative">
                <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black uppercase text-slate-400 tracking-widest z-10">Justification</label>
                <textarea 
                  rows="3" 
                  value={leave.reason} 
                  onChange={(e) => setLeave(p => ({...p, reason: e.target.value}))} 
                  required
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-100 focus:bg-white p-5 rounded-2xl font-medium text-slate-600 outline-none transition-all resize-none placeholder:text-slate-200" 
                  placeholder="Provide context for your leave request..." 
                />
              </div>

              {/* Conditional Alerts */}
              {leave.startDate && leave.endDate && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  {daysCount === 0 && (
                    <div className="bg-amber-50 p-4 rounded-2xl flex items-center gap-3 border border-amber-100">
                      <AlertTriangle className="text-amber-500" size={18} />
                      <p className="text-[10px] font-black uppercase text-amber-700 tracking-tight">Range only contains non-working days.</p>
                    </div>
                  )}
                  {isInsufficient && (
                    <div className="bg-red-50 p-4 rounded-2xl flex items-center gap-3 border border-red-100">
                      <AlertTriangle className="text-red-500" size={18} />
                      <p className="text-[10px] font-black uppercase text-red-700 tracking-tight">Requested days exceed available balance.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading || daysCount <= 0 || isInsufficient || !leave.leaveType} 
                className="w-full flex items-center justify-center gap-4 py-4 rounded-[2rem] bg-slate-900 hover:bg-rose-600 text-[11px] font-black uppercase tracking-[0.3em] text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale cursor-pointer group"
              >
                <span className="relative z-10 flex items-center justify-center gap-4">
                  {loading ? "Transmitting..." : "Submit Application"}
                  <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform" />
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeaveAdd;