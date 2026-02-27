import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  UploadCloud, CheckCircle2, ArrowLeft, ShieldCheck,
  History, FileText, Wallet, Activity, Receipt
} from "lucide-react";

/* ===== SHARED SUCCESS ALERT COMPONENT ===== */
const SuccessAlert = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" />
    <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 text-center animate-in zoom-in-95 duration-300">
      <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mx-auto mb-6">
        <CheckCircle2 size={40} strokeWidth={2.5} />
      </div>
      <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">Vaulted!</h3>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2 mb-8">
        Financial statement has been securely posted.
      </p>
      <button 
        onClick={onClose} 
        className="w-full py-4 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-600 transition-all active:scale-95 shadow-lg cursor-pointer"
      >
        Dismiss Ledger
      </button>
    </div>
  </div>
);

const AddPayslip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [history, setHistory] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  const [form, setForm] = useState({
    month: "", basicSalary: "", hra: "", conveyanceAllowance: "",
    medicalAllowance: "", bonus: "", providentFund: "",
    professionalTax: "", incomeTax: "", lossOfPay: ""
  });

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/payslip/employee/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setHistory(res.data.payslips || []);
    } catch (err) { console.error(err); } 
    finally { setFetchingHistory(false); }
  };

  useEffect(() => { if (id) fetchHistory(); }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const calculations = useMemo(() => {
    const gross = ["basicSalary", "hra", "conveyanceAllowance", "medicalAllowance", "bonus"]
      .reduce((acc, k) => acc + Number(form[k] || 0), 0);
    const ded = ["providentFund", "professionalTax", "incomeTax", "lossOfPay"]
      .reduce((acc, k) => acc + Number(form[k] || 0), 0);
    return { gross, ded, net: gross - ded };
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload the PDF payslip");
    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    formData.append("employeeId", id);
    formData.append("payslip", file);

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/payslip/add`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.data.success) {
        setShowAlert(true);
        fetchHistory();
        setForm({ month: "", basicSalary: "", hra: "", conveyanceAllowance: "", medicalAllowance: "", bonus: "", providentFund: "", professionalTax: "", incomeTax: "", lossOfPay: "" });
        setFile(null);
      }
    } catch (err) { alert("Error posting payslip"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 text-slate-900 font-sans">
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}

      <nav className="sticky top-0 px-6 py-3 flex justify-between items-center z-50">
        <button onClick={() => navigate(-1)} className="group px-30 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-all cursor-pointer pt-5">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform"/> Back
        </button>
        <div className="flex items-center gap-2 pt-5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Node</span>
          <ShieldCheck size={16} className="text-emerald-500" />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: FORM SECTION */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-end gap-3">
               <h1 className="text-3xl font-black uppercase italic tracking-tighter">Issue <span className="text-red-600">Statement</span></h1>
               <Activity size={20} className="mb-1 text-slate-300 animate-pulse" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-8">
                <div className="w-full md:w-1/3">
                   <Input label="Payroll Month" name="month" type="month" value={form.month} onChange={handleChange} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                  <div className="space-y-4">
                    <SectionLabel icon={<Wallet size={12}/>} title="Earnings" />
                    <Input label="Basic Salary" name="basicSalary" type="number" value={form.basicSalary} onChange={handleChange} />
                    <Input label="HRA" name="hra" type="number" value={form.hra} onChange={handleChange} />
                    <Input label="Bonus" name="bonus" type="number" value={form.bonus} onChange={handleChange} />
                  </div>

                  <div className="space-y-4">
                    <SectionLabel icon={<Receipt size={12}/>} title="Deductions" color="text-red-500" />
                    <Input label="Provident Fund" name="providentFund" type="number" value={form.providentFund} onChange={handleChange} />
                    <Input label="Income Tax" name="incomeTax" type="number" value={form.incomeTax} onChange={handleChange} />
                    <Input label="Loss of Pay" name="lossOfPay" type="number" value={form.lossOfPay} onChange={handleChange} />
                  </div>
                </div>

                <div className="group relative border-2 border-dashed border-slate-100 rounded-[2rem] p-6 text-center transition-all hover:border-red-500 hover:bg-red-50/30">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files[0])} />
                  <UploadCloud size={24} className="mx-auto text-slate-200 mb-2 group-hover:text-red-500 transition-colors" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-600 transition-colors">
                    {file ? file.name : "Drop PDF Statement"}
                  </p>
                </div>
              </div>

              <button disabled={loading} className="w-full bg-gradient-to-br from-slate-900 to-slate-800 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:from-red-600 hover:to-rose-500 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
                {loading ? "COMMITTING DATA..." : "Finalize & Post Statement"}
              </button>
            </form>
          </div>

          {/* RIGHT: LIVE LEDGER & HISTORY */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-24 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl" />
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 flex items-center gap-2">
                <Activity size={10}/> Real-time Calculation
              </h3>
              
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Gross Yield</span>
                  <span className="text-xl font-black italic tracking-tight">₹{calculations.gross.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3 text-red-400">
                  <span className="text-[10px] uppercase font-bold tracking-widest">Total Deductions</span>
                  <span className="text-xl font-black italic tracking-tight">- ₹{calculations.ded.toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-4 text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-red-500 mb-1">Final Net Pay</p>
                  <p className="text-5xl font-black italic tracking-tighter">₹{calculations.net.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>

            <section className="space-y-4">
              <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 ml-2">
                <History size={12} /> Recent Dispatches
              </h2>
              <div className="space-y-3">
                {fetchingHistory ? (
                   <div className="p-4 bg-white/50 rounded-2xl border border-slate-100 animate-pulse text-[10px] font-black uppercase text-slate-300 text-center tracking-widest">Syncing Vault...</div>
                ) : history.length === 0 ? (
                  <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem] text-[10px] font-black uppercase text-slate-300 tracking-widest">No entries found</div>
                ) : (
                  history.slice(0, 4).map((item) => (
                    <div key={item._id} className="bg-white rounded-[1.5rem] p-4 border border-slate-100 shadow-sm flex justify-between items-center group hover:border-red-200 hover:translate-x-1 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                           <Receipt size={16} />
                        </div>
                        <div>
                          <p className="font-black uppercase text-xs italic tracking-tight text-slate-800">{item.month}</p>
                          <p className="text-[10px] font-bold text-slate-400">₹{item.netSalary?.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                      <a href={item.payslipFile} target="_blank" rel="noreferrer" className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-200 hover:bg-slate-900 hover:text-white transition-all">
                        <FileText size={18} />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

const SectionLabel = ({ icon, title, color = "text-slate-400" }) => (
  <div className={`flex items-center gap-2 ${color} mb-2`}>
    {icon}
    <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="group space-y-2">
    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-red-500 transition-colors ml-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-black italic tracking-tight outline-none transition-all focus:bg-white focus:border-red-200 focus:ring-4 focus:ring-red-500/5 placeholder:text-slate-200"
      placeholder="0.00"
    />
  </div>
);

export default AddPayslip;