import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Download, ShieldCheck, 
  Calendar, History, Lock, Wallet, 
  ArrowUpRight, CreditCard 
} from "lucide-react";

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
        
        const employeeId = empRes?.data?.employee?._id;
        
        if (employeeId) {
          const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/payslip/employee/${employeeId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const sortedData = (res.data.payslips || []).sort((a, b) => 
            new Date(b.month) - new Date(a.month)
          );
          setPayslips(sortedData);
        }
      } catch (err) { 
        console.error("Fetch Error:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchPayslips();
  }, [id]);

  const totalLifetime = useMemo(() => 
    payslips.reduce((acc, curr) => acc + Number(curr.netSalary || 0), 0), 
  [payslips]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-rose-100 font-sans text-slate-900 selection:bg-red-50 flex justify-center items-start overflow-x-hidden">
      
      {/* Main container */}
      <div className="w-full max-w-5xl p-6 md:p-12">
        
        {/* Header Section */}
        <div className="flex justify-end items-center mb-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 rounded-full text-[8px] font-black text-white uppercase tracking-widest">
            <Lock size={10} className="text-red-500" /> Secure Terminal
          </div>
        </div>

        {/* SUMMARY CARD */}
        <div className="bg-white rounded-[2.5rem] p-8 mb-12 border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <ShieldCheck size={120} className="text-slate-900" />
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-center sm:text-left">
            <div className="space-y-1 w-full sm:w-auto">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-red-600 mb-1">
                <Wallet size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Financial Ledger</span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter italic uppercase text-slate-900">
                Payroll Archive
              </h1>
            </div>

            <div className="flex justify-center sm:justify-end gap-10 w-full sm:w-auto">
              <div className="space-y-0.5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aggregate</p>
                <p className="text-3xl font-black tracking-tighter text-slate-900">
                  <span className="text-red-600 mr-0.5">₹</span>{totalLifetime.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="space-y-0.5 text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Slips</p>
                <p className="text-3xl font-black italic text-slate-900">{payslips.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* LIST SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-center sm:justify-start gap-2 px-4 mb-6 text-slate-400">
            <History size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Transaction History</span>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center sm:items-start px-4 gap-4">
              <div className="w-8 h-8 border-2 border-red-600/10 border-t-red-600 rounded-full animate-spin" />
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Decrypting Records...</p>
            </div>
          ) : payslips.length > 0 ? (
            payslips.map((p) => (
              <div 
                key={p._id} 
                onClick={() => setSelectedSlip(p)}
                className="group bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:border-red-500/30 hover:shadow-xl hover:shadow-red-500/5 transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="font-black text-lg uppercase italic tracking-tight text-slate-900 group-hover:text-red-600">{p.month}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Verified Credit</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-black text-xl tracking-tighter text-slate-900">
                      ₹{Number(p.netSalary).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center sm:text-left px-10 bg-white/40 rounded-[3rem] border border-dashed border-slate-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No records found in database</p>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedSlip && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => setSelectedSlip(null)} 
          />
          <div className="relative bg-white w-full max-w-[360px] rounded-[3.5rem] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-300">
            
            <div className="pt-12 pb-6 text-center">
              <div className="inline-flex p-4 bg-red-50 rounded-2xl text-red-600 mb-4">
                <CreditCard size={28} />
              </div>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">{selectedSlip.month}</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit Breakdown</p>
            </div>

            <div className="px-10 space-y-6">
              <div className="bg-slate-50/80 rounded-3xl p-6 space-y-4">
                <MiniRow label="Base Compensation" value={selectedSlip.basicSalary} />
                <MiniRow label="Housing / HRA" value={selectedSlip.hra} />
                <div className="pt-4 border-t border-slate-200">
                    <MiniRow label="Total Deductions" value={selectedSlip.totalDeductions} color="text-red-600" />
                </div>
              </div>

              <div className="text-center py-2">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Disbursed Amount</p>
                 <p className="text-4xl font-black tracking-tighter text-slate-900 italic">
                   <span className="text-red-600 text-lg not-italic mr-1">₹</span>
                   {Number(selectedSlip.netSalary).toLocaleString('en-IN')}
                 </p>
              </div>
            </div>

            <div className="p-10 pt-6 space-y-3">
              <button 
                onClick={() => window.open(selectedSlip.payslipFile, '_blank')} 
                className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-600 transition-all cursor-pointer shadow-xl active:scale-95"
              >
                <Download size={18}/> Get Statement
              </button>
              <button 
                onClick={() => setSelectedSlip(null)} 
                className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                Dismiss Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MiniRow = ({ label, value, color = "text-slate-900" }) => (
  <div className="flex justify-between items-center">
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <span className={`text-sm font-black tracking-tight ${color}`}>₹{Number(value || 0).toLocaleString('en-IN')}</span>
  </div>
);

export default ViewPayslip;