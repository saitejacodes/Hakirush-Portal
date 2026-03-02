import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EmployeeButtons } from "../../utils/EmployeeHelper";
import { Search, UserPlus, Users, ChevronLeft, ChevronRight } from "lucide-react";

/* ================= COMPACT PREMIUM MOBILE CARD ================= */
const MobileEmployeeCard = ({ emp, getImageUrl }) => {
  return (
    <div className="bg-white rounded-[1.5rem] shadow-lg border border-white p-5 transition-all active:scale-[0.98]">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={getImageUrl(emp.profileImage)}
            onError={(e) => (e.target.src = "/default-avatar.png")}
            className="w-14 h-14 rounded-[1.2rem] object-cover border-2 border-red-50 shadow-sm shrink-0"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-0.5">
            {emp.employeeId}
          </p>
          <p className="font-black text-slate-800 uppercase italic tracking-tighter truncate leading-none text-base">
            {emp.name}
          </p>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
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
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 pb-12">
      {/* Container widened to 1400px for a more expansive look */}
      <div className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-8">
        
        {/* HEADER */}
        <header className="flex items-center gap-6 pt-2">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-2xl shadow-red-200 shrink-0">
            <Users size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-red-800 uppercase tracking-tighter sm:text-4xl leading-none italic">
              Organization Staff
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mt-3">
              Real-time Employee Directory & Management
            </p>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
          
          {/* SEARCH & ACTION ROW - Expanded Padding */}
          <div className="p-6 md:p-10 border-b border-slate-50">
            <div className="flex flex-col lg:flex-row gap-5 items-center">
              
              {/* SEARCH BAR */}
              <div className="group relative flex-1 w-full flex items-center bg-slate-100/50 border-2 border-transparent rounded-[1.5rem] px-6 focus-within:border-red-500/20 focus-within:bg-white transition-all shadow-inner">
                <Search className="text-slate-300 group-focus-within:text-red-500 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="SEARCH RECORDS BY NAME OR EMPLOYEE ID..."
                  className="w-full py-5 pl-4 outline-none bg-transparent text-[11px] font-black uppercase tracking-widest text-slate-700 placeholder:text-slate-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* ACTION BUTTON */}
              <Link
                to="/admin-dashboard/add-employee"
                className="w-full lg:w-auto flex items-center justify-center gap-3 rounded-[1.5rem] bg-gradient-to-br from-slate-900 to-slate-800 px-10 py-5 font-black uppercase text-[10px] tracking-widest text-white shadow-2xl shadow-red-100 transition-all hover:from-red-600 hover:to-rose-500 hover:-translate-y-1 active:scale-95 whitespace-nowrap"
              >
                <UserPlus size={18} strokeWidth={3} />
                <span>Add New Member</span>
              </Link>
            </div>
          </div>

          {empLoading ? (
            <div className="p-24 text-center">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing Database...</p>
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
                  <p className="text-center py-16 font-bold text-slate-300 uppercase text-xs">No records found</p>
                )}
              </div>

              {/* DESKTOP VIEW */}
              <div className="hidden md:block overflow-x-auto px-8 pb-10">
                <table className="w-full border-separate border-spacing-y-5">
                  <thead>
                    <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                      <th className="px-8 py-4 text-left">S.No</th>
                      <th className="px-8 py-4 text-left">Identification</th>
                      <th className="px-8 py-4 text-left">Member Details</th>
                      <th className="px-8 py-4 text-left">Department</th>
                      <th className="px-8 py-4 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEmployees.map((emp) => (
                      <tr key={emp._id} className="bg-slate-50/40 hover:bg-white transition-all group shadow-sm hover:shadow-xl hover:shadow-red-500/5">
                        {/* S.No */}
                        <td className="px-8 py-6 first:rounded-l-[2rem] text-[11px] font-black text-slate-300 italic">
                          {emp.sno.toString().padStart(2, '0')}
                        </td>

                        {/* ID & Photo */}
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img
                                src={getImageUrl(emp.profileImage)}
                                className="w-12 h-12 rounded-[1rem] object-cover border-2 border-white shadow-md group-hover:scale-110 transition-transform duration-300"
                                alt=""
                              />
                            </div>
                            <span className="bg-white px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-600 border border-slate-100 shadow-sm">
                              {emp.employeeId}
                            </span>
                          </div>
                        </td>

                        {/* Name & Title */}
                        <td className="px-8 py-6">
                          <p className="font-black text-slate-800 uppercase italic tracking-tighter group-hover:text-red-700 transition-colors text-base leading-tight">
                            {emp.name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {emp.designation}
                          </p>
                        </td>

                        {/* Department */}
                        <td className="px-8 py-6">
                          <span className="px-4 py-2 bg-white rounded-[1rem] text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100 shadow-sm group-hover:border-red-100 transition-colors">
                            {emp.dep_name}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-8 py-6 last:rounded-r-[2rem] text-right">
                          <div className="scale-110 origin-right transition-transform group-hover:translate-x-[-4px]">
                            <EmployeeButtons id={emp._id} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION - RESPONSIVE DESIGN */}
                {filteredEmployees.length > ITEMS_PER_PAGE && (
                  <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 bg-slate-50/50 border-t border-white gap-4 sm:gap-0">
                    
                    {/* Page Counter - Appears first on mobile stack */}
                    <div className="order-1 sm:order-2 px-6 py-2 bg-white rounded-full border border-slate-100 shadow-inner">
                      <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Page <span className="text-red-600">{currentPage}</span> 
                        <span className="mx-2 text-slate-200">/</span> {totalPages}
                      </p>
                    </div>

                    {/* Buttons Container - Side by side on mobile */}
                    <div className="order-2 sm:order-1 flex w-full sm:w-auto gap-3 items-center justify-between sm:contents">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-2xl bg-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 shadow-sm transition-all enabled:hover:text-red-600 enabled:hover:shadow-md enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={14} className="sm:w-4 sm:h-4" strokeWidth={3} /> 
                        <span>Prev</span>
                      </button>

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex-1 sm:flex-none order-3 flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-2xl bg-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 shadow-sm transition-all enabled:hover:text-red-600 enabled:hover:shadow-md enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <span>Next</span>
                        <ChevronRight size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
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

export default List;