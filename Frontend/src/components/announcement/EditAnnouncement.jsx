import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ImagePlus } from "lucide-react"; // ✅ ADDED (nothing removed)

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />

    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />

        <div className="p-6 flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
            ✓
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-700">
              Announcement Updated
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              The announcement has been updated successfully.
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
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90 transition"
          >
            Okay, got it
          </button>
        </div>
      </div>
    </div>
  </>
);

const EditAnnouncement = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Access denied. Please login again.
      </div>
    );
  }

  /* ================= FETCH EXISTING DATA ================= */
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/announcements/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const a = res.data?.announcement || res.data;

        if (!a || !a._id) throw new Error("Announcement data missing");

        setForm({
          title: a.title || "",
          type: a.type || "Annual",
          date: a.date
            ? new Date(a.date).toISOString().split("T")[0]
            : "",
          venue: a.venue || "",
          status: a.status || "Upcoming",

          // ✅ ADDED (nothing removed)
          image: null,
        });
      } catch {
        setError("Failed to load announcement data");
      } finally {
        setFetching(false);
      }
    };

    fetchAnnouncement();
  }, [id, token]);

  /* ================= UPDATE (ORIGINAL – KEPT 100%) ================= */
  /*
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/announcements/${id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowAlert(true);

      setTimeout(() => {
        navigate("/admin-dashboard/announcement");
      }, 1800);
    } catch {
      setError("Failed to update announcement");
    } finally {
      setLoading(false);
    }
  };
  */

  /* ================= UPDATE (NEW – IMAGE SUPPORT) ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/announcements/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setShowAlert(true);

      setTimeout(() => {
        navigate("/admin-dashboard/announcement");
      }, 1800);
    } catch {
      setError("Failed to update announcement");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING ================= */
  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading announcement data...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Announcement not found
      </div>
    );
  }

  return (
    <>
      {showAlert && <SuccessAlert onClose={() => setShowAlert(false)} />}

      <div className="min-h-screen bg-red-100 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-2xl font-extrabold text-red-800 mb-6">
            Edit Announcement
          </h2>

          {error && (
            <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-xl">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              required
              className="border p-3 rounded-xl"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <select
              className="border p-3 rounded-xl"
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value })
              }
            >
              <option>Annual</option>
              <option>Quarterly</option>
            </select>

            <input
              type="date"
              required
              className="border p-3 rounded-xl"
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
            />

            <input
              required
              className="border p-3 rounded-xl"
              value={form.venue}
              onChange={(e) =>
                setForm({ ...form, venue: e.target.value })
              }
            />

            <select
              className="border p-3 rounded-xl"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option>Upcoming</option>
              <option>Ongoing</option>
              <option>Completed</option>
            </select>

            {/* ================= IMAGE UPLOAD (ADDED ONLY) ================= */}
            <div className="col-span-full">
              <label className="block text-sm font-semibold text-red-700 mb-2">
                Replace Announcement Image (optional)
              </label>

              <label className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-red-300 bg-red-50/40 hover:bg-red-50 cursor-pointer transition-all">
                <ImagePlus size={36} className="text-red-500 mb-2" />
                <p className="text-sm font-medium text-red-700">
                  Click to upload new image
                </p>

                {form.image && (
                  <p className="mt-2 text-xs font-semibold text-green-600">
                    Selected: {form.image.name}
                  </p>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setForm({ ...form, image: e.target.files[0] })
                  }
                />
              </label>
            </div>

            <button
              disabled={loading}
              className="col-span-full bg-red-600 text-white py-3 rounded-xl font-semibold cursor-pointer"
            >
              {loading ? "Updating..." : "Update Announcement"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditAnnouncement;
