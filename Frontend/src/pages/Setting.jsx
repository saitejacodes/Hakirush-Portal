import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import axios from "axios";
import { Eye, EyeOff, ShieldCheck, Lock, KeyRound, AlertCircle } from "lucide-react";

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] animate-fade-in" />
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden animate-pop">
        <div className="h-2 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />
        <div className="p-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ShieldCheck size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Security Updated</h3>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Your credentials have been successfully reset. Please use your new password for future logins.
          </p>
          <button
            onClick={onClose}
            className="w-full mt-8 py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-lg active:scale-95"
          >
            Acknowledge
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

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSetting({ ...setting, [name]: value });
    if (error) setError("");
  };

  const togglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!setting.oldPassword || !setting.newPassword || !setting.confirmPassword) {
      return setError("Please complete all security fields.");
    }
    if (setting.newPassword !== setting.confirmPassword) {
      return setError("New passwords do not match.");
    }

    try {
      setLoading(true);
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/setting/change-password`,
        setting,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data.success) {
        setShowAlert(true);
        setSetting({ ...setting, oldPassword: "", newPassword: "", confirmPassword: "" });
        // Redirect logic handled by Alert onClose or timeout
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Security update failed. Verification error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-slate-100 flex items-center justify-center p-4">
      {showAlert && (
        <SuccessAlert 
          onClose={() => {
            setShowAlert(false);
            navigate("/admin-dashboard/employees");
          }} 
        />
      )}

      <div className="w-full max-w-md">
        {/* TOP BADGE */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-3xl shadow-xl border border-red-50">
            <Lock className="text-red-600" size={32} />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">
              Security <span className="text-red-600 font-black">Vault</span>
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Update Personnel Credentials</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl animate-shake">
              <AlertCircle size={18} />
              <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordField 
              label="Current Password" 
              name="oldPassword"
              value={setting.oldPassword}
              show={showPassword.old}
              onChange={handleChange}
              toggle={() => togglePassword("old")}
              icon={<KeyRound size={16} />}
            />

            <div className="h-px bg-slate-100 my-2" />

            <PasswordField 
              label="New Password" 
              name="newPassword"
              value={setting.newPassword}
              show={showPassword.new}
              onChange={handleChange}
              toggle={() => togglePassword("new")}
              icon={<ShieldCheck size={16} />}
            />

            <PasswordField 
              label="Verify Password" 
              name="confirmPassword"
              value={setting.confirmPassword}
              show={showPassword.confirm}
              onChange={handleChange}
              toggle={() => togglePassword("confirm")}
              icon={<ShieldCheck size={16} />}
            />

            <button
              disabled={loading}
              className="group relative w-full mt-4 py-5 rounded-2xl bg-red-800 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-50 overflow-hidden cursor-pointer"
            >
              <span className="relative z-10">{loading ? "Updating Records..." : "Authorize Password Change"}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="w-full text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-red-600 transition-colors py-2 cursor-pointer"
            >
              Cancel Security Update
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ===== SUB-COMPONENT: PASSWORD FIELD ===== */
const PasswordField = ({ label, name, value, show, onChange, toggle, icon }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors">
        {icon}
      </div>
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all"
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

export default EmployeeSetting;