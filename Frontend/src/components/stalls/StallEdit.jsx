import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/* ================= IMAGE HELPER ================= */
const getImageUrl = (url) => {
  if (!url) return "/default-avatar.png";
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("http")) return `${url}?t=${Date.now()}`;
  return "/default-avatar.png";
};

const StallEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    number: "",
    type: "",
    eventCount: 0,
    plans: [""],
  });

  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ================= FETCH STALL ================= */
  useEffect(() => {
    fetchStall();
    // eslint-disable-next-line
  }, [id]);

  const fetchStall = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/stalls/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success && res.data.stall) {
        const s = res.data.stall;
        setForm({
          name: s.name || "",
          number: s.number || "",
          type: s.type || "",
          eventCount: s.eventCount || 0,
          plans: s.plans && s.plans.length ? s.plans : [""],
        });
        setPreview(s.logo || null);
      } else {
        setError("Stall not found");
      }
    } catch {
      setError("Failed to load stall");
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "logo") {
      const file = files?.[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        alert("Image must be less than 10MB");
        e.target.value = "";
        return;
      }

      setLogo(file);
      setPreview(URL.createObjectURL(file));
      e.target.value = "";
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: name === "eventCount" ? Number(value) : value,
    }));
  };

  /* ================= PLANS ================= */
  const handlePlanChange = (idx, value) => {
    const plans = [...form.plans];
    plans[idx] = value;
    setForm((p) => ({ ...p, plans }));
  };

  const addPlan = () =>
    setForm((p) => ({ ...p, plans: [...p.plans, ""] }));

  const removePlan = (idx) =>
    setForm((p) => ({
      ...p,
      plans: p.plans.filter((_, i) => i !== idx),
    }));

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === "plans") {
          form.plans.forEach((p) => fd.append("plans", p));
        } else {
          fd.append(key, form[key]);
        }
      });
      if (logo) fd.append("logo", logo);

      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/stalls/${id}`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        alert("Stall updated successfully 🎉");
        navigate("/admin-dashboard/stalls");
      } else {
        setError(res.data.message || "Failed to update stall");
      }
    } catch {
      setError("Failed to update stall");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !preview) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Loading…
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-red-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">

        <h2 className="text-3xl font-bold text-center text-red-700 mb-6">
          Edit Stall
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* IMAGE */}
          <div className="flex flex-col items-center gap-3">
            <img
              src={getImageUrl(preview)}
              alt="logo"
              onError={(e) => (e.target.src = "/default-avatar.png")}
              className="w-28 h-28 rounded-full object-cover border"
            />

            <label className="cursor-pointer text-red-600 font-semibold">
              Change Logo
              <input
                ref={fileInputRef}
                type="file"
                name="logo"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
              />
            </label>
          </div>

          {/* FORM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              className="input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Stall Name"
              required
            />

            <input
              className="input"
              name="number"
              value={form.number}
              onChange={handleChange}
              placeholder="Stall Number"
              required
            />

            <input
              className="input"
              name="type"
              value={form.type}
              onChange={handleChange}
              placeholder="Type"
              required
            />

            <input
              type="number"
              className="input"
              name="eventCount"
              value={form.eventCount}
              onChange={handleChange}
              placeholder="Events Placed"
            />
          </div>

          {/* PLANS */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Plans
            </label>

            {form.plans.map((plan, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  value={plan}
                  onChange={(e) => handlePlanChange(idx, e.target.value)}
                  className="input flex-1"
                  placeholder={`Plan ${idx + 1}`}
                />

                {form.plans.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePlan(idx)}
                    className="text-red-600 font-semibold"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addPlan}
              className="text-red-600 font-semibold mt-2"
            >
              + Add Plan
            </button>
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold
              ${
                loading
                  ? "bg-red-300"
                  : "bg-red-600 hover:bg-red-700"
              }`}
          >
            {loading ? "Updating..." : "Update Stall"}
          </button>

          {error && (
            <p className="text-center text-red-600 font-semibold">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default StallEdit;