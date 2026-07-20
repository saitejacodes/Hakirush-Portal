import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Download, ShieldCheck, 
  Calendar, History, Lock, Wallet, 
  ArrowUpRight, CreditCard 
} from "lucide-react";

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#B8912E";
const SAGE = "#3F6B52";
const RUST = "#A24A32";

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
    <div className="min-h-screen bg-[#F6F3EC] font-sans text-[#1C1A17] selection:bg-[#FBF3E3] flex justify-center items-start overflow-x-hidden">
      
      {/* Main container */}
      <div className="w-full max-w-5xl p-6 md:p-12">
        
        {/* Header Section */}
        <div className="flex justify-end items-center mb-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1A17] rounded-full text-[8px] font-black text-[#F6F3EC] uppercase tracking-widest">
            <Lock size={10} className="text-[#B8912E]" /> Secure Terminal
          </div>
        </div>

        {/* SUMMARY CARD */}
        <div className="bg-white rounded-[2.5rem] p-8 mb-12 border border-[#E7E1D3] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <ShieldCheck size={120} className="text-[#1C1A17]" />
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-center sm:text-left">
            <div className="space-y-1 w-full sm:w-auto">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-[#B8912E] mb-1">
                <Wallet size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Financial Ledger</span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase text-[#1C1A17]">
                Payroll Archive
              </h1>
            </div>

            <div className="flex justify-center sm:justify-end gap-10 w-full sm:w-auto">
              <div className="space-y-0.5">
                <p className="text-[9px] font-black text-[#8A8478] uppercase tracking-widest">Aggregate</p>
                <p className="text-3xl font-black tracking-tighter text-[#1C1A17]">
                  <span className="text-[#B8912E] mr-0.5">₹</span>{totalLifetime.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="space-y-0.5 text-right">
                <p className="text-[9px] font-black text-[#8A8478] uppercase tracking-widest">Slips</p>
                <p className="text-3xl font-black text-[#1C1A17]">{payslips.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* LIST SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-center sm:justify-start gap-2 px-4 mb-6 text-[#8A8478]">
            <History size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Transaction History</span>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center sm:items-start px-4 gap-4">
              <div className="w-8 h-8 border-2 border-[#EFE9D8] border-t-[#B8912E] rounded-full animate-spin" />
              <p className="text-[8px] font-black uppercase tracking-widest text-[#8A8478]">Decrypting Records...</p>
            </div>
          ) : payslips.length > 0 ? (
            payslips.map((p) => (
              <div 
                key={p._id} 
                onClick={() => setSelectedSlip(p)}
                className="group bg-white p-6 rounded-[2rem] border border-[#E7E1D3] flex items-center justify-between hover:border-[#B8912E]/40 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-[#F6F3EC] flex items-center justify-center text-[#8A8478] group-hover:bg-[#FBF3E3] group-hover:text-[#B8912E] transition-all">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="font-black text-lg uppercase tracking-tight text-[#1C1A17] group-hover:text-[#B8912E]">{p.month}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SAGE }} />
                      <p className="text-[8px] font-bold text-[#8A8478] uppercase tracking-widest">Verified Credit</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-black text-xl tracking-tighter text-[#1C1A17]">
                      ₹{Number(p.netSalary).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full border border-[#E7E1D3] flex items-center justify-center text-[#C9C2AE] group-hover:bg-[#1C1A17] group-hover:text-[#F6F3EC] group-hover:border-[#1C1A17] transition-all">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center sm:text-left px-10 bg-white/60 rounded-[3rem] border border-dashed border-[#E7E1D3]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8A8478]">No records found in database</p>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedSlip && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => setSelectedSlip(null)} 
          />
          <div className="relative bg-white w-full max-w-[360px] rounded-[3.5rem] shadow-2xl overflow-hidden border border-[#E7E1D3] animate-in zoom-in-95 duration-300">
            
            <div className="pt-12 pb-6 text-center">
              <div className="inline-flex p-4 bg-[#FBF3E3] rounded-2xl text-[#B8912E] mb-4">
                <CreditCard size={28} />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter text-[#1C1A17]">{selectedSlip.month}</h3>
              <p className="text-[9px] font-black text-[#8A8478] uppercase tracking-widest mt-1">Audit Breakdown</p>
            </div>

            <div className="px-10 space-y-6">
              <div className="bg-[#FBFAF6] rounded-3xl p-6 space-y-4 border border-[#F1EFE8]">
                <MiniRow label="Base Compensation" value={selectedSlip.basicSalary} />
                <MiniRow label="Housing / HRA" value={selectedSlip.hra} />
                <div className="pt-4 border-t border-[#E7E1D3]">
                    <MiniRow label="Total Deductions" value={selectedSlip.totalDeductions} color="text-[#A24A32]" />
                </div>
              </div>

              <div className="text-center py-2">
                 <p className="text-[9px] font-black text-[#8A8478] uppercase tracking-widest mb-1">Final Disbursed Amount</p>
                 <p className="text-4xl font-black tracking-tighter text-[#1C1A17]">
                   <span className="text-[#B8912E] text-lg mr-1">₹</span>
                   {Number(selectedSlip.netSalary).toLocaleString('en-IN')}
                 </p>
              </div>
            </div>

            <div className="p-10 pt-6 space-y-3">
              <button 
                onClick={() => window.open(selectedSlip.payslipFile, '_blank')} 
                className="w-full py-5 rounded-2xl bg-[#1C1A17] text-[#F6F3EC] font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#B8912E] hover:text-[#1C1A17] transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Download size={18}/> Get Statement
              </button>
              <button 
                onClick={() => setSelectedSlip(null)} 
                className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-[#8A8478] hover:text-[#1C1A17] cursor-pointer transition-colors"
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

const MiniRow = ({ label, value, color = "text-[#1C1A17]" }) => (
  <div className="flex justify-between items-center">
    <span className="text-[9px] font-black text-[#8A8478] uppercase tracking-widest">{label}</span>
    <span className={`text-sm font-black tracking-tight ${color}`}>₹{Number(value || 0).toLocaleString('en-IN')}</span>
  </div>
);

export default ViewPayslip;