import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

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

  const [preview, setPreview] = useState(null);
  const [logo, setLogo] = useState(null);

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

          if (s.logo) {
            setPreview(
              `${import.meta.env.VITE_BACKEND_URL}/uploads/${s.logo}`
            );
          }
        }
      } catch (error) {
        console.error("FETCH SPONSOR ERROR:", error.response || error);
        alert("Failed to load sponsor data");
      }
    };

    fetchSponsor();
  }, [id]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "logo") {
      const file = files[0];
      setLogo(file);
      setPreview(URL.createObjectURL(file));
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
        navigate("/admin-dashboard/sponsors");
      }
    } catch (error) {
      console.error("UPDATE SPONSOR ERROR:", error.response || error);
      alert(error.response?.data?.error || "Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <h3 className="text-4xl font-extrabold text-red-700 text-center mb-6">
          Edit Sponsor
        </h3>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* LOGO */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-red-200 shadow">
                <img
                  src={preview || "/default-avatar.png"}
                  alt="logo"
                  className="w-full h-full object-cover"
                />
              </div>

              <label className="cursor-pointer text-red-600 font-semibold">
                Change Logo
                <input
                  type="file"
                  name="logo"
                  className="hidden"
                  accept="image/*"
                  onChange={handleChange}
                />
              </label>
            </div>

            {/* FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              <input
                className="border p-2 rounded"
                name="name"
                value={sponsor.name}
                onChange={handleChange}
                placeholder="Sponsor Name"
              />

              <select
                name="collaboration"
                className="border p-2 rounded"
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
                name="eventsSponsored"
                className="border p-2 rounded"
                value={sponsor.eventsSponsored}
                onChange={handleChange}
                placeholder="Events Sponsored"
              />

              <input
                name="reach"
                className="border p-2 rounded"
                value={sponsor.reach}
                onChange={handleChange}
                placeholder="Reach (eg: 2M impressions)"
              />

              <input
                name="upcomingEvents"
                className="border p-2 rounded"
                value={sponsor.upcomingEvents}
                onChange={handleChange}
                placeholder="Upcoming Events"
              />
            </div>

            {/* SUBMIT */}
            <div className="text-center">
              <button className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700 transition">
                Update Sponsor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SponsorEdit;