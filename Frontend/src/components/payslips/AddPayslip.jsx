import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  Eye,
  PlusCircle,
  History,
  IndianRupee,
  CheckCircle2,
  X
} from "lucide-react";

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] animate-fade-in" />
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden animate-pop">
        <div className="h-2 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />
        <div className="p-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Payslip Issued</h3>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            The payroll document has been securely uploaded and linked to the employee record.
          </p>
          <button
            onClick={onClose}
            className="w-full mt-8 py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-lg active:scale-95"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  </>
);

const AddPayslip = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    month: "",
    basicSalary: "",
    allowances: "",
    deductions: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [payslips, setPayslips] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchPayslips = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/payslip/employee/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPayslips(res.data.payslips || []);
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload a PDF payslip");
    setLoading(true);

    try {
      const data = new FormData();
      data.append("employeeId", id);
      data.append("month", form.month);
      data.append("basicSalary", form.basicSalary);
      data.append("allowances", form.allowances || 0);
      data.append("deductions", form.deductions || 0);
      data.append("payslip", file);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payslip/add`,
        data,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data.success) {
        setShowAlert(true);
        setForm({ month: "", basicSalary: "", allowances: "", deductions: "" });
        setFile(null);
        fetchPayslips();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add payslip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-4 md:p-8">
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}

      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-black text-red-700 uppercase italic tracking-tighter flex items-center gap-3">
              <PlusCircle className="text-red-500" /> Payroll Entry
            </h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Generate Monthly Compensation Records</p>
          </div>
          <button onClick={() => navigate(-1)} className="p-3 rounded-xl hover:bg-white hover:shadow-sm text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* FORM COLUMN */}
          <div className="lg:col-span-5">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white p-8 sticky top-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <Input label="Statement Month" name="month" value={form.month} onChange={handleChange} placeholder="e.g. March 2026" required icon={<CalendarIcon />} />
                
                <div className="grid grid-cols-1 gap-4">
                  <Input label="Basic Salary" name="basicSalary" type="number" value={form.basicSalary} onChange={handleChange} placeholder="0.00" required icon={<IndianRupee size={14}/>} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Allowances" name="allowances" type="number" value={form.allowances} onChange={handleChange} placeholder="0" icon={<PlusCircle size={14}/>} />
                    <Input label="Deductions" name="deductions" type="number" value={form.deductions} onChange={handleChange} placeholder="0" icon={<X size={14}/>} />
                  </div>
                </div>

                {/* UPLOAD BOX */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Document Attachment</p>
                  <label className={`group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-[2rem] transition-all cursor-pointer ${file ? 'border-green-400 bg-green-50/30' : 'border-slate-200 hover:border-red-400 hover:bg-red-50/30'}`}>
                    <UploadCloud className={`mb-2 transition-transform group-hover:-translate-y-1 ${file ? 'text-green-500' : 'text-slate-300 group-hover:text-red-500'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {file ? file.name : "Drop PDF Here"}
                    </span>
                    <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                  </label>
                </div>

                <button
                  disabled={loading}
                  className="w-full py-5 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-red-200 hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer overflow-hidden"
                >
                  {loading ? "Finalizing Entry..." : "Issue Statement"}
                </button>
              </form>
            </div>
          </div>

          {/* HISTORY COLUMN */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-6">
              <History size={18} className="text-slate-400" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vault History</h4>
            </div>

            {listLoading ? (
               <div className="animate-pulse space-y-4">
                 {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-3xl border border-slate-100" />)}
               </div>
            ) : payslips.length === 0 ? (
              <div className="bg-white/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 py-20 text-center">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No history found for this employee</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payslips.map(p => (
                  <div key={p._id} className="group flex items-center justify-between bg-white rounded-[1.5rem] p-5 border border-slate-100 hover:border-red-100 hover:shadow-lg hover:shadow-red-900/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 tracking-tight">{p.month}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[9px] font-black uppercase text-green-600">Net: ₹{p.netSalary}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-200" />
                           <span className="text-[9px] font-black uppercase text-slate-400">ID: {p._id.slice(-6)}</span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={p.payslipFile}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-90"
                    >
                      <Eye size={16} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

/* ===== COMPONENTS ===== */
const Input = ({ label, icon, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <div className="relative flex items-center">
      <div className="absolute left-4 text-slate-300 group-focus-within:text-red-500">
        {icon}
      </div>
      <input
        {...props}
        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all"
      />
    </div>
  </div>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

export default AddPayslip;