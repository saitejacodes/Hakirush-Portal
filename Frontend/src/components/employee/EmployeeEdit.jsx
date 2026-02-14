import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { fetchDepartments } from "../../utils/EmployeeHelper";
import { UserCog, Camera, CheckCircle2, ArrowLeft } from "lucide-react";

/* ================= IMAGE URL HELPER ================= */
const getImageUrl = (url) => {
  if (!url) return "/default-avatar.png";
  if (url.startsWith("blob:") || url.startsWith("http")) return url;
  return `${import.meta.env.VITE_BACKEND_URL}/${url}`;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => {
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100]" />
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl border border-white overflow-hidden animate-pop">
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-3xl bg-green-50 flex items-center justify-center text-green-500 mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
              Updated!
            </h3>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">
              Personnel record synchronized.
            </p>
          </div>
          <div className="px-8 pb-8">
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-xl shadow-slate-200 cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const EmployeeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [employee, setEmployee] = useState({
    name: "",
    maritalStatus: "",
    designation: "",
    salary: "",
    department: "",
  });

  const [departments, setDepartments] = useState([]);
  const [loadingDept, setLoadingDept] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingDept(true);
        const deptData = await fetchDepartments();
        setDepartments(deptData || []);

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        const emp = res.data.employee;
        setEmployee({
          name: emp?.userId?.name || "",
          maritalStatus: emp?.maritalStatus || "",
          designation: emp?.designation || "",
          salary: emp?.salary || "",
          department: emp?.department?._id || "",
        });
        setPreview(emp?.userId?.profileImage || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingDept(false);
      }
    };
    loadData();
  }, [id]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage") {
      const file = files[0];
      if (!file || file.size > MAX_FILE_SIZE) return;
      setImage(file);
      setPreview(URL.createObjectURL(file));
      return;
    }
    setEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    Object.keys(employee).forEach((key) => fd.append(key, employee[key]));
    if (image) fd.append("profileImage", image);

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}`,
        fd,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.data.success) {
        setShowAlert(true);
        setTimeout(() => navigate("/admin-dashboard/employees"), 1800);
      }
    } catch (error) {
      alert(error.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-50 border-2 border-transparent focus:border-red-500/20 focus:bg-white rounded-2xl px-5 py-4 text-xs font-black uppercase italic tracking-tight text-slate-700 outline-none transition-all placeholder:text-slate-300";

  return (
    <>
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}

      <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white/70 backdrop-blur-2xl p-8 sm:p-12 rounded-[3rem] shadow-2xl border border-white">
          
          <header className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-red-100 mb-4">
              <UserCog size={30} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 uppercase italic tracking-tighter">
              Modify <span className="text-red-600">Personnel.</span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-3">Edit Record ID: {id.slice(-6)}</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* IMAGE UPDATE AREA */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white p-2 shadow-2xl transition-transform group-hover:scale-105">
                  <img
                    src={getImageUrl(preview)}
                    alt="preview"
                    className="w-full h-full object-cover rounded-[2rem] border border-slate-50"
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                  />
                </div>
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white cursor-pointer shadow-xl hover:bg-red-600 transition-colors">
                  <Camera size={18} />
                  <input type="file" name="profileImage" accept="image/*" className="hidden" onChange={handleChange} />
                </label>
              </div>
            </div>

            {/* FORM FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
                <input name="name" value={employee.name} required onChange={handleChange} className={inputClass} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Marital Status</label>
                <select name="maritalStatus" value={employee.maritalStatus} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
                  <option value="">Select Status</option>
                  <option value="Single">SINGLE</option>
                  <option value="Married">MARRIED</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Department</label>
                <select name="department" value={employee.department} required onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
                  <option value="">{loadingDept ? "SYNCING..." : "SELECT DEPT"}</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.dep_name.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Designation</label>
                <input name="designation" value={employee.designation} onChange={handleChange} className={inputClass} />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Salary (LPA)</label>
                <input type="number" name="salary" value={employee.salary} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-1/3 py-5 rounded-[1.5rem] bg-slate-100 text-slate-500 font-black uppercase text-xs tracking-[0.2em] transition-all hover:bg-slate-200 active:scale-95 cursor-pointer"
              >
                Discard
              </button>
              <button
                disabled={loading}
                className="w-2/3 py-5 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-rose-500 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-red-200 transition-all 
                enabled:cursor-pointer enabled:hover:scale-[1.02] enabled:active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "SAVING..." : "UPDATE RECORD"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EmployeeEdit;