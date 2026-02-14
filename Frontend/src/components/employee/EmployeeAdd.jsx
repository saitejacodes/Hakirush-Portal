import React, { useEffect, useState } from "react";
import axios from "axios";
import { fetchDepartments } from "../../utils/EmployeeHelper";
import { useNavigate } from "react-router-dom";
import { 
  UserPlus, 
  Camera, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ArrowLeft 
} from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => {
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] animate-fade-in" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-white overflow-hidden animate-pop">
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-3xl bg-green-50 flex items-center justify-center text-green-500 mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
              Onboarded!
            </h3>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">
              New employee record created.
            </p>
          </div>
          <div className="px-8 pb-8">
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-xl shadow-slate-200 cursor-pointer"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const Add = () => {
  const [departments, setDepartments] = useState([]);
  const [loadingDept, setLoadingDept] = useState(false);
  const [formData, setFormData] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDept(true);
        const data = await fetchDepartments();
        setDepartments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Dept fetch failed", error);
      } finally {
        setLoadingDept(false);
      }
    };
    loadDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage") {
      const file = files[0];
      if (!file || file.size > MAX_FILE_SIZE) return;
      setFormData((prev) => ({ ...prev, profileImage: file }));
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
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/employee/add`,
        fd,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.data.success) {
        setShowAlert(true);
        setTimeout(() => navigate("/admin-dashboard/employees"), 1800);
      }
    } catch (error) {
      alert(error.response?.data?.error || "Submission error");
    } finally {
      setLoading(false);
    }
  };

  // Base class for most inputs
  const inputBase = "w-full bg-slate-50 border-2 border-transparent focus:border-red-500/20 focus:bg-white rounded-2xl px-5 py-4 text-slate-700 outline-none transition-all placeholder:text-slate-300";
  
  // Style for standard "Punchy" fields (Uppercase/Italic)
  const punchyInput = `${inputBase} text-xs font-black uppercase italic tracking-tight`;
  
  // Style for Manual Casing fields (Email & Password)
  const manualCaseInput = `${inputBase} text-sm font-bold normal-case`;

  return (
    <>
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}

      <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white/70 backdrop-blur-2xl p-8 sm:p-12 rounded-[3rem] shadow-2xl border border-white">
          
          <header className="flex flex-col items-center mb-12">
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-red-100 mb-4">
              <UserPlus size={30} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 uppercase italic tracking-tighter">
              New <span className="text-red-600">Personnel.</span>
            </h2>
          </header>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* PHOTO SECTION */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white p-2 shadow-2xl transition-transform group-hover:scale-105">
                  <img src={preview || "/default-avatar.png"} alt="preview" className="w-full h-full object-cover rounded-[2rem]" />
                </div>
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white cursor-pointer shadow-xl hover:bg-red-600 transition-colors">
                  <Camera size={18} />
                  <input type="file" name="profileImage" accept="image/*" className="hidden" onChange={handleChange} />
                </label>
              </div>
            </div>

            {/* FORM GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <input name="name" placeholder="FULL NAME" required onChange={handleChange} className={punchyInput} />
              
              {/* MANUAL CASE EMAIL */}
              <input 
                name="email" 
                placeholder="email address" 
                type="email" 
                required 
                onChange={handleChange} 
                className={manualCaseInput} 
              />
              
              <input name="employeeId" placeholder="IDENTITY NO." required onChange={handleChange} className={punchyInput} />
              <input type="date" name="dob" required onChange={handleChange} className={punchyInput} />

              <select name="gender" required onChange={handleChange} className={`${punchyInput} appearance-none cursor-pointer`}>
                <option value="">GENDER</option>
                <option>MALE</option><option>FEMALE</option><option>OTHER</option>
              </select>

              <select name="department" required onChange={handleChange} className={`${punchyInput} appearance-none cursor-pointer`}>
                <option value="">{loadingDept ? "SYNCING..." : "DEPARTMENT"}</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.dep_name.toUpperCase()}</option>
                ))}
              </select>

              <input name="designation" placeholder="DESIGNATION" required onChange={handleChange} className={punchyInput} />

              <select name="bloodGroup" required onChange={handleChange} className={`${punchyInput} appearance-none cursor-pointer`}>
                <option value="">BLOOD GROUP</option>
                <option>A+</option><option>B+</option><option>O+</option><option>AB+</option>
              </select>

              <select name="maritalStatus" required onChange={handleChange} className={`${punchyInput} appearance-none cursor-pointer`}>
                <option value="">MARITAL STATUS</option>
                <option>SINGLE</option><option>MARRIED</option>
              </select>

              <input type="number" name="experience" placeholder="EXP (YEARS)" required onChange={handleChange} className={punchyInput} />
              <input type="number" name="salary" placeholder="SALARY (LPA)" required onChange={handleChange} className={punchyInput} />

              {/* MANUAL CASE PASSWORD WITH TOGGLE */}
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  placeholder="Access Key" 
                  required 
                  onChange={handleChange} 
                  className={manualCaseInput} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <select name="role" required onChange={handleChange} className={`${punchyInput} appearance-none cursor-pointer`}>
                <option value="">SYSTEM ROLE</option>
                <option value="admin">ADMIN</option>
                <option value="employee">EMPLOYEE</option>
              </select> 
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-1/3 py-5 rounded-[1.5rem] bg-slate-100 text-slate-500 font-black uppercase text-xs tracking-[0.2em] transition-all hover:bg-slate-200 active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                className="w-2/3 py-5 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-rose-500 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-red-200 transition-all 
                enabled:cursor-pointer enabled:hover:scale-[1.02] enabled:active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "INITIALIZING..." : "EXECUTE ONBOARDING"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Add;