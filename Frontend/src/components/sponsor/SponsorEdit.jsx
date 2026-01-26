import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/* ================= IMAGE HELPER ================= */
const getImageUrl = (url) => {
  if (!url) return "/default-avatar.png";
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("http")) return `${url}?t=${Date.now()}`; // 🔥 cache bust
  return "/default-avatar.png";
};

const SponsorEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sponsor, setSponsor] = useState({
    name: "",
    collaboration: "",
    eventsSponsored: "",
    reach: "",
    upcomingEvents: "",
  });

  const [preview, setPreview] = useState("/default-avatar.png");
  const [logo, setLogo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD SPONSOR ================= */
  useEffect(() => {
    const fetchSponsor = async () => {
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

          setPreview(getImageUrl(s.logo));
        }
      } catch (error) {
        alert("Failed to load sponsor");
      } finally {
        setLoading(false);
      }
    };

    fetchSponsor();
  }, [id]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "logo") {
      const file = files?.[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        alert("Logo must be under 10MB");
        e.target.value = "";
        return;
      }

      setLogo(file);
      setPreview(URL.createObjectURL(file)); // 🔥 instant preview
      e.target.value = ""; // allow same file reselect
      return;
    }

    setSponsor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const form = new FormData();
    form.append("name", sponsor.name);
    form.append("collaboration", sponsor.collaboration);
    form.append("eventsSponsored", sponsor.eventsSponsored);
    form.append("reach", sponsor.reach);
    form.append("upcomingEvents", sponsor.upcomingEvents);

    if (logo) form.append("logo", logo);

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/sponsors/${id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        alert("Sponsor updated successfully 🎉");
        navigate("/admin-dashboard/sponsors", { replace: true });
      }
    } catch (error) {
      alert(error.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
      <div className="max-w-4xl mx-auto">

        <h3 className="text-4xl font-extrabold text-red-700 text-center mb-6">
          Edit Sponsor
        </h3>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* LOGO */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-red-200 shadow">
                <img
                  src={preview}
                  alt="logo"
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                  className="w-full h-full object-cover"
                />
              </div>

              <label className="cursor-pointer text-red-600 font-semibold">
                Change Logo
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
                value={sponsor.name}
                onChange={handleChange}
                placeholder="Sponsor Name"
                className="input"
              />

              <select
                name="collaboration"
                value={sponsor.collaboration}
                onChange={handleChange}
                className="input"
              >
                <option value="">Collaboration Type</option>
                <option value="Title Sponsor">Title Sponsor</option>
                <option value="Associate Sponsor">Associate Sponsor</option>
                <option value="Event Sponsor">Event Sponsor</option>
                <option value="Media Partner">Media Partner</option>
              </select>

              <input
                type="number"
                name="eventsSponsored"
                value={sponsor.eventsSponsored}
                onChange={handleChange}
                placeholder="Events Sponsored"
                className="input"
              />

              <input
                name="reach"
                value={sponsor.reach}
                onChange={handleChange}
                placeholder="Reach (eg: 2M impressions)"
                className="input"
              />

              <input
                name="upcomingEvents"
                value={sponsor.upcomingEvents}
                onChange={handleChange}
                placeholder="Upcoming Events"
                className="input"
              />
            </div>

            <div className="text-center">
              <button
                disabled={saving}
                className={`px-8 py-3 rounded-xl text-white font-semibold
                ${saving ? "bg-red-300" : "bg-red-600 hover:bg-red-700"}`}
              >
                {saving ? "Updating..." : "Update Sponsor"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default SponsorEdit;
