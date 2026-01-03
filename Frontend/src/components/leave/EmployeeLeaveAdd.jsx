import React, { useState } from "react";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EmployeeLeaveAdd = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [leave, setLeave] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeave((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/leave/add",
        leave,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data?.success) {
        alert("Leave request submitted");
        navigate(`/employee-dashboard/leaves/${user._id}`);
      }
    } catch (error) {
      alert(error?.response?.data?.error || "Leave submit failed");
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-rose-100 p-6">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border p-8">
        <h3 className="text-center text-3xl font-extrabold text-rose-600 mb-6">
          Request for Leave
        </h3>

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
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-rose-600 text-white font-semibold"
          >
            Add Leave
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeLeaveAdd;