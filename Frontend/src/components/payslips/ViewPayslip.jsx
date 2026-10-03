import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Download,
  Eye,
  Loader2,
} from "lucide-react";
import { apiErrorMessage } from "../../utils/apiError";
import { downloadPayslip, openPayslip, payslipHasFile } from "../../utils/payslipFiles";

// HAKIRUSH admin dashboard tokens
const INK = "#1C1A17";
const PAPER = "#FBF8F3";
const GARNET = "#7A2233";
const GOLD = "#C6A15B";
const SAGE = "#3F6B52";
const RUST = "#A24A32";
const HAIRLINE = "#E7E1D3";
const MUTED = "#8A8478";

const monthLabel = (raw) => {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const ViewPayslip = () => {
  const { id } = useParams();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(null); // `${payslipId}:view|download`
  const [actionError, setActionError] = useState("");

  const runAction = async (payslipId, kind, fn) => {
    if (busy) return;
    setBusy(`${payslipId}:${kind}`);
    setActionError("");
    try {
      await fn();
    } catch (err) {
      setActionError(apiErrorMessage(err, "Couldn't open this payslip. Try again."));
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchPayslips = async () => {
      try {
        const token = localStorage.getItem("token");
        const empRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const employeeId = empRes?.data?.employee?._id;
        if (employeeId) {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/payslip/employee/${employeeId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const sorted = (res.data.payslips || []).sort(
            (a, b) => new Date(b.month) - new Date(a.month)
          );
          if (!cancelled) setPayslips(sorted);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        if (!cancelled) setLoadError(apiErrorMessage(err, "Couldn't load your payslips."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPayslips();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-[#F6F3EC] font-sans text-[#1C1A17]">
      <div className="w-full max-w-4xl mx-auto p-6 md:p-12">

        {/* Letterhead / summary */}
        <div
          className="rounded-3xl overflow-hidden mb-10"
          style={{ backgroundColor: GARNET }}
        >
          <div className="h-[3px]" style={{ backgroundColor: GOLD }} />
          <div className="px-8 py-9">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2"
              style={{ color: GOLD }}
            >
              Payroll statement
            </p>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: PAPER, fontFamily: "'Playfair Display', serif" }}>
              Your earnings, on record
            </h1>
          </div>
        </div>

        {/* Ledger */}
        <div>
          <div className="flex items-baseline justify-between px-1 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: MUTED }}>
              Statement history
            </span>
            {!loading && payslips.length > 0 && (
              <span className="text-[10px] font-bold" style={{ color: MUTED }}>
                {payslips.length} {payslips.length === 1 ? "entry" : "entries"}
              </span>
            )}
          </div>

          {actionError && (
            <p role="alert" className="mb-3 px-1 text-[12px] font-semibold" style={{ color: RUST }}>
              {actionError}
            </p>
          )}
          <div className="rounded-2xl border overflow-hidden bg-white" style={{ borderColor: HAIRLINE }}>
            {loading ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <div
                  className="w-6 h-6 border-2 rounded-full animate-spin"
                  style={{ borderColor: HAIRLINE, borderTopColor: GOLD }}
                />
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED }}>
                  Loading your statements…
                </p>
              </div>
            ) : loadError ? (
              <div className="py-16 text-center px-10">
                <p className="text-[12px] font-semibold" style={{ color: RUST }}>{loadError}</p>
              </div>
            ) : payslips.length > 0 ? (
              payslips.map((p, i) => {
                const hasFile = payslipHasFile(p);
                const viewing = busy === `${p._id}:view`;
                const downloading = busy === `${p._id}:download`;
                return (
                <div
                  key={p._id}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#FBF8F3] transition-colors"
                  style={{
                    borderTop: i === 0 ? "none" : `1px solid ${HAIRLINE}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SAGE }} />
                    <span className="font-bold text-[15px]">{monthLabel(p.month)}</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="font-black text-lg tracking-tight tabular-nums text-red-600">
                      {rupees(p.netSalary)}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={!hasFile || Boolean(busy)}
                        aria-label={`View statement for ${monthLabel(p.month)}`}
                        title={hasFile ? "View PDF" : "No PDF on file"}
                        onClick={() => runAction(p._id, "view", () => openPayslip(p._id))}
                        className="p-1.5 rounded-lg hover:bg-[#F1EFE8] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ color: MUTED, outlineColor: GOLD }}
                      >
                        {viewing ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                      </button>
                      <button
                        type="button"
                        disabled={!hasFile || Boolean(busy)}
                        aria-label={`Download statement for ${monthLabel(p.month)}`}
                        title={hasFile ? "Download PDF" : "No PDF on file"}
                        onClick={() => runAction(p._id, "download", () => downloadPayslip(p._id, `payslip-${p.month}`))}
                        className="p-1.5 rounded-lg hover:bg-[#F1EFE8] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ color: MUTED, outlineColor: GOLD }}
                      >
                        {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                );
              })
            ) : (
              <div className="py-16 text-center px-10">
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: MUTED }}>
                  No statements on file yet
                </p>
                <p className="text-[12px] mt-1" style={{ color: MUTED }}>
                  Your first payslip will appear here once it's processed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPayslip;
