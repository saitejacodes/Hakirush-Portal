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
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        if (res.data.success) setClient(res.data.client);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!client) return <div className="min-h-screen flex items-center justify-center">Client not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h3 className="text-4xl font-extrabold text-center text-red-700 mb-8">
          Client Profile
        </h3>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-red-100">

          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-full border-4 border-red-200 shadow-lg overflow-hidden">
              <img
                src={getImageUrl(client.companyLogo)}
                className="w-full h-full object-cover"
              />
            </div>

            <h2 className="text-2xl font-bold">{client.userId?.name}</h2>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Info label="Email" value={client.userId?.email} />
            <Info label="Budget" value={`₹ ${client.budget}`} />
            <Info label="Plan" value={client.planType} />
            <Info label="Date Of Joining" value={new Date(client.dateOfJoining).toDateString()} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
    <p className="text-xs uppercase tracking-wide text-red-500 font-semibold">{label}</p>
    <p className="text-gray-800 text-lg font-bold mt-1">{value || "—"}</p>
  </div>
);

export default ViewClient;
