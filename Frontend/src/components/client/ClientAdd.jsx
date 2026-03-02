import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  UserPlus, Camera, CheckCircle2, Eye, EyeOff, ChevronLeft
} from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const SuccessAlert = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" />
    <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 text-center animate-in zoom-in-95 duration-300">
      <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mx-auto mb-6">
        <CheckCircle2 size={40} strokeWidth={2.5} />
      </div>
      <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">Onboarded!</h3>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2 mb-8">Client record has been initialized.</p>
      <button onClick={onClose} className="w-full py-4 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-600 transition-all active:scale-95 shadow-lg">
        Back to List
      </button>
    </div>
  </div>
);

/* ================= MAIN COMPONENT ================= */
const AddClient = () => {
  const [formData, setFormData] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "companyLogo") {
      const file = files[0];
      if (!file || file.size > MAX_FILE_SIZE) return;
      setFormData((p) => ({ ...p, companyLogo: file }));
      setPreview(URL.createObjectURL(file));
      return;
    }
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    Object.keys(formData).forEach((key) => fd.append(key, formData[key]));
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/client/add`, fd, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        setShowAlert(true);
        setTimeout(() => navigate("/admin-dashboard/clients"), 1800);
      }
    } catch (error) {
      alert(error.response?.data?.error || "Submission error");
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "w-full bg-slate-50 border border-slate-100 focus:border-red-200 focus:bg-white focus:ring-4 focus:ring-red-500/5 rounded-2xl px-5 py-3.5 outline-none transition-all placeholder:text-slate-300";
  const punchyInput = `${inputBase} text-xs font-black uppercase italic tracking-tight`;
  const manualCaseInput = `${inputBase} text-sm font-bold normal-case not-italic`;
  const labelCls = "text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block ml-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 text-slate-900 p-4 lg:p-10">
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* PHOTO SIDEBAR */}
            <div className="lg:col-span-4 bg-slate-50/50 p-10 border-r border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="relative group mb-6">
                <div className="w-40 h-40 rounded-[3rem] bg-white p-2 shadow-2xl transition-transform group-hover:rotate-2">
                  <img src={preview || "/default-avatar.png"} alt="preview" className="w-full h-full object-cover rounded-[2.5rem]" />
                </div>
                <label className="absolute -bottom-2 -right-2 w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white cursor-pointer shadow-xl hover:bg-red-600 transition-all hover:scale-110">
                  <Camera size={20} />
                  <input type="file" name="companyLogo" accept="image/*" className="hidden" onChange={handleChange} />
                </label>
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">New <span className="text-red-600">Client</span></h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Initialize Registry Entry</p>
            </div>
            {/* FORM AREA */}
            <div className="lg:col-span-8 p-8 lg:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* IDENTIFICATION SECTION */}
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-6 flex items-center gap-2">
                    <UserPlus size={14}/> Primary Identification
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Client Name</label>
                      <input name="name" placeholder="CLIENT NAME" required onChange={handleChange} className={punchyInput} />
                    </div>
                    <div>
                      <label className={labelCls}>Email Address (Manual Case)</label>
                      <input name="email" type="email" placeholder="email address" required onChange={handleChange} className={manualCaseInput} />
                    </div>
                    <div>
                      <label className={labelCls}>Access Key (Manual Case)</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          name="password" 
                          placeholder="Access Key" 
                          required 
                          onChange={handleChange} 
                          className={manualCaseInput} 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Date of Onboarding</label>
                      <input type="date" name="dateOfJoining" onChange={handleChange} className={punchyInput} />
                    </div>
                  </div>
                </section>
                {/* BUSINESS SECTION */}
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Business Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    <div>
                      <label className={labelCls}>Plan Type</label>
                      <select name="planType" onChange={handleChange} className={punchyInput}>
                        <option value="">SELECT PLAN</option>
                        <option value="Annual">ANNUAL PREMIUM</option>
                        <option value="Quarterly">QUARTERLY STANDARD</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Budget (INR)</label>
                      <input type="number" name="budget" placeholder="BUDGET" onChange={handleChange} className={punchyInput} />
                    </div>
                  </div>
                </section>
                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-4 pt-4">
                  <button type="button" onClick={() => navigate(-1)} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-all cursor-pointer">
                    Discard
                  </button>
                  <button 
                    disabled={loading} 
                    className="flex-1 py-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:from-red-600 hover:to-rose-500 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? "INITIALIZING..." : "EXECUTE ONBOARDING"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClient;