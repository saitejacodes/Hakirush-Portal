import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Plus, ChevronLeft, ChevronRight, ChevronDown, Building2 } from "lucide-react";
import { DepartmentButtons } from "../../utils/DepartmentHelper";

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#C6A15B";
const HAIRLINE = "#E7DFD2";

const displayFont = { fontFamily: "'Playfair Display', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

const GRAIN_URI =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='140'%20height='140'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23n)'%20opacity='0.5'/%3E%3C/svg%3E";

/* Scoped scrollbar styling for the table viewport */
const ScrollbarStyle = () => (
  <style>{`
    .dept-table-scroll::-webkit-scrollbar {
      width: 10px;
    }
    .dept-table-scroll::-webkit-scrollbar-track {
      background: #FBF8F3;
      border-radius: 999px;
    }
    .dept-table-scroll::-webkit-scrollbar-thumb {
      background-color: ${GOLD};
      background-image: linear-gradient(180deg, ${GOLD}, ${GARNET});
      background-clip: padding-box;
      border: 2.5px solid #FBF8F3;
      border-radius: 999px;
    }
    .dept-table-scroll::-webkit-scrollbar-thumb:hover {
      border-color: #F5EFE2;
    }
    .dept-table-scroll {
      scrollbar-width: thin;
      scrollbar-color: ${GOLD} #FBF8F3;
    }
  `}</style>
);

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

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [depLoading, setDepLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
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

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const result = departments.filter((dep) =>
      dep.dep_name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredDepartments(result);
    setCurrentPage(1);
  }, [search, departments]);

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDepartments = filteredDepartments.slice(startIndex, startIndex + itemsPerPage);

  const handlePageSizeChange = (size) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  return (
    <div
      className="relative min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-100 pb-20 text-[#1C1A17]"
      style={bodyFont}
    >
      <ScrollbarStyle />

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
        <header className="flex flex-col gap-6 pt-4 sm:pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5 sm:gap-6">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] text-white shadow-[0_20px_40px_-14px_rgba(122,34,51,0.45)] sm:h-16 sm:w-16"
              style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
            >
              <Building2 size={28} strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="h-px w-7" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
                <p className="text-[9px] font-semibold uppercase tracking-[0.42em] text-[#C6A15B] sm:text-[10px]">
                  Organization
                </p>
              </div>
              <h1
                className="text-3xl leading-[0.92] tracking-tight text-[#1C1A17] sm:text-[2.75rem]"
                style={{ ...displayFont, fontWeight: 700 }}
              >
                <span className="italic" style={{ color: GARNET }}>Department</span> Directory
              </h1>
              <p className="max-w-md text-[12px] font-medium leading-relaxed text-[#8A8378] sm:text-[13px]">
                A structured registry of every operating unit across the organization.
              </p>
            </div>
          </div>

          {/* DEPARTMENT COUNT — quiet stat badge */}
          {!depLoading && departments.length > 0 && (
            <div
              className="flex items-center gap-4 self-start rounded-2xl border bg-white/70 px-6 py-3.5 backdrop-blur-md lg:self-auto"
              style={{ borderColor: HAIRLINE }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${GOLD}18`, color: GARNET }}
              >
                <Building2 size={16} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B4ADA0]">
                  Total Departments
                </p>
                <p className="text-xl leading-none tracking-tight text-[#1C1A17]" style={{ ...displayFont, fontWeight: 700 }}>
                  {departments.length}
                </p>
              </div>
            </div>
          )}
        </header>

        {/* MAIN CONTAINER */}
        <div className="overflow-hidden rounded-[2rem] border border-[#E7DFD2] bg-white/70 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_30px_60px_-24px_rgba(28,26,23,0.16)] backdrop-blur-md sm:rounded-[2.25rem]">
          {/* SEARCH & ACTION ROW */}
          <div className="border-b p-3 md:p-5" style={{ borderColor: HAIRLINE }}>
            <div className="flex flex-col items-center gap-4 lg:flex-row lg:gap-5">
              {/* SEARCH BAR */}
              <div
                className="group relative flex min-h-[40px] w-full flex-1 items-center rounded-2xl border px-2 transition-all focus-within:border-[#C6A15B]/50 focus-within:bg-white sm:px-6"
                style={{ borderColor: HAIRLINE, backgroundColor: "#FBF8F3" }}
              >
                <Search
                  className="text-[#B4ADA0] transition-colors group-focus-within:text-[#7A2233]"
                  size={17}
                  strokeWidth={1.75}
                />
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
                className="flex min-h-[40px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-6 py-2 text-[11px] font-semibold uppercase tracking-widest text-white shadow-[0_14px_28px_-10px_rgba(28,26,23,0.35)] transition-all duration-300 active:scale-95 lg:w-auto"
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

              {/* DESKTOP TABLE — scrollable viewport with sticky header */}
              <div className="mt-10 hidden px-8 pb-10 md:block lg:px-12">
                <div
                  className="relative overflow-hidden rounded-[1.75rem] border shadow-[inset_0_1px_2px_rgba(28,26,23,0.03)]"
                  style={{ borderColor: HAIRLINE, backgroundColor: "#FBF8F3" }}
                >
                  <div className="dept-table-scroll max-h-[28rem] overflow-y-auto px-3 pb-3 pt-1">
                    <table className="w-full border-separate" style={{ borderSpacing: "0 0.875rem" }}>
                      <thead className="sticky top-0 z-10">
                        <tr
                          className="text-left text-[10.5px] font-semibold uppercase tracking-[0.28em] text-[#B4ADA0]"
                        >
                          <th className="w-16 py-4 pl-3 pt-5 font-semibold" style={{ backgroundColor: "#FBF8F3" }}>
                            <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>
                              Ref
                            </span>
                          </th>
                          <th className="py-4 pl-2 pt-5 font-semibold" style={{ backgroundColor: "#FBF8F3" }}>
                            <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>
                              Department name
                            </span>
                          </th>
                          <th className="w-44 py-4 pr-3 pt-5 text-right font-semibold" style={{ backgroundColor: "#FBF8F3" }}>
                            <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>
                              Actions
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                      {paginatedDepartments.map((dep) => (
                        <tr
                          key={dep._id}
                          className="group relative bg-white shadow-[0_1px_2px_rgba(28,26,23,0.04)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_20px_36px_-18px_rgba(28,26,23,0.24)]"
                        >
                          <td
                            className="relative rounded-l-2xl border-y border-l py-5 pl-5 pr-2 align-middle text-[14px] italic tabular-nums text-[#B4ADA0] transition-colors duration-300 group-hover:text-[#7A2233] group-hover:border-[#D9C79A]"
                            style={{ ...displayFont, borderColor: HAIRLINE }}
                          >
                            {/* left accent bar — reveals on hover */}
                            <span
                              className="absolute left-0 top-1/2 h-2/3 w-[3px] -translate-y-1/2 rounded-r-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                              style={{ background: `linear-gradient(180deg, ${GOLD}, ${GARNET})` }}
                            />
                            <span
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-300 group-hover:border-[#D9C79A]"
                              style={{ borderColor: HAIRLINE }}
                            >
                              {String(dep.sno).padStart(2, "0")}
                            </span>
                          </td>

                          <td
                            className="border-y py-5 pr-4 align-middle group-hover:border-[#D9C79A]"
                            style={{ borderColor: HAIRLINE }}
                          >
                            <div className="flex min-w-0 items-center gap-4">
                              <div
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[16px] font-semibold uppercase text-white shadow-[0_10px_20px_-10px_rgba(122,34,51,0.55)] ring-1 ring-white/40 transition-transform duration-300 group-hover:scale-105"
                                style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
                              >
                                {dep.dep_name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p
                                  className="truncate text-[19px] leading-tight tracking-tight text-[#1C1A17]"
                                  style={{ ...displayFont, fontWeight: 700 }}
                                >
                                  {dep.dep_name}
                                </p>
                                <div className="mt-1.5 flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: GOLD }} />
                                  <span className="text-[9.5px] font-semibold uppercase tracking-[0.25em] text-[#B4ADA0]">
                                    Active unit
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td
                            className="rounded-r-2xl border-y border-r py-5 pl-2 pr-6 text-right align-middle group-hover:border-[#D9C79A]"
                            style={{ borderColor: HAIRLINE }}
                          >
                            <div className="flex justify-end opacity-90 transition-opacity duration-300 group-hover:opacity-100">
                              <DepartmentButtons id={dep._id} onDepartmentDelete={fetchDepartments} />
                            </div>
                          </td>
                        </tr>
                      ))}
                      </tbody>
                    </table>

                    {paginatedDepartments.length === 0 && (
                      <div className="flex flex-col items-center gap-3 py-20">
                        <div
                          className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-white"
                          style={{ borderColor: HAIRLINE, color: "#B4ADA0" }}
                        >
                          <Building2 size={22} strokeWidth={1.5} />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#B4ADA0]">
                          No Departments Found
                        </p>
                      </div>
                    )}
                  </div>

                  {/* bottom fade — hints there's more to scroll */}
                  {paginatedDepartments.length > 4 && (
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-[1.75rem]"
                      style={{ background: "linear-gradient(180deg, transparent, #FBF8F3)" }}
                    />
                  )}
                </div>
              </div>

              {/* RESPONSIVE PAGINATION */}
              {filteredDepartments.length > 0 && (
                <div
                  className="flex flex-col items-center gap-4 border-t p-3 sm:flex-row sm:justify-between sm:gap-4 sm:p-5"
                  style={{ borderColor: HAIRLINE, backgroundColor: "#FBF8F3" }}
                >
                  {/* Previous */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="order-2 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border bg-white px-6 text-[10px] font-semibold uppercase tracking-widest text-[#8A8378] shadow-[0_1px_2px_rgba(28,26,23,0.04)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:border-[#D9C79A] enabled:hover:text-[#7A2233] enabled:active:scale-95 sm:order-1 sm:w-auto"
                    style={{ borderColor: HAIRLINE }}
                  >
                    <ChevronLeft size={15} strokeWidth={1.75} /> Previous
                  </button>

                  {/* Page Indicator — middle */}
                  <div
                    className="order-1 rounded-full border bg-white px-7 py-2.5 sm:order-2"
                    style={{ borderColor: HAIRLINE }}
                  >
                    <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-[#8A8378] sm:text-[11px]">
                      Page <span style={{ color: GARNET }}>{currentPage}</span>
                      <span className="mx-2 text-[#E7DFD2]">/</span> {totalPages || 1}
                    </p>
                  </div>

                  {/* Right cluster — Next + per-page, grouped as one unit */}
                  <div className="order-3 flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border bg-white px-6 text-[10px] font-semibold uppercase tracking-widest text-[#8A8378] shadow-[0_1px_2px_rgba(28,26,23,0.04)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:border-[#D9C79A] enabled:hover:text-[#7A2233] enabled:active:scale-95 sm:flex-none"
                      style={{ borderColor: HAIRLINE }}
                    >
                      Next <ChevronRight size={15} strokeWidth={1.75} />
                    </button>

                    {/* divider */}
                    <div className="hidden h-6 w-px sm:block" style={{ backgroundColor: HAIRLINE }} />

                    {/* PAGE SIZE SELECTOR */}
                    <div
                      className="flex h-11 shrink-0 items-center gap-2.5 rounded-2xl border bg-white px-3"
                      style={{ borderColor: HAIRLINE }}
                    >
                      <span className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-widest text-[#B4ADA0]">
                        Per page
                      </span>
                      <div className="relative">
                        <select
                          value={itemsPerPage}
                          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                          className="cursor-pointer appearance-none rounded-lg border bg-white py-1.5 pl-3 pr-7 text-[12px] font-bold text-[#1C1A17] outline-none transition-all hover:border-[#D9C79A] focus:border-[#C6A15B]/60"
                          style={{ borderColor: HAIRLINE }}
                        >
                          {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={12}
                          strokeWidth={2.25}
                          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#8A8378]"
                        />
                      </div>
                    </div>
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