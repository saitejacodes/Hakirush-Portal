import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronDown, Users, Mail, Briefcase } from "lucide-react";

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
    .roster-table-scroll::-webkit-scrollbar {
      width: 10px;
    }
    .roster-table-scroll::-webkit-scrollbar-track {
      background: #FBF8F3;
      border-radius: 999px;
    }
    .roster-table-scroll::-webkit-scrollbar-thumb {
      background-color: ${GOLD};
      background-image: linear-gradient(180deg, ${GOLD}, ${GARNET});
      background-clip: padding-box;
      border: 2.5px solid #FBF8F3;
      border-radius: 999px;
    }
    .roster-table-scroll::-webkit-scrollbar-thumb:hover {
      border-color: #F5EFE2;
    }
    .roster-table-scroll {
      scrollbar-width: thin;
      scrollbar-color: ${GOLD} #FBF8F3;
    }
  `}</style>
);

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

const DepartmentEmployees = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

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
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/employee/department/${id}/employees`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        if (res.data?.success) {
          setEmployees(res.data.employees || []);
        } else {
          setError("Failed to load employees");
        }
      } catch (err) {
        setError(err?.response?.data?.error || "Connection error occurred");
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

      <div className="relative z-10 mx-auto max-w-[1200px] space-y-6 p-4 sm:space-y-8 sm:p-8">
        {/* BACK BUTTON */}
        <div className="flex justify-start pt-2">
          <button
            onClick={() => navigate(-1)}
            className="group flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 transition-all"
          >
            <ChevronLeft
              size={17}
              strokeWidth={1.75}
              className="text-[#B4ADA0] transition-all group-hover:-translate-x-1 group-hover:text-[#7A2233]"
            />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#B4ADA0] transition-colors group-hover:text-[#7A2233]">
              Return to Departments
            </span>
          </button>
        </div>

        {/* HEADER */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
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
                  Assigned Personnel
                </p>
              </div>
              <h1
                className="text-3xl leading-[0.92] tracking-tight text-[#1C1A17] sm:text-[2.75rem]"
                style={{ ...displayFont, fontWeight: 700 }}
              >
                Team <span className="italic" style={{ color: GARNET }}>Roster</span>
              </h1>
              <p className="max-w-md text-[12px] font-medium leading-relaxed text-[#8A8378] sm:text-[13px]">
                Every member currently assigned to this department, at a glance.
              </p>
            </div>
          </div>

          {/* HEADCOUNT — quiet stat badge */}
          {!loading && !error && employees.length > 0 && (
            <div
              className="flex items-center gap-4 self-start rounded-2xl border bg-white/70 px-6 py-3.5 backdrop-blur-md sm:self-auto"
              style={{ borderColor: HAIRLINE }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${GOLD}18`, color: GARNET }}
              >
                <Users size={16} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B4ADA0]">
                  Team Members
                </p>
                <p className="text-xl leading-none tracking-tight text-[#1C1A17]" style={{ ...displayFont, fontWeight: 700 }}>
                  {employees.length}
                </p>
              </div>
            </div>
          )}
        </header>

        {/* MAIN CONTAINER */}
        <div className="mt-2 overflow-hidden rounded-[2rem] border border-[#E7DFD2] bg-white/70 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_30px_60px_-24px_rgba(28,26,23,0.16)] backdrop-blur-md sm:rounded-[2.25rem]">
          <main className="p-2 md:p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center space-y-5 py-24">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E7DFD2] border-t-[#7A2233]"></div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-[#8A8378]">
                  Syncing Personnel
                </p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <div
                  className="mb-4 inline-block rounded-2xl border p-6"
                  style={{ borderColor: "#7A223330", backgroundColor: "#7A22330A" }}
                >
                  <p
                    className="text-xl italic leading-none tracking-tight"
                    style={{ ...displayFont, fontWeight: 700, color: GARNET }}
                  >
                    {error}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* MOBILE VIEW */}
                <div className="space-y-4 p-2 md:hidden">
                  {paginatedEmployees.length > 0 ? (
                    paginatedEmployees.map((emp, index) => (
                      <div
                        key={emp._id}
                        className="rounded-2xl border border-[#E7DFD2] bg-white/75 p-5 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_16px_32px_-16px_rgba(28,26,23,0.14)] backdrop-blur-md transition-all duration-300 active:scale-[0.98]"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-[9px] font-semibold uppercase italic tracking-widest text-[#B4ADA0]">
                            Ref #{String(startIndex + index + 1).padStart(2, "0")}
                          </span>
                          <span
                            className="rounded-lg border px-3 py-1 text-[9px] font-semibold uppercase tracking-widest text-[#8A8378]"
                            style={{ borderColor: HAIRLINE, backgroundColor: "#FBF8F3" }}
                          >
                            {emp.userId?.employeeId || "No ID"}
                          </span>
                        </div>

                        <div className="mb-4">
                          <p
                            className="mb-1 text-xl leading-none tracking-tight text-[#1C1A17]"
                            style={{ ...displayFont, fontWeight: 700 }}
                          >
                            {emp.userId?.name}
                          </p>
                          <p className="flex items-center gap-1.5 text-[11px] font-medium text-[#8A8378]">
                            <Mail size={12} style={{ color: GOLD }} /> {emp.userId?.email}
                          </p>
                        </div>

                        <div className="border-t pt-4" style={{ borderColor: HAIRLINE }}>
                          <span
                            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[10px] font-semibold uppercase tracking-widest"
                            style={{ borderColor: `${GARNET}25`, backgroundColor: `${GARNET}0A`, color: GARNET }}
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

                {/* DESKTOP TABLE — scrollable viewport with sticky header */}
                <div className="hidden px-6 pb-6 md:block">
                  <div
                    className="relative overflow-hidden rounded-[1.75rem] border shadow-[inset_0_1px_2px_rgba(28,26,23,0.03)]"
                    style={{ borderColor: HAIRLINE, backgroundColor: "#FBF8F3" }}
                  >
                    <div className="roster-table-scroll max-h-[30rem] overflow-y-auto overflow-x-auto px-3 pb-3 pt-1">
                      <table className="w-full border-separate" style={{ borderSpacing: "0 0.875rem" }}>
                        <thead className="sticky top-0 z-10">
                          <tr className="text-left text-[10.5px] font-semibold uppercase tracking-[0.28em] text-[#B4ADA0]">
                            <th className="px-5 py-4 pt-5">
                              <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Ref</span>
                            </th>
                            <th className="px-5 py-4 pt-5">
                              <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Emp ID</span>
                            </th>
                            <th className="px-5 py-4 pt-5">
                              <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Full Name</span>
                            </th>
                            <th className="px-5 py-4 pt-5">
                              <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Email Address</span>
                            </th>
                            <th className="px-5 py-4 pt-5 text-right">
                              <span className="border-b-2 pb-1" style={{ borderColor: GOLD }}>Designation</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedEmployees.map((emp, index) => (
                            <tr
                              key={emp._id}
                              className="group relative border transition-all duration-300 hover:-translate-y-[3px] hover:border-[#D9C79A] hover:shadow-[0_20px_36px_-18px_rgba(28,26,23,0.2)]"
                              style={{ backgroundColor: "#fff", borderColor: HAIRLINE }}
                            >
                              <td className="relative rounded-l-[1.5rem] px-5 py-5 text-[11px] font-semibold italic tabular-nums text-[#B4ADA0] transition-colors duration-300 group-hover:text-[#7A2233]">
                                {/* left accent bar — reveals on hover */}
                                <span
                                  className="absolute left-0 top-1/2 h-2/3 w-[3px] -translate-y-1/2 rounded-r-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                  style={{ background: `linear-gradient(180deg, ${GOLD}, ${GARNET})` }}
                                />
                                <span
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-300 group-hover:border-[#D9C79A]"
                                  style={{ borderColor: HAIRLINE }}
                                >
                                  {String(startIndex + index + 1).padStart(2, "0")}
                                </span>
                              </td>
                              <td className="px-5 py-5">
                                <span
                                  className="rounded-xl border bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#8A8378]"
                                  style={{ borderColor: HAIRLINE }}
                                >
                                  {emp.employeeId || "N/A"}
                                </span>
                              </td>
                              <td className="px-5 py-5">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[14px] font-semibold uppercase text-white shadow-[0_10px_20px_-10px_rgba(122,34,51,0.55)] ring-1 ring-white/40 transition-transform duration-300 group-hover:scale-105"
                                    style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
                                  >
                                    {emp.userId?.name?.charAt(0) || "?"}
                                  </div>
                                  <span
                                    className="truncate text-xl leading-none tracking-tight text-[#1C1A17] transition-colors group-hover:text-[#7A2233]"
                                    style={{ ...displayFont, fontWeight: 700 }}
                                  >
                                    {emp.userId?.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-5 text-sm font-medium italic text-[#8A8378]">
                                {emp.userId?.email}
                              </td>
                              <td className="rounded-r-[1.5rem] px-5 py-5 text-right">
                                <span
                                  className="rounded-2xl border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest transition-all duration-300"
                                  style={{
                                    borderColor: `${GARNET}25`,
                                    backgroundColor: `${GARNET}0A`,
                                    color: GARNET,
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = GARNET;
                                    e.currentTarget.style.color = "#fff";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = `${GARNET}0A`;
                                    e.currentTarget.style.color = GARNET;
                                  }}
                                >
                                  {emp.designation || "—"}
                                </span>
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

                {/* RESPONSIVE PAGINATION */}
                {employees.length > 0 && (
                  <div
                    className="mt-2 flex flex-col items-center gap-4 border-t p-3 sm:flex-row sm:justify-between sm:gap-4 sm:p-5"
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
          </main>
        </div>
      </div>
    </div>
  );
};

/* Internal Helper for Empty State */
const EmptyState = () => (
  <div className="py-24 text-center">
    <div
      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border bg-white"
      style={{ borderColor: HAIRLINE }}
    >
      <Users size={22} strokeWidth={1.5} className="text-[#C9C2B4]" />
    </div>
    <p className="text-[10px] font-semibold uppercase italic tracking-[0.4em] text-[#C9C2B4]">
      No Team Members Assigned
    </p>
  </div>
);

export default DepartmentEmployees;