import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search, Plus, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { DepartmentButtons } from "../../utils/DepartmentHelper";

/* ================= PREMIUM MOBILE CARD ================= */
const MobileDepartmentCard = ({ dep, fetchDepartments }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-lg border border-white p-5 transition-all active:scale-[0.98]">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl flex items-center justify-center text-red-500 shadow-inner">
          <Building2 size={24} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">
            DEPT-ID: {dep.sno}
          </p>
          <p className="font-black text-slate-800 uppercase italic tracking-tighter truncate leading-none text-lg">
            {dep.dep_name}
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">
            Internal Department
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
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
        
        {/* HEADER (Same as Employee List) */}
        <header className="flex items-center gap-5 pt-2">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-red-100">
            <Building2 size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-red-700 uppercase tracking-tighter sm:text-5xl leading-none italic">
              Departments
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">
              Organization Structure
            </p>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white overflow-hidden">
          
          {/* SEARCH & ACTION ROW */}
          <div className="p-6 md:p-8 border-b border-slate-50">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              
              {/* SEARCH BAR */}
              <div className="group relative flex-1 w-full flex items-center bg-slate-100/50 border-2 border-transparent rounded-[1.5rem] px-5 focus-within:border-red-500/20 focus-within:bg-white transition-all shadow-inner">
                <Search className="text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="SEARCH DEPARTMENTS..."
                  className="w-full py-5 pl-4 outline-none bg-transparent text-[11px] font-black uppercase tracking-widest text-slate-700 placeholder:text-slate-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* ACTION BUTTON */}
              <Link
                to="/admin-dashboard/add-department"
                className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-[1.5rem] bg-red-700 px-8 py-5 font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-slate-200 transition-all hover:bg-red-600 hover:shadow-red-200 active:scale-95 whitespace-nowrap"
              >
                <Plus size={18} strokeWidth={3} />
                <span>Add New Dept</span>
              </Link>
            </div>
          </div>

          {depLoading ? (
            <div className="p-24 text-center">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Syncing Records...</p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="md:hidden p-4 space-y-4">
                {paginatedDepartments.length ? (
                  paginatedDepartments.map((dep) => (
                    <MobileDepartmentCard key={dep._id} dep={dep} fetchDepartments={fetchDepartments} />
                  ))
                ) : (
                  <p className="text-center py-10 font-bold text-slate-300 uppercase text-xs">No Departments Found</p>
                )}
              </div>

              {/* DESKTOP TABLE (Spaced-out style) */}
              <div className="hidden md:block overflow-x-auto px-4 pb-4">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-8 py-4 text-left">S.No</th>
                      <th className="px-8 py-4 text-left">Department Name</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDepartments.map((dep) => (
                      <tr key={dep._id} className="bg-slate-50/50 hover:bg-red-50/50 transition-all group">
                        <td className="px-8 py-6 first:rounded-l-[1.5rem] text-xs font-black text-slate-300 italic">
                          #{dep.sno}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <span className="w-2 h-2 rounded-full bg-red-400 group-hover:scale-150 transition-transform"></span>
                            <span className="font-black text-slate-700 uppercase italic tracking-tighter text-lg group-hover:text-red-700 transition-colors">
                              {dep.dep_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 last:rounded-r-[1.5rem] text-right">
                          <DepartmentButtons id={dep._id} onDepartmentDelete={fetchDepartments} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {filteredDepartments.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between p-8 bg-slate-50/50">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 transition-all enabled:cursor-pointer enabled:hover:text-red-600 enabled:active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} strokeWidth={3} /> Prev
                  </button>

                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Page <span className="text-red-600">{currentPage}</span> / {totalPages}
                  </p>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 transition-all enabled:cursor-pointer enabled:hover:text-red-600 enabled:active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight size={16} strokeWidth={3} />
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