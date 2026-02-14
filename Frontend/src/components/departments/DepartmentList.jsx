import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search, Plus, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { DepartmentButtons } from "../../utils/DepartmentHelper";

/* ================= MOBILE CARD ================= */
const MobileDepartmentCard = ({ dep, fetchDepartments }) => {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-50 flex items-center justify-between transition-transform hover:scale-[1.02]">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
          <Building2 size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department</p>
          <p className="font-black text-slate-800 text-lg uppercase italic tracking-tighter">{dep.dep_name}</p>
        </div>
      </div>
      <DepartmentButtons id={dep._id} onDepartmentDelete={fetchDepartments} />
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
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-2">
          <div>
            <h1 className="text-3xl font-black text-red-700 uppercase tracking-tighter sm:text-5xl leading-none">
              Departments
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2 ml-1">
              Organization Structure
            </p>
          </div>
  
          <Link
            to="/admin-dashboard/add-department"
            className="group flex items-center gap-3 rounded-2xl bg-gradient-to-br from-red-600 to-rose-500 px-8 py-4 font-black uppercase text-[11px] tracking-widest text-white shadow-xl shadow-red-200 transition-all hover:scale-105 hover:shadow-red-300 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} className="text-white" /> 
            <span>Add New Dept</span>
          </Link>
        </header>

        {/* TOP BAR / SEARCH */}
        <div className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-white flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input
              type="text"
              placeholder="SEARCH BY NAME..."
              className="w-full rounded-2xl border-none bg-slate-50 pl-14 pr-6 py-4 outline-none focus:ring-2 focus:ring-red-500/20 text-[12px] font-black uppercase tracking-widest text-slate-600 placeholder:text-slate-300 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {depLoading ? (
          <div className="h-40 flex items-center justify-center font-black italic text-slate-300 uppercase tracking-tighter text-2xl">
            Loading Records...
          </div>
        ) : (
          <>
            {/* MOBILE VIEW */}
            <div className="md:hidden space-y-4">
              {paginatedDepartments.length ? (
                paginatedDepartments.map((dep) => (
                  <MobileDepartmentCard key={dep._id} dep={dep} fetchDepartments={fetchDepartments} />
                ))
              ) : (
                <div className="text-center text-slate-400 py-10 font-black uppercase tracking-widest">No Results</div>
              )}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-white rounded-[3rem] shadow-2xl border border-white overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">S.No</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Department Name</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedDepartments.map((dep) => (
                    <tr key={dep._id} className="hover:bg-red-50/30 transition-colors group">
                      <td className="px-8 py-6 text-sm font-black text-slate-300 italic">#{dep.sno}</td>
                      <td className="px-8 py-6">
                        <span className="text-lg font-black text-slate-700 uppercase italic tracking-tighter group-hover:text-red-600 transition-colors">
                          {dep.dep_name}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <DepartmentButtons id={dep._id} onDepartmentDelete={fetchDepartments} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION (Matching your monthly calendar controls) */}
            {filteredDepartments.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between bg-white p-4 rounded-[2rem] shadow-lg border border-white">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-3 rounded-xl transition-all ${currentPage === 1 ? "text-slate-200 cursor-not-allowed" : "bg-slate-100 text-slate-600 hover:bg-red-500 hover:text-white cursor-pointer"}`}
                >
                  <ChevronLeft size={20} />
                </button>
                
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                  Page <span className="text-red-500">{currentPage}</span> of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-3 rounded-xl transition-all ${currentPage === totalPages ? "text-slate-200 cursor-not-allowed" : "bg-slate-100 text-slate-600 hover:bg-red-500 hover:text-white cursor-pointer"}`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DepartmentList;