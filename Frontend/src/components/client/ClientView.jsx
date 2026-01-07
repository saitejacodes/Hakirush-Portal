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
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/client/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // SAME CONDITION STYLE AS EMPLOYEE VIEW
        if (response.data?.success) {
          setClient(response.data.client);
        }

      } catch (error) {
        alert(error?.response?.data?.error || "Failed to load client");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  // SAME IMAGE LOGIC AS EMPLOYEE
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return `http://localhost:5000${imagePath}`;
    if (imagePath.startsWith("uploads/")) return `http://localhost:5000/${imagePath}`;
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  // SAME LOADING VIEW
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        Loading profile…
      </div>
    );

  // SAME NOT FOUND VIEW
  if (!client)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        Client not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
      <div className="max-w-3xl mx-auto">

        {/* Title */}
        <h3 className="text-4xl font-extrabold text-center text-red-700 mb-8">
          Client Profile
        </h3>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-red-100">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-full border-4 border-red-200 shadow-lg overflow-hidden hover:scale-105 transition">
              <img
                src={getImageUrl(client?.companyLogo)}
                alt="logo"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "/default-avatar.png")}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              {client?.userId?.name}
            </h2>

            <span className="px-4 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
              {client?.planType === "annual"
                ? "Annual Plan"
                : client?.planType === "quarterly"
                ? "Quarterly Plan"
                : "Client"}
            </span>
          </div>

          {/* Details */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">

            <Info label="Client Name" value={client?.userId?.name} />
            <Info label="Email" value={client?.userId?.email} />

            <Info label="Budget" value={`₹ ${client?.budget || 0}`} />

            <Info
              label="Date Of Joining"
              value={
                client?.dateOfJoining
                  ? new Date(client.dateOfJoining).toDateString()
                  : "N/A"
              }
            />

            <Info
              label="Plan Type"
              value={
                client?.planType === "annual"
                  ? "Annual"
                  : client?.planType === "quarterly"
                  ? "Quarterly"
                  : "N/A"
              }
            />

            <Info label="Account Type" value="CLIENT" />
          </div>
        </div>
      </div>
    </div>
  );
};

// SAME REUSABLE INFO COMPONENT
const Info = ({ label, value }) => (
  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
    <p className="text-xs uppercase tracking-wide text-red-500 font-semibold">
      {label}
    </p>
    <p className="text-gray-800 text-lg font-bold mt-1">{value || "—"}</p>
  </div>
);

export default ViewClient;
