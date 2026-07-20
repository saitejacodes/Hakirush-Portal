import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Users, Mail, Briefcase } from "lucide-react";

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#C6A15B";
const HAIRLINE = "#E7DFD2";

const displayFont = { fontFamily: "'Playfair Display', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

const GRAIN_URI =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='140'%20height='140'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23n)'%20opacity='0.5'/%3E%3C/svg%3E";

const DepartmentEmployees = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div
      className="relative min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-100 pb-20 text-[#1C1A17]"
      style={bodyFont}
    >
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
        <header className="flex items-center gap-5 sm:gap-6">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] text-white shadow-[0_20px_40px_-14px_rgba(122,34,51,0.45)] sm:h-16 sm:w-16"
            style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
          >
            <Users size={28} strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-px w-6" style={{ backgroundColor: GOLD }} />
              <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-[#C6A15B] sm:text-[10px]">
                Assigned Personnel
              </p>
            </div>
            <h1
              className="text-2xl leading-[0.95] tracking-tight text-[#1C1A17] sm:text-4xl"
              style={{ ...displayFont, fontWeight: 700 }}
            >
              Team <span className="italic text-[#7A2233]">Roster</span>
            </h1>
          </div>
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
                  {employees.length > 0 ? (
                    employees.map((emp, index) => (
                      <div
                        key={emp._id}
                        className="rounded-2xl border border-[#E7DFD2] bg-white/75 p-5 shadow-[0_1px_2px_rgba(28,26,23,0.04),0_16px_32px_-16px_rgba(28,26,23,0.14)] backdrop-blur-md transition-all duration-300 active:scale-[0.98]"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-[9px] font-semibold uppercase italic tracking-widest text-[#B4ADA0]">
                            Ref #{String(index + 1).padStart(2, "0")}
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

                {/* DESKTOP TABLE */}
                <div className="hidden overflow-x-auto px-6 pb-6 md:block">
                  <table className="w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-[10.5px] font-semibold uppercase tracking-[0.28em] text-[#B4ADA0]">
                        <th className="px-8 py-3 text-left">Ref</th>
                        <th className="px-8 py-3 text-left">Emp ID</th>
                        <th className="px-8 py-3 text-left">Full Name</th>
                        <th className="px-8 py-3 text-left">Email Address</th>
                        <th className="px-8 py-3 text-right">Designation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp, index) => (
                        <tr
                          key={emp._id}
                          className="group border transition-all duration-300 hover:border-[#D9C79A]"
                          style={{ backgroundColor: "#FBF8F3", borderColor: HAIRLINE }}
                        >
                          <td className="rounded-l-[1.5rem] px-8 py-5 text-[11px] font-semibold italic tabular-nums text-[#B4ADA0]">
                            {String(index + 1).padStart(2, "0")}
                          </td>
                          <td className="px-8 py-5">
                            <span
                              className="rounded-xl border bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#8A8378]"
                              style={{ borderColor: HAIRLINE }}
                            >
                              {emp.employeeId || "N/A"}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span
                              className="text-xl leading-none tracking-tight text-[#1C1A17] transition-colors group-hover:text-[#7A2233]"
                              style={{ ...displayFont, fontWeight: 700 }}
                            >
                              {emp.userId?.name}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-sm font-medium italic text-[#8A8378]">
                            {emp.userId?.email}
                          </td>
                          <td className="rounded-r-[1.5rem] px-8 py-5 text-right">
                            <span
                              className="rounded-2xl border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 group-hover:text-white"
                              style={{
                                borderColor: `${GARNET}25`,
                                backgroundColor: `${GARNET}0A`,
                                color: GARNET,
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GARNET)}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${GARNET}0A`)}
                            >
                              {emp.designation || "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {employees.length === 0 && <EmptyState />}
                </div>
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
      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border"
      style={{ borderColor: HAIRLINE, backgroundColor: "#FBF8F3" }}
    >
      <Users size={22} strokeWidth={1.5} className="text-[#C9C2B4]" />
    </div>
    <p className="text-[10px] font-semibold uppercase italic tracking-[0.4em] text-[#C9C2B4]">
      No Team Members Assigned
    </p>
  </div>
);

export default DepartmentEmployees;