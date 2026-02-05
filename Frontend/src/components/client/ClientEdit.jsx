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

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => {
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />

      {/* Alert */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-red-100 overflow-hidden">
          
          {/* Gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />

          <div className="p-6 flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              ✓
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-700">
                Client Updated
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Client details have been updated successfully.
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-red-600 transition"
            >
              ✕
            </button>
          </div>

          <div className="px-6 pb-5">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-medium hover:opacity-90 transition"
            >
              Okay, got it
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [client, setClient] = useState({
    planType: "",
    budget: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  /* ================= FETCH CLIENT ================= */
  useEffect(() => {
    fetchClient();
    // eslint-disable-next-line
  }, [id]);

  const fetchClient = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/client/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        const c = res.data.client;
        setClient({
          planType: c.planType || "",
          budget: c.budget || "",
        });
        setPreview(c.companyLogo || null);
      }
    } catch (err) {
      alert("Failed to load client");
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "companyLogo") {
      const file = files[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        alert("Image size must be less than 10MB");
        e.target.value = "";
        return;
      }

      setImage(file);
      setPreview(URL.createObjectURL(file));
      e.target.value = "";
      return;
    }

    setClient((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    Object.keys(client).forEach((key) => {
      fd.append(key, client[key]);
    });

    if (image) {
      fd.append("companyLogo", image);
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/client/${id}`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        setShowAlert(true);

        setTimeout(() => {
          navigate("/admin-dashboard/clients");
        }, 1800);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
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
    <>
      {showAlert && (
        <SuccessAlert onClose={() => setShowAlert(false)} />
      )}

      <div className="min-h-screen bg-red-50 p-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
          <h2 className="text-3xl font-bold text-center text-red-700 mb-6">
            Edit Client
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
                  name="companyLogo"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChange}
                />
              </label>
            </div>

            {/* FORM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                className="input"
                name="planType"
                value={client.planType}
                onChange={handleChange}
              >
                <option value="">Select Plan</option>
                <option value="Annual">Annual</option>
                <option value="Quarterly">Quarterly</option>
              </select>

              <input
                type="number"
                className="input"
                name="budget"
                value={client.budget}
                onChange={handleChange}
                placeholder="Budget"
              />
            </div>

            <button
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold cursor-pointer
                ${
                  loading
                    ? "bg-red-300"
                    : "bg-red-600 hover:bg-red-700"
                }`}
            >
              {loading ? "Updating..." : "Update Client"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditClient;