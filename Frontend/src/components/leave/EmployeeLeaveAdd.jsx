import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />

    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-200 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600" />

        <div className="p-6 flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 text-xl">
            ✓
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-rose-700">
              Leave Submitted
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Your leave request has been submitted successfully.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-rose-600 transition"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:opacity-90 transition"
          >
            Okay, got it
          </button>
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

  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  /* ---------------- FETCH LEAVE BALANCE ---------------- */
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/employee/leave/balance/me`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setBalance(res?.data?.balance ?? 0);
      } catch {
        setBalance(0);
      }
    };
    fetchBalance();
  }, []);

  /* ---------------- HANDLE INPUT CHANGE ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeave((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- HANDLE FORM SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const msInDay = 1000 * 60 * 60 * 24;
    const daysRequested = Math.floor((end - start) / msInDay) + 1;

    if (daysRequested <= 0) {
      return alert("End date must be after start date");
    }

    if (daysRequested > balance) {
      return alert(
        `❌ You have only ${balance} day(s) left but requested ${daysRequested}`
      );
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/leave/add`,
        leave,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

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
      {showAlert && (
        <SuccessAlert onClose={() => setShowAlert(false)} />
      )}

      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-rose-100 p-6">
        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border p-8">

          <h3 className="text-center text-3xl font-extrabold text-rose-600 mb-2">
            Request for Leave
          </h3>

          <p className="text-center text-red-600 font-semibold mb-6">
            🧾 Available Leave Balance:{" "}
            <span className="font-bold">{balance}</span> day(s)
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-medium text-gray-700">Leave Type</label>
              <select
                name="leaveType"
                onChange={handleChange}
                required
                className="w-full p-3 rounded-xl border"
              >
                <option value="">Select Type</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Annual Leave">Annual Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label>From Date</label>
                <input
                  type="date"
                  name="startDate"
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-xl border"
                />
              </div>

              <div>
                <label>To Date</label>
                <input
                  type="date"
                  name="endDate"
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-xl border"
                />
              </div>
            </div>

            <div>
              <label>Description</label>
              <textarea
                name="reason"
                rows="4"
                onChange={handleChange}
                className="w-full p-3 rounded-xl border"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-rose-600 text-white font-semibold disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Submitting..." : "Add Leave"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EmployeeLeaveAdd;