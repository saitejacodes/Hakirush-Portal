import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Plus, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { DepartmentButtons } from "../../utils/DepartmentHelper";

/* ================= PREMIUM MOBILE CARD ================= */
const MobileDepartmentCard = ({ dep, fetchDepartments }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-white p-4 sm:p-6 transition-all active:scale-[0.98] w-full max-w-[420px] mx-auto">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl flex items-center justify-center text-red-500 shadow-inner shrink-0">
          <Building2 size={22} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">
            DEPT-ID: {String(dep.sno).padStart(2, '0')}
          </p>
          <p className="font-black text-slate-800 uppercase italic tracking-tighter truncate leading-none text-lg sm:text-xl">
            {dep.dep_name}
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 mt-2">
            Organizational Unit
          </p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-50 flex justify-end">
        <DepartmentButtons id={dep._id} onDepartmentDelete={fetchDepartments} />
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 5;

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [depLoading, setDepLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const fetchDepartments = async () => {
    setDepLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/department`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.success) {
        let sno = 1;
        const data = res.data.departments.map((dep) => ({
          _id: dep._id,
          sno: sno++,
          dep_name: dep.dep_name,
        }));
        setDepartments(data);
        setFilteredDepartments(data);
      }
    } catch (err) {
      console.error("Failed to load departments");
    } finally {
      setDepLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  useEffect(() => {
    const result = departments.filter((dep) =>
      dep.dep_name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredDepartments(result);
    setCurrentPage(1);
  }, [search, departments]);

  const totalPages = Math.ceil(filteredDepartments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDepartments = filteredDepartments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 pb-12">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-6">

        {/* HEADER */}
        <header className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-2xl shadow-red-200 shrink-0">
            <Building2 size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-red-800 uppercase tracking-tighter sm:text-4xl leading-none italic">
              Departments
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mt-3">
              Organization Structure & Units
            </p>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
          
          {/* SEARCH & ACTION ROW */}
          <div className="p-6 md:p-10 border-b border-slate-50">
            <div className="flex flex-col lg:flex-row gap-5 items-center">
              
              {/* SEARCH BAR */}

              <div className="group relative flex-1 w-full flex items-center bg-slate-100/50 border-2 border-transparent rounded-2xl px-4 sm:px-6 focus-within:border-red-500/20 focus-within:bg-white transition-all shadow-inner min-h-[48px]">
                <Search className="text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="SEARCH BY DEPARTMENT NAME..."
                  className="w-full py-3 pl-3 outline-none bg-transparent text-[12px] font-black uppercase tracking-widest text-slate-700 placeholder:text-slate-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* ACTION BUTTON */}
              <Link
                to="/admin-dashboard/add-department"
                className="w-full lg:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-4 font-black uppercase text-[11px] tracking-widest text-white shadow-2xl shadow-red-100 transition-all hover:from-red-600 hover:to-rose-500 active:scale-95 whitespace-nowrap min-h-[48px]"
              >
                <Plus size={16} strokeWidth={3} />
                <span>Add New Dept</span>
              </Link>
            </div>
          </div>

          {depLoading ? (
            <div className="p-24 text-center">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Records...</p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="md:hidden px-2 py-4 space-y-5">
                {paginatedDepartments.length ? (
                  paginatedDepartments.map((dep) => (
                    <MobileDepartmentCard key={dep._id} dep={dep} fetchDepartments={fetchDepartments} />
                  ))
                ) : (
                  <p className="text-center py-16 font-bold text-slate-300 uppercase text-xs">No Departments Found</p>
                )}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto px-8 pb-10">
                <table className="w-full border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                      <th className="px-8 py-4 text-left">Ref</th>
                      <th className="px-8 py-4 text-left">Department Name</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDepartments.map((dep) => (
                      <tr key={dep._id} className="bg-slate-50/40 hover:bg-white transition-all group shadow-sm hover:shadow-xl hover:shadow-red-500/5">
                        <td className="px-8 py-6 first:rounded-l-[2rem] text-[11px] font-black text-slate-300 italic">
                          {String(dep.sno).padStart(2, '0')}
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-black text-slate-800 uppercase italic tracking-tighter text-xl group-hover:text-red-700 transition-colors">
                            {dep.dep_name}
                          </span>
                        </td>
                        <td className="px-8 py-6 last:rounded-r-[2rem] text-right">
                          <DepartmentButtons id={dep._id} onDepartmentDelete={fetchDepartments} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* RESPONSIVE PAGINATION */}
              {filteredDepartments.length > ITEMS_PER_PAGE && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-10 bg-slate-50/50 border-t border-white gap-6 sm:gap-0">
                  
                  {/* Page Indicator */}
                  <div className="order-1 sm:order-2 px-8 py-3 bg-white rounded-full border border-slate-100 shadow-inner">
                    <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Page <span className="text-red-600">{currentPage}</span> 
                      <span className="mx-2 text-slate-200">/</span> {totalPages}
                    </p>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="order-2 sm:order-1 flex w-full sm:w-auto gap-4 items-center justify-between sm:contents">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 shadow-sm transition-all enabled:hover:text-red-600 enabled:hover:shadow-md enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} strokeWidth={3} /> Previous
                    </button>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex-1 sm:flex-none order-3 flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 shadow-sm transition-all enabled:hover:text-red-600 enabled:hover:shadow-md enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentList;