import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Search, ChevronLeft, ChevronRight, Clock3, CheckCircle2, XCircle,
  User, Hash, Briefcase, CalendarDays, ArrowRight, X, MessageSquareText
} from "lucide-react";
import { apiErrorMessage } from "../../utils/apiError";

const ITEMS_PER_PAGE = 8;

const INK = "#1C1A17";
const GARNET = "#7A2233";
const GOLD = "#C6A15B";
const HAIRLINE = "#E7DFD2";

const TABS = ["Pending", "Approved", "Rejected", "All"];

const statusStyle = {
  Pending: { badge: "bg-[#FAF1EA] text-[#A24A32] border-[#EAD9CC]", bar: "bg-[#B8912E]", icon: <Clock3 size={13} /> },
  Approved: { badge: "bg-[#EEF3EE] text-[#3F6B52] border-[#D9E5DA]", bar: "bg-[#3F6B52]", icon: <CheckCircle2 size={13} /> },
  Rejected: { badge: "bg-[#FBEAEA] text-[#A22F2F] border-[#F1D4D4]", bar: "bg-[#A24A32]", icon: <XCircle size={13} /> },
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

const AdminAttendanceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState("Pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewTarget, setReviewTarget] = useState(null); // { request, decision }
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async (status) => {
    try {
      setLoading(true);
      const params = status && status !== "All" ? { status } : {};
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/attendance-request`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params,
      });
      if (res.data.success) {
        setRequests(res.data.requests || []);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(tab); }, [tab]);

  const openReview = (request, decision) => {
    setReviewTarget({ request, decision });
    setRemarks("");
  };

  const submitReview = async () => {
    if (!reviewTarget) return;
    setSubmitting(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance-request/${reviewTarget.request._id}/review`,
        { decision: reviewTarget.decision, remarks },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setReviewTarget(null);
      await fetchRequests(tab);
    } catch (err) {
      // e.g. 409 ALREADY_REVIEWED when another admin got there first
      alert(apiErrorMessage(err, "Failed to update the request."));
      if (err?.response?.status === 409) {
        setReviewTarget(null);
        await fetchRequests(tab);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return requests
      .filter((r) => (r.employeeId?.userId?.name || "").toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [requests, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filtered, currentPage]
  );

  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  return (
    <div className="min-h-screen bg-[#F6F3EC] pb-20">
      <div className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-8">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-[#1C1A17] flex items-center justify-center text-[#B8912E] shadow-xl shadow-black/10 ring-1 ring-[#B8912E]/20">
              <MessageSquareText size={28} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl font-black text-[#1C1A17] uppercase tracking-tighter sm:text-4xl leading-none">
                  Attendance Requests
                </h1>
                {tab !== "All" && pendingCount > 0 && (
                  <span className="relative flex h-2.5 w-2.5 mt-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8912E] opacity-60" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#B8912E]" />
                  </span>
                )}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#8A8478] mt-3">
                Correction Approvals {pendingCount > 0 && `• ${pendingCount} awaiting review`}
              </p>
            </div>
          </div>
        </header>

        {/* TABS + SEARCH */}
        <div className="sticky top-4 z-20 flex flex-col sm:flex-row gap-3">
          <div className="flex bg-white rounded-2xl border border-[#E7E1D3] shadow-sm p-1.5 gap-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  tab === t ? "text-white shadow-sm" : "text-[#8A8478] hover:text-[#1C1A17]"
                }`}
                style={tab === t ? { background: `linear-gradient(155deg, ${INK} 0%, ${GARNET} 100%)` } : {}}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-[#E7E1D3] shadow-sm flex items-center px-4 focus-within:ring-1 focus-within:ring-[#B8912E]/50 transition-shadow">
            <Search className="text-[#C9C2AE]" size={18} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="SEARCH PERSONNEL..."
              className="w-full py-4 pl-3 outline-none bg-transparent text-[11px] font-bold uppercase tracking-widest text-[#1C1A17] placeholder:text-[#C9C2AE]"
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="min-h-[400px] bg-white rounded-[2.5rem] shadow-sm border border-[#E7E1D3] overflow-hidden">
          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-[#EFE9D8] border-t-[#B8912E] rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase text-[#8A8478] tracking-widest">Loading requests...</p>
            </div>
          ) : (
            <div className="space-y-4">

              {/* DESKTOP */}
              <div className="hidden md:block overflow-x-auto px-8 py-6">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[11px] font-black text-[#8A8478] uppercase tracking-[0.3em]">
                      <th className="px-8 py-4 text-left">Personnel</th>
                      <th className="px-8 py-4 text-left">Date</th>
                      <th className="px-8 py-4 text-center">Change</th>
                      <th className="px-8 py-4 text-left">Reason</th>
                      <th className="px-8 py-4 text-center">Status</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length > 0 ? paginated.map((r) => {
                      const emp = r.employeeId;
                      const st = statusStyle[r.status] || statusStyle.Pending;
                      return (
                        <tr key={r._id} className="bg-[#FBFAF6] hover:bg-white border border-transparent hover:border-[#E7E1D3] transition-all group shadow-sm hover:shadow-md">
                          <td className="px-8 py-6 first:rounded-l-[1.5rem]">
                            <div className="flex flex-col">
                              <span className="font-black uppercase text-[#1C1A17] group-hover:text-[#B8912E] transition-colors text-base leading-tight">
                                {emp?.userId?.name || "Unknown"}
                              </span>
                              <span className="text-[10px] font-bold text-[#8A8478] uppercase tracking-tight">
                                ID: {emp?.employeeId || "N/A"} • {emp?.department?.dep_name || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-[11px] font-bold text-[#1C1A17] uppercase tracking-tight">{formatDate(r.date)}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-tight">
                              <span className="px-2.5 py-1 rounded-full bg-[#FBEAEA] text-[#A22F2F] border border-[#F1D4D4]">{r.currentStatus}</span>
                              <ArrowRight size={12} className="text-[#C9C2AE]" />
                              <span className="px-2.5 py-1 rounded-full bg-[#EEF3EE] text-[#3F6B52] border border-[#D9E5DA]">{r.requestedStatus}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 max-w-[220px]">
                            <span className="text-[11px] font-medium text-[#5C574C] line-clamp-2">{r.reason}</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${st.badge}`}>
                              {st.icon} {r.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 last:rounded-r-[1.5rem] text-right">
                            {r.status === "Pending" ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openReview(r, "Approved")}
                                  className="px-4 py-2 rounded-xl bg-[#3F6B52] text-white text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all cursor-pointer active:scale-95"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => openReview(r, "Rejected")}
                                  className="px-4 py-2 rounded-xl bg-white text-[#A22F2F] border border-[#F1D4D4] text-[9px] font-black uppercase tracking-widest hover:bg-[#FBEAEA] transition-all cursor-pointer active:scale-95"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[9px] font-bold text-[#C9C2AE] uppercase tracking-widest">
                                {r.reviewedAt ? formatDate(r.reviewedAt) : "—"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="6" className="text-center py-10 text-[#8A8478] font-black uppercase tracking-widest text-xs">
                          No {tab.toLowerCase()} requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="md:hidden p-4 space-y-4">
                {paginated.length > 0 ? paginated.map((r) => {
                  const emp = r.employeeId;
                  const st = statusStyle[r.status] || statusStyle.Pending;
                  return (
                    <div key={r._id} className="bg-[#FBFAF6] rounded-[1.8rem] p-5 border border-[#E7E1D3] relative overflow-hidden">
                      <div className={`absolute top-0 left-0 h-full w-1.5 ${st.bar}`} />
                      <div className="flex justify-between items-start mb-3 pl-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#1C1A17] flex items-center justify-center text-[#B8912E]">
                            <User size={18} />
                          </div>
                          <div>
                            <h3 className="font-black uppercase text-[#1C1A17] leading-tight tracking-tight">
                              {emp?.userId?.name || "Unknown"}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-bold bg-white text-[#8A8478] px-1.5 py-0.5 rounded flex items-center gap-1 border border-[#E7E1D3]">
                                <Hash size={8} /> {emp?.employeeId || "N/A"}
                              </span>
                              <span className="text-[9px] font-bold bg-white text-[#8A8478] px-1.5 py-0.5 rounded flex items-center gap-1 border border-[#E7E1D3]">
                                <Briefcase size={8} /> {emp?.department?.dep_name || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${st.badge}`}>
                          {st.icon} {r.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pl-2 mb-2 text-[10px] font-bold text-[#8A8478] uppercase tracking-tight">
                        <CalendarDays size={12} /> {formatDate(r.date)}
                      </div>

                      <div className="flex items-center gap-2 pl-2 mb-3 text-[10px] font-black uppercase tracking-tight">
                        <span className="px-2 py-1 rounded-full bg-[#FBEAEA] text-[#A22F2F] border border-[#F1D4D4]">{r.currentStatus}</span>
                        <ArrowRight size={11} className="text-[#C9C2AE]" />
                        <span className="px-2 py-1 rounded-full bg-[#EEF3EE] text-[#3F6B52] border border-[#D9E5DA]">{r.requestedStatus}</span>
                      </div>

                      <p className="pl-2 mb-4 text-[11px] font-medium text-[#5C574C]">{r.reason}</p>

                      {r.status === "Pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openReview(r, "Approved")}
                            className="flex-1 py-2.5 rounded-xl bg-[#3F6B52] text-white text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openReview(r, "Rejected")}
                            className="flex-1 py-2.5 rounded-xl bg-white text-[#A22F2F] border border-[#F1D4D4] text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="text-center py-10 text-[#8A8478] font-black uppercase tracking-widest text-xs bg-[#FBFAF6] rounded-2xl border border-[#E7E1D3]">
                    No {tab.toLowerCase()} requests found.
                  </div>
                )}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 bg-[#FBFAF6] border-t border-[#E7E1D3] gap-4 sm:gap-0">
                  <div className="order-1 sm:order-2 px-6 py-2 bg-white rounded-full border border-[#E7E1D3]">
                    <p className="text-[10px] sm:text-[11px] font-black text-[#8A8478] uppercase tracking-widest text-center">
                      Page <span className="text-[#B8912E]">{currentPage}</span>
                      <span className="mx-2 text-[#D6D0BF]">/</span> {totalPages}
                    </p>
                  </div>
                  <div className="order-2 sm:order-1 flex w-full sm:w-auto gap-3 items-center justify-between sm:contents">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-2xl bg-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#8A8478] border border-[#E7E1D3] transition-all enabled:hover:text-[#B8912E] enabled:hover:border-[#B8912E]/40 enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} strokeWidth={3} />
                      <span>Prev</span>
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex-1 sm:flex-none order-3 flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-2xl bg-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#8A8478] border border-[#E7E1D3] transition-all enabled:hover:text-[#B8912E] enabled:hover:border-[#B8912E]/40 enabled:active:scale-95 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <span>Next</span>
                      <ChevronRight size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* REVIEW CONFIRMATION MODAL */}
      {reviewTarget && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#1C1A17]/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 relative border border-[#E7E1D3]">
            <button
              onClick={() => setReviewTarget(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-[#F6F3EC] text-[#8A8478] hover:text-[#A22F2F] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B8912E]">
              {reviewTarget.decision === "Approved" ? "Approve Request" : "Reject Request"}
            </span>
            <h3 className="text-xl font-black uppercase text-[#1C1A17] tracking-tight mt-1 mb-1">
              {reviewTarget.request.employeeId?.userId?.name || "Unknown"}
            </h3>
            <p className="text-[11px] font-bold text-[#8A8478] uppercase tracking-tight mb-6">
              {formatDate(reviewTarget.request.date)} • {reviewTarget.request.currentStatus} → {reviewTarget.request.requestedStatus}
            </p>

            <label className="text-[10px] font-black uppercase text-[#8A8478] tracking-widest">
              Remarks (optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="Add a note for the employee..."
              className="w-full mt-2 text-sm p-3 rounded-2xl border border-[#E7E1D3] focus:outline-none focus:border-[#B8912E]/60 resize-none"
            />

            <button
              onClick={submitReview}
              disabled={submitting}
              className={`mt-6 w-full py-3.5 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 ${
                reviewTarget.decision === "Approved" ? "bg-[#3F6B52] hover:opacity-90" : "bg-[#A22F2F] hover:opacity-90"
              }`}
            >
              {submitting ? "Submitting..." : `Confirm ${reviewTarget.decision}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendanceRequests;