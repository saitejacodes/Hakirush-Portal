import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search, Plus, ChevronLeft, ChevronRight, ChevronDown, Building2 } from "lucide-react";
import { DepartmentButtons } from "../../utils/DepartmentHelper";
import { apiErrorMessage } from "../../utils/apiError";

const INK = "#4A1015";        
const INK_SOFT = "#5C161C";   
const PAPER = "#F7F4EC";      
const PAPER_DIM = "#EFEBE0";    
const BRASS = "#A9853C";
const BRASS_LIGHT = "#D7B978";
const TEAL = "#2F5D62";
const SLATE = "#6B7280";       
const FOG = "#C7A9A6";       
const HAIRLINE_DARK = "#6B262C";
const HAIRLINE_LIGHT = "#E4DECE";

const displayFont = { fontFamily: "'Fraunces', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };
const monoFont = { fontFamily: "'IBM Plex Mono', 'SFMono-Regular', monospace" };

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

/* ================= MOBILE PLAQUE CARD ================= */
const MobileDepartmentCard = ({ dep, fetchDepartments }) => {
  return (
    <div
      className="mx-auto w-full max-w-[420px] rounded-xl border p-4 shadow-[0_12px_28px_-16px_rgba(20,22,27,0.4)] sm:p-5"
      style={{ backgroundColor: PAPER, borderColor: HAIRLINE_LIGHT, ...bodyFont }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-[12.5px] font-semibold"
            style={{ backgroundColor: INK, color: BRASS_LIGHT, ...monoFont }}
          >
            {String(dep.sno).padStart(2, "0")}
          </div>
          <div className="min-w-0">
            <p
              className="truncate text-[17px] leading-tight"
              style={{ ...displayFont, fontWeight: 600, color: INK }}
            >
              {dep.dep_name}
            </p>
            <p className="mt-1 truncate text-[11px] font-medium" style={{ color: SLATE }}>
              Manager:{" "}
              {dep.managerName ? (
                <span style={{ color: INK }}>{dep.managerName}</span>
              ) : (
                <span style={{ color: FOG }}>Not assigned</span>
              )}
              {typeof dep.memberCount === "number" && <span> · {dep.memberCount} members</span>}
            </p>
          </div>
        </div>
        <Building2 size={16} strokeWidth={1.5} color={BRASS} className="mt-1 shrink-0" />
      </div>

      <div className="mt-4 flex justify-end border-t pt-3" style={{ borderColor: HAIRLINE_LIGHT }}>
        <DepartmentButtons id={dep._id} onDepartmentDelete={fetchDepartments} />
      </div>
    </div>
  );
};

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [depLoading, setDepLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loadError, setLoadError] = useState("");

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
          managerName: dep.manager?.name || null,
          // "invalid" = assigned manager is inactive or moved to another department
          managerInvalid: dep.managerStatus === "invalid",
          managerDesignation: dep.manager?.designation || "",
          memberCount: typeof dep.memberCount === "number" ? dep.memberCount : null,
        }));
        setDepartments(data);
        setFilteredDepartments(data);
        setLoadError("");
      }
    } catch (err) {
      console.error("Failed to load departments");
      setLoadError(apiErrorMessage(err, "Failed to load departments."));
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
    <div className="min-h-screen pb-20" style={{ backgroundColor: PAPER_DIM, ...bodyFont }}>

      <div className="mx-auto max-w-[1160px] space-y-7 p-4 sm:space-y-9 sm:p-8">
        {/* HEADER */}
        <header className="flex flex-col gap-6 pt-3 sm:pt-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2"
              style={{ backgroundColor: INK, borderColor: BRASS }}
            >
              <Building2 size={22} strokeWidth={1.5} color={BRASS_LIGHT} />
            </div>
            <div>
              <p className="text-[11.5px] font-semibold" style={{ color: SLATE }}>
                Organization registry
              </p>
              <h1
                className="text-[1.9rem] leading-[1.05] tracking-tight sm:text-[2.35rem]"
                style={{ ...displayFont, fontWeight: 600, color: INK }}
              >
                Department Directory
              </h1>
            </div>
          </div>

          {!depLoading && departments.length > 0 && (
            <div
              className="flex items-center gap-3 self-start rounded-lg border px-5 py-3 lg:self-auto"
              style={{ backgroundColor: PAPER, borderColor: HAIRLINE_LIGHT }}
            >
              <span className="text-[26px] font-semibold leading-none" style={{ ...monoFont, color: INK }}>
                {String(departments.length).padStart(2, "0")}
              </span>
              <span className="text-[11.5px] font-medium leading-tight" style={{ color: SLATE }}>
                departments
                <br />
                on record
              </span>
            </div>
          )}
        </header>

        {/* THE BOARD */}
        <div className="overflow-hidden rounded-2xl border" style={{ backgroundColor: INK, borderColor: HAIRLINE_DARK }}>
          {/* SEARCH + ADD */}
          <div className="p-3 sm:p-4" style={{ borderBottom: `1px solid ${HAIRLINE_DARK}` }}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div
                className="flex flex-1 items-center gap-2.5 rounded-lg px-4 py-2.5 transition-colors focus-within:ring-2"
                style={{ backgroundColor: PAPER }}
              >
                <Search size={16} strokeWidth={1.75} color={SLATE} />
                <input
                  type="text"
                  placeholder="Search departments…"
                  className="dept-focusable w-full bg-transparent text-[14px] font-medium outline-none placeholder:text-[#9CA3AF]"
                  style={{ color: INK }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Link
                to="/admin-dashboard/add-department"
                className="dept-focusable flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-[13.5px] font-semibold text-[#14161B] transition-transform active:scale-[0.97]"
                style={{ backgroundColor: BRASS_LIGHT }}
              >
                <Plus size={16} strokeWidth={2.25} />
                Add department
              </Link>
            </div>
          </div>

          {depLoading ? (
            <div className="p-24 text-center">
              <div
                className="mx-auto mb-5 h-9 w-9 animate-spin rounded-full border-2"
                style={{ borderColor: HAIRLINE_DARK, borderTopColor: BRASS }}
              />
              <p className="text-[12px] font-medium" style={{ color: FOG }}>
                Loading the directory…
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="space-y-4 px-3 py-4 md:hidden">
                {paginatedDepartments.length ? (
                  paginatedDepartments.map((dep) => (
                    <MobileDepartmentCard key={dep._id} dep={dep} fetchDepartments={fetchDepartments} />
                  ))
                ) : (
                  <div className="py-14 text-center">
                    <p className="text-[13px] font-medium" style={{ color: FOG }}>
                      {loadError || (search ? "No departments match that search." : "No departments yet — add the first one.")}
                    </p>
                  </div>
                )}
              </div>

              {/* DESKTOP */}
              <div className="hidden px-4 pb-4 md:block lg:px-6">
                <div
                  className="grid grid-cols-[56px_1fr_220px_170px] items-center px-4 py-2 text-[11.5px] font-medium"
                  style={{ color: FOG }}
                >
                  <span>Ref</span>
                  <span>Department</span>
                  <span>Manager</span>
                  <span className="text-right">Actions</span>
                </div>

                <div className="space-y-2 pb-1">
                  {paginatedDepartments.map((dep) => (
                    <div
                      key={dep._id}
                      className="dept-row grid grid-cols-[56px_1fr_220px_170px] items-center rounded-lg px-4 py-3.5"
                      style={{ backgroundColor: PAPER }}
                    >
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-md text-[12px] font-semibold"
                        style={{ backgroundColor: INK, color: BRASS_LIGHT, ...monoFont }}
                      >
                        {String(dep.sno).padStart(2, "0")}
                      </div>

                      <div className="min-w-0 pl-3">
                        <p
                          className="truncate text-[17px] leading-tight"
                          style={{ ...displayFont, fontWeight: 600, color: INK }}
                        >
                          {dep.dep_name}
                        </p>
                        {typeof dep.memberCount === "number" && (
                          <p className="mt-0.5 text-[11px] font-medium" style={{ color: SLATE }}>
                            {dep.memberCount} {dep.memberCount === 1 ? "member" : "members"}
                          </p>
                        )}
                      </div>

                      <div className="min-w-0 pr-3">
                        {dep.managerName ? (
                          <>
                            <p className="truncate text-[13px] font-semibold" style={{ color: INK }}>
                              {dep.managerName}
                            </p>
                            {dep.managerInvalid && (
                              <p className="truncate text-[11px] font-medium" style={{ color: "#B4432E" }}>
                                No longer eligible - reassign
                              </p>
                            )}
                            {dep.managerDesignation && (
                              <p className="truncate text-[11px]" style={{ color: SLATE }}>
                                {dep.managerDesignation}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-[12.5px] font-medium italic" style={{ color: FOG }}>
                            Not assigned
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <DepartmentButtons id={dep._id} onDepartmentDelete={fetchDepartments} />
                      </div>
                    </div>
                  ))}

                  {paginatedDepartments.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-16">
                      <Building2 size={20} strokeWidth={1.5} color={FOG} />
                      <p className="text-[13px] font-medium" style={{ color: FOG }}>
                        {loadError || (search ? "No departments match that search." : "No departments yet — add the first one.")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* PAGINATION */}
              {filteredDepartments.length > 0 && (
                <div
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  style={{ borderTop: `1px solid ${HAIRLINE_DARK}` }}
                >
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="dept-focusable flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                    style={{ color: FOG, border: `1px solid ${HAIRLINE_DARK}`, backgroundColor: INK_SOFT }}
                  >
                    <ChevronLeft size={15} strokeWidth={1.75} /> Previous
                  </button>

                  <p className="order-first text-center text-[13px] sm:order-none" style={{ ...monoFont, color: BRASS_LIGHT }}>
                    {currentPage} / {totalPages || 1}
                  </p>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="dept-focusable flex flex-1 items-center justify-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30 sm:flex-none"
                      style={{ color: FOG, border: `1px solid ${HAIRLINE_DARK}`, backgroundColor: INK_SOFT }}
                    >
                      Next <ChevronRight size={15} strokeWidth={1.75} />
                    </button>

                    <div className="relative shrink-0">
                      <select
                        value={itemsPerPage}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="dept-focusable cursor-pointer appearance-none rounded-md py-2 pl-3 pr-8 text-[13px] font-medium outline-none"
                        style={{ backgroundColor: INK_SOFT, color: FOG, border: `1px solid ${HAIRLINE_DARK}` }}
                      >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                          <option key={size} value={size} style={{ backgroundColor: INK, color: PAPER }}>
                            {size} per page
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={12}
                        strokeWidth={2.25}
                        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
                        color={FOG}
                      />
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
