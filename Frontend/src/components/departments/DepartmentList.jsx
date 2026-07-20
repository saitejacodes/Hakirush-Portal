import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Plus, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { DepartmentButtons } from "../../utils/DepartmentHelper";

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#C6A15B";
const HAIRLINE = "#E7DFD2";

const displayFont = { fontFamily: "'Playfair Display', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

const GRAIN_URI =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='140'%20height='140'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23n)'%20opacity='0.5'/%3E%3C/svg%3E";

/* ================= PREMIUM MOBILE CARD ================= */
const MobileDepartmentCard = ({ dep, fetchDepartments }) => {
  return (
    <div
      className="mx-auto w-full max-w-[420px] rounded-2xl border border-[#E7DFD2] bg-white/75 p-4 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_16px_32px_-16px_rgba(28,26,23,0.14)] backdrop-blur-md transition-all duration-300 active:scale-[0.98] sm:p-6"
      style={bodyFont}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border sm:h-14 sm:w-14"
          style={{ borderColor: `${GARNET}30`, color: GARNET, backgroundColor: `${GARNET}0A` }}
        >
          <Building2 size={20} strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[9.5px] font-semibold uppercase tracking-[0.24em]" style={{ color: GOLD }}>
            Dept-Id {String(dep.sno).padStart(2, "0")}
          </p>
          <p
            className="truncate text-lg leading-none tracking-tight text-[#1C1A17] sm:text-xl"
            style={{ ...displayFont, fontWeight: 700 }}
          >
            {dep.dep_name}
          </p>
          <p className="mt-2 text-[8.5px] font-semibold uppercase tracking-[0.3em] text-[#B4ADA0]">
            Organizational Unit
          </p>
        </div>
      </div>

      <div className="mt-5 flex justify-end border-t pt-4" style={{ borderColor: HAIRLINE }}>
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
    <div
      className="relative min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-100 pb-20 text-[#1C1A17]"
      style={bodyFont}
    >
      {/* faint paper grain, matching the dashboard */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] mix-blend-multiply"
        style={{ backgroundImage: `url("${GRAIN_URI}")` }}
      />
      {/* masthead rule */}
      <div
        className="relative z-10 h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, ${GARNET}, ${GOLD} 45%, ${GARNET})` }}
      />

      <div className="relative z-10 mx-auto max-w-[1200px] space-y-6 p-4 sm:space-y-8 sm:p-8">

        {/* HEADER */}
        <header className="flex items-center gap-5 pt-4 sm:gap-6 sm:pt-6">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] text-white shadow-[0_20px_40px_-14px_rgba(122,34,51,0.45)] sm:h-16 sm:w-16"
            style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
          >
            <Building2 size={28} strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-px w-6" style={{ backgroundColor: GOLD }} />
              <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-[#C6A15B] sm:text-[10px]">
                Organization
              </p>
            </div>
            <h1
              className="text-2xl leading-[0.95] tracking-tight text-[#1C1A17] sm:text-4xl"
              style={{ ...displayFont, fontWeight: 700 }}
            >
              <span className="italic text-[#7A2233]">Department</span> Directory
            </h1>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <div className="overflow-hidden rounded-[2rem] border border-[#E7DFD2] bg-white/70 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_30px_60px_-24px_rgba(28,26,23,0.16)] backdrop-blur-md sm:rounded-[2.25rem]">

          {/* SEARCH & ACTION ROW */}
          <div className="border-b p-6 md:p-9" style={{ borderColor: HAIRLINE }}>
            <div className="flex flex-col items-center gap-4 lg:flex-row lg:gap-5">

              {/* SEARCH BAR */}
              <div className="group relative flex min-h-[48px] w-full flex-1 items-center rounded-2xl border px-4 transition-all focus-within:border-[#C6A15B]/50 focus-within:bg-white sm:px-6"
                style={{ borderColor: HAIRLINE, backgroundColor: "#FBF8F3" }}
              >
                <Search className="text-[#B4ADA0] transition-colors group-focus-within:text-[#7A2233]" size={17} strokeWidth={1.75} />
                <input
                  type="text"
                  placeholder="Search by department name…"
                  className="w-full bg-transparent py-3 pl-3 text-[12px] font-semibold uppercase tracking-widest text-[#1C1A17] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[#B4ADA0]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* ACTION BUTTON */}
              <Link
                to="/admin-dashboard/add-department"
                className="flex min-h-[48px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-6 py-4 text-[11px] font-semibold uppercase tracking-widest text-white shadow-[0_14px_28px_-10px_rgba(28,26,23,0.35)] transition-all duration-300 active:scale-95 lg:w-auto"
                style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
              >
                <Plus size={16} strokeWidth={2} />
                <span>Add New Dept</span>
              </Link>
            </div>
          </div>

          {depLoading ? (
            <div className="p-24 text-center">
              <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-[#E7DFD2] border-t-[#7A2233]"></div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-[#8A8378]">
                Syncing Records
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="space-y-5 px-2 py-4 md:hidden">
                {paginatedDepartments.length ? (
                  paginatedDepartments.map((dep) => (
                    <MobileDepartmentCard key={dep._id} dep={dep} fetchDepartments={fetchDepartments} />
                  ))
                ) : (
                  <p className="py-16 text-center text-xs font-semibold uppercase tracking-widest text-[#B4ADA0]">
                    No Departments Found
                  </p>
                )}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto px-8 pb-10 md:block">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10.5px] font-semibold uppercase tracking-[0.28em] text-[#B4ADA0]">
                      <th className="px-8 py-3 text-left">Ref</th>
                      <th className="px-8 py-3 text-left">Department Name</th>
                      <th className="px-8 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDepartments.map((dep) => (
                      <tr
                        key={dep._id}
                        className="group border transition-all duration-300 hover:border-[#D9C79A]"
                        style={{ backgroundColor: "#FBF8F3", borderColor: HAIRLINE }}
                      >
                        <td className="rounded-l-[1.5rem] px-8 py-5 text-[11px] font-semibold italic tabular-nums text-[#B4ADA0]">
                          {String(dep.sno).padStart(2, "0")}
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className="text-xl leading-none tracking-tight text-[#1C1A17] transition-colors group-hover:text-[#7A2233]"
                            style={{ ...displayFont, fontWeight: 700 }}
                          >
                            {dep.dep_name}
                          </span>
                        </td>
                        <td className="rounded-r-[1.5rem] px-8 py-5 text-right">
                          <DepartmentButtons id={dep._id} onDepartmentDelete={fetchDepartments} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* RESPONSIVE PAGINATION */}
              {filteredDepartments.length > ITEMS_PER_PAGE && (
                <div
                  className="flex flex-col items-center justify-between gap-6 border-t p-6 sm:flex-row sm:gap-0 sm:p-9"
                  style={{ borderColor: HAIRLINE, backgroundColor: "#FBF8F3" }}
                >
                  {/* Page Indicator */}
                  <div
                    className="order-1 rounded-full border bg-white px-7 py-2.5 sm:order-2"
                    style={{ borderColor: HAIRLINE }}
                  >
                    <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-[#8A8378] sm:text-[11px]">
                      Page <span style={{ color: GARNET }}>{currentPage}</span>
                      <span className="mx-2 text-[#E7DFD2]">/</span> {totalPages}
                    </p>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="order-2 flex w-full items-center justify-between gap-4 sm:order-1 sm:w-auto sm:contents">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-2xl border bg-white px-7 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-[#8A8378] shadow-[0_1px_2px_rgba(28,26,23,0.04)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:border-[#D9C79A] enabled:hover:text-[#7A2233] enabled:active:scale-95 sm:flex-none"
                      style={{ borderColor: HAIRLINE }}
                    >
                      <ChevronLeft size={16} strokeWidth={1.75} /> Previous
                    </button>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="order-3 flex flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-2xl border bg-white px-7 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-[#8A8378] shadow-[0_1px_2px_rgba(28,26,23,0.04)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:border-[#D9C79A] enabled:hover:text-[#7A2233] enabled:active:scale-95 sm:flex-none"
                      style={{ borderColor: HAIRLINE }}
                    >
                      Next <ChevronRight size={16} strokeWidth={1.75} />
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