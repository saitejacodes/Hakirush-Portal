import axios from "axios";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Search, ClipboardList, PlusCircle, Calendar, Info, XCircle, AlertTriangle, Check } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/authContext";

/* ===== STYLES & HELPERS ===== */
const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#B8912E";

const STATUS_THEME = {
  approved: "text-[#3F6B52] bg-[#EEF3EE] border-[#D7E4D9] shadow-sm",
  pending: "text-[#9C7A22] bg-[#FBF3E3] border-[#EFE1BF] shadow-sm",
  rejected: "text-[#A24A32] bg-[#FAF1EA] border-[#EAD9CC] shadow-sm",
  cancelled: "text-[#7A2233] bg-[#F8E9EC] border-[#E8C6CF] shadow-sm",
  default: "text-[#8A8478] bg-[#F1EFE8] border-[#E7E1D3]",
};

const ACTION_MODAL_HAIRLINE = "rgba(26,26,29,0.12)";
const ACTION_MODAL_GOLD = "#AD8A56";
const ACTION_MODAL_GARNET = "#722F37";

const ActionModal = ({ modalState, onClose }) => {
  if (!modalState) return null;

  const isSuccess = modalState.type === "success";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#1A1A1D]/30 backdrop-blur-md" />
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm overflow-hidden rounded-[1.25rem] border bg-white/95 text-center shadow-[0_40px_90px_-32px_rgba(26,26,29,0.4)] backdrop-blur-md"
          style={{ borderColor: ACTION_MODAL_HAIRLINE }}
        >
          <div className="px-10 pb-10 pt-12">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
              style={{ borderColor: isSuccess ? "rgba(173,138,86,0.4)" : "rgba(114,47,55,0.2)", color: isSuccess ? ACTION_MODAL_GOLD : ACTION_MODAL_GARNET }}
            >
              {isSuccess ? <Check size={26} strokeWidth={1.75} /> : <AlertTriangle size={26} strokeWidth={1.75} />}
            </div>
            <h3 className="text-2xl leading-none text-[#1A1A1D]" style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif", fontWeight: 500 }}>
              {modalState.title}
            </h3>
            <p className="mt-3 text-xs leading-relaxed text-[#7A756C]">
              {modalState.message}
            </p>
            <div className="mt-8 flex flex-col gap-3">
              {!isSuccess && (
                <button
                  onClick={onClose}
                  className="w-full cursor-pointer rounded-full border border-[#E7E1D3] bg-white py-3.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#1A1A1D] transition-colors"
                >
                  {modalState.cancelLabel || "No, keep it"}
                </button>
              )}
              <button
                onClick={() => {
                  if (isSuccess) {
                    onClose();
                    return;
                  }
                  onClose();
                  modalState.onConfirm?.();
                }}
                className="w-full cursor-pointer rounded-full py-3.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white transition-colors"
                style={{ backgroundColor: isSuccess ? "#1A1A1D" : ACTION_MODAL_GARNET }}
              >
                {modalState.confirmLabel || "Got it, thanks"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
  });
};

const getNetDays = (start, end, holidaySet) => {
  if (!start || !end) return 0;
  let count = 0;
  let current = new Date(start);
  const last = new Date(end);
  current.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);
  while (current <= last) {
    const day = current.getDay();
    const dateStr = current.toISOString().split('T')[0];
    if (day !== 0 && day !== 6 && !holidaySet.has(dateStr)) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
};

const EmployeeLeaveList = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cancellingId, setCancellingId] = useState(null);
  const [modalState, setModalState] = useState(null);
  const navigate = useNavigate();
  const itemsPerPage = 5;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const [leaveRes, holidayRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/leave/${id}/${user.role}`, { headers }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holiday/all`, { headers })
      ]);
      if (leaveRes.data.success) setLeaves(leaveRes.data.leaves || []);
      if (holidayRes.data.success) setHolidays(holidayRes.data.holidays || []);
    } catch (err) {
      setError("Sync Failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, user.role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const processedData = useMemo(() => {
    return leaves
      .filter(l => (l.leaveType || "").toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [leaves, search]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const currentItems = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCancelLeave = async (leaveId) => {
    try {
      setCancellingId(leaveId);
      setError(null);
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/leave/cancel/${leaveId}`, {}, { headers });

      if (res.data.success) {
        await fetchData();
        setCurrentPage(1);
        setSuccessMessage("Leave request cancelled successfully.");
        setModalState({
          type: "success",
          title: "Leave Cancelled",
          message: "Your leave request has been cancelled and logged in the register.",
          confirmLabel: "Got it, thanks",
        });
      } else {
        setError(res.data.message || "Unable to cancel leave request");
      }
    } catch (err) {
      setError("Unable to cancel leave request");
      console.error(err);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <>
      <ActionModal
        modalState={modalState}
        onClose={() => setModalState(null)}
      />
      <div className="min-h-screen bg-[#F6F3EC] pb-12">
      <div className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-6">


        {/* HEADER */}
        <header className="flex items-center gap-6">
          <div
            className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-[#F6F3EC] shadow-xl shadow-black/10 ring-1 ring-[#B8912E]/20 shrink-0"
            style={{ background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` }}
          >
            <ClipboardList size={30} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1C1A17] uppercase tracking-tighter sm:text-4xl leading-none">
              Leave <span className="text-[#B8912E]">Records</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#8A8478] mt-3">
              Personnel Absence & History Tracking
            </p>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#E7E1D3] overflow-hidden mt-4">

          {/* SEARCH & ACTION ROW */}
          <div className="p-6 md:p-10 border-b border-[#F1EFE8]">
            <div className="flex flex-col lg:flex-row gap-5 items-center">

              <div className="group relative flex-1 w-full flex items-center bg-[#F6F3EC] border-2 border-transparent rounded-[1.5rem] px-6 focus-within:border-[#B8912E]/30 focus-within:bg-white transition-all">
                <Search className="text-[#C9C2AE] group-focus-within:text-[#B8912E] transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="SEARCH BY LEAVE CATEGORY..."
                  className="w-full py-5 pl-4 outline-none bg-transparent text-[11px] font-black uppercase tracking-widest text-[#1C1A17] placeholder:text-[#C9C2AE]"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                />
              </div>

              {user.role === "employee" && (
                <Link
                  to="/employee-dashboard/add-leave"
                  className="w-full lg:w-auto flex items-center justify-center gap-3 rounded-[1.5rem] bg-[#1C1A17] px-10 py-5 font-black uppercase text-[10px] tracking-widest text-[#F6F3EC] shadow-md transition-all hover:bg-[#B8912E] hover:text-[#1C1A17] active:scale-95 whitespace-nowrap"
                >
                  <PlusCircle size={18} strokeWidth={3} />
                  <span>Request Leave</span>
                </Link>
              )}
            </div>
          </div>

          {error && (
            <div className="px-6 md:px-10 py-4 border-b border-[#F1EFE8] bg-[#FFF7F5] text-[#A24A32] text-sm font-semibold">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="px-6 md:px-10 py-4 border-b border-[#F1EFE8] bg-[#F5FFF7] text-[#3F6B52] text-sm font-semibold">
              {successMessage}
            </div>
          )}

          {loading ? (
            <div className="p-24 text-center">
              <div className="w-12 h-12 border-4 border-[#EFE9D8] border-t-[#B8912E] rounded-full animate-spin mx-auto mb-5"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8A8478]">Syncing Records...</p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="lg:hidden p-4 space-y-4">
                {currentItems.map((leave, i) => (
                  <div key={leave._id} className="bg-white rounded-[1.5rem] shadow-sm border border-[#E7E1D3] p-6 transition-all active:scale-[0.98]">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                         <p className="text-[9px] font-black uppercase tracking-widest text-[#B8912E] mb-1">
                           LOG #{(currentPage - 1) * itemsPerPage + i + 1}
                         </p>
                         <h4 className="font-black text-[#1C1A17] uppercase tracking-tighter text-xl">
                           {leave.leaveType}
                         </h4>
                      </div>
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${STATUS_THEME[leave.status?.toLowerCase()] || STATUS_THEME.default}`}>
                        {leave.status}
                      </span>
                    </div>

                    <div className="bg-[#FBFAF6] rounded-2xl p-4 mb-4 border border-[#E7E1D3]">
                      <div className="flex items-center gap-2 text-[#8A8478] text-[10px] font-bold uppercase tracking-tight">
                        <Calendar size={14} className="text-[#B8912E]" />
                        {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                      </div>
                    </div>

                    <div className="flex justify-between items-end pt-4 border-t border-[#F1EFE8]">
                      <div className="max-w-[60%]">
                        <p className="text-[11px] font-medium text-[#8A8478] truncate">{leave.reason || "No reason provided"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-[#1C1A17] leading-none">{leave.days}</p>
                        <p className="text-[8px] font-black uppercase text-[#8A8478] tracking-widest mt-1">Days</p>
                      </div>
                    </div>

                    {user.role === "employee" && ["pending", "approved"].includes((leave.status || "").toLowerCase()) && (
                      <button
                        onClick={() => setModalState({
                          type: "confirm",
                          title: "Cancel Leave Request",
                          message: `Are you sure you want to cancel this ${leave.leaveType || "leave"} request?`,
                          cancelLabel: "No, keep it",
                          confirmLabel: "Yes, cancel it",
                          onConfirm: () => handleCancelLeave(leave._id),
                        })}
                        disabled={cancellingId === leave._id}
                        className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-[#E8C6CF] bg-[#FFF7F9] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#7A2233] transition-all disabled:opacity-60"
                      >
                        <XCircle size={15} />
                        {cancellingId === leave._id ? "Cancelling..." : "Cancel Leave"}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden lg:block overflow-x-auto px-8 pb-10">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[11px] font-black text-[#8A8478] uppercase tracking-[0.3em]">
                      <th className="px-8 py-4 text-left">Ref</th>
                      <th className="px-8 py-4 text-left">Category</th>
                      <th className="px-8 py-4 text-left">Duration</th>
                      <th className="px-8 py-4 text-center">Net Days</th>
                      <th className="px-8 py-4 text-left">Reason</th>
                      <th className="px-8 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((leave, i) => (
                      <tr key={leave._id} className="bg-[#FBFAF6] hover:bg-white border border-transparent hover:border-[#E7E1D3] transition-all group shadow-sm hover:shadow-md">
                        <td className="px-8 py-6 first:rounded-l-[1.5rem] text-[11px] font-black text-[#D6D0BF]">
                          #{(currentPage - 1) * itemsPerPage + i + 1}
                        </td>
                        <td className="px-8 py-6 font-black uppercase text-[#1C1A17] text-base tracking-tighter group-hover:text-[#B8912E] transition-colors">
                          {leave.leaveType}
                        </td>
                        <td className="px-8 py-6">
                          <span className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-[#8A8478] border border-[#E7E1D3]">
                            {formatDate(leave.startDate)} <span className="mx-2 text-[#D9C79A]">→</span> {formatDate(leave.endDate)}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="text-2xl font-black text-[#1C1A17]">{leave.days}</span>
                        </td>
                        <td className="px-8 py-6 max-w-[250px]">
                          <p className="text-[12px] font-medium text-[#8A8478] truncate">
                            {leave.reason || "—"}
                          </p>
                        </td>
                        <td className="px-8 py-6 last:rounded-r-[1.5rem] text-right">
                          <div className="flex flex-col items-end gap-3">
                            <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 inline-block ${STATUS_THEME[leave.status?.toLowerCase()] || STATUS_THEME.default}`}>
                              {leave.status}
                            </span>
                            {user.role === "employee" && ["pending", "approved"].includes((leave.status || "").toLowerCase()) && (
                              <button
                                onClick={() => setModalState({
                                  type: "confirm",
                                  title: "Cancel Leave Request",
                                  message: `Are you sure you want to cancel this ${leave.leaveType || "leave"} request?`,
                                  cancelLabel: "No, keep it",
                                  confirmLabel: "Yes, cancel it",
                                  onConfirm: () => handleCancelLeave(leave._id),
                                })}
                                disabled={cancellingId === leave._id}
                                className="flex items-center gap-2 rounded-2xl border border-[#E8C6CF] bg-[#FFF7F9] px-4 py-2 text-[9px] font-black uppercase tracking-widest text-[#7A2233] transition-all disabled:opacity-60 cursor-pointer"
                              >
                                <XCircle size={14} />
                                {cancellingId === leave._id ? "Cancelling..." : "Cancel"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {processedData.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-10 bg-[#FBFAF6] border-t border-[#E7E1D3] gap-6 sm:gap-0">
                  <div className="order-1 sm:order-2 px-8 py-3 bg-white rounded-full border border-[#E7E1D3]">
                    <p className="text-[10px] sm:text-[11px] font-black text-[#8A8478] uppercase tracking-widest text-center">
                      Page <span className="text-[#B8912E]">{currentPage}</span>
                      <span className="mx-2 text-[#D6D0BF]">/</span> {totalPages}
                    </p>
                  </div>
                  <div className="order-2 sm:order-1 flex w-full sm:w-auto gap-4 items-center justify-between sm:contents">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] bg-white text-[10px] font-black uppercase tracking-widest text-[#8A8478] border border-[#E7E1D3] transition-all enabled:hover:text-[#B8912E] enabled:hover:border-[#B8912E]/40 enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} strokeWidth={3} /> Prev
                    </button>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex-1 sm:flex-none order-3 flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] bg-white text-[10px] font-black uppercase tracking-widest text-[#8A8478] border border-[#E7E1D3] transition-all enabled:hover:text-[#B8912E] enabled:hover:border-[#B8912E]/40 enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default EmployeeLeaveList;
