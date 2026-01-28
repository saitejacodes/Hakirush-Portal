import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const SponsorAdd = () => {
  const [formData, setFormData] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
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

      setFormData((p) => ({ ...p, logo: file }));
      setPreview(URL.createObjectURL(file));
      return;
    }

    setFormData((p) => ({
      ...p,
      [name]: name === "eventsSponsored" ? Number(value) : value,
    }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.collaboration) {
      alert("Please fill all required fields");
      setLoading(false);
      return;
    }

    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== undefined && formData[key] !== "") {
        fd.append(key, formData[key]);
      }
    });

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/sponsors/add`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data?.success) {
        alert("Sponsor Added Successfully 🎉");
        navigate("/admin-dashboard/sponsors");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Failed to add sponsor");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white/95 p-10 rounded-3xl shadow-2xl border border-red-100">

        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-red-700 mb-8 drop-shadow-sm">
          Add New Sponsor
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
              Upload Sponsor Logo
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
              placeholder="Sponsor Name"
              required
              onChange={handleChange}
              className="input bg-white/80"
            />

            <select
              name="collaboration"
              required
              onChange={handleChange}
              className="input bg-white/80"
            >
              <option value="">Collaboration Type</option>
              <option>Title Sponsor</option>
              <option>Associate Sponsor</option>
              <option>Event Sponsor</option>
              <option>Media Partner</option>
            </select>

            <input
              type="number"
              name="eventsSponsored"
              placeholder="Events Sponsored"
              min="0"
              onChange={handleChange}
              className="input bg-white/80"
            />

            <input
              name="reach"
              placeholder="Reach (eg: 2M impressions)"
              onChange={handleChange}
              className="input bg-white/80"
            />

            <input
              name="upcomingEvents"
              placeholder="Upcoming Events"
              onChange={handleChange}
              className="input bg-white/80"
            />
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
            {loading ? "Creating..." : "Create Sponsor"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default SponsorAdd;