import React, { useState, useEffect } from "react";
import axios from "axios";
import { Edit2, ImagePlus, Trash2, Megaphone, MapPin, Calendar, Activity, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { NavLink } from "react-router-dom";

/* ================= PROTOCOL: DELETE CONFIRMATION ================= */
const ConfirmDeleteAlert = ({ onConfirm, onCancel }) => (
  <>
    <div className="fixed inset-0 bg-red-950/40 backdrop-blur-md z-[60] animate-in fade-in duration-300" />
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="h-2 bg-red-600" />
        <div className="p-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-6">
            <AlertCircle size={40} strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-red-950">Confirm <span className="text-red-600">Erasure</span></h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 leading-relaxed">This announcement will be <br /> purged from all public feeds.</p>
        </div>
        <div className="flex gap-3 px-8 pb-8">
          <button onClick={onCancel} className="w-1/2 py-4 rounded-2xl bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Abort</button>
          <button onClick={onConfirm} className="w-1/2 py-4 rounded-2xl bg-red-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all">Execute</button>
        </div>
      </div>
    </div>
  </>
);

/* ================= PROTOCOL: SUCCESS ================= */
const DeleteSuccessAlert = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-red-950/20 backdrop-blur-sm z-[60]" />
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-white overflow-hidden text-center p-8 animate-in zoom-in-95">
        <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
        <h3 className="text-xl font-black uppercase italic tracking-tighter text-red-950">Update Complete</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 mb-6">The broadcast has been terminated.</p>
        <button onClick={onClose} className="w-full py-4 rounded-2xl bg-red-950 text-white text-[9px] font-black uppercase tracking-widest">Acknowledge</button>
      </div>
    </div>
  </>
);

const AdminAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "Annual",
    date: "",
    venue: "",
    status: "Upcoming",
    image: null,
  });

  const token = localStorage.getItem("token");

  const fetchAnnouncements = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(Array.isArray(data?.announcements) ? data.announcements : []);
    } catch { setError("System Sync Failed"); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/announcements/add`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setForm({ title: "", description: "", type: "Annual", date: "", venue: "", status: "Upcoming", image: null });
      fetchAnnouncements();
    } catch { setError("Directive Failed"); } finally { setLoading(false); }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/announcements/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteId(null);
      setShowSuccess(true);
      fetchAnnouncements();
    } catch { setError("Purge Failed"); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-6 md:p-10">
      {deleteId && <ConfirmDeleteAlert onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />}
      {showSuccess && <DeleteSuccessAlert onClose={() => setShowSuccess(false)} />}

      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest mb-4">
            <Megaphone size={12} fill="currentColor" /> Communication Hub
          </div>
          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-red-950">
            Broadcast <span className="text-red-600">Control</span>
          </h2>
        </div>

        {/* MAIN INTERFACE GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* LEFT: ADD FORM */}
          <div className="xl:col-span-5">
            <div className="sticky top-10 bg-white/70 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white shadow-2xl">
              <h3 className="text-lg font-black uppercase italic tracking-tighter text-red-950 mb-6">New Directive</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required placeholder="EVENT TITLE" className="w-full bg-white border-2 border-transparent focus:border-red-500 rounded-2xl px-5 py-4 text-[11px] font-bold uppercase tracking-wider outline-none transition-all shadow-inner" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value.toUpperCase() })} />
                
                <div className="grid grid-cols-2 gap-4">
                    <select className="bg-white border-2 border-transparent focus:border-red-500 rounded-2xl px-4 py-4 text-[11px] font-bold uppercase tracking-wider outline-none shadow-inner" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                        <option>Annual</option>
                        <option>Quarterly</option>
                    </select>
                    <select className="bg-white border-2 border-transparent focus:border-red-500 rounded-2xl px-4 py-4 text-[11px] font-bold uppercase tracking-wider outline-none shadow-inner" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option>Upcoming</option>
                        <option>Ongoing</option>
                        <option>Completed</option>
                    </select>
                </div>

                <textarea rows="3" placeholder="BRIEF DESCRIPTION..." className="w-full bg-white border-2 border-transparent focus:border-red-500 rounded-2xl px-5 py-4 text-[11px] font-bold uppercase tracking-wider outline-none shadow-inner resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

                <div className="grid grid-cols-2 gap-4">
                    <input type="date" required className="bg-white border-2 border-transparent focus:border-red-500 rounded-2xl px-4 py-4 text-[11px] font-bold outline-none shadow-inner" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                    <input required placeholder="VENUE" className="bg-white border-2 border-transparent focus:border-red-500 rounded-2xl px-4 py-4 text-[11px] font-bold uppercase tracking-wider outline-none shadow-inner" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
                </div>

                <label className="flex flex-col items-center justify-center w-full h-32 rounded-3xl border-2 border-dashed border-red-200 bg-red-50/30 hover:bg-red-50 cursor-pointer transition-all">
                  <ImagePlus size={24} className="text-red-400 mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-red-900/60">{form.image ? form.image.name : "Attach Visual Media"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} />
                </label>

                <button disabled={loading} className="w-full py-5 rounded-[2rem] bg-red-950 text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Authorize & Broadcast"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: ANNOUNCEMENT FEED */}
          <div className="xl:col-span-7">
             <h3 className="text-lg font-black uppercase italic tracking-tighter text-red-950 mb-6 flex items-center gap-2">
                <Activity size={18} className="text-red-600" /> Active Archives
             </h3>
             <div className="grid grid-cols-1 gap-6">
                {announcements.map((item) => (
                  <div key={item._id} className="group flex flex-col md:flex-row bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                    {item.image && (
                      <div className="md:w-48 h-48 md:h-auto overflow-hidden">
                        <img src={item.image} alt="brief" className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                      </div>
                    )}
                    <div className="p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] font-black bg-red-950 text-white px-3 py-1 rounded-full uppercase tracking-widest">{item.type}</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${item.status === 'Upcoming' ? 'text-emerald-500' : 'text-slate-400'}`}>// {item.status}</span>
                        </div>
                        <h4 className="text-xl font-black uppercase italic tracking-tighter text-red-950 group-hover:text-red-600 transition-colors">{item.title}</h4>
                        <p className="text-[11px] font-medium text-slate-500 mt-2 line-clamp-2 leading-relaxed uppercase tracking-tight">{item.description}</p>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-red-50 pt-4">
                        <div className="flex gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(item.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><MapPin size={12} /> {item.venue}</span>
                        </div>
                        <div className="flex gap-2">
                            <NavLink to={`/admin-dashboard/announcement/edit/${item._id}`} className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"><Edit2 size={14} /></NavLink>
                            <button onClick={() => setDeleteId(item._id)} className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncement;