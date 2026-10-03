import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronDown, Users, Mail, Briefcase, Star } from "lucide-react";
import { apiErrorMessage } from "../../utils/apiError";

const idOf = (value) => {
  if (!value) return "";
  if (typeof value === "object") return String(value._id || value.employeeRecordId || "");
  return String(value);
};

const ManagerBadge = () => (
  <span
    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
    style={{ backgroundColor: "#A9853C22", color: "#7A5A1C", border: "1px solid #A9853C55" }}
  >
    <Star size={10} strokeWidth={2} /> Manager
  </span>
);

const InactiveBadge = () => (
  <span
    className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
    style={{ backgroundColor: "#6B728018", color: "#6B7280" }}
  >
    Inactive
  </span>
);

const INK = "#4A1015";          
const INK_SOFT = "#5C161C";     
const PAPER = "#F7F4EC";     
const PAPER_DIM = "#EFEBE0";   
const BRASS = "#A9853C";
const BRASS_LIGHT = "#D7B978";
const RUST = "#B4432E";        
const SLATE = "#6B7280";       
const FOG = "#C7A9A6";         
const HAIRLINE_DARK = "#6B262C";
const HAIRLINE_LIGHT = "#E4DECE";

const displayFont = { fontFamily: "'Fraunces', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };
const monoFont = { fontFamily: "'IBM Plex Mono', 'SFMono-Regular', monospace" };

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];


const DepartmentEmployees = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [departmentName, setDepartmentName] = useState("");

  useEffect(() => {
    if (!id || id === ":id") {
      setError("Invalid department ID");
      setLoading(false);
      return;
    }

    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError("");
        const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
        const [res, depRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employee/department/${id}/employees`, { headers }),
          // Department carries managerEmployeeId; failure here only hides the badge.
          axios
            .get(`${import.meta.env.VITE_BACKEND_URL}/api/department/${id}`, { headers })
            .catch(() => null),
        ]);

        if (res.data?.success) {
          const dep = depRes?.data?.department || null;
          const managerId = idOf(dep?.managerEmployeeId) || idOf(dep?.manager?.employeeRecordId);
          setDepartmentName(dep?.dep_name || "");
          const list = (res.data.employees || []).map((emp) => ({
            ...emp,
            isManager: Boolean(emp.isManager) || (managerId !== "" && String(emp._id) === managerId),
          }));
          // Manager first, then the rest in their original order
          list.sort((a, b) => Number(b.isManager) - Number(a.isManager));
          setEmployees(list);
        } else {
          setError("Failed to load employees");
        }
      } catch (err) {
        setError(apiErrorMessage(err, "Connection error occurred"));
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [employees]);

  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = employees.slice(startIndex, startIndex + itemsPerPage);

  const handlePageSizeChange = (size) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: PAPER_DIM, ...bodyFont }}>

      <div className="mx-auto max-w-[1200px] space-y-6 p-4 sm:space-y-8 sm:p-8">
        {/* BACK BUTTON */}
        <div className="flex justify-start pt-2">
          <button
            onClick={() => navigate(-1)}
            className="roster-focusable group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 transition-all"
          >
            <ChevronLeft
              size={17}
              strokeWidth={1.75}
              style={{ color: SLATE }}
              className="transition-all group-hover:-translate-x-1"
            />
            <span
              className="text-[12px] font-medium transition-colors"
              style={{ color: SLATE }}
            >
              Back to departments
            </span>
          </button>
        </div>

        {/* HEADER */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2"
              style={{ backgroundColor: INK, borderColor: BRASS }}
            >
              <Users size={22} strokeWidth={1.5} color={BRASS_LIGHT} />
            </div>
            <div>
              <p className="text-[11.5px] font-semibold" style={{ color: SLATE }}>
                Assigned personnel{departmentName ? ` · ${departmentName}` : ""}
              </p>
              <h1
                className="text-[1.9rem] leading-[1.05] tracking-tight sm:text-[2.35rem]"
                style={{ ...displayFont, fontWeight: 600, color: "#14161B" }}
              >
                Team Roster
              </h1>
            </div>
          </div>

          {!loading && !error && employees.length > 0 && (
            <div
              className="flex items-center gap-3 self-start rounded-lg border px-5 py-3 sm:self-auto"
              style={{ backgroundColor: PAPER, borderColor: HAIRLINE_LIGHT }}
            >
              <span className="text-[26px] font-semibold leading-none" style={{ ...monoFont, color: "#14161B" }}>
                {String(employees.length).padStart(2, "0")}
              </span>
              <span className="text-[11.5px] font-medium leading-tight" style={{ color: SLATE }}>
                team members
                <br />
                assigned here
              </span>
            </div>
          )}
        </header>

        {/* THE BOARD */}
        <div className="overflow-hidden rounded-2xl border" style={{ backgroundColor: INK, borderColor: HAIRLINE_DARK }}>
          {loading ? (
            <div className="p-24 text-center">
              <div
                className="mx-auto mb-5 h-9 w-9 animate-spin rounded-full border-2"
                style={{ borderColor: HAIRLINE_DARK, borderTopColor: BRASS }}
              />
              <p className="text-[12px] font-medium" style={{ color: FOG }}>
                Loading the roster…
              </p>
            </div>
          ) : error ? (
            <div className="p-16 text-center">
              <div
                className="mx-auto inline-block max-w-sm rounded-lg px-6 py-5"
                style={{ backgroundColor: PAPER }}
              >
                <p className="text-[15px] font-semibold" style={{ ...displayFont, color: RUST }}>
                  {error}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="space-y-4 p-3 md:hidden">
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((emp, index) => (
                    <div
                      key={emp._id}
                      className="rounded-xl border p-4 sm:p-5"
                      style={{ backgroundColor: PAPER, borderColor: HAIRLINE_LIGHT }}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[11px] font-semibold" style={{ ...monoFont, color: BRASS }}>
                          #{String(startIndex + index + 1).padStart(2, "0")}
                        </span>
                        <span
                          className="rounded-md px-2.5 py-1 text-[10.5px] font-medium"
                          style={{ backgroundColor: PAPER_DIM, color: SLATE }}
                        >
                          {emp.employeeId || emp.userId?.employeeId || "No ID"}
                        </span>
                      </div>

                      <p
                        className="mb-1 text-[18px] leading-tight"
                        style={{ ...displayFont, fontWeight: 600, color: "#14161B" }}
                      >
                        {emp.userId?.name}
                      </p>
                      {(emp.isManager || emp.isActive === false || emp.userId?.isActive === false) && (
                        <div className="mb-2 flex gap-1.5">
                          {emp.isManager && <ManagerBadge />}
                          {(emp.isActive === false || emp.userId?.isActive === false) && <InactiveBadge />}
                        </div>
                      )}
                      <p className="mb-3 flex items-center gap-1.5 text-[12px] font-medium" style={{ color: SLATE }}>
                        <Mail size={12} color={BRASS} /> {emp.userId?.email}
                      </p>

                      <div className="border-t pt-3" style={{ borderColor: HAIRLINE_LIGHT }}>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold"
                          style={{ backgroundColor: INK, color: BRASS_LIGHT }}
                        >
                          <Briefcase size={12} strokeWidth={1.75} /> {emp.designation || "Staff"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState />
                )}
              </div>

              {/* DESKTOP */}
              <div className="hidden px-4 pb-4 md:block lg:px-6">
                <div
                  className="grid grid-cols-[56px_120px_1.2fr_1.4fr_150px] items-center px-4 py-2 text-[11.5px] font-medium"
                  style={{ color: FOG }}
                >
                  <span>Ref</span>
                  <span>Emp ID</span>
                  <span>Full name</span>
                  <span>Email</span>
                  <span className="text-right">Designation</span>
                </div>

                <div className="space-y-2 pb-1">
                  {paginatedEmployees.map((emp, index) => (
                    <div
                      key={emp._id}
                      className="roster-row grid grid-cols-[56px_120px_1.2fr_1.4fr_150px] items-center rounded-lg px-4 py-3.5"
                      style={{ backgroundColor: PAPER }}
                    >
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-md text-[12px] font-semibold"
                        style={{ backgroundColor: INK, color: BRASS_LIGHT, ...monoFont }}
                      >
                        {String(startIndex + index + 1).padStart(2, "0")}
                      </div>

                      <span
                        className="w-fit rounded-md px-2.5 py-1 text-[11px] font-medium"
                        style={{ backgroundColor: PAPER_DIM, color: SLATE }}
                      >
                        {emp.employeeId || "N/A"}
                      </span>

                      <div className="flex min-w-0 items-center gap-3 pr-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[13px] font-semibold uppercase"
                          style={{ backgroundColor: INK, color: BRASS_LIGHT }}
                        >
                          {emp.userId?.name?.charAt(0) || "?"}
                        </div>
                        <div className="min-w-0">
                          <span
                            className="block truncate text-[16px] leading-tight"
                            style={{ ...displayFont, fontWeight: 600, color: "#14161B" }}
                          >
                            {emp.userId?.name}
                          </span>
                          {(emp.isManager || emp.isActive === false || emp.userId?.isActive === false) && (
                            <div className="mt-1 flex gap-1.5">
                              {emp.isManager && <ManagerBadge />}
                              {(emp.isActive === false || emp.userId?.isActive === false) && <InactiveBadge />}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="truncate pr-3 text-[13px] font-medium" style={{ color: SLATE }}>
                        {emp.userId?.email}
                      </span>

                      <div className="flex justify-end">
                        <span
                          className="rounded-md px-3 py-1.5 text-[11px] font-semibold"
                          style={{ backgroundColor: INK, color: BRASS_LIGHT }}
                        >
                          {emp.designation || "—"}
                        </span>
                      </div>
                    </div>
                  ))}

                  {paginatedEmployees.length === 0 && <EmptyState />}
                </div>
              </div>

              {/* PAGINATION */}
              {employees.length > 0 && (
                <div
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  style={{ borderTop: `1px solid ${HAIRLINE_DARK}` }}
                >
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="roster-focusable flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30"
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
                      className="roster-focusable flex flex-1 items-center justify-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30 sm:flex-none"
                      style={{ color: FOG, border: `1px solid ${HAIRLINE_DARK}`, backgroundColor: INK_SOFT }}
                    >
                      Next <ChevronRight size={15} strokeWidth={1.75} />
                    </button>

                    <div className="relative shrink-0">
                      <select
                        value={itemsPerPage}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="roster-focusable cursor-pointer appearance-none rounded-md py-2 pl-3 pr-8 text-[13px] font-medium outline-none"
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

/* Internal helper for empty state */
const EmptyState = () => (
  <div className="flex flex-col items-center gap-2 py-16">
    <Users size={20} strokeWidth={1.5} color={FOG} />
    <p className="text-[13px] font-medium" style={{ color: FOG }}>
      No team members assigned yet
    </p>
  </div>
);

export default DepartmentEmployees;
