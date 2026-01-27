
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const StallEdit = () => {
  const { id } = useParams();
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

  useEffect(() => {
    const fetchStall = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/stalls/${id}`);
        if (res.data.success && res.data.stall) {
          setForm({
            name: res.data.stall.name || "",
            number: res.data.stall.number || "",
            type: res.data.stall.type || "",
            eventCount: res.data.stall.eventCount || 0,
            plans: res.data.stall.plans && res.data.stall.plans.length > 0 ? res.data.stall.plans : [""],
            logo: null,
          });
          setPreview(res.data.stall.logo || null);
        } else {
          setError("Stall not found");
        }
      } catch {
        setError("Failed to fetch stall");
      } finally {
        setLoading(false);
      }
    };
    fetchStall();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo" && files && files[0]) {
      setForm((prev) => ({ ...prev, logo: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: name === "eventCount" ? Number(value) : value }));
    }
  };

  const handlePlanChange = (idx, value) => {
    const newPlans = [...form.plans];
    newPlans[idx] = value;
    setForm((prev) => ({ ...prev, plans: newPlans }));
  };

  const addPlan = () => setForm((prev) => ({ ...prev, plans: [...prev.plans, ""] }));
  const removePlan = (idx) => setForm((prev) => ({ ...prev, plans: prev.plans.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === "plans") {
          form.plans.forEach((plan) => formData.append("plans", plan));
        } else if (form[key] !== undefined && form[key] !== "") {
          formData.append(key, form[key]);
        }
      });
      const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/stalls/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        navigate("/admin-dashboard/stalls");
      } else {
        setError(res.data.message || "Failed to update stall");
      }
    } catch (err) {
      setError("Failed to update stall");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-red-600 font-semibold">Loading...</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-red-100 p-6 flex items-center justify-center">
      <div className="max-w-4xl mx-auto w-full">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h3 className="text-4xl font-extrabold text-red-700">Edit Stall</h3>
          <p className="text-red-500 mt-2">Update stall details</p>
        </div>
        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-red-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* LOGO */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-red-200 shadow">
                <img
                  src={preview || "/default-avatar.png"}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                />
              </div>
              <label className="cursor-pointer text-red-600 font-semibold">
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
            {/* FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input
                name="name"
                placeholder="Stall Name"
                required
                value={form.name}
                onChange={handleChange}
                className="input"
              />
              <input
                name="number"
                placeholder="Stall Number"
                required
                value={form.number}
                onChange={handleChange}
                className="input"
              />
              <input
                name="type"
                placeholder="Type"
                required
                value={form.type}
                onChange={handleChange}
                className="input"
              />
              <input
                type="number"
                name="eventCount"
                placeholder="Events Placed"
                min="0"
                value={form.eventCount}
                onChange={handleChange}
                className="input"
              />
            </div>
            {/* PLANS */}
            <div className="mb-4">
              <label className="block font-semibold mb-1">Plans</label>
              {form.plans.map((plan, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    value={plan}
                    onChange={(e) => handlePlanChange(idx, e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder={`Plan ${idx + 1}`}
                  />
                  {form.plans.length > 1 && (
                    <button type="button" onClick={() => removePlan(idx)} className="text-red-500">Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addPlan} className="text-blue-600 mt-1">+ Add Plan</button>
            </div>
            {/* SUBMIT */}
            <div className="text-center">
              <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 transition text-white px-10 py-3 rounded-2xl shadow-lg font-semibold">
                {loading ? "Updating..." : "Update Stall"}
              </button>
              {error && <div className="mt-4 text-red-600">{error}</div>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StallEdit;
