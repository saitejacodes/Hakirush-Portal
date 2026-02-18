import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const SuccessAlert = ({ onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center z-[70] px-4">
    <div className="fixed inset-0 bg-red-950/40 backdrop-blur-md" />
    <div className="relative w-full max-w-sm rounded-[2.5rem] bg-white p-8 text-center shadow-2xl animate-in zoom-in-95">
      <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-6">
        <CheckCircle2 size={40} />
      </div>
      <h3 className="text-2xl font-black uppercase italic text-red-950">Holiday Locked</h3>
      <button onClick={onClose} className="mt-6 w-full py-4 rounded-2xl bg-red-950 text-white font-black uppercase text-[10px] tracking-widest">Continue</button>
    </div>
  </div>
);

const AddHoliday = () => {
  const [holiday, setHoliday] = useState({ title: "", date: "" });
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/add`, holiday, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setShowAlert(true);
      setTimeout(() => navigate("/admin-dashboard/holidays"), 1500);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-6">
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}
      <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-xl">
        <h2 className="text-3xl font-black text-red-950 uppercase italic text-center mb-8">New <span className="text-red-600">Holiday</span></h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Event Title" className="w-full p-4 bg-slate-50 rounded-2xl font-bold uppercase outline-red-500" onChange={e => setHoliday({...holiday, title: e.target.value})} />
          <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-red-500" onChange={e => setHoliday({...holiday, date: e.target.value})} />
          <button className="w-full py-4 bg-red-950 text-white font-black rounded-2xl uppercase tracking-widest hover:bg-red-600 transition-all">
            {loading ? "Syncing..." : "Authorize"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default AddHoliday;