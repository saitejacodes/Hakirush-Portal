import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FileText, Download, Eye } from "lucide-react";

const ViewPayslip = () => {
  const { id } = useParams(); // userId OR employeeId
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FORCE DOWNLOAD ================= */
  const handleDownload = async (url, filename = "payslip.pdf") => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("DOWNLOAD ERROR:", err);
      alert("Failed to download payslip");
    }
  };

  /* ================= FETCH PAYSLIPS ================= */
  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        let employeeId = id;

        /* 🔹 SAFETY: If ID is userId, convert to employeeId */
        const empRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        employeeId = empRes?.data?.employee?._id || id;

        /* 🔹 FETCH PAYSLIPS */
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/payslip/employee/${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setPayslips(res.data.payslips || []);
      } catch (err) {
        console.error("FETCH PAYSLIP ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-yellow-50 px-4 py-10">

      <div
        className="max-w-4xl mx-auto bg-white/80 backdrop-blur
                   rounded-3xl shadow-xl border border-red-100 p-6"
      >
        {/* ================= HEADER ================= */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-red-100 text-red-600">
            <FileText />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-red-700">
              My Payslips
            </h2>
            <p className="text-sm text-gray-500">
              View & download your salary slips
            </p>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        {loading ? (
          <p className="text-sm text-gray-500">Loading payslips...</p>
        ) : payslips.length === 0 ? (
          <p className="text-sm text-gray-400">
            No payslips available yet
          </p>
        ) : (
          <div className="space-y-4">
            {payslips.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between
                           bg-white rounded-2xl border
                           p-4 hover:shadow-md transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {p.month}
                  </p>
                  <p className="text-xs text-gray-500">
                    Basic: ₹{p.basicSalary} | Net: ₹{p.netSalary}
                  </p>
                </div>

                <div className="flex gap-3">
                  {/* VIEW */}
                  <a
                    href={p.payslipFile}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-red-100
                               text-red-600 hover:bg-red-200"
                    title="View Payslip"
                  >
                    <Eye size={16} />
                  </a>

                  {/* DOWNLOAD (FORCED) */}
                  <button
                    onClick={() =>
                      handleDownload(
                        p.payslipFile,
                        `${p.month}-Payslip.pdf`
                      )
                    }
                    className="p-2 rounded-xl bg-green-100
                               text-green-600 hover:bg-green-200"
                    title="Download Payslip"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPayslip;