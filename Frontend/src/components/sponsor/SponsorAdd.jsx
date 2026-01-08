import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SponsorAdd = () => {
  const [formData, setFormData] = useState({});
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "logo" && files && files[0]) {
      setFormData((prev) => ({ ...prev, logo: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "eventsSponsored" ? Number(value) : value,
      }));
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.collaboration) {
      alert("Please fill all required fields");
      return;
    }

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== undefined && formData[key] !== "") {
        form.append(key, formData[key]);
      }
    });

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/sponsors/add`,
        form,
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
      console.error("ADD SPONSOR ERROR:", error.response?.data || error);
      alert(error.response?.data?.error || "Failed to add sponsor");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h3 className="text-4xl font-extrabold text-red-700">
            Add New Sponsor
          </h3>
          <p className="text-red-500 mt-2">
            Enter sponsor and collaboration details
          </p>
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

            {/* FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              <input
                name="name"
                placeholder="Sponsor Name"
                required
                onChange={handleChange}
                className="input"
              />

              <select
                name="collaboration"
                required
                onChange={handleChange}
                className="input"
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
                className="input"
              />

              <input
                name="reach"
                placeholder="Reach (eg: 2M impressions)"
                onChange={handleChange}
                className="input"
              />

              <input
                name="upcomingEvents"
                placeholder="Upcoming Events"
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* SUBMIT */}
            <div className="text-center">
              <button className="bg-red-600 hover:bg-red-700 transition text-white px-10 py-3 rounded-2xl shadow-lg font-semibold">
                Create Sponsor
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default SponsorAdd;