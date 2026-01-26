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

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState({
    planType: "",
    budget: "",
  });

  const [preview, setPreview] = useState("/default-avatar.png");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= LOAD CLIENT ================= */
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

        if (res.data.success) {
          const c = res.data.client;
          setClient({
            planType: c.planType || "",
            budget: c.budget || "",
          });

          setPreview(getImageUrl(c.companyLogo));
        }
      } catch (err) {
        alert("Failed to load client");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  /* ================= IMAGE CHANGE ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("Image must be less than 10MB");
      e.target.value = "";
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file)); // 🔥 instant UI update
    e.target.value = ""; // allow re-select same image
  };

  /* ================= FORM CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient((p) => ({ ...p, [name]: value }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("planType", client.planType);
      fd.append("budget", client.budget);
      if (image) fd.append("image", image);

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
        alert("Client updated successfully 🎉");

        // ✅ go back to client list
        navigate("/admin-dashboard/clients", { replace: true });
      }
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
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
          Edit Client
        </h3>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* IMAGE */}
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
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {/* FORM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <select
                name="planType"
                value={client.planType}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Plan</option>
                <option value="annual">Annual</option>
                <option value="quarterly">Quarterly</option>
              </select>

              <input
                type="number"
                name="budget"
                value={client.budget}
                onChange={handleChange}
                placeholder="Budget"
                className="input"
              />
            </div>

            <div className="text-center">
              <button
                disabled={saving}
                className={`px-8 py-3 rounded-xl text-white font-semibold
                ${saving ? "bg-red-300" : "bg-red-600 hover:bg-red-700"}`}
              >
                {saving ? "Updating..." : "Update Client"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditClient;