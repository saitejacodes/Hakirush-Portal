import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

/* ================= IMAGE HELPER ================= */
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/default-avatar.png";
  if (imagePath.startsWith("http")) return imagePath;
  return "/default-avatar.png";
};

const StallView = () => {
  const { id } = useParams();
  const [stall, setStall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStall = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/stalls/${id}`
        );

        if (res.data?.success && res.data.stall) {
          setStall(res.data.stall);
        }
      } catch {
        alert("Failed to load stall");
      } finally {
        setLoading(false);
      }
    };

    fetchStall();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        Loading profile…
      </div>
    );

  if (!stall)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        Stall not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto">

        <h3 className="text-4xl font-extrabold text-center text-red-700 mb-10 drop-shadow-sm">
          Stall Profile
        </h3>

        <div className="bg-white/95 rounded-3xl shadow-2xl p-10 border border-red-100">

          {/* HEADER */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full border-4 border-red-200 shadow-lg overflow-hidden">
              <img
                src={getImageUrl(stall.logo)}
                alt="stall"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "/default-avatar.png")}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mt-2">
              {stall.name}
            </h2>

            <span className="px-4 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold mt-1">
              Stall No: {stall.number}
            </span>
          </div>

          {/* INFO GRID */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-7">
            <Info label="Stall Name" value={stall.name} />
            <Info label="Stall Number" value={stall.number} />
            <Info label="Type" value={stall.type} />
            <Info label="Events Placed" value={stall.eventCount} />
            <Info
              label="Plans"
              value={
                stall.plans && stall.plans.length
                  ? stall.plans.join(", ")
                  : "No plans"
              }
            />
            <Info
              label="Created On"
              value={
                stall.createdAt
                  ? new Date(stall.createdAt).toDateString()
                  : "—"
              }
            />
          </div>

        </div>
      </div>
    </div>
  );
};

/* ================= INFO CARD ================= */
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

export default StallView;
