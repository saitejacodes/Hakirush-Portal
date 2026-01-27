import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const getImageUrl = (imagePath) => {
  if (!imagePath) return "/default-avatar.png";
  if (imagePath.startsWith("http")) return imagePath;
  return "/default-avatar.png";
};

const StallView = () => {
  const { id } = useParams();
  const [stall, setStall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStall = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/stalls/${id}`);
        if (res.data.success && res.data.stall) {
          setStall(res.data.stall);
        } else {
          setError('Stall not found');
        }
      } catch {
        setError('Failed to fetch stall');
      } finally {
        setLoading(false);
      }
    };
    fetchStall();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-red-600 font-semibold">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600 font-semibold">{error}</div>;
  if (!stall) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-red-100 p-6 flex items-center justify-center">
      <div className="max-w-2xl mx-auto w-full">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h3 className="text-4xl font-extrabold text-red-700">Stall Details</h3>
          <p className="text-red-500 mt-2">View all information about this stall</p>
        </div>
        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-red-100 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-red-200 shadow mb-4">
            <img
              src={getImageUrl(stall.logo)}
              alt={stall.name}
              className="w-full h-full object-cover"
              onError={(e) => (e.target.src = "/default-avatar.png")}
            />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-red-700">{stall.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-4">
            <div className="text-gray-700">Stall Number: <span className="font-semibold">{stall.number}</span></div>
            <div className="text-gray-700">Type: <span className="font-semibold">{stall.type}</span></div>
            <div className="text-gray-700">Events Placed: <span className="font-semibold">{stall.eventCount}</span></div>
          </div>
          <div className="w-full mt-3">
            <span className="font-semibold">Plans:</span>
            <ul className="list-disc ml-5">
              {stall.plans && stall.plans.length > 0 ? (
                stall.plans.map((plan, idx) => <li key={idx}>{plan}</li>)
              ) : (
                <li>No plans</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StallView;
