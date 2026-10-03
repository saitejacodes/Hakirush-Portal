import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import axios from "axios";
import { apiErrorMessage } from "../utils/apiError";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
} from "lucide-react";

// HAKIRUSH design tokens (matches the payslip / admin dashboard system)
const INK = "#1C1A17";
const PAPER = "#FBF8F3";
const GARNET = "#7A2233";
const GOLD = "#C6A15B";
const SAGE = "#3F6B52";
const RUST = "#A24A32";
const HAIRLINE = "#E7E1D3";
const MUTED = "#8A8478";

const strengthOf = (pw) => {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score += 25;
  if (/[A-Z]/.test(pw)) score += 25;
  if (/[0-9]/.test(pw)) score += 25;
  if (/[^A-Za-z0-9]/.test(pw)) score += 25;
  const labels = { 25: "Weak", 50: "Fair", 75: "Strong", 100: "Excellent" };
  return { score, label: labels[score] || "Weak" };
};

const strengthColor = (score) => {
  if (score <= 25) return RUST;
  if (score <= 50) return GOLD;
  if (score <= 75) return GOLD;
  return SAGE;
};

const Setting = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // The backend always targets the authenticated user; never send a userId.
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [reauthRequired, setReauthRequired] = useState(false);

  const strength = useMemo(() => strengthOf(form.newPassword), [form.newPassword]);
  const mismatch =
    form.confirmPassword.length > 0 && form.newPassword !== form.confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.oldPassword || !form.newPassword) {
      return setError("Enter your current and new password.");
    }
    if (form.newPassword !== form.confirmPassword) {
      return setError("New password and confirmation don't match.");
    }
    if (form.newPassword.length < 8) {
      return setError("New password must be at least 8 characters.");
    }
    if (loading) return;
    try {
      setLoading(true);
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/setting/change-password`,
        { oldPassword: form.oldPassword, newPassword: form.newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.data.success) {
        setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        // Password change revokes every session (tokenVersion bump):
        // sign out now and tell the user on the login page.
        if (res.data.reauthRequired) {
          setReauthRequired(true);
          logout("Password changed. Please sign in again with your new password.");
          navigate("/login", { replace: true });
          return;
        }
        setDone(true);
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't update your password. Try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] font-sans text-[#1C1A17] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto">

        <div className="rounded-3xl overflow-hidden bg-white border" style={{ borderColor: HAIRLINE }}>
          {/* Letterhead */}
          <div style={{ backgroundColor: GARNET }} className="relative px-8 pt-8 pb-9">
            <div className="h-[3px] absolute top-0 left-0 right-0" style={{ backgroundColor: GOLD }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2" style={{ color: GOLD }}>
              Account security
            </p>
            <h1
              className="text-2xl font-black tracking-tight"
              style={{ color: PAPER, fontFamily: "'Playfair Display', serif" }}
            >
              Update your password
            </h1>
          </div>

          <div className="px-8 py-8">
            {done ? (
              <div className="text-center py-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ backgroundColor: "#EEF3EF", color: SAGE }}
                >
                  <CheckCircle2 size={28} />
                </div>
                <h2 className="text-lg font-black tracking-tight mb-1.5">Password updated</h2>
                <p className="text-[13px] mb-7" style={{ color: MUTED }}>
                  {reauthRequired
                    ? "Your password was changed and all sessions were signed out. Sign in again with your new password."
                    : "Use your new password the next time you sign in."}
                </p>
                <button
                  onClick={() => {
                    if (reauthRequired) {
                      logout();
                      navigate("/login", { replace: true });
                    } else {
                      navigate(-1);
                    }
                  }}
                  className="w-full py-4 rounded-xl font-bold text-[12px] uppercase tracking-widest transition-colors"
                  style={{ backgroundColor: INK, color: PAPER }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GOLD)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = INK)}
                >
                  {reauthRequired ? "Sign in again" : "Done"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div
                    className="flex items-start gap-2.5 py-3 px-4 rounded-xl border"
                    style={{ backgroundColor: "#FBF2EE", borderColor: "rgba(162,74,50,0.25)" }}
                  >
                    <p className="text-[12px] font-semibold" style={{ color: RUST }}>
                      {error}
                    </p>
                  </div>
                )}

                <Field
                  step={1}
                  label="Current password"
                  name="oldPassword"
                  value={form.oldPassword}
                  show={show.old}
                  onChange={handleChange}
                  toggle={() => setShow((s) => ({ ...s, old: !s.old }))}
                  icon={<KeyRound size={16} />}
                />

                <div className="pt-1 border-t" style={{ borderColor: HAIRLINE }}>
                  <div className="pt-5">
                    <Field
                      step={2}
                      label="New password"
                      name="newPassword"
                      value={form.newPassword}
                      show={show.new}
                      onChange={handleChange}
                      toggle={() => setShow((s) => ({ ...s, new: !s.new }))}
                      icon={<Lock size={16} />}
                    />
                  </div>

                  {form.newPassword && (
                    <div className="mt-3 pl-9">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold" style={{ color: MUTED }}>
                          Password strength
                        </span>
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: strengthColor(strength.score) }}
                        >
                          {strength.label}
                        </span>
                      </div>
                      <div className="h-1 w-full rounded-full flex gap-1" style={{ backgroundColor: HAIRLINE }}>
                        {[25, 50, 75, 100].map((step) => (
                          <div
                            key={step}
                            className="h-full flex-1 rounded-full transition-colors duration-300"
                            style={{
                              backgroundColor:
                                strength.score >= step ? strengthColor(strength.score) : "transparent",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Field
                  step={3}
                  label="Confirm new password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  show={show.confirm}
                  onChange={handleChange}
                  toggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                  icon={<ShieldCheck size={16} />}
                  invalid={mismatch}
                  hint={mismatch ? "Doesn't match your new password" : ""}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-[12px] uppercase tracking-widest transition-colors disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: INK, color: PAPER }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = GOLD)}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = INK)}
                >
                  {loading && (
                    <span
                      className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                      style={{ borderColor: "rgba(251,248,243,0.35)", borderTopColor: PAPER }}
                    />
                  )}
                  {loading ? "Updating…" : "Update password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ step, label, name, value, show, onChange, toggle, icon, invalid, hint }) => (
  <div>
    <div className="flex items-center gap-2.5 mb-2">
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
        style={{ backgroundColor: INK, color: GOLD }}
      >
        {step}
      </span>
      <label className="text-[12px] font-bold" style={{ color: INK }}>
        {label}
      </label>
    </div>
    <div className="relative pl-9">
      <div
        className="absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: MUTED }}
      >
        {icon}
      </div>
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={name === "oldPassword" ? "current-password" : "new-password"}
        className="w-full rounded-xl py-3.5 pl-10 pr-11 text-[13px] font-semibold outline-none border transition-colors placeholder:text-[#C9C2AE]"
        style={{
          backgroundColor: "#FBF8F3",
          borderColor: invalid ? RUST : HAIRLINE,
          color: INK,
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = invalid ? RUST : GOLD)}
        onBlur={(e) => (e.currentTarget.style.borderColor = invalid ? RUST : HAIRLINE)}
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
        style={{ color: MUTED }}
        aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
    {hint && (
      <p className="text-[11px] font-semibold mt-1.5 pl-9" style={{ color: RUST }}>
        {hint}
      </p>
    )}
  </div>
);

export default Setting;
