import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  UploadCloud, CheckCircle2, ArrowLeft, ShieldCheck,
  History, FileText, ChevronRight, Wallet, Activity, Receipt
} from "lucide-react";

const AddPayslip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [history, setHistory] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  const [form, setForm] = useState({
    month: "",
    basicSalary: "",
    hra: "",
    conveyanceAllowance: "",
    medicalAllowance: "",
    bonus: "",
    providentFund: "",
    professionalTax: "",
    incomeTax: "",
    lossOfPay: ""
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
    const gross = Object.entries(form)
      .filter(([k]) => ["basicSalary", "hra", "conveyanceAllowance", "medicalAllowance", "bonus"].includes(k))
      .reduce((acc, [, v]) => acc + Number(v || 0), 0);
    const ded = Object.entries(form)
      .filter(([k]) => ["providentFund", "professionalTax", "incomeTax", "lossOfPay"].includes(k))
      .reduce((acc, [, v]) => acc + Number(v || 0), 0);
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}

      {/* --- TOP BAR --- */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center z-50">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-all">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Back to Personnel
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Node</span>
          <ShieldCheck size={18} className="text-emerald-500" />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: FORM SECTION (7 COLS) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-end gap-4">
               <h1 className="text-5xl font-black uppercase italic tracking-tighter">Issue <span className="text-red-600">Statement</span></h1>
               <Activity size={24} className="mb-2 text-slate-300 animate-pulse" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-8">
                
                {/* Month Picker */}
                <div className="w-full md:w-1/2">
                   <Input label="Payroll Month" name="month" type="month" value={form.month} onChange={handleChange} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  <div className="space-y-6">
                    <SectionLabel icon={<Wallet size={14}/>} title="Earnings" />
                    <Input label="Basic Salary" name="basicSalary" type="number" value={form.basicSalary} onChange={handleChange} />
                    <Input label="HRA" name="hra" type="number" value={form.hra} onChange={handleChange} />
                    <Input label="Bonus / Incentives" name="bonus" type="number" value={form.bonus} onChange={handleChange} />
                  </div>

                  <div className="space-y-6">
                    <SectionLabel icon={<Receipt size={14}/>} title="Deductions" color="text-red-500" />
                    <Input label="Provident Fund" name="providentFund" type="number" value={form.providentFund} onChange={handleChange} />
                    <Input label="Income Tax (TDS)" name="incomeTax" type="number" value={form.incomeTax} onChange={handleChange} />
                    <Input label="Loss of Pay" name="lossOfPay" type="number" value={form.lossOfPay} onChange={handleChange} />
                  </div>
                </div>

                {/* File Upload Area */}
                <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center transition-all hover:border-red-500 hover:bg-red-50/30">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files[0])} />
                  <UploadCloud size={32} className="mx-auto text-slate-300 mb-2 group-hover:text-red-500 transition-colors" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-red-600">
                    {file ? file.name : "Drop PDF Statement Here"}
                  </p>
                </div>
              </div>

              {/* POST BUTTON */}
              <button disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-red-600 transition-all active:scale-[0.98] disabled:opacity-50">
                {loading ? "Authenticating & Uploading..." : "Finalize & Post Statement"}
              </button>
            </form>
          </div>

          {/* RIGHT: LIVE LEDGER & HISTORY (5 COLS) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* LIVE CALCULATOR CARD */}
            <div className="sticky top-28 bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-300 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full blur-3xl" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 flex items-center gap-2">
                <Activity size={12}/> Net Calculation
              </h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <span className="text-xs text-slate-400 uppercase font-bold">Gross Total</span>
                  <span className="text-xl font-bold">₹{calculations.gross.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/10 pb-4 text-red-400">
                  <span className="text-xs uppercase font-bold">Deductions</span>
                  <span className="text-xl font-bold">- ₹{calculations.ded.toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-1">Final Disbursable</p>
                  <p className="text-6xl font-black italic tracking-tighter">₹{calculations.net.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>

            {/* HISTORY LIST */}
            <section className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                <History size={14} /> Audit Trail
              </h2>
              <div className="space-y-3">
                {fetchingHistory ? (
                   <div className="p-4 bg-white rounded-2xl border border-slate-100 animate-pulse text-[10px] font-bold uppercase text-slate-300">Syncing Ledger...</div>
                ) : history.length === 0 ? (
                  <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-[2rem] text-[10px] font-bold uppercase text-slate-400">No records found</div>
                ) : (
                  history.slice(0, 5).map((item) => (
                    <div key={item._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex justify-between items-center group hover:border-red-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                           <Receipt size={18} />
                        </div>
                        <div>
                          <p className="font-black uppercase text-sm italic">{item.month}</p>
                          <p className="text-[10px] font-bold text-slate-400">₹{item.netSalary?.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                      <a href={item.payslipFile} target="_blank" rel="noreferrer" className="p-2 text-slate-300 hover:text-red-600 transition-colors">
                        <FileText size={20} />
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

/* --- SUB-COMPONENTS --- */

const SectionLabel = ({ icon, title, color = "text-slate-400" }) => (
  <div className={`flex items-center gap-2 ${color} mb-4`}>
    {icon}
    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</span>
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="group space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-red-500 transition-colors">
      {label}
    </label>
    <input
      {...props}
      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-black outline-none transition-all focus:bg-white focus:border-red-200 focus:ring-4 focus:ring-red-500/5 placeholder:text-slate-300"
      placeholder="0.00"
    />
  </div>
);

const SuccessAlert = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
    <div className="relative bg-white p-10 rounded-[3rem] text-center w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
        <CheckCircle2 size={40} />
      </div>
      <h3 className="text-2xl font-black uppercase italic mb-2">Authenticated</h3>
      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-8">Statement has been posted to the employee's vault.</p>
      <button onClick={onClose} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all">
        Continue
      </button>
    </div>
  </div>
);

export default AddPayslip;