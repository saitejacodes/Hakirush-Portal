import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const StallView = () => {
  const { id } = useParams();
  const [stall, setStall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/stalls/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => {
      if (res.data.success) setStall(res.data.stall);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="p-10 text-center text-red-600">Loading stall...</div>;
  if (!stall) return <div className="p-10 text-center text-red-600">Stall not found</div>;

  return (
    <div className="min-h-screen bg-red-50 p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow">
        <h2 className="text-3xl font-bold text-red-700 mb-6">{stall.stallName}</h2>

        <div className="grid grid-cols-2 gap-4">
          <Info label="Vendor" value={stall.vendorName} />
          <Info label="Category" value={stall.category} />
          <Info label="Event" value={stall.eventId?.eventName} />
          <Info label="Location" value={stall.location} />
          <Info label="Stall Number" value={stall.stallNumber} />
          <Info label="Phone" value={stall.phone} />
          <Info label="Status" value={stall.status} />
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-red-100 p-4 rounded">
    <p className="text-xs text-red-600">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

export default StallView;