import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EmployeeButtons } from "../../utils/EmployeeHelper";
import { Search, UserPlus, Users, ChevronLeft, ChevronRight } from "lucide-react";

/* ================= PREMIUM MOBILE CARD ================= */
const MobileEmployeeCard = ({ emp, getImageUrl }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-lg border border-white p-5 transition-all active:scale-[0.98]">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={getImageUrl(emp.profileImage)}
            onError={(e) => (e.target.src = "/default-avatar.png")}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-red-50 shadow-sm shrink-0"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">
            {emp.employeeId}
          </p>
          <p className="font-black text-slate-800 uppercase italic tracking-tighter truncate leading-none">
            {emp.name}
          </p>
          <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
            {emp.designation} <span className="text-red-300 mx-1">•</span> {emp.dep_name}
          </p>
        </div>
      </div>
      
      <div className="mt-5 pt-4 border-t border-slate-50 flex justify-end">
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
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
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
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 pb-12">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
        
        {/* HEADER */}
        <header className="flex items-center gap-5 pt-2">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-red-100">
            <Users size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-red-700 uppercase tracking-tighter sm:text-5xl leading-none italic">
               Employees
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">
              Manage Organization Staff
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
                  placeholder="SEARCH BY NAME OR ID..."
                  className="w-full py-5 pl-4 outline-none bg-transparent text-[11px] font-black uppercase tracking-widest text-slate-700 placeholder:text-slate-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* ACTION BUTTON BESIDE SEARCH */}
              <Link
                to="/admin-dashboard/add-employee"
                className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-[1.5rem] bg-red-700 px-8 py-5 font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-slate-200 transition-all hover:bg-red-600 hover:shadow-red-200 active:scale-95 whitespace-nowrap"
              >
                <UserPlus size={18} strokeWidth={3} />
                <span>Add New</span>
              </Link>
            </div>
          </div>

          {empLoading ? (
            <div className="p-24 text-center">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Syncing Records...</p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="md:hidden p-4 space-y-4">
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
                        <td className="px-6 py-4 first:rounded-l-[1.5rem] text-xs font-black text-slate-300 italic">#{emp.sno}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={getImageUrl(emp.profileImage)}
                              className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm"
                              alt=""
                            />
                            <span className="bg-white px-3 py-1 rounded-lg text-[10px] font-black text-slate-600 border border-slate-100">
                              {emp.employeeId}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-black text-slate-700 uppercase italic tracking-tighter group-hover:text-red-700 transition-colors">
                            {emp.name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            {emp.designation}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-4 py-2 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100">
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

export default List;