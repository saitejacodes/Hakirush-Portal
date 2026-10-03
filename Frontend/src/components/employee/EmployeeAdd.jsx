import React, { useEffect, useState } from "react";
import axios from "axios";
import { fetchDepartments } from "../../utils/EmployeeHelper";
import { apiErrorMessage } from "../../utils/apiError";
import { useNavigate } from "react-router-dom";
import { UserPlus, Camera, Check } from "lucide-react";

const PAGE_BG = "bg-gradient-to-br from-white via-red-50 to-pink-100";

const CHARCOAL = "#1A1A1D";
const GOLD = "#AD8A56";
const SLATE = "#7A756C";
const GARNET = "#722F37";
const HAIRLINE = "rgba(26,26,29,0.12)";
const GOLD_HAIRLINE = "rgba(173,138,86,0.4)";

const displayFont = { fontFamily: "'Cormorant Garamond', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

const MAX_FILE_SIZE = 5 * 1024 * 1024; // matches server limit (5MB)

/* ================= CONFIRMATION DIALOG ================= */
const SuccessAlert = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-[#1A1A1D]/30 backdrop-blur-md" />
    <div
      className="relative w-full max-w-sm rounded-[1.25rem] border bg-white/95 p-10 text-center shadow-[0_40px_90px_-32px_rgba(26,26,29,0.4)] backdrop-blur-md"
      style={{ borderColor: HAIRLINE, ...bodyFont }}
    >
      <div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
        style={{ borderColor: GOLD_HAIRLINE, color: GOLD }}
      >
        <Check size={26} strokeWidth={1.75} />
      </div>
      <h3 className="text-2xl leading-none" style={{ ...displayFont, fontWeight: 500, color: CHARCOAL }}>
        Onboarded
      </h3>
      <p className="mt-3 text-xs leading-relaxed" style={{ color: SLATE }}>
        An onboarding email has been sent to their address to set up a secure password.
      </p>
      <button
        onClick={onClose}
        className="mt-8 w-full cursor-pointer rounded-full py-3.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white transition-colors"
        style={{ backgroundColor: CHARCOAL }}
      >
        Back to Directory
      </button>
    </div>
  </div>
);

const Add = () => {
  const [departments, setDepartments] = useState([]);
  const [loadingDept, setLoadingDept] = useState(false);
  const [formData, setFormData] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDept(true);
        const data = await fetchDepartments();
        setDepartments(Array.isArray(data) ? data : []);
      } catch (error) { console.error(error); }
      finally { setLoadingDept(false); }
    };
    loadDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage") {
      const file = files[0];
      if (!file || file.size > MAX_FILE_SIZE) return;
      setFormData((p) => ({ ...p, profileImage: file }));
      setPreview(URL.createObjectURL(file));
      return;
    }
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const fd = new FormData();
    // `manager` is never sent: a manager is a Department assignment
    // (Departments -> Edit), not an employee field.
    Object.keys(formData)
      .filter((key) => key !== "manager")
      .forEach((key) => fd.append(key, formData[key]));
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/employee/add`, fd, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        setShowAlert(true);
        setTimeout(() => navigate("/admin-dashboard/employees"), 1800);
      }
    } catch (error) { alert(apiErrorMessage(error, "Submission error")); }
    finally { setLoading(false); }
  };

  return (
    <div className={`relative min-h-screen ${PAGE_BG} p-4 text-[#1A1A1D] lg:p-10`} style={bodyFont}>
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}

      <div className="relative z-10 mx-auto max-w-5xl">
        <div
          className="overflow-hidden rounded-[1.25rem] border bg-white/80 shadow-[0_1px_2px_rgba(26,26,29,0.04),0_40px_90px_-32px_rgba(26,26,29,0.24)] backdrop-blur-md"
          style={{ borderColor: HAIRLINE }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* ============ PORTRAIT SIDEBAR ============ */}
            <div
              className="flex flex-col items-center justify-center border-b p-10 text-center lg:col-span-4 lg:border-b-0 lg:border-r"
              style={{ borderColor: HAIRLINE }}
            >
              <div className="relative mb-6">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border" style={{ borderColor: GOLD_HAIRLINE }}>
                  <img src={preview || "/default-avatar.png"} alt="preview" className="h-full w-full object-cover" />
                </div>
                <label
                  className="absolute -bottom-1 -right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white shadow-[0_8px_20px_-6px_rgba(26,26,29,0.6)]"
                  style={{ backgroundColor: CHARCOAL }}
                >
                  <Camera size={16} strokeWidth={1.75} />
                  <input type="file" name="profileImage" accept="image/*" className="hidden" onChange={handleChange} />
                </label>
              </div>
              <h2
                className="mt-3 text-4xl leading-none tracking-tight text-[#1C1A17]"
                style={{ ...displayFont, fontWeight: 700 }}
              >
                New <span className="italic" style={{ color: GARNET }}>Employee</span>
              </h2>
              <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.28em]" style={{ color: GOLD }}>
                Initialize Registry Entry
              </p>
            </div>

            {/* ============ FORM AREA ============ */}
            <div className="p-8 lg:col-span-8 lg:p-12">
              <form onSubmit={handleSubmit} className="space-y-10">

                {/* PRIMARY IDENTIFICATION */}
                <section>
                  <SectionHeading icon={<UserPlus size={13} strokeWidth={1.5} />} label="Primary Identification" />
                  <div className="grid grid-cols-1 gap-x-8 gap-y-7 md:grid-cols-2">
                    <EditField label="Full Name" name="name" placeholder="Full name" required onChange={handleChange} />
                    <EditField label="Email Address" name="email" type="email" placeholder="email address" required onChange={handleChange} />
                    <EditField label="Identity No." name="employeeId" placeholder="Identity no." required onChange={handleChange} />
                    <EditField label="Aadhar Card" name="aadharcard" placeholder="Aadhar number" onChange={handleChange} />
                    <EditField label="PAN Card" name="pancard" placeholder="PAN number" onChange={handleChange} />
                    <EditField label="PF Number" name="pfNumber" placeholder="PF number" onChange={handleChange} />
                    <EditField label="Date of Birth" name="dob" type="date" required onChange={handleChange} />
                    <EditSelect
                      label="Gender"
                      name="gender"
                      required
                      onChange={handleChange}
                      options={[{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Other", value: "Other" }]}
                    />
                    <EditSelect
                      label="Marital Status"
                      name="maritalStatus"
                      required
                      onChange={handleChange}
                      options={["Single", "Married", "Divorced", "Widowed"].map((v) => ({ label: v, value: v }))}
                    />
                  </div>
                </section>

                <GoldRule />

                {/* WORK DETAILS */}
                <section>
                  <SectionHeading label="Work Details" muted />
                  <div className="grid grid-cols-2 gap-x-8 gap-y-7 md:grid-cols-3">
                    <EditSelect
                      label="Department"
                      name="department"
                      required
                      onChange={handleChange}
                      options={departments.map((d) => ({ label: d.dep_name, value: d._id }))}
                      placeholder={loadingDept ? "Syncing…" : "Select"}
                    />
                    <EditSelect
                      label="System Role"
                      name="role"
                      required
                      onChange={handleChange}
                      options={[{ label: "Admin", value: "admin" }, { label: "Employee", value: "employee" }]}
                    />
                    <EditField label="Designation" name="designation" placeholder="Designation" required onChange={handleChange} />
                    <EditField label="Experience (Yrs)" name="experience" type="number" placeholder="Years" required onChange={handleChange} />
                    <EditField label="Annual Salary" name="salary" type="number" placeholder="Salary" required onChange={handleChange} />
                    <EditSelect
                      label="Blood Group"
                      name="bloodGroup"
                      required
                      onChange={handleChange}
                      options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => ({ label: g, value: g }))}
                    />
                  </div>
                </section>

                {/* ACTIONS */}
                <div className="flex items-center gap-6 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="cursor-pointer text-[10px] font-medium uppercase tracking-[0.2em] transition-colors"
                    style={{ color: SLATE }}
                  >
                    Discard
                  </button>
                  <button
                    disabled={loading}
                    className="flex-1 cursor-pointer rounded-full py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: CHARCOAL }}
                  >
                    {loading ? "Initializing…" : "Complete Onboarding"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== SUPPORTING COMPONENTS ===== */

const GoldRule = () => <div className="h-px" style={{ backgroundColor: GOLD_HAIRLINE }} />;

const SectionHeading = ({ icon, label, muted }) => (
  <h3
    className="mb-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em]"
    style={{ color: muted ? SLATE : GOLD }}
  >
    {icon}
    {label}
  </h3>
);

const FieldLabel = ({ label }) => (
  <span className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: SLATE }}>{label}</span>
);

const EditField = ({ label, ...props }) => (
  <div>
    <FieldLabel label={label} />
    <input
      {...props}
      className="mt-2 w-full border-b bg-transparent pb-2 text-base outline-none transition-colors"
      style={{ ...displayFont, fontWeight: 500, borderColor: HAIRLINE, color: CHARCOAL }}
      onFocus={(e) => (e.target.style.borderColor = GOLD)}
      onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
    />
  </div>
);

const EditSelect = ({ label, options, placeholder = "Select", ...props }) => (
  <div>
    <FieldLabel label={label} />
    <select
      {...props}
      className="mt-2 w-full cursor-pointer border-b bg-transparent pb-2 text-base outline-none transition-colors"
      style={{ ...displayFont, fontWeight: 500, borderColor: HAIRLINE, color: CHARCOAL }}
      onFocus={(e) => (e.target.style.borderColor = GOLD)}
      onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export default Add;