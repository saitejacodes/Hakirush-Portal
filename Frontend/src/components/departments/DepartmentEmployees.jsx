import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Users, Mail, Briefcase, ShieldCheck } from "lucide-react";

const DepartmentEmployees = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-6">
        
        {/* BACK BUTTON - Standardized Position */}
        <div className="flex justify-start">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            <ChevronLeft size={18} className="text-slate-400 group-hover:text-red-600 group-hover:-translate-x-1 transition-all" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-600 transition-colors">
              Return to Departments
            </span>
          </button>
        </div>

        {/* HEADER - Standardized Scaling */}
        <header className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-2xl shadow-red-200 shrink-0">
            <Users size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-red-800 uppercase tracking-tighter sm:text-4xl leading-none italic">
              Team Roster
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mt-3">
              Assigned Personnel & Roles
            </p>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden mt-4">
          
          <main className="p-2 md:p-4">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-5">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-slate-300 uppercase tracking-widest text-[10px]">Syncing Personnel...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="inline-block p-6 rounded-[2rem] bg-red-50 border border-red-100 mb-4">
                  <p className="text-red-500 font-black uppercase italic text-xl tracking-tighter">{error}</p>
                </div>
              </div>
            ) : (
              <>
                {/* MOBILE VIEW - Redesigned Cards */}
                <div className="md:hidden space-y-4 p-2">
                  {employees.length > 0 ? (
                    employees.map((emp, index) => (
                      <div key={emp._id} className="bg-white p-6 rounded-[2rem] shadow-lg border border-white transition-all active:scale-[0.98]">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[9px] font-black text-slate-300 uppercase italic">Ref #{String(index + 1).padStart(2, '0')}</span>
                          <span className="bg-slate-100 text-slate-500 text-[9px] font-black uppercase px-3 py-1 rounded-lg">
                            {emp.userId?.employeeId || "No ID"}
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-xl font-black text-slate-800 uppercase italic tracking-tighter leading-none mb-1">
                            {emp.userId?.name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 lowercase">
                            <Mail size={12} className="text-red-400" /> {emp.userId?.email}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-50">
                          <span className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100/50">
                            <Briefcase size={12} /> {emp.designation || "Staff"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState />
                  )}
                </div>

                {/* DESKTOP TABLE - Floating Row Style */}
                <div className="hidden md:block px-6 pb-6 overflow-x-auto">
                  <table className="w-full border-separate border-spacing-y-4">
                    <thead>
                      <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        <th className="px-8 py-4 text-left">Ref</th>
                        <th className="px-8 py-4 text-left">Emp ID</th>
                        <th className="px-8 py-4 text-left">Full Name</th>
                        <th className="px-8 py-4 text-left">Email Address</th>
                        <th className="px-8 py-4 text-right">Designation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp, index) => (
                        <tr key={emp._id} className="bg-slate-50/40 hover:bg-white transition-all group shadow-sm hover:shadow-xl hover:shadow-red-500/5">
                          <td className="px-8 py-6 first:rounded-l-[2rem] text-[11px] font-black text-slate-300 italic">
                            {String(index + 1).padStart(2, '0')}
                          </td>
                          <td className="px-8 py-6">
                            <span className="bg-white text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase border border-slate-100 shadow-sm">
                              {emp.employeeId || "N/A"}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="font-black text-slate-800 uppercase italic tracking-tighter text-xl group-hover:text-red-700 transition-colors">
                              {emp.userId?.name}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-400 lowercase italic">
                            {emp.userId?.email}
                          </td>
                          <td className="px-8 py-6 last:rounded-r-[2rem] text-right">
                            <span className="bg-red-50 text-red-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100/50 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                              {emp.designation || "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {employees.length === 0 && <EmptyState />}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

/* Internal Helper for Empty State */
const EmptyState = () => (
  <div className="text-center py-24">
    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
      <Users size={24} className="text-slate-200" />
    </div>
    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-300 italic">
      No Team Members Assigned
    </p>
  </div>
);

export default DepartmentEmployees;