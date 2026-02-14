import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ImagePlus, Loader2, CheckCircle2, ChevronLeft, AlertCircle } from "lucide-react";

/* ================= PROTOCOL: SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-red-950/20 backdrop-blur-sm z-[60]" />
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-white overflow-hidden text-center p-8 animate-in zoom-in-95">
        <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
        <h3 className="text-xl font-black uppercase italic tracking-tighter text-red-950">Record Modified</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 mb-6">Database has been synchronized successfully.</p>
        <button onClick={onClose} className="w-full py-4 rounded-2xl bg-red-950 text-white text-[9px] font-black uppercase tracking-widest">Return to Hub</button>
      </div>
    </div>
  </>
);

const EditAnnouncement = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/announcements/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const a = res.data?.announcement || res.data;
        if (!a || !a._id) throw new Error("Missing ID");

        setForm({
          title: a.title || "",
          type: a.type || "Annual",
          date: a.date ? new Date(a.date).toISOString().split("T")[0] : "",
          venue: a.venue || "",
          status: a.status || "Upcoming",
          image: null,
        });
      } catch { setError("Access Failed: Record Unreachable"); } finally { setFetching(false); }
    };
    if (token) fetchAnnouncement();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => { if (value) formData.append(key, value); });

      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/announcements/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setShowAlert(true);
      setTimeout(() => navigate("/admin-dashboard/announcement"), 1800);
    } catch { setError("System Rejection: Update Interrupted"); } finally { setLoading(false); }
  };

  if (!token) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-red-600">Unauthorized Access</div>;

  if (fetching) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
      <Loader2 size={32} className="animate-spin text-red-600 mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-900/40">Decrypting Brief...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-6 md:p-12">
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}

      <div className="max-w-2xl mx-auto">
        {/* BACK BUTTON */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-red-950/40 hover:text-red-600 transition-colors mb-8 group cursor-pointer">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Ledger</span>
        </button>

        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white overflow-hidden p-8 md:p-12">
          {/* HEADER */}
          <div className="mb-10">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-red-950">
              Modify <span className="text-red-600">Directive</span>
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Editing Brief ID: <span className="text-red-600">{id.slice(-8).toUpperCase()}</span></p>
          </div>

          {error && (
            <div className="mb-8 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-red-950 ml-2">Headline</label>
                <input required className="w-full bg-white border-2 border-transparent focus:border-red-500 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-wider outline-none transition-all shadow-inner" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value.toUpperCase() })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-red-950 ml-2">Category</label>
                <select className="w-full bg-white border-2 border-transparent focus:border-red-500 rounded-2xl px-5 py-4 text-xs font-bold uppercase tracking-wider outline-none shadow-inner" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option>Annual</option>
                  <option>Quarterly</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-red-950 ml-2">Timeline</label>
                <input type="date" required className="w-full bg-white border-2 border-transparent focus:border-red-500 rounded-2xl px-5 py-4 text-xs font-bold outline-none shadow-inner" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-red-950 ml-2">Location/Venue</label>
                <input required className="w-full bg-white border-2 border-transparent focus:border-red-500 rounded-2xl px-5 py-4 text-xs font-bold uppercase tracking-wider outline-none shadow-inner" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-red-950 ml-2">Protocol Status</label>
                <select className="w-full bg-white border-2 border-transparent focus:border-red-500 rounded-2xl px-5 py-4 text-xs font-bold uppercase tracking-wider outline-none shadow-inner" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option>Upcoming</option>
                  <option>Ongoing</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>

            {/* IMAGE UPLOAD SECTION */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-red-950 ml-2">Visual Media Replacement (Optional)</label>
              <label className="flex flex-col items-center justify-center w-full h-40 rounded-[2rem] border-2 border-dashed border-red-200 bg-red-50/20 hover:bg-red-50 cursor-pointer transition-all group">
                <ImagePlus size={32} className="text-red-400 group-hover:scale-110 transition-transform mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-red-900/60">
                  {form.image ? form.image.name : "Select New Asset"}
                </p>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} />
              </label>
            </div>

            <button disabled={loading} className="w-full py-6 rounded-[2rem] bg-red-950 text-white font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:bg-red-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed">
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Commit Changes to System"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAnnouncement;