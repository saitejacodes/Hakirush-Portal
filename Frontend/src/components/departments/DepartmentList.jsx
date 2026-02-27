import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search, Plus, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { DepartmentButtons } from "../../utils/DepartmentHelper";

/* ================= PREMIUM MOBILE CARD (SCALED DOWN) ================= */
const MobileDepartmentCard = ({ dep, fetchDepartments }) => {
  return (
    <div className="bg-white rounded-[1.5rem] shadow-md border border-white p-4 transition-all active:scale-[0.98]">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl flex items-center justify-center text-red-500 shadow-inner">
          <Building2 size={20} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[8px] font-black uppercase tracking-widest text-red-500 mb-0.5">
            DEPT-ID: {dep.sno}
          </p>
          <p className="font-black text-slate-800 uppercase italic tracking-tighter truncate leading-none text-base">
            {dep.dep_name}
          </p>
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">
            Internal Department
          </p>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end">
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
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 pb-8">
      <div className="max-w-[1000px] mx-auto p-4 sm:p-6 space-y-6">
        <header className="flex items-center gap-4 pt-1">
          <div className="w-12 h-12 rounded-[0.8rem] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-100">
            <Building2 size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-black text-red-700 uppercase tracking-tighter sm:text-3xl leading-none italic">
              Departments
            </h1>
            <p className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-400 mt-1">
              Organization Structure
            </p>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-xl border border-white overflow-hidden">
          
          {/* SEARCH & ACTION ROW */}
          <div className="p-5 md:p-6 border-b border-slate-50">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              
              {/* SEARCH BAR */}
              <div className="group relative flex-1 w-full flex items-center bg-slate-100/50 border-2 border-transparent rounded-[1.2rem] px-4 focus-within:border-red-500/20 focus-within:bg-white transition-all shadow-inner">
                <Search className="text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="SEARCH DEPARTMENTS..."
                  className="w-full py-3.5 pl-3 outline-none bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-700 placeholder:text-slate-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* ACTION BUTTON */}
              <Link
                to="/admin-dashboard/add-department"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-[1.2rem] bg-red-700 px-6 py-3.5 font-black uppercase text-[9px] tracking-widest text-white shadow-lg transition-all hover:bg-red-600 active:scale-95 whitespace-nowrap"
              >
                <Plus size={16} strokeWidth={3} />
                <span>Add New Dept</span>
              </Link>
            </div>
          </div>

          {depLoading ? (
            <div className="p-16 text-center">
              <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Syncing Records...</p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="md:hidden p-3 space-y-3">
                {paginatedDepartments.length ? (
                  paginatedDepartments.map((dep) => (
                    <MobileDepartmentCard key={dep._id} dep={dep} fetchDepartments={fetchDepartments} />
                  ))
                ) : (
                  <p className="text-center py-8 font-bold text-slate-300 uppercase text-[10px]">No Departments Found</p>
                )}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto px-3 pb-3">
                <table className="w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-6 py-3 text-left">S.No</th>
                      <th className="px-6 py-3 text-left">Department Name</th>
                      <th className="px-8 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDepartments.map((dep) => (
                      <tr key={dep._id} className="bg-slate-50/50 hover:bg-red-50/50 transition-all group">
                        <td className="px-6 py-4 first:rounded-l-[1.2rem] text-[10px] font-black text-slate-300 italic">
                          {dep.sno}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <span className="font-black text-slate-700 uppercase italic tracking-tighter text-base group-hover:text-red-700 transition-colors">
                              {dep.dep_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-4 last:rounded-r-[1.2rem] text-right">
                          <DepartmentButtons id={dep._id} onDepartmentDelete={fetchDepartments} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {filteredDepartments.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between p-6 bg-slate-50/50">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 transition-all enabled:hover:text-red-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} strokeWidth={3} /> Prev
                  </button>

                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Page <span className="text-red-600">{currentPage}</span> / {totalPages}
                  </p>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 transition-all enabled:hover:text-red-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight size={14} strokeWidth={3} />
                  </button>
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