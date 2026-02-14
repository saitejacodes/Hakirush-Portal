import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  UserPlus, Mail, Lock, Calendar, 
  CreditCard, DollarSign, Camera, 
  CheckCircle2, Eye, EyeOff 
} from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => {
  return (
    <>
      <div className="fixed inset-0 bg-red-900/20 backdrop-blur-md z-[100] animate-in fade-in duration-300" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div className="relative w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="h-2 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
              Client Added<span className="text-red-600">!</span>
            </h3>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2 leading-relaxed">
              The partner profile has been <br/> successfully initialized.
            </p>
          </div>
          <div className="px-8 pb-8">
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-red-600 text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-xl shadow-red-200 cursor-pointer hover:bg-red-700"
            >
              Acknowledge
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ================= MAIN COMPONENT ================= */
const AddClient = () => {
  const [formData, setFormData] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "companyLogo") {
      const file = files[0];
      if (!file) return;
      if (file.size > MAX_FILE_SIZE) {
        alert("Image must be less than 10MB");
        return;
      }
      setFormData((prev) => ({ ...prev, companyLogo: file }));
      setPreview(URL.createObjectURL(file));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      alert(error.response?.data?.error || "Failed to add client.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "w-full pl-12 pr-12 py-3.5 bg-red-50/30 border border-red-100 rounded-2xl text-sm focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-400/10 transition-all outline-none text-slate-700 font-medium";
  const iconBase = "absolute left-4 top-1/2 -translate-y-1/2 text-red-300 group-focus-within:text-red-600 transition-colors";

  return (
    <>
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(220,38,38,0.1)] border border-white overflow-hidden">
          
          <div className="grid grid-cols-1 md:grid-cols-12">
            
            {/* BRANDING SIDEBAR */}
            <div className="md:col-span-4 bg-gradient-to-b from-red-700 to-red-900 p-10 flex flex-col justify-between text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-12 shadow-xl border border-white/20">
                  <UserPlus className="text-white" size={28} />
                </div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-[0.9] mb-4">
                  Partner <br /> <span className="text-red-200 font-normal not-italic">Sync</span>
                </h1>
                <div className="h-1 w-12 bg-red-400 rounded-full mb-4" />
                <p className="text-red-100/60 text-[10px] font-bold uppercase tracking-[0.3em]">Onboarding Module</p>
              </div>
              <div className="relative z-10 text-[9px] text-red-200/50 font-bold uppercase tracking-widest leading-relaxed">
                Secure encryption enabled. <br /> Initialize partner protocol.
              </div>
            </div>

            {/* FORM SECTION */}
            <div className="md:col-span-8 p-8 sm:p-14 bg-white/50">
              <form onSubmit={handleSubmit} className="space-y-10">
                
                {/* LOGO UPLOAD */}
                <div className="flex flex-col items-center justify-center group">
                  <div className="relative w-32 h-32">
                    <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-red-50 shadow-2xl bg-white transition-transform duration-500 group-hover:scale-105">
                      <img src={preview || "/default-avatar.png"} alt="logo" className="w-full h-full object-cover" />
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-11 h-11 bg-red-600 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:bg-red-700 transition-all hover:rotate-12 z-10 border-4 border-white">
                      <Camera size={20} />
                      <input type="file" name="companyLogo" accept="image/*" className="hidden" onChange={handleChange} />
                    </label>
                  </div>
                  <span className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Corporate Identity</span>
                </div>

                {/* FORM GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="group relative">
                    <UserPlus className={iconBase} size={18} />
                    <input name="name" placeholder="CLIENT NAME" required onChange={handleChange} className={`${inputBase} uppercase`} />
                  </div>

                  <div className="group relative">
                    <Mail className={iconBase} size={18} />
                    <input name="email" placeholder="Email Address" type="email" required onChange={handleChange} className={`${inputBase} normal-case`} />
                  </div>

                  {/* PASSWORD FIELD WITH VIEW ICON */}
                  <div className="group relative">
                    <Lock className={iconBase} size={18} />
                    <input 
                      name="password" 
                      placeholder="Access Password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      onChange={handleChange} 
                      className={`${inputBase} normal-case`} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-red-300 hover:text-red-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="group relative">
                    <Calendar className={iconBase} size={18} />
                    <input type="date" name="dateOfJoining" onChange={handleChange} className={inputBase} />
                  </div>

                  <div className="group relative">
                    <CreditCard className={iconBase} size={18} />
                    <select name="planType" onChange={handleChange} className={`${inputBase} appearance-none cursor-pointer uppercase text-[11px]`}>
                      <option value="">SELECT PLAN</option>
                      <option value="Annual">ANNUAL PREMIUM</option>
                      <option value="Quarterly">QUARTERLY STANDARD</option>
                    </select>
                  </div>

                  <div className="group relative">
                    <DollarSign className={iconBase} size={18} />
                    <input type="number" name="budget" placeholder="BUDGET (INR)" onChange={handleChange} className={`${inputBase} uppercase`} />
                  </div>
                </div>

                <button
                  disabled={loading}
                  className="group relative w-full h-16 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-red-200 overflow-hidden transition-all active:scale-[0.97] disabled:opacity-70 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Establish Partner <UserPlus size={18} /></>
                    )}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddClient;