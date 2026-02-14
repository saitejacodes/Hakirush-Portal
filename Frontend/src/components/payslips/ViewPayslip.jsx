import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FileText, Download, Eye, Calendar, IndianRupee, ShieldCheck } from "lucide-react";

const ViewPayslip = () => {
  const { id } = useParams();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FORCE DOWNLOAD ================= */
  const handleDownload = async (url, filename = "payslip.pdf") => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      alert("Failed to download payslip");
    }
  };

  /* ================= FETCH PAYSLIPS ================= */
  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        let employeeId = id;
        const empRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        employeeId = empRes?.data?.employee?._id || id;

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/payslip/employee/${employeeId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        setPayslips(res.data.payslips || []);
      } catch (err) {
        console.error("FETCH PAYSLIP ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayslips();
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* ================= HEADER SECTION ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-200">
              <FileText size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">
                Salary Statements
              </h2>
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck size={14} className="text-green-500" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Verified Payroll Records</p>
              </div>
            </div>
          </div>

          <div className="hidden md:block bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Slips Found</p>
            <p className="text-xl font-black text-red-600">{payslips.length}</p>
          </div>
        </div>

        {/* ================= CONTENT AREA ================= */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <div className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Accessing Secure Vault...</p>
          </div>
        ) : payslips.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records available in this account</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {payslips.map((p) => (
              <div
                key={p._id}
                className="group relative bg-white rounded-[2rem] border border-slate-100 p-6 shadow-xl shadow-slate-900/[0.02] hover:shadow-red-900/10 hover:border-red-100 transition-all duration-300"
              >
                {/* Decoration */}
                <div className="absolute top-0 right-10 w-20 h-1 bg-gradient-to-r from-red-600 to-rose-400 rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-800 tracking-tight">{p.month}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fiscal Period</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Payout</p>
                    <div className="flex items-center gap-1 text-green-600 font-black text-xl tracking-tighter">
                      <IndianRupee size={16} strokeWidth={3} />
                      {Number(p.netSalary).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Basic Component</p>
                    <p className="text-sm font-bold text-slate-700">₹{p.basicSalary}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Deductions/Allow.</p>
                    <p className="text-sm font-bold text-slate-700">₹{p.allowances || 0}</p>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-3">
                  <a
                    href={p.payslipFile}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
                  >
                    <Eye size={14} /> Preview Slip
                  </a>
                  <button
                    onClick={() => handleDownload(p.payslipFile, `${p.month}-Payslip.pdf`)}
                    className="w-14 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-green-600 hover:border-green-100 hover:bg-green-50 transition-all active:scale-90"
                    title="Download PDF"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 p-6 rounded-[2rem] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <ShieldCheck size={20} className="text-red-400" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">All records are encrypted and digitally signed by HR.</p>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Security Clearance: Level 1</p>
        </div>
      </div>
    </div>
  );
};

export default ViewPayslip;