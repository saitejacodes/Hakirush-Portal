import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import axios from "axios";
import { 
  Eye, EyeOff, ShieldCheck, Lock, KeyRound, 
  AlertCircle, ArrowLeft, CheckCircle2, ShieldAlert 
} from "lucide-react";

/* ================= COMPACT SUCCESS MODAL ================= */
const SuccessAlert = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] animate-in fade-in duration-500" />
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div className="w-full max-w-[320px] bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="h-1.5 bg-gradient-to-r from-red-600 to-rose-500" />
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 relative">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Key Updated</h3>
          <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest leading-tight">
            Vault encryption successful.
          </p>
          <button
            onClick={onClose}
            className="w-full mt-6 py-4 rounded-xl bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[9px] hover:bg-red-600 transition-all active:scale-95 cursor-pointer"
          >
            Return to Hub
          </button>
        </div>
      </div>
    </div>
  </>
);

const EmployeeSetting = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [setting, setSetting] = useState({
    userId: user?._id,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const strengthData = useMemo(() => {
    if (!setting.newPassword) return { score: 0, label: "Empty" };
    let score = 0;
    if (setting.newPassword.length >= 8) score += 25;
    if (/[A-Z]/.test(setting.newPassword)) score += 25;
    if (/[0-9]/.test(setting.newPassword)) score += 25;
    if (/[^A-Za-z0-9]/.test(setting.newPassword)) score += 25;
    const labels = ["Insecure", "Weak", "Fair", "Strong", "Elite"];
    return { score, label: labels[Math.floor(score / 25)] || "Insecure" };
  }, [setting.newPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSetting({ ...setting, [name]: value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!setting.oldPassword || !setting.newPassword) return setError("Keys required.");
    if (setting.newPassword !== setting.confirmPassword) return setError("Mismatch detected.");

    try {
      setLoading(true);
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/setting/change-password`,
        setting,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.data.success) setShowAlert(true);
    } catch (err) {
      setError(err?.response?.data?.error || "Link failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex items-center justify-center">
      {showAlert && <SuccessAlert onClose={() => { setShowAlert(false); navigate(-1); }} />}
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-start mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={12} /> Back
          </button>
        </div>

        {/* REDUCED padding from p-16 to p-8 or p-10 */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-10 relative overflow-hidden">
          <ShieldAlert size={140} className="absolute -top-6 -right-6 opacity-[0.03] text-slate-900 pointer-events-none" />

          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full mb-4">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[5px] font-black uppercase tracking-[0.3em] text-white">Encrypted Link</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              Vault <span className="text-red-600">Keys</span>
            </h2>
          </div>

          {error && (
            <div className="mb-6 flex items-center justify-center gap-2 bg-red-50 border-b-2 border-red-500 py-3 px-4 rounded-lg">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <p className="text-[8px] font-black uppercase tracking-widest text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <PasswordField 
              label="Old Master Key" 
              name="oldPassword"
              value={setting.oldPassword}
              show={showPassword.old}
              onChange={handleChange}
              toggle={() => setShowPassword(p => ({...p, old: !p.old}))}
              icon={<KeyRound size={16} />}
            />

            <div className="pt-4 border-t border-slate-50">
              <PasswordField 
                label="New Key" 
                name="newPassword"
                value={setting.newPassword}
                show={showPassword.new}
                onChange={handleChange}
                toggle={() => setShowPassword(p => ({...p, new: !p.new}))}
                icon={<Lock size={16} />}
              />
              
              <div className="mt-3 px-1">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[7px] font-black uppercase tracking-widest text-slate-300">Complexity</span>
                  <span className={`text-[7px] font-black uppercase tracking-widest ${strengthData.score >= 75 ? 'text-emerald-500' : 'text-slate-300'}`}>
                    {strengthData.label}
                  </span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full flex gap-0.5">
                  {[25, 50, 75, 100].map((step) => (
                    <div 
                      key={step}
                      className={`h-full flex-1 rounded-full transition-all duration-700 ${
                        strengthData.score >= step 
                        ? (strengthData.score <= 25 ? 'bg-red-500' : strengthData.score <= 50 ? 'bg-orange-400' : strengthData.score <= 75 ? 'bg-blue-500' : 'bg-emerald-500')
                        : 'bg-slate-50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <PasswordField 
              label="Verify Key" 
              name="confirmPassword"
              value={setting.confirmPassword}
              show={showPassword.confirm}
              onChange={handleChange}
              toggle={() => setShowPassword(p => ({...p, confirm: !p.confirm}))}
              icon={<ShieldCheck size={16} />}
            />

            <div className="pt-6">
              <button
                disabled={loading}
                className="group relative w-full py-4 rounded-xl bg-red-600 text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-lg hover:bg-red-500 transition-all active:scale-[0.98] cursor-pointer overflow-hidden"
              >
                <span className="relative z-10">{loading ? "Encrypting..." : "Update Vault"}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const PasswordField = ({ label, name, value, show, onChange, toggle, icon }) => (
  <div className="space-y-2">
    <label className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{label}</label>
    <div className="relative">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors">
        {icon}
      </div>
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-12 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-red-500 transition-all placeholder:text-slate-200"
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 cursor-pointer"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  </div>
);

export default EmployeeSetting;