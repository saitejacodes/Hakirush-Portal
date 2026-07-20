import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User, Calendar, Briefcase, Heart, Droplets,
  Fingerprint, CreditCard, PiggyBank, Camera, Check, X
} from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const PAGE_BG = "bg-gradient-to-br from-white via-red-50 to-pink-50";

const CHARCOAL = "#1A1A1D";
const GOLD = "#AD8A56";
const SLATE = "#7A756C";
const GARNET = "#722F37";
const HAIRLINE = "rgba(26,26,29,0.12)";
const GOLD_HAIRLINE = "rgba(173,138,86,0.4)";

const displayFont = { fontFamily: "'Cormorant Garamond', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

/* ================= CONFIRMATION DIALOG ================= */
const ConfirmDialog = ({ onClose }) => (
  <>
    <div className="fixed inset-0 z-50 bg-[#1A1A1D]/30 backdrop-blur-md" />
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div
        className="w-full max-w-sm overflow-hidden rounded-[1.25rem] border bg-white/95 text-center shadow-[0_40px_90px_-32px_rgba(26,26,29,0.4)] backdrop-blur-md"
        style={{ borderColor: HAIRLINE }}
      >
        <div className="px-10 pb-10 pt-12">
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
            style={{ borderColor: GOLD_HAIRLINE, color: GOLD }}
          >
            <Check size={26} strokeWidth={1.75} />
          </div>
          <h3 className="text-2xl leading-none" style={{ ...displayFont, fontWeight: 500, color: CHARCOAL }}>
            Record Updated
          </h3>
          <p className="mt-3 text-xs leading-relaxed" style={{ color: SLATE }}>
            Your profile has been saved and synchronized.
          </p>
          <button
            onClick={onClose}
            className="mt-8 w-full cursor-pointer rounded-full py-3.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white transition-colors"
            style={{ backgroundColor: CHARCOAL }}
          >
            Return to Profile
          </button>
        </div>
      </div>
    </div>
  </>
);

const EditEmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [name, setName] = useState("");
  const [experience, setExperience] = useState("");
  const [dob, setDob] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("/default-avatar.png");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [aadharcard, setAadharcard] = useState("");
  const [pancard, setPancard] = useState("");
  const [pfNumber, setPfNumber] = useState("");

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        const emp = res.data.employee;
        setEmployee(emp);
        setName(emp?.userId?.name || "");
        setExperience(emp?.experience || "");
        setDob(emp?.dob ? emp.dob.split("T")[0] : "");
        setBloodGroup(emp?.bloodGroup || "");
        setMaritalStatus(emp?.maritalStatus || "");
        setAadharcard(emp?.aadharcard || "");
        setPancard(emp?.pancard || "");
        setPfNumber(emp?.pfNumber || "");

        const profileImg = emp?.userId?.profileImage;
        if (profileImg) {
          setPreview(
            profileImg.startsWith("http")
              ? profileImg
              : `${import.meta.env.VITE_BACKEND_URL}/${profileImg}`
          );
        }
      } catch {
        console.error("Failed to load employee");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert("Image must be under 10MB");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("name", name);
      fd.append("experience", experience);
      fd.append("dob", dob);
      fd.append("bloodGroup", bloodGroup);
      fd.append("maritalStatus", maritalStatus);
      fd.append("aadharcard", aadharcard);
      fd.append("pancard", pancard);
      fd.append("pfNumber", pfNumber);
      if (image) fd.append("profileImage", image);

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/employee/update-profile/${id}`,
        fd,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setShowAlert(true);
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPulse />;

  return (
    <div className={`min-h-screen ${PAGE_BG} p-4 text-[#1A1A1D] lg:p-12`} style={bodyFont}>
      {showAlert && (
        <ConfirmDialog onClose={() => navigate(`/employee-dashboard/profile/${employee._id}`)} />
      )}

      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center justify-between px-2">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>Configuration</p>
            <h1 className="mt-2 text-4xl font-extrabold leading-none" style={{ ...displayFont, fontWeight: 500 }}>
              Edit <span className="italic" style={{ color: GARNET }}>My Record</span>
            </h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex cursor-pointer items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors"
            style={{ color: SLATE }}
          >
            <X size={14} strokeWidth={1.75} /> Discard
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div
            className="rounded-[1.25rem] border bg-white/80 shadow-[0_1px_2px_rgba(26,26,29,0.04),0_40px_90px_-32px_rgba(26,26,29,0.24)] backdrop-blur-md"
            style={{ borderColor: HAIRLINE }}
          >
            {/* ============ PORTRAIT + IDENTITY ============ */}
            <div className="flex flex-col items-center gap-6 px-8 pb-10 pt-12 text-center sm:px-14">
              <div className="relative">
                <div className="h-28 w-28 overflow-hidden rounded-full border" style={{ borderColor: GOLD_HAIRLINE }}>
                  <img src={preview} alt="preview" className="h-full w-full object-cover" />
                </div>
                <label
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white shadow-[0_8px_20px_-6px_rgba(26,26,29,0.6)]"
                  style={{ backgroundColor: CHARCOAL }}
                >
                  <Camera size={15} strokeWidth={1.75} />
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </label>
              </div>

              <div className="w-full max-w-sm">
                <FieldLabel icon={<User size={13} strokeWidth={1.5} />} label="Display Name" />
                <input
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  required
                  className="mt-2 w-full border-b bg-transparent pb-2 text-center text-lg outline-none transition-colors focus:border-current"
                  style={{ ...displayFont, fontWeight: 500, borderColor: HAIRLINE, color: CHARCOAL }}
                  onFocus={(e) => (e.target.style.borderColor = GOLD)}
                  onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
                />
              </div>

              <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: SLATE }}>
                {employee?.designation || "Executive Member"} &nbsp;·&nbsp; Employee ID{" "}
                <span style={{ color: CHARCOAL, fontWeight: 600 }}>{employee?.employeeId}</span>
              </p>
            </div>

            <GoldRule />

            {/* ============ REGISTRY FIELDS ============ */}
            <div className="grid grid-cols-1 gap-x-10 gap-y-8 px-8 py-10 sm:grid-cols-2 sm:px-14">
              <StaticField icon={<Fingerprint size={13} strokeWidth={1.5} />} label="Employee ID" value={employee?.employeeId} />
              <StaticField icon={<CreditCard size={13} strokeWidth={1.5} />} label="Department" value={employee?.department?.dep_name} />

              <EditField
                icon={<Calendar size={13} strokeWidth={1.5} />}
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
              <EditField
                icon={<Briefcase size={13} strokeWidth={1.5} />}
                label="Experience (Years)"
                type="number"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />

              <EditField
                icon={<CreditCard size={13} strokeWidth={1.5} />}
                label="Aadhar Card"
                value={aadharcard}
                onChange={(e) => setAadharcard(e.target.value)}
                placeholder="Aadhar number"
              />
              <EditField
                icon={<CreditCard size={13} strokeWidth={1.5} />}
                label="PAN Card"
                value={pancard}
                onChange={(e) => setPancard(e.target.value)}
                placeholder="PAN number"
              />
              <EditField
                icon={<PiggyBank size={13} strokeWidth={1.5} />}
                label="PF Number"
                value={pfNumber}
                onChange={(e) => setPfNumber(e.target.value)}
                placeholder="PF number"
              />

              <EditSelect
                icon={<Heart size={13} strokeWidth={1.5} />}
                label="Marital Status"
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                options={[
                  { label: "Single", value: "Single" },
                  { label: "Married", value: "Married" },
                  { label: "Divorced", value: "Divorced" },
                ]}
              />
              <EditSelect
                icon={<Droplets size={13} strokeWidth={1.5} />}
                label="Blood Group"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => ({ label: g, value: g }))}
              />
            </div>
          </div>

          {/* ============ ACTIONS ============ */}
          <button
            type="submit"
            disabled={saving}
            className="mt-6 w-full cursor-pointer rounded-full py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: CHARCOAL }}
          >
            {saving ? "Synchronizing…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ===== SUPPORTING COMPONENTS ===== */

const GoldRule = () => (
  <div className="px-8 sm:px-14">
    <div className="h-px" style={{ backgroundColor: GOLD_HAIRLINE }} />
  </div>
);

const FieldLabel = ({ icon, label }) => (
  <div className="flex items-center justify-center gap-2" style={{ color: GOLD }}>
    {icon}
    <span className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#7A756C" }}>{label}</span>
  </div>
);

const StaticField = ({ icon, label, value }) => (
  <div>
    <div className="flex items-center gap-2" style={{ color: GOLD }}>
      {icon}
      <span className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#7A756C" }}>{label}</span>
    </div>
    <p
      className="mt-2 truncate border-b pb-2 text-base"
      style={{ ...displayFont, fontWeight: 500, borderColor: HAIRLINE, color: SLATE }}
    >
      {value || "—"}
    </p>
  </div>
);

const EditField = ({ icon, label, ...props }) => (
  <div className="group">
    <div className="flex items-center gap-2" style={{ color: GOLD }}>
      {icon}
      <span className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#7A756C" }}>{label}</span>
    </div>
    <input
      {...props}
      className="mt-2 w-full border-b bg-transparent pb-2 text-base outline-none transition-colors"
      style={{ ...displayFont, fontWeight: 500, borderColor: HAIRLINE, color: "#1A1A1D" }}
      onFocus={(e) => (e.target.style.borderColor = GOLD)}
      onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
    />
  </div>
);

const EditSelect = ({ icon, label, options, ...props }) => (
  <div className="group">
    <div className="flex items-center gap-2" style={{ color: GOLD }}>
      {icon}
      <span className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#7A756C" }}>{label}</span>
    </div>
    <select
      {...props}
      className="mt-2 w-full cursor-pointer border-b bg-transparent pb-2 text-base outline-none transition-colors"
      style={{ ...displayFont, fontWeight: 500, borderColor: HAIRLINE, color: "#1A1A1D" }}
      onFocus={(e) => (e.target.style.borderColor = GOLD)}
      onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const LoadingPulse = () => (
  <div className={`flex min-h-screen flex-col items-center justify-center gap-4 ${PAGE_BG}`}>
    <div className="h-9 w-9 animate-spin rounded-full border border-[#1A1A1D]/10 border-t-[#AD8A56]"></div>
    <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-[#1A1A1D]/50">Opening Record</p>
  </div>
);

export default EditEmployeeProfile;