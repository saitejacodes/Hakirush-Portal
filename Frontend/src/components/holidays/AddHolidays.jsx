import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, ArrowLeft, Loader2 } from "lucide-react";

const AddHoliday = () => {
  const [holiday, setHoliday] = useState({ title: "", date: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/holiday/add`,
      holiday,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    navigate("/admin-dashboard/holidays");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-white flex justify-center items-center px-3 py-4">

      <div className="w-full max-w-xl bg-white/70 backdrop-blur-xl border rounded-3xl shadow-2xl p-8">

        <div className="flex flex-col items-center mb-6">
          <div className="bg-red-200 rounded-2xl w-14 h-14 flex justify-center items-center text-red-600 shadow">
            <CalendarPlus size={30} />
          </div>

          <h2 className="text-3xl font-bold mt-3">Add Holiday</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="text-sm font-semibold">Holiday Title</label>
            <input
              required
              placeholder="Independence Day"
              className="w-full border rounded-xl px-4 py-3 mt-1 focus:ring-2 focus:ring-red-500 outline-none"
              onChange={e => setHoliday({ ...holiday, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Date</label>
            <input
              type="date"
              required
              className="w-full border rounded-xl px-4 py-3 mt-1 focus:ring-2 focus:ring-red-500 outline-none"
              onChange={e => setHoliday({ ...holiday, date: e.target.value })}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-1/2 border rounded-xl py-3 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-red-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Adding…
                </>
              ) : (
                "Add Holiday"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddHoliday;