import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, X, ArrowLeft, Download, ShieldCheck, Calendar, TrendingDown, History } from "lucide-react";

const ViewPayslip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const token = localStorage.getItem("token");
        const empRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const employeeId = empRes?.data?.employee?._id || id;
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/payslip/employee/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayslips(res.data.payslips || []);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchPayslips();
  }, [id]);

  const totalLifetime = useMemo(() => 
    payslips.reduce((acc, curr) => acc + Number(curr.netSalary || 0), 0), 
  [payslips]);

  return (
    <div className="min-h-screen bg-[#FFFBFB] font-sans text-slate-900 selection:bg-red-100">
      <div className="max-w-4xl mx-auto p-5 md:p-10">
        
        {/* TOP NAVIGATION */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-700 transition-all cursor-pointer">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-red-100 shadow-sm text-[9px] font-black text-red-500 uppercase tracking-tighter">
            <ShieldCheck size={14} /> End-to-End Encrypted
          </div>
        </div>

        {/* RED GRADIENT SUMMARY CARD */}
        <div className="bg-gradient-to-br from-red-600 via-red-700 to-rose-900 rounded-[2.5rem] p-10 mb-10 text-white shadow-2xl shadow-red-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none">Earning Archive</h1>
              <p className="text-red-100 text-xs font-bold opacity-70 uppercase tracking-[0.2em]">Fiscal History Ledger</p>
            </div>
            <div className="flex gap-10 border-l border-white/20 pl-10">
              <div>
                <p className="text-[10px] font-black text-red-200 uppercase tracking-widest mb-1">Total Assets</p>
                <p className="text-3xl font-black tracking-tighter italic text-white">₹{totalLifetime.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-red-200 uppercase tracking-widest mb-1">Records</p>
                <p className="text-3xl font-black italic text-white">{payslips.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ARCHIVE FEED */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4 px-2 text-slate-400">
             <History size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">Recent Disbursements</span>
          </div>

          {loading ? (
             <div className="text-center py-20 text-red-300 font-black text-[11px] uppercase tracking-[0.4em] animate-pulse">Decrypting Statements...</div>
          ) : (
            payslips.map((p) => (
              <div 
                key={p._id} 
                onClick={() => setSelectedSlip(p)}
                className="group bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all cursor-pointer transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="font-black text-lg uppercase italic tracking-tighter text-slate-800 group-hover:text-red-700 transition-colors">{p.month}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Released</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <p className="font-black text-xl tracking-tighter text-slate-900 group-hover:text-red-600">₹{Number(p.netSalary).toLocaleString('en-IN')}</p>
                  <div className="p-3 rounded-2xl text-slate-200 group-hover:text-red-600 group-hover:bg-red-50 transition-all">
                    <Eye size={20} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedSlip(null)} />
          <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-8 border-b border-red-50 flex justify-between items-center bg-red-50/20">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Analysis Mode</span>
                <span className="text-2xl font-black uppercase italic tracking-tighter">{selectedSlip.month}</span>
              </div>
              <button onClick={() => setSelectedSlip(null)} className="p-3 hover:bg-white rounded-full transition-all text-red-400 shadow-sm cursor-pointer"><X size={20}/></button>
            </div>

            <div className="p-10 space-y-8">
              <div className="text-center p-8 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden shadow-xl shadow-red-100">
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-red-600/20 rounded-full blur-2xl" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">Net Payable</p>
                <p className="text-5xl font-black tracking-tighter text-white italic">₹{Number(selectedSlip.netSalary).toLocaleString('en-IN')}</p>
              </div>

              <div className="space-y-4">
                <MiniRow label="Basic Salary" value={selectedSlip.basicSalary} />
                <MiniRow label="HRA Allowance" value={selectedSlip.hra} />
                <div className="pt-4 border-t border-slate-50">
                    <MiniRow label="Total Deductions" value={selectedSlip.totalDeductions} color="text-red-600" icon={<TrendingDown size={14} className="text-red-400"/>} />
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50/50 grid grid-cols-2 gap-4">
              <button onClick={() => window.open(selectedSlip.payslipFile)} className="py-4 rounded-2xl border-2 border-red-100 bg-white font-black text-[10px] uppercase tracking-widest text-red-600 hover:border-red-600 hover:text-red-700 transition-all cursor-pointer">Preview</button>
              <button onClick={() => window.open(selectedSlip.payslipFile)} className="py-4 rounded-2xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200 cursor-pointer">
                <Download size={16}/> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MiniRow = ({ label, value, color = "text-slate-800", icon = null }) => (
  <div className="flex justify-between items-center group">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-600 transition-colors">{label}</span>
    <div className="flex items-center gap-2">
        {icon}
        <span className={`text-sm font-black tracking-tight ${color}`}>₹{Number(value || 0).toLocaleString('en-IN')}</span>
    </div>
  </div>
);

export default ViewPayslip;