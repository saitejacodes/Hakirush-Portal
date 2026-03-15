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
  ChevronLeft 
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
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2 mb-8">Employee record has been initialized.</p>
      <button onClick={onClose} className="w-full py-4 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-600 transition-all active:scale-95 shadow-lg">
        Back to List
      </button>
    </div>
  </div>
);

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
      } catch (error) { console.error(error); } 
      finally { setLoadingDept(false); }
    };
    loadDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage") {
      const file = files[0];
      if (!file || file.size > MAX_FILE_SIZE) return;
      setFormData(p => ({ ...p, profileImage: file }));
      setPreview(URL.createObjectURL(file));
      return;
    }
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    Object.keys(formData).forEach(key => fd.append(key, formData[key]));
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/employee/add`, fd, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.data.success) {
        setShowAlert(true);
        setTimeout(() => navigate("/admin-dashboard/employees"), 1800);
      }
    } catch (error) { alert(error.response?.data?.error || "Submission error"); } 
    finally { setLoading(false); }
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
                  <input type="file" name="profileImage" accept="image/*" className="hidden" onChange={handleChange} />
                </label>
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">New <span className="text-red-600">Personnel</span></h2>
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
                      <label className={labelCls}>Full Name</label>
                      <input name="name" placeholder="FULL NAME" required onChange={handleChange} className={punchyInput} />
                    </div>
                    <div>
                      <label className={labelCls}>Email Address (Manual Case)</label>
                      <input name="email" type="email" placeholder="email address" required onChange={handleChange} className={manualCaseInput} />
                    </div>
                    <div>
                      <label className={labelCls}>Identity No.</label>
                      <input name="employeeId" placeholder="IDENTITY NO." required onChange={handleChange} className={punchyInput} />
                    </div>
                    <div>
                      <label className={labelCls}>Aadhar Card</label>
                      <input name="aadharcard" placeholder="AADHAR NUMBER" onChange={handleChange} className={manualCaseInput} />
                    </div>
                    <div>
                      <label className={labelCls}>PAN Card</label>
                      <input name="pancard" placeholder="PAN NUMBER" onChange={handleChange} className={manualCaseInput} />
                    </div>
                    <div>
                      <label className={labelCls}>PF Number</label>
                      <input name="pfNumber" placeholder="PF NUMBER" onChange={handleChange} className={manualCaseInput} />
                    </div>
                    <div>
                      <label className={labelCls}>Password (Manual Case)</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          name="password" 
                          placeholder="Password" 
                          required 
                          onChange={handleChange} 
                          className={manualCaseInput} 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* EMPLOYMENT SECTION */}
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Work Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    <div>
                      <label className={labelCls}>Department</label>
                      <select name="department" required onChange={handleChange} className={punchyInput}>
                        <option value="">{loadingDept ? "SYNCING..." : "DEPARTMENT"}</option>
                        {departments.map((d) => <option key={d._id} value={d._id}>{d.dep_name.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>System Role</label>
                      <select name="role" required onChange={handleChange} className={punchyInput}>
                        <option value="">ROLE</option>
                        <option value="admin">ADMIN</option>
                        <option value="employee">EMPLOYEE</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Designation</label>
                      <input name="designation" placeholder="DESIGNATION" required onChange={handleChange} className={punchyInput} />
                    </div>
                    <div>
                      <label className={labelCls}>Exp (Years)</label>
                      <input type="number" name="experience" placeholder="EXP" required onChange={handleChange} className={punchyInput} />
                    </div>
                    <div>
                      <label className={labelCls}>Salary (LPA)</label>
                      <input type="number" name="salary" placeholder="SALARY" required onChange={handleChange} className={punchyInput} />
                    </div>
                    <div>
                      <label className={labelCls}>Blood Group</label>
                      <select name="bloodGroup" required onChange={handleChange} className={punchyInput}>
                        <option value="">SELECT</option>
                        {["A+", "B+", "O+", "AB+", "A-", "B-"].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
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

export default Add;