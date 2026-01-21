import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SponsorView = () => {
  const { id } = useParams();
  const [sponsor, setSponsor] = useState(null);
  const [loading, setLoading] = useState(true);

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
          setSponsor(res.data.sponsor);
        }
      } catch (error) {
        alert(error.response?.data?.error || "Failed to load sponsor");
      } finally {
        setLoading(false);
      }
    };

    fetchSponsor();
  }, [id]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    return "/default-avatar.png";
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        Loading sponsor profile…
      </div>
    );

  if (!sponsor)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        Sponsor not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
      <div className="max-w-3xl mx-auto">

        <h3 className="text-4xl font-extrabold text-center text-red-700 mb-8">
          Sponsor Profile
        </h3>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-red-100">

          {/* LOGO */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-full border-4 border-red-200 shadow-lg overflow-hidden">
              <img
                src={getImageUrl(sponsor.logo)}
                alt="logo"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "/default-avatar.png")}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              {sponsor.name}
            </h2>

            <span className="px-4 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
              {sponsor.collaboration || "No Collaboration"}
            </span>
          </div>

          {/* DETAILS */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Info label="Sponsor Name" value={sponsor.name} />
            <Info label="Collaboration Type" value={sponsor.collaboration} />
            <Info label="Events Sponsored" value={sponsor.eventsSponsored} />
            <Info label="Reach" value={sponsor.reach} />
            <Info label="Upcoming Events" value={sponsor.upcomingEvents} />
            <Info
              label="Created On"
              value={
                sponsor.createdAt
                  ? new Date(sponsor.createdAt).toDateString()
                  : "—"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
    <p className="text-xs uppercase tracking-wide text-red-500 font-semibold">
      {label}
    </p>
    <p className="text-gray-800 text-lg font-bold mt-1">
      {value || "—"}
    </p>
  </div>
);

export default SponsorView;