import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EmployeeButtons } from "../../utils/EmployeeHelper";
import { Search, UserPlus, Users, ChevronLeft, ChevronRight } from "lucide-react";

/* ================= COMPACT PREMIUM MOBILE CARD ================= */
const MobileEmployeeCard = ({ emp, getImageUrl }) => {
  return (
    <div className="bg-white rounded-[1.5rem] shadow-lg border border-white p-4 transition-all active:scale-[0.98]">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={getImageUrl(emp.profileImage)}
            onError={(e) => (e.target.src = "/default-avatar.png")}
            className="w-12 h-12 rounded-[1rem] object-cover border-2 border-red-50 shadow-sm shrink-0"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[8px] font-black uppercase tracking-widest text-red-500 mb-0.5">
            {emp.employeeId}
          </p>
          <p className="font-black text-slate-800 uppercase italic tracking-tighter truncate leading-none text-sm">
            {emp.name}
          </p>
          <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
            {emp.designation} <span className="text-red-300 mx-1">•</span> {emp.dep_name}
          </p>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end">
        <EmployeeButtons id={emp._id} />
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 5;

const List = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchEmployees = async () => {
      setEmpLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/employee`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        if (response.data.success) {
          const sortedEmployees = [...response.data.employees].sort((a, b) => {
            const idA = a.employeeId ?? "";
            const idB = b.employeeId ?? "";
            return !isNaN(idA) && !isNaN(idB) ? Number(idA) - Number(idB) : String(idA).localeCompare(String(idB));
          });

          let sno = 1;
          const data = sortedEmployees.map((emp) => ({
            _id: emp._id,
            sno: sno++,
            employeeId: emp.employeeId || "N/A",
            dep_name: emp.department?.dep_name || "N/A",
            designation: emp.designation || "N/A",
            name: emp.userId?.name || "Unknown",
            dob: emp.dob ? new Date(emp.dob).toDateString() : "N/A",
            profileImage: emp.userId?.profileImage || "",
          }));

          setEmployees(data);
          setFilteredEmployees(data);
        }
      } catch (error) {
        console.error("Failed to load employees");
      } finally {
        setEmpLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const result = employees.filter((emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredEmployees(result);
    setCurrentPage(1);
  }, [search, employees]);

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${import.meta.env.VITE_BACKEND_URL}/${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 pb-8">
      <div className="max-w-[1000px] mx-auto p-4 sm:p-6 space-y-6">
        
        {/* HEADER - SCALED DOWN */}
        <header className="flex items-center gap-4 pt-1">
          <div className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-red-100 shrink-0">
            <Users size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-red-700 uppercase tracking-tighter sm:text-3xl leading-none italic">
               Employees
            </h1>
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">
              Manage Organization Staff
            </p>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white overflow-hidden">
          
          {/* SEARCH & ACTION ROW */}
          <div className="p-5 md:p-6 border-b border-slate-50">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              
              {/* SEARCH BAR */}
              <div className="group relative flex-1 w-full flex items-center bg-slate-100/50 border-2 border-transparent rounded-[1.2rem] px-4 focus-within:border-red-500/20 focus-within:bg-white transition-all shadow-inner">
                <Search className="text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="SEARCH BY NAME OR ID..."
                  className="w-full py-4 pl-3 outline-none bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-700 placeholder:text-slate-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* ACTION BUTTON */}
              <Link
                to="/admin-dashboard/add-employee"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-[1.2rem] bg-red-700 px-6 py-4 font-black uppercase text-[9px] tracking-widest text-white shadow-xl shadow-red-50 transition-all hover:bg-red-600 active:scale-95 whitespace-nowrap"
              >
                <UserPlus size={16} strokeWidth={3} />
                <span>Add New</span>
              </Link>
            </div>
          </div>

          {empLoading ? (
            <div className="p-16 text-center">
              <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Syncing Records...</p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="md:hidden p-3 space-y-3">
                {paginatedEmployees.length ? (
                  paginatedEmployees.map((emp) => (
                    <MobileEmployeeCard key={emp._id} emp={emp} getImageUrl={getImageUrl} />
                  ))
                ) : (
                  <p className="text-center py-10 font-bold text-slate-300 uppercase text-xs">No Results Found</p>
                )}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto px-4 pb-4">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-6 py-4 text-left">S.No</th>
                      <th className="px-6 py-4 text-left">Identity</th>
                      <th className="px-6 py-4 text-left">Employee Name</th>
                      <th className="px-6 py-4 text-left">Department</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEmployees.map((emp) => (
                      <tr key={emp._id} className="bg-slate-50/50 hover:bg-red-50/50 transition-all group">
                        <td className="px-6 py-4 first:rounded-l-[1.5rem] text-[10px] font-black text-slate-300 italic">#{emp.sno}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={getImageUrl(emp.profileImage)}
                              className="w-8 h-8 rounded-[0.6rem] object-cover border-2 border-white shadow-sm"
                              alt=""
                            />
                            <span className="bg-white px-2 py-0.5 rounded-md text-[9px] font-black text-slate-600 border border-slate-100">
                              {emp.employeeId}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-black text-slate-700 uppercase italic tracking-tighter group-hover:text-red-700 transition-colors text-sm">
                            {emp.name}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                            {emp.designation}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-white rounded-[0.8rem] text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-100">
                            {emp.dep_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 last:rounded-r-[1.5rem] text-right">
                          <EmployeeButtons id={emp._id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {filteredEmployees.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between p-6 bg-slate-50/50">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 transition-all enabled:hover:text-red-600 enabled:active:scale-90 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} strokeWidth={3} /> Prev
                  </button>

                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Page <span className="text-red-600">{currentPage}</span> / {totalPages}
                  </p>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 transition-all enabled:hover:text-red-600 enabled:active:scale-90 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
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

export default List;