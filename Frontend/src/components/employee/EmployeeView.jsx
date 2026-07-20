import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar, ChevronLeft, Fingerprint, Mail,
  Droplets, Briefcase, IdCard, CreditCard,
  PiggyBank, Heart, User, Edit
} from "lucide-react";

const PAGE_BG = "bg-gradient-to-br from-white via-red-50 to-pink-100";

const CHARCOAL = "#1A1A1D";
const GOLD = "#AD8A56";
const IVORY = "#F6F2EA";
const SLATE = "#7A756C";
const HAIRLINE = "rgba(26,26,29,0.10)";
const GOLD_HAIRLINE = "rgba(173,138,86,0.35)";

const displayFont = { fontFamily: "'Cormorant Garamond', 'Georgia', serif" };
const bodyFont = { fontFamily: "'Inter', 'Helvetica Neue', sans-serif" };

const EmployeeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.data?.success) setEmployee(res.data.employee);
      } catch {
        console.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${import.meta.env.VITE_BACKEND_URL}/${imagePath.replace(/^\/+/, "")}`;
  };

  const initials = React.useMemo(() => {
    const name = employee?.userId?.name || "";
    return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  }, [employee]);

  if (loading) return <LoadingPulse />;
  if (!employee) return <ErrorView />;

  return (
    <div className={`relative min-h-screen ${PAGE_BG} p-4 text-[#1A1A1D] lg:p-10`} style={bodyFont}>
      <div className="relative z-10 mx-auto max-w-3xl">

        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex cursor-pointer items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors hover:text-[#1A1A1D]"
          style={{ color: SLATE }}
        >
          <ChevronLeft size={14} strokeWidth={1.75} /> Back
        </button>

        <div
          className="rounded-[1.25rem] border bg-white/80 shadow-[0_1px_2px_rgba(26,26,29,0.04),0_40px_90px_-32px_rgba(26,26,29,0.28)] backdrop-blur-md"
          style={{ borderColor: HAIRLINE }}
        >
          {/* ============ NAMEPLATE ============ */}
          <div className="flex flex-col items-center px-8 pb-10 pt-12 text-center sm:px-14">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full border"
              style={{ borderColor: GOLD_HAIRLINE, color: GOLD }}
            >
              {employee?.userId?.profileImage ? (
                <img
                  src={getImageUrl(employee.userId.profileImage)}
                  className="h-full w-full rounded-full object-cover"
                  alt="Profile"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : (
                <span className="text-lg" style={{ ...displayFont, fontWeight: 500 }}>{initials}</span>
              )}
            </div>

            <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
              HAKIRUSH · Member Since {new Date(employee.dateOfJoining).getFullYear()}
            </p>
            <h1 className="mt-3 text-4xl leading-none sm:text-5xl" style={{ ...displayFont, fontWeight: 500 }}>
              {employee?.userId?.name}
            </h1>
            <p className="mt-3 text-xs uppercase tracking-[0.18em]" style={{ color: SLATE }}>
              {employee?.designation || "Executive Member"} &nbsp;·&nbsp; {employee?.department?.dep_name}
            </p>
          </div>

          <GoldRule />

          {/* ============ DOSSIER ============ */}
          <div className="grid grid-cols-1 gap-x-10 gap-y-8 px-8 py-10 sm:grid-cols-2 sm:px-14">
            <Field icon={<Fingerprint size={14} strokeWidth={1.5} />} label="Employee ID" value={employee.employeeId} />
            <Field icon={<Mail size={14} strokeWidth={1.5} />} label="Email Address" value={employee.userId?.email} />
            <Field
              icon={<Calendar size={14} strokeWidth={1.5} />}
              label="Date of Birth"
              value={new Date(employee.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            />
            <Field icon={<User size={14} strokeWidth={1.5} />} label="Gender" value={employee.gender} />
            <Field icon={<Heart size={14} strokeWidth={1.5} />} label="Marital Status" value={employee.maritalStatus} />
            <Field icon={<Droplets size={14} strokeWidth={1.5} />} label="Blood Group" value={employee.bloodGroup} />
            <Field icon={<Briefcase size={14} strokeWidth={1.5} />} label="Experience" value={`${employee.experience} Years`} />
            <Field
              icon={<Calendar size={14} strokeWidth={1.5} />}
              label="Official Join Date"
              value={new Date(employee.dateOfJoining).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            />
            <Field icon={<IdCard size={14} strokeWidth={1.5} />} label="Aadhar Card" value={employee.aadharcard} />
            <Field icon={<CreditCard size={14} strokeWidth={1.5} />} label="PAN Card" value={employee.pancard} />
            <Field icon={<PiggyBank size={14} strokeWidth={1.5} />} label="PF Number" value={employee.pfNumber} />
          </div>

          <GoldRule />

          {/* ============ COMPENSATION ============ */}
          <div className="flex flex-col items-center justify-between gap-6 px-8 py-10 sm:flex-row sm:px-14">
            <div className="text-center sm:text-left">
              <p className="text-[9px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
                Annual Compensation
              </p>
              <h2 className="mt-2 text-3xl leading-none" style={{ ...displayFont, fontWeight: 500 }}>
                ₹{Number(employee.salary || 0).toLocaleString('en-IN')}
              </h2>
            </div>
            <button
              onClick={() => navigate(`/admin-dashboard/employees/edit/${employee._id}`)}
              className="flex cursor-pointer items-center gap-2 rounded-full border px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors hover:text-white"
              style={{ borderColor: CHARCOAL, color: CHARCOAL }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = CHARCOAL)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Edit size={13} strokeWidth={1.75} /> Edit Profile
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-[9px] uppercase tracking-[0.28em]" style={{ color: SLATE }}>
          Verified &nbsp;·&nbsp; Active &nbsp;·&nbsp; On-Site
        </p>
      </div>
    </div>
  );
};

// --- SUPPORTING COMPONENTS ---

const GoldRule = () => (
  <div className="px-8 sm:px-14">
    <div className="h-px" style={{ backgroundColor: GOLD_HAIRLINE }} />
  </div>
);

const Field = ({ icon, label, value }) => (
  <div>
    <div className="flex items-center gap-2" style={{ color: GOLD }}>
      {icon}
      <span className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#7A756C" }}>{label}</span>
    </div>
    <p className="mt-1.5 truncate text-base" style={{ ...displayFont, fontWeight: 500 }}>
      {value || "—"}
    </p>
  </div>
);

const LoadingPulse = () => (
  <div className={`flex min-h-screen flex-col items-center justify-center gap-4 ${PAGE_BG}`}>
    <div className="h-9 w-9 animate-spin rounded-full border border-[#1A1A1D]/10 border-t-[#AD8A56]"></div>
    <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-[#1A1A1D]/50">Preparing Dossier</p>
  </div>
);

const ErrorView = () => (
  <div className={`flex min-h-screen items-center justify-center p-6 text-center ${PAGE_BG}`}>
    <div className="rounded-[1.25rem] border border-[#1A1A1D]/10 bg-white/85 px-12 py-14 shadow-[0_40px_90px_-32px_rgba(26,26,29,0.28)] backdrop-blur-md">
      <h2 className="text-3xl leading-none" style={{ ...displayFont, fontWeight: 500 }}>
        Not Found
      </h2>
      <button
        onClick={() => window.history.back()}
        className="mt-6 cursor-pointer rounded-full px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white"
        style={{ backgroundColor: "#1A1A1D" }}
      >
        Go Back
      </button>
    </div>
  </div>
);

export default EmployeeView;