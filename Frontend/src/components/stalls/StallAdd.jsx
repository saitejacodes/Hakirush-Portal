import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const StallAdd = () => {
  const [form, setForm] = useState({
    name: "",
    number: "",
    type: "",
    eventCount: 0,
    plans: [""],
    logo: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

      setForm((p) => ({ ...p, logo: file }));
      setPreview(URL.createObjectURL(file));
      return;
    }

    setForm((p) => ({
      ...p,
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
        } else if (form[key] !== undefined && form[key] !== "") {
          fd.append(key, form[key]);
        }
      });

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/stalls`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        alert("Stall Added Successfully 🎉");
        navigate("/admin-dashboard/stalls");
      } else {
        setError(res.data.message || "Failed to add stall");
      }
    } catch {
      setError("Failed to add stall");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white/95 p-10 rounded-3xl shadow-2xl border border-red-100">

        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-red-700 mb-8 drop-shadow-sm">
          Add New Stall
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* IMAGE */}
          <div className="flex flex-col items-center gap-4">
            <img
              src={preview || "/default-avatar.png"}
              alt="logo"
              className="w-28 h-28 rounded-full object-cover border-4 border-red-200 shadow"
              onError={(e) => (e.target.src = "/default-avatar.png")}
            />

            <label className="text-red-600 font-semibold cursor-pointer hover:underline">
              Upload Stall Logo
              <input
                type="file"
                name="logo"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
              />
            </label>
          </div>

          {/* FORM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <input
              name="name"
              placeholder="Stall Name"
              required
              onChange={handleChange}
              className="input bg-white/80"
            />

            <input
              name="number"
              placeholder="Stall Number"
              required
              onChange={handleChange}
              className="input bg-white/80"
            />

            <input
              name="type"
              placeholder="Type"
              required
              onChange={handleChange}
              className="input bg-white/80"
            />

            <input
              type="number"
              name="eventCount"
              placeholder="Events Placed"
              min="0"
              onChange={handleChange}
              className="input bg-white/80"
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
                  className="input bg-white/80 flex-1"
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
            className={`w-full py-3 rounded-xl text-white font-semibold text-lg shadow
              transition-all duration-200
              ${
                loading
                  ? "bg-red-300"
                  : "bg-gradient-to-br from-red-600 to-red-500 hover:scale-105 hover:bg-red-700"
              }`}
          >
            {loading ? "Creating..." : "Create Stall"}
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

export default StallAdd;