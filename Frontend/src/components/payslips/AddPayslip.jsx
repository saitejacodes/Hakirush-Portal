import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  UploadCloud, CheckCircle2, AlertTriangle, ArrowLeft, ShieldCheck,
  History, FileText, Wallet, Activity, Receipt
} from "lucide-react";

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#B8912E";
const SAGE = "#3F6B52";
const RUST = "#A24A32";

/* ===== SHARED STATUS ALERT COMPONENT (success + error) ===== */
const StatusAlert = ({ variant = "success", title, message, onClose }) => {
  const isError = variant === "error";
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300" />
      <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-[#E7E1D3] p-8 text-center motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-300">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{
            backgroundColor: isError ? "#F7EAE6" : "#EEF3EE",
            color: isError ? RUST : SAGE
          }}
        >
          {isError ? <AlertTriangle size={40} strokeWidth={2.5} /> : <CheckCircle2 size={40} strokeWidth={2.5} />}
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tighter text-[#1C1A17]">{title}</h3>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#8A8478] mt-2 mb-8">
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md cursor-pointer"
          style={{
            backgroundColor: isError ? RUST : INK,
            color: "#F6F3EC"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.color = INK; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isError ? RUST : INK; e.currentTarget.style.color = "#F6F3EC"; }}
        >
          {isError ? "Try Again" : "Dismiss Ledger"}
        </button>
      </div>
    </div>
  );
};

const AddPayslip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState(null); // { variant, title, message } | null
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

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      setAlertState({
        variant: "error",
        title: "Wrong Format",
        message: "Only PDF statements are accepted. Please select a .pdf file."
      });
      e.target.value = "";
      return;
    }
    setFile(selected);
  };

  const calculations = useMemo(() => {
    const gross = ["basicSalary", "hra", "conveyanceAllowance", "medicalAllowance", "bonus"]
      .reduce((acc, k) => acc + Number(form[k] || 0), 0);
    const ded = ["providentFund", "professionalTax", "incomeTax", "lossOfPay"]
      .reduce((acc, k) => acc + Number(form[k] || 0), 0);
    return { gross, ded, net: gross - ded };
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setAlertState({
        variant: "error",
        title: "Missing Statement",
        message: "Please upload the PDF payslip before finalizing."
      });
      return;
    }
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
        setAlertState({
          variant: "success",
          title: "Vaulted!",
          message: "Financial statement has been securely posted."
        });
        fetchHistory();
        setForm({ month: "", basicSalary: "", hra: "", conveyanceAllowance: "", medicalAllowance: "", bonus: "", providentFund: "", professionalTax: "", incomeTax: "", lossOfPay: "" });
        setFile(null);
      }
    } catch (err) {
      setAlertState({
        variant: "error",
        title: "Posting Failed",
        message: "The statement could not be committed. Please try again."
      });
    }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#1C1A17] font-sans">
      {alertState && (
        <StatusAlert
          variant={alertState.variant}
          title={alertState.title}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      <nav className="top-0 px-6 py-3 flex justify-between items-center z-50">
        <button onClick={() => navigate(-1)} className="group px-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#8A8478] hover:text-[#B8912E] transition-all cursor-pointer pt-5">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform"/> Back
        </button>
        <div className="flex items-center gap-2 pt-5">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#8A8478]">Secure Node</span>
          <ShieldCheck size={16} style={{ color: SAGE }} />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT: FORM SECTION */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-end gap-3">
               <h1 className="text-3xl font-black uppercase tracking-tighter">Issue <span className="text-[#B8912E]">Statement</span></h1>
               <Activity size={20} className="mb-1 text-[#D6D0BF] motion-safe:animate-pulse" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-white rounded-[2.5rem] border border-[#E7E1D3] p-8 shadow-sm space-y-8">
                <div className="w-full md:w-1/3">
                   <Input label="Payroll Month" name="month" type="month" value={form.month} onChange={handleChange} required placeholder="" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                  <div className="space-y-4">
                    <SectionLabel icon={<Wallet size={12}/>} title="Earnings" />
                    <Input label="Basic Salary" name="basicSalary" type="number" value={form.basicSalary} onChange={handleChange} />
                    <Input label="HRA" name="hra" type="number" value={form.hra} onChange={handleChange} />
                    <Input label="Bonus" name="bonus" type="number" value={form.bonus} onChange={handleChange} />
                  </div>

                  <div className="space-y-4">
                    <SectionLabel icon={<Receipt size={12}/>} title="Deductions" color="text-[#A24A32]" />
                    <Input label="Provident Fund" name="providentFund" type="number" value={form.providentFund} onChange={handleChange} />
                    <Input label="Income Tax" name="incomeTax" type="number" value={form.incomeTax} onChange={handleChange} />
                    <Input label="Loss of Pay" name="lossOfPay" type="number" value={form.lossOfPay} onChange={handleChange} />
                  </div>
                </div>

                <div className="group relative border-2 border-dashed border-[#E7E1D3] rounded-[2rem] p-6 text-center transition-all hover:border-[#B8912E] hover:bg-[#FBF3E3]/30">
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  <UploadCloud size={24} className="mx-auto text-[#D6D0BF] mb-2 group-hover:text-[#B8912E] transition-colors" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#8A8478] group-hover:text-[#9C7A22] transition-colors">
                    {file ? file.name : "Drop PDF Statement"}
                  </p>
                </div>
              </div>

              <button disabled={loading} className="w-full bg-[#1C1A17] text-[#F6F3EC] py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-md hover:bg-[#B8912E] hover:text-[#1C1A17] transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
                {loading ? "COMMITTING DATA..." : "Finalize & Post Statement"}
              </button>
            </form>
          </div>

          {/* RIGHT: LIVE LEDGER & HISTORY */}
          <div className="lg:col-span-5 space-y-6">
            <div
              className="sticky top-24 rounded-[2.5rem] p-8 text-[#F6F3EC] shadow-2xl relative overflow-hidden"
              style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 140%)` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#B8912E]/10 rounded-full blur-3xl" />
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[#B8912E]/70 mb-8 flex items-center gap-2">
                <Activity size={10}/> Real-time Calculation
              </h3>

              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-[10px] text-[#D6D0BF] uppercase font-bold tracking-widest">Gross Yield</span>
                  <span className="text-xl font-black tracking-tight">₹{calculations.gross.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3 text-[#E08F73]">
                  <span className="text-[10px] uppercase font-bold tracking-widest">Total Deductions</span>
                  <span className="text-xl font-black tracking-tight">- ₹{calculations.ded.toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-4 text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#B8912E] mb-1">Final Net Pay</p>
                  <p className="text-5xl font-black tracking-tighter">₹{calculations.net.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>

            <section className="space-y-4">
              <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8A8478] flex items-center gap-2 ml-2">
                <History size={12} /> Recent Dispatches
              </h2>
              <div className="space-y-3">
                {fetchingHistory ? (
                   <div className="p-4 bg-white/60 rounded-2xl border border-[#E7E1D3] motion-safe:animate-pulse text-[10px] font-black uppercase text-[#D6D0BF] text-center tracking-widest">Syncing Vault...</div>
                ) : history.length === 0 ? (
                  <div className="p-10 text-center border-2 border-dashed border-[#E7E1D3] rounded-[2rem] text-[10px] font-black uppercase text-[#D6D0BF] tracking-widest">No entries found</div>
                ) : (
                  history.slice(0, 4).map((item) => (
                    <div key={item._id} className="bg-white rounded-[1.5rem] p-4 border border-[#E7E1D3] shadow-sm flex justify-between items-center group hover:border-[#B8912E]/40 hover:translate-x-1 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-[#F6F3EC] flex items-center justify-center text-[#C9C2AE] group-hover:bg-[#FBF3E3] group-hover:text-[#B8912E] transition-colors">
                           <Receipt size={16} />
                        </div>
                        <div>
                          <p className="font-black uppercase text-xs tracking-tight text-[#1C1A17]">{item.month}</p>
                          <p className="text-[10px] font-bold text-[#8A8478]">₹{item.netSalary?.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                      <a href={item.payslipFile} target="_blank" rel="noreferrer" className="h-10 w-10 flex items-center justify-center rounded-xl text-[#D6D0BF] hover:bg-[#1C1A17] hover:text-[#F6F3EC] transition-all">
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

const SectionLabel = ({ icon, title, color = "text-[#8A8478]" }) => (
  <div className={`flex items-center gap-2 ${color} mb-2`}>
    {icon}
    <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
  </div>
);

const Input = ({ label, placeholder = "0.00", ...props }) => (
  <div className="group space-y-2">
    <label className="text-[9px] font-black uppercase tracking-widest text-[#8A8478] group-focus-within:text-[#B8912E] transition-colors ml-1">
      {label}
    </label>
    <input
      {...props}
      placeholder={placeholder}
      className="w-full bg-[#F6F3EC] border border-[#E7E1D3] rounded-2xl px-5 py-3.5 text-xs font-black tracking-tight outline-none transition-all text-[#1C1A17] focus:bg-white focus:border-[#B8912E] focus:ring-4 focus:ring-[#B8912E]/10 placeholder:text-[#D6D0BF]"
    />
  </div>
);

export default AddPayslip;