import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  Eye
} from "lucide-react";

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => {
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />

      {/* Alert */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-red-100 overflow-hidden">

          {/* Gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />

          <div className="p-6 flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              ✓
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-700">
                Payslip Added
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                The payslip has been uploaded successfully.
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-red-600 transition"
            >
              ✕
            </button>
          </div>

          <div className="px-6 pb-5">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-medium hover:opacity-90 transition"
            >
              Okay, got it
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const AddPayslip = () => {
  const { id } = useParams(); // employeeId
  const navigate = useNavigate();

  const [form, setForm] = useState({
    month: "",
    basicSalary: "",
    allowances: "",
    deductions: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [payslips, setPayslips] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false); // ✅ NEW

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= FETCH PAYSLIPS ================= */
  const fetchPayslips = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/payslip/employee/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setPayslips(res.data.payslips || []);
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, [id]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("employeeId", id);
      data.append("month", form.month);
      data.append("basicSalary", form.basicSalary);
      data.append("allowances", form.allowances);
      data.append("deductions", form.deductions);
      data.append("payslip", file);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payslip/add`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        setShowAlert(true); // ✅ SHOW ALERT

        setForm({
          month: "",
          basicSalary: "",
          allowances: "",
          deductions: "",
        });
        setFile(null);

        fetchPayslips(); // refresh list

        // OPTIONAL AUTO REDIRECT
        // setTimeout(() => navigate(-1), 1800);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add payslip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ================= SUCCESS ALERT ================= */}
      {showAlert && (
        <SuccessAlert onClose={() => setShowAlert(false)} />
      )}

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-yellow-50 px-4 py-10">

        {/* ================= ADD PAYSLIP CARD ================= */}
        <div className="max-w-xl mx-auto bg-white/80 backdrop-blur
                        rounded-3xl shadow-xl border border-red-100 p-6 sm:p-8">

          <div className="mb-6 text-center">
            <div className="mx-auto w-12 h-12 flex items-center justify-center
                            rounded-2xl bg-red-100 text-red-600 mb-3">
              <FileText />
            </div>
            <h2 className="text-2xl font-extrabold text-red-700">
              Add Payslip
            </h2>
            <p className="text-sm text-gray-500">
              Upload monthly salary details
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <Input label="Salary Month" name="month" value={form.month} onChange={handleChange} placeholder="January 2026" required />
            <Input label="Basic Salary (₹)" name="basicSalary" value={form.basicSalary} onChange={handleChange} required />
            <Input label="Allowances (₹)" name="allowances" value={form.allowances} onChange={handleChange} />
            <Input label="Deductions (₹)" name="deductions" value={form.deductions} onChange={handleChange} />

            {/* FILE */}
            <label className="block">
              <span className="block text-xs font-semibold text-gray-600 mb-2">
                Payslip PDF
              </span>
              <div className="flex items-center justify-center gap-3
                              border-2 border-dashed border-red-200
                              rounded-2xl p-4 cursor-pointer
                              hover:bg-red-50 transition">
                <UploadCloud className="text-red-500" />
                <span className="text-sm text-gray-600">
                  {file ? file.name : "Click to upload PDF"}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  required
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
            </label>

            <button
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white
                         bg-gradient-to-r from-red-600 to-pink-600
                         hover:from-red-700 hover:to-pink-700
                         shadow-lg transition
                         disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Uploading Payslip..." : "Add Payslip"}
            </button>
          </form>
        </div>

        {/* ================= PAYSLIP HISTORY ================= */}
        <div className="max-w-4xl mx-auto mt-10 bg-white/80 backdrop-blur
                        rounded-3xl shadow-xl border border-red-100 p-6">

          <h3 className="text-lg font-bold text-red-700 mb-4">
            Payslip History
          </h3>

          {listLoading ? (
            <p className="text-sm text-gray-500">Loading payslips...</p>
          ) : payslips.length === 0 ? (
            <p className="text-sm text-gray-400">No payslips uploaded yet</p>
          ) : (
            <div className="space-y-3">
              {payslips.map(p => (
                <div
                  key={p._id}
                  className="flex items-center justify-between
                             bg-white rounded-xl p-4 border
                             hover:shadow transition"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{p.month}</p>
                    <p className="text-xs text-gray-500">
                      Net Salary: ₹{p.netSalary}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <a
                      href={p.payslipFile}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                      title="View"
                    >
                      <Eye size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ================= INPUT COMPONENT ================= */
const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full rounded-xl border border-gray-200 px-4 py-2.5
                 focus:ring-2 focus:ring-red-300 focus:outline-none"
    />
  </div>
);

export default AddPayslip;
