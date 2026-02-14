import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, Mail, Briefcase, Hash, ShieldCheck } from "lucide-react";

const DepartmentEmployees = () => {
  const { id } = useParams();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || id === ":id") {
      setError("Invalid department ID");
      setLoading(false);
      return;
    }

    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/employee/department/${id}/employees`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        if (res.data?.success) {
          setEmployees(res.data.employees || []);
        } else {
          setError("Failed to load employees");
        }
      } catch (err) {
        setError(err?.response?.data?.error || "Connection error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 pb-12">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
        
        {/* ================= HEADER ================= */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-2">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-red-100">
              <Users size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-red-700 uppercase tracking-tighter sm:text-5xl leading-none italic">
                Team Roster
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">
                Department Personnel
              </p>
            </div>
          </div>

          <Link
            to="/admin-dashboard/departments"
            className="group flex items-center gap-3 rounded-2xl bg-white border border-slate-100 px-6 py-4 font-black uppercase text-[10px] tracking-widest text-slate-500 shadow-lg transition-all hover:bg-red-600 hover:text-white active:scale-95"
          >
            <ArrowLeft size={16} strokeWidth={3} className="text-slate-500 group-hover:text-white" /> 
            Back to List
          </Link>
        </header>

        {/* ================= CONTENT ================= */}
        <main>
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Syncing Records...</p>
            </div>
          ) : error ? (
            <div className="bg-white p-12 rounded-[3rem] border-2 border-dashed border-red-100 text-center">
              <p className="text-red-500 font-black uppercase italic text-xl tracking-tighter">{error}</p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="md:hidden space-y-4">
                {employees.map((emp, index) => (
                  <div key={emp._id} className="bg-white p-6 rounded-[2rem] shadow-lg border border-white">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-4">
                      <span className="text-[10px] font-black text-slate-300 uppercase italic">Rank #{index + 1}</span>
                      <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-lg tracking-widest">
                        {emp.designation}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">{emp.userId?.name}</p>
                      <p className="text-xs font-bold text-slate-400 lowercase">{emp.userId?.email}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block bg-white rounded-[3rem] shadow-2xl border border-white overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"><Hash size={14} className="inline mr-2 opacity-50"/>S.No</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"><ShieldCheck size={14} className="inline mr-2 opacity-50"/>Emp ID</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Name</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"><Mail size={14} className="inline mr-2 opacity-50"/>Email</th>
                      <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"><Briefcase size={14} className="inline mr-2 opacity-50"/>Designation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {employees.map((emp, index) => (
                      <tr key={emp._id} className="hover:bg-red-50/30 transition-colors group">
                        <td className="px-8 py-6 text-sm font-black text-slate-300 italic">#{index + 1}</td>
                        <td className="px-8 py-6">
                          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[11px] font-black tracking-widest uppercase">
                            {emp.userId?.employeeId || emp.employeeId || "N/A"}
                          </span>
                        </td>
                        <td className="px-8 py-6 font-black text-slate-700 uppercase italic tracking-tighter group-hover:text-red-600 transition-colors">
                          {emp.userId?.name}
                        </td>
                        <td className="px-8 py-6 text-xs font-bold text-slate-400">
                          {emp.userId?.email}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100/50 group-hover:bg-red-600 group-hover:text-white transition-all">
                            {emp.designation || "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* EMPTY STATE */}
              {employees.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[3rem] border border-white">
                  <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-300">
                    No Team Members Assigned
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DepartmentEmployees;