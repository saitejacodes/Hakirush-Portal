import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ViewClient = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/client/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data?.success) {
          setClient(res.data.client);
        }
      } catch {
        alert("Failed to load client");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    return "/default-avatar.png";
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        Loading profile…
      </div>
    );

  if (!client)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        Client not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto">

        <h3 className="text-4xl font-extrabold text-center text-red-700 mb-10 drop-shadow-sm">
          Client Profile
        </h3>

        <div className="bg-white/95 rounded-3xl shadow-2xl p-10 border border-red-100">

          {/* HEADER */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full border-4 border-red-200 shadow-lg overflow-hidden">
              <img
                src={getImageUrl(client.companyLogo)}
                alt="logo"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "/default-avatar.png")}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mt-2">
              {client.userId?.name}
            </h2>

            <span className="px-4 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold mt-1">
              {client.planType || "No Plan"}
            </span>
          </div>

          {/* INFO GRID */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-7">
            <Info label="Email" value={client.userId?.email} />
            <Info label="Budget" value={`₹ ${client.budget || 0}`} />
            <Info label="Plan Type" value={client.planType || "N/A"} />
            <Info
              label="Date Of Joining"
              value={
                client.dateOfJoining
                  ? new Date(client.dateOfJoining).toDateString()
                  : "N/A"
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

export default ViewClient;