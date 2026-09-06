import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Eye,
  Lock,
  X,
} from "lucide-react";

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

const shortMonth = (raw) => {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-IN", { month: "short" });
};

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const viewStatement = (url) => {
  if (url) window.open(url, "_blank", "noopener,noreferrer");
};

const downloadStatement = (url, filename) => {
  if (!url) return;
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "payslip";
  document.body.appendChild(a);
  a.click();
  a.remove();
};

const ViewPayslip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);

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
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPayslips();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const totalLifetime = useMemo(
    () => payslips.reduce((acc, p) => acc + Number(p.netSalary || 0), 0),
    [payslips]
  );

  const average = payslips.length ? totalLifetime / payslips.length : 0;

  // Last 6 statements, oldest to newest, for the trend strip
  const trend = useMemo(() => {
    const recent = [...payslips].slice(0, 6).reverse();
    const max = Math.max(...recent.map((p) => Number(p.netSalary || 0)), 1);
    return recent.map((p) => ({
      key: p._id,
      label: shortMonth(p.month),
      pct: Math.max(Number(p.netSalary || 0) / max, 0.06),
      isLatest: p._id === payslips[0]?._id,
    }));
  }, [payslips]);

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
            ) : payslips.length > 0 ? (
              payslips.map((p, i) => (
                <button
                  key={p._id}
                  onClick={() => setSelectedSlip(p)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#FBF8F3] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2"
                  style={{
                    borderTop: i === 0 ? "none" : `1px solid ${HAIRLINE}`,
                    outlineColor: GOLD,
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
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`View statement for ${monthLabel(p.month)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          viewStatement(p.payslipFile);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#F1EFE8] transition-colors cursor-pointer"
                        style={{ color: MUTED }}
                      >
                        <Eye size={16} />
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`Download statement for ${monthLabel(p.month)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadStatement(p.payslipFile, `payslip-${p.month}`);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#F1EFE8] transition-colors cursor-pointer"
                        style={{ color: MUTED }}
                      >
                        <Download size={16} />
                      </span>
                    </div>
                  </div>
                </button>
              ))
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

const Figure = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(251,248,243,0.6)" }}>
      {label}
    </p>
   
  </div>
);

const Row = ({ label, value, color = INK, negative = false }) => (
  <div className="flex justify-between items-center py-1.5">
    <span className="text-[12px] font-semibold" style={{ color: MUTED }}>
      {label}
    </span>
    <span className="text-[14px] font-black tabular-nums" style={{ color }}>
      {negative ? "−" : ""}
      {rupees(value)}
    </span>
  </div>
);

export default ViewPayslip;
