import axios from "axios";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { EmployeeButtons } from "../../utils/EmployeeHelper";
import { Search, UserPlus, Users, ChevronLeft, ChevronRight, ChevronDown, Building2, UserX } from "lucide-react";

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#C6A15B";
const HAIRLINE = "#E7DFD2";
const SAGE = "#3F5B54";

const displayFont = { fontFamily: "'Playfair Display', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

const GRAIN_URI =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='140'%20height='140'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23n)'%20opacity='0.5'/%3E%3C/svg%3E";

/* Scoped scrollbar styling for the table viewport */
const ScrollbarStyle = () => (
  <style>{`
    .staff-table-scroll::-webkit-scrollbar {
      width: 10px;
    }
    .staff-table-scroll::-webkit-scrollbar-track {
      background: #FBF8F3;
      border-radius: 999px;
    }
    .staff-table-scroll::-webkit-scrollbar-thumb {
      background-color: ${GOLD};
      background-image: linear-gradient(180deg, ${GOLD}, ${GARNET});
      background-clip: padding-box;
      border: 2.5px solid #FBF8F3;
      border-radius: 999px;
    }
    .staff-table-scroll::-webkit-scrollbar-thumb:hover {
      border-color: #F5EFE2;
    }
    .staff-table-scroll {
      scrollbar-width: thin;
      scrollbar-color: ${GOLD} #FBF8F3;
    }
  `}</style>
);

/* Active/inactive chip - only rendered when the API reports isActive */
const StatusChip = ({ isActive }) => {
  if (isActive === undefined || isActive === null) return null;
  return (
    <span
      className="ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest"
      style={
        isActive
          ? { color: SAGE, borderColor: `${SAGE}40`, backgroundColor: `${SAGE}0D` }
          : { color: "#8A8378", borderColor: HAIRLINE, backgroundColor: "#F3EEE4" }
      }
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

const statusDotColor = (isActive) => (isActive === false ? "#B4ADA0" : SAGE);

/* ================= PREMIUM MOBILE CARD ================= */
const MobileEmployeeCard = ({ emp, getImageUrl, index, refresh }) => {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-1 rounded-[1.5rem] border border-[#E7DFD2] bg-white/75 p-5 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_16px_32px_-16px_rgba(28,26,23,0.14)] backdrop-blur-md duration-500 active:scale-[0.98]"
      style={{ animationDelay: `${index * 45}ms`, animationFillMode: "backwards" }}
    >
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <img
            src={getImageUrl(emp.profileImage)}
            onError={(e) => (e.target.src = "/default-avatar.png")}
            className="h-14 w-14 rounded-[1.1rem] border-2 object-cover shadow-sm"
            style={{ borderColor: HAIRLINE }}
          />
          <div
            className="absolute -right-0.5 -bottom-0.5 h-4 w-4 rounded-full border-2 border-white"
            style={{ backgroundColor: statusDotColor(emp.isActive) }}
          ></div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-widest" style={{ color: GOLD }}>
            {emp.employeeId}
            <StatusChip isActive={emp.isActive} />
          </p>
          <p
            className="truncate text-base leading-none tracking-tight text-[#1C1A17]"
            style={{ ...displayFont, fontWeight: 700 }}
          >
            {emp.name}
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-tight text-[#8A8378]">
            {emp.designation} <span className="mx-1" style={{ color: GOLD }}>•</span> {emp.dep_name}
          </p>
        </div>
      </div>

      <div className="mt-5 flex justify-end border-t pt-4" style={{ borderColor: HAIRLINE }}>
        <EmployeeButtons id={emp._id} isActive={emp.isActive} refresh={refresh} />
      </div>
    </div>
  );
};

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

const List = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const fetchEmployees = useCallback(async () => {
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
        const data = sortedEmployees.map((emp) => {
          // isActive may be on the employee (admin list) or on the populated user
          const rawActive = emp.isActive ?? emp.userId?.isActive;
          return {
            _id: emp._id,
            sno: sno++,
            employeeId: emp.employeeId || "N/A",
            dep_name: emp.department?.dep_name || "N/A",
            designation: emp.designation || "N/A",
            name: emp.userId?.name || "Unknown",
            dob: emp.dob ? new Date(emp.dob).toDateString() : "N/A",
            profileImage: emp.userId?.profileImage || "",
            isActive: typeof rawActive === "boolean" ? rawActive : undefined,
          };
        });

        setEmployees(data);
        setFilteredEmployees(data);
      }
    } catch {
      console.error("Failed to load employees");
    } finally {
      setEmpLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    const result = employees.filter((emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredEmployees(result);
    setCurrentPage(1);
  }, [search, employees]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  const handlePageSizeChange = (size) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const departmentCount = useMemo(
    () => new Set(employees.map((e) => e.dep_name).filter((d) => d && d !== "N/A")).size,
    [employees]
  );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${import.meta.env.VITE_BACKEND_URL}/${imagePath}`;
  };

  return (
    <div
      className="relative min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-100 pb-20 text-[#1C1A17]"
      style={bodyFont}
    >
      <ScrollbarStyle />

      {/* faint paper grain, matching the rest of the app */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] mix-blend-multiply"
        style={{ backgroundImage: `url("${GRAIN_URI}")` }}
      />
      {/* masthead rule */}
      <div
        className="relative z-10 h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, ${GARNET}, ${GOLD} 45%, ${GARNET})` }}
      />

      <div className="relative z-10 mx-auto max-w-[1400px] space-y-8 p-4 sm:p-8">

        {/* HEADER */}
        <header className="flex flex-col gap-6 pt-4 sm:pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5 sm:gap-6">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] text-white shadow-[0_20px_40px_-14px_rgba(122,34,51,0.45)] sm:h-16 sm:w-16"
              style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
            >
              <Users size={28} strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="h-px w-7" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
                <p className="text-[9px] font-semibold uppercase tracking-[0.42em] text-[#C6A15B] sm:text-[10px]">
                  Real-time Directory
                </p>
              </div>
              <h1
                className="text-3xl leading-[0.92] tracking-tight text-[#1C1A17] sm:text-[2.75rem]"
                style={{ ...displayFont, fontWeight: 700 }}
              >
                <span className="italic" style={{ color: GARNET }}>Organization</span> Staff
              </h1>
              <p className="max-w-md text-[12px] font-medium leading-relaxed text-[#8A8378] sm:text-[13px]">
                Every active member of the workforce, searchable by name, ID, or department.
              </p>
            </div>
          </div>

          {/* ROSTER SNAPSHOT — quiet stat strip */}
          {!empLoading && employees.length > 0 && (
            <div className="flex items-stretch gap-3 self-stretch sm:self-auto">
              <div
                className="flex flex-1 flex-col justify-center rounded-2xl border bg-white/70 px-5 py-3 backdrop-blur-md sm:flex-none sm:px-6"
                style={{ borderColor: HAIRLINE }}
              >
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B4ADA0]">Headcount</p>
                <p className="text-xl tracking-tight text-[#1C1A17]" style={{ ...displayFont, fontWeight: 700 }}>
                  {employees.length}
                </p>
              </div>
              <div
                className="flex flex-1 flex-col justify-center rounded-2xl border bg-white/70 px-5 py-3 backdrop-blur-md sm:flex-none sm:px-6"
                style={{ borderColor: HAIRLINE }}
              >
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B4ADA0]">Departments</p>
                <p className="text-xl tracking-tight text-[#1C1A17]" style={{ ...displayFont, fontWeight: 700 }}>
                  {departmentCount}
                </p>
              </div>
            </div>
          )}
        </header>

        {/* MAIN CONTAINER */}
        <div className="overflow-hidden rounded-[2rem] border border-[#E7DFD2] bg-white/70 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_30px_60px_-24px_rgba(28,26,23,0.16)] backdrop-blur-md sm:rounded-[2.25rem]">

          {/* SEARCH & ACTION ROW */}
          <div className="border-b p-6 md:p-9" style={{ borderColor: HAIRLINE }}>
            <div className="flex flex-col items-center gap-4 lg:flex-row lg:gap-5">

              {/* SEARCH BAR */}
              <div
                className="group relative flex w-full flex-1 items-center rounded-2xl border px-5 transition-all duration-300 focus-within:border-[#C6A15B] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(198,161,91,0.14)]"
                style={{ borderColor: HAIRLINE, backgroundColor: "#FBF8F3" }}
              >
                <Search className="text-[#B4ADA0] transition-colors group-focus-within:text-[#7A2233]" size={18} strokeWidth={1.75} />
                <input
                  type="text"
                  placeholder="Search records by name or employee ID…"
                  className="w-full bg-transparent py-4 pl-4 text-[12px] font-semibold uppercase tracking-widest text-[#1C1A17] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[#B4ADA0]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <span
                    className="shrink-0 rounded-lg border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest text-[#8A8378]"
                    style={{ borderColor: HAIRLINE, backgroundColor: "#fff" }}
                  >
                    {filteredEmployees.length} found
                  </span>
                )}
              </div>

              {/* ACTION BUTTON */}
              <Link
                to="/admin-dashboard/add-employee"
                className="flex w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-2xl px-9 py-4 text-[10.5px] font-semibold uppercase tracking-widest text-white shadow-[0_14px_28px_-10px_rgba(28,26,23,0.35)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 lg:w-auto"
                style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
              >
                <UserPlus size={17} strokeWidth={1.75} />
                <span>Add New Member</span>
              </Link>
            </div>
          </div>

          {empLoading ? (
            <div className="p-24 text-center">
              <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-[#E7DFD2] border-t-[#7A2233]"></div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-[#8A8378]">
                Synchronizing Database
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="space-y-4 p-4 md:hidden">
                {paginatedEmployees.length ? (
                  paginatedEmployees.map((emp, i) => (
                    <MobileEmployeeCard key={emp._id} emp={emp} getImageUrl={getImageUrl} index={i} refresh={fetchEmployees} />
                  ))
                ) : (
                  <EmptyState />
                )}
              </div>

              {/* DESKTOP VIEW — scrollable viewport with sticky header */}
              <div className="mt-10 hidden px-8 pb-10 md:block">
                <div
                  className="relative overflow-hidden rounded-[1.75rem] border shadow-[inset_0_1px_2px_rgba(28,26,23,0.03)]"
                  style={{ borderColor: HAIRLINE, backgroundColor: "#FBF8F3" }}
                >
                  <div className="staff-table-scroll max-h-[30rem] overflow-y-auto overflow-x-auto px-3 pb-3 pt-1">
                    <table className="w-full border-separate" style={{ borderSpacing: "0 0.875rem" }}>
                      <thead className="sticky top-0 z-10">
                        <tr className="text-left text-[10.5px] font-semibold uppercase tracking-[0.28em] text-[#B4ADA0]">
                          <th className="px-5 py-4 pt-5 font-semibold" style={{ backgroundColor: "#FBF8F3" }}>
                            <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>S.No</span>
                          </th>
                          <th className="px-5 py-4 pt-5 font-semibold" style={{ backgroundColor: "#FBF8F3" }}>
                            <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Identification</span>
                          </th>
                          <th className="px-5 py-4 pt-5 font-semibold" style={{ backgroundColor: "#FBF8F3" }}>
                            <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Member Details</span>
                          </th>
                          <th className="px-5 py-4 pt-5 font-semibold" style={{ backgroundColor: "#FBF8F3" }}>
                            <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Department</span>
                          </th>
                          <th className="px-5 py-4 pt-5 text-right font-semibold" style={{ backgroundColor: "#FBF8F3" }}>
                            <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Administrative Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedEmployees.map((emp, i) => (
                          <tr
                            key={emp._id}
                            className="group relative animate-in fade-in border transition-all duration-300 hover:-translate-y-[3px] hover:border-[#D9C79A] hover:shadow-[0_20px_36px_-18px_rgba(28,26,23,0.2)]"
                            style={{ backgroundColor: "#fff", borderColor: HAIRLINE, animationDelay: `${i * 40}ms`, animationFillMode: "backwards" }}
                          >
                            {/* S.No */}
                            <td className="relative rounded-l-[1.5rem] px-5 py-5 text-[11px] font-semibold italic tabular-nums text-[#B4ADA0] transition-colors duration-300 group-hover:text-[#7A2233]">
                              {/* left accent bar — reveals on hover */}
                              <span
                                className="absolute left-0 top-1/2 h-2/3 w-[3px] -translate-y-1/2 rounded-r-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                style={{ background: `linear-gradient(180deg, ${GOLD}, ${GARNET})` }}
                              />
                              {emp.sno.toString().padStart(2, "0")}
                            </td>

                            {/* ID & Photo */}
                            <td className="px-5 py-5">
                              <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                  <img
                                    src={getImageUrl(emp.profileImage)}
                                    onError={(e) => (e.target.src = "/default-avatar.png")}
                                    className="h-11 w-11 rounded-[0.9rem] border-2 border-white object-cover shadow-md transition-transform duration-300 group-hover:scale-110"
                                    alt=""
                                  />
                                  <div
                                    className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white"
                                    style={{ backgroundColor: statusDotColor(emp.isActive) }}
                                  />
                                </div>
                                <span
                                  className="rounded-lg border bg-white px-3 py-1.5 text-[10px] font-semibold text-[#8A8378] shadow-sm"
                                  style={{ borderColor: HAIRLINE }}
                                >
                                  {emp.employeeId}
                                </span>
                              </div>
                            </td>

                            {/* Name & Title */}
                            <td className="px-5 py-5">
                              <p
                                className="text-base leading-tight tracking-tight text-[#1C1A17] transition-colors group-hover:text-[#7A2233]"
                                style={{ ...displayFont, fontWeight: 700 }}
                              >
                                {emp.name}
                              </p>
                              <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-[#B4ADA0]">
                                {emp.designation}
                                <StatusChip isActive={emp.isActive} />
                              </p>
                            </td>

                            {/* Department */}
                            <td className="px-5 py-5">
                              <span
                                className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#8A8378] shadow-sm transition-colors group-hover:border-[#D9C79A]"
                                style={{ borderColor: HAIRLINE }}
                              >
                                <Building2 size={11} strokeWidth={1.75} style={{ color: GOLD }} />
                                {emp.dep_name}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="rounded-r-[1.5rem] px-5 py-5 text-right">
                              <div className="origin-right scale-110 opacity-90 transition-all group-hover:-translate-x-1 group-hover:opacity-100">
                                <EmployeeButtons id={emp._id} isActive={emp.isActive} refresh={fetchEmployees} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {paginatedEmployees.length === 0 && (
                      <div className="py-4">
                        <EmptyState />
                      </div>
                    )}
                  </div>

                  {/* bottom fade — hints there's more to scroll */}
                  {paginatedEmployees.length > 4 && (
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-[1.75rem]"
                      style={{ background: "linear-gradient(180deg, transparent, #FBF8F3)" }}
                    />
                  )}
                </div>
              </div>

              {/* PAGINATION */}
              {filteredEmployees.length > 0 && (
                <div
                  className="flex flex-col items-center gap-4 border-t p-4 sm:flex-row sm:justify-between sm:gap-4 sm:p-6"
                  style={{ borderColor: HAIRLINE, backgroundColor: "#FBF8F3" }}
                >
                  {/* Previous */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="order-2 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border bg-white px-6 text-[10px] font-semibold uppercase tracking-widest text-[#8A8378] shadow-sm transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:border-[#D9C79A] enabled:hover:text-[#7A2233] enabled:active:scale-95 sm:order-1 sm:w-auto"
                    style={{ borderColor: HAIRLINE }}
                  >
                    <ChevronLeft size={15} strokeWidth={1.75} /> Prev
                  </button>

                  {/* Page Counter — middle */}
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
                      className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border bg-white px-6 text-[10px] font-semibold uppercase tracking-widest text-[#8A8378] shadow-sm transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:border-[#D9C79A] enabled:hover:text-[#7A2233] enabled:active:scale-95 sm:flex-none"
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

/* ================= EMPTY STATE ================= */
const EmptyState = () => (
  <div className="flex flex-col items-center py-16">
    <span
      className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border bg-white"
      style={{ borderColor: HAIRLINE, color: "#B4ADA0" }}
    >
      <UserX size={20} strokeWidth={1.5} />
    </span>
    <p className="text-xs font-semibold uppercase tracking-widest text-[#B4ADA0]">No records found</p>
    <p className="mt-1.5 text-[11px] text-[#B4ADA0]">Try a different name or employee ID.</p>
  </div>
);

export default List;