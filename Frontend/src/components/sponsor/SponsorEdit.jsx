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

const SponsorEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [sponsor, setSponsor] = useState({
    name: "",
    collaboration: "",
    eventsSponsored: "",
    reach: "",
    upcomingEvents: "",
  });

  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH SPONSOR ================= */
  useEffect(() => {
    fetchSponsor();
    // eslint-disable-next-line
  }, [id]);

  const fetchSponsor = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/sponsors/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        const s = res.data.sponsor;
        setSponsor({
          name: s.name || "",
          collaboration: s.collaboration || "",
          eventsSponsored: s.eventsSponsored || "",
          reach: s.reach || "",
          upcomingEvents: s.upcomingEvents || "",
        });
        setPreview(s.logo || null);
      }
    } catch {
      alert("Failed to load sponsor");
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
        alert("Image size must be less than 10MB");
        e.target.value = "";
        return;
      }

      setLogo(file);
      setPreview(URL.createObjectURL(file));
      e.target.value = "";
      return;
    }

    setSponsor((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    Object.keys(sponsor).forEach((key) => {
      fd.append(key, sponsor[key]);
    });
    if (logo) {
      fd.append("logo", logo);
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/sponsors/${id}`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        alert("Sponsor updated successfully 🎉");
        navigate("/admin-dashboard/sponsors");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Update failed");
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
          Edit Sponsor
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
              value={sponsor.name}
              onChange={handleChange}
              placeholder="Sponsor Name"
              required
            />

            <select
              className="input"
              name="collaboration"
              value={sponsor.collaboration}
              onChange={handleChange}
            >
              <option value="">Collaboration Type</option>
              <option value="Title Sponsor">Title Sponsor</option>
              <option value="Associate Sponsor">Associate Sponsor</option>
              <option value="Event Sponsor">Event Sponsor</option>
              <option value="Media Partner">Media Partner</option>
            </select>

            <input
              type="number"
              className="input"
              name="eventsSponsored"
              value={sponsor.eventsSponsored}
              onChange={handleChange}
              placeholder="Events Sponsored"
            />

            <input
              className="input"
              name="reach"
              value={sponsor.reach}
              onChange={handleChange}
              placeholder="Reach (eg: 2M impressions)"
            />

            <input
              className="input"
              name="upcomingEvents"
              value={sponsor.upcomingEvents}
              onChange={handleChange}
              placeholder="Upcoming Events"
            />
          </div>

          <button
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold
              ${loading ? "bg-red-300" : "bg-red-600 hover:bg-red-700"}`}
          >
            {loading ? "Updating..." : "Update Sponsor"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default SponsorEdit;
