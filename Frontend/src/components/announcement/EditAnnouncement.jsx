import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditAnnouncement = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

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
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("EDIT ANNOUNCEMENT RESPONSE:", res.data);

        // ✅ SUPPORT BOTH RESPONSE TYPES
        const a =
          res.data?.announcement || // preferred
          res.data; // fallback

        if (!a || !a._id) {
          throw new Error("Announcement data missing");
        }

        setForm({
          title: a.title || "",
          type: a.type || "Annual",
          date: a.date
            ? new Date(a.date).toISOString().split("T")[0]
            : "",
          venue: a.venue || "",
          status: a.status || "Upcoming",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load announcement data");
      } finally {
        setFetching(false);
      }
    };

    fetchAnnouncement();
  }, [id, token]);

  /* ================= UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/announcements/${id}`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate("/admin-dashboard/announcement");
    } catch (err) {
      console.error(err);
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
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <select
            className="border p-3 rounded-xl"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option>Annual</option>
            <option>Quarterly</option>
          </select>

          <input
            type="date"
            required
            className="border p-3 rounded-xl"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <input
            required
            className="border p-3 rounded-xl"
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
          />

          <select
            className="border p-3 rounded-xl"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option>Upcoming</option>
            <option>Ongoing</option>
            <option>Completed</option>
          </select>

          <button
            disabled={loading}
            className="col-span-full bg-red-600 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? "Updating..." : "Update Announcement"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditAnnouncement;