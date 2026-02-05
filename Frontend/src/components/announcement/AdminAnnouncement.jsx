import React, { useState, useEffect } from "react";
import axios from "axios";
import { Edit2, Trash2 } from "lucide-react";
import { NavLink } from "react-router-dom";

/* ================= PREMIUM CONFIRM DELETE ================= */
const ConfirmDeleteAlert = ({ onConfirm, onCancel }) => (
  <>
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />

        <div className="p-6 flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-bold">
            !
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-700">
              Delete Announcement
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              This action cannot be undone. Are you sure?
            </p>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="w-1/2 py-2.5 rounded-xl border hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90 transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </>
);

/* ================= PREMIUM SUCCESS ALERT ================= */
const DeleteSuccessAlert = ({ onClose }) => (
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
              Announcement Deleted
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              The announcement has been removed successfully.
            </p>
          </div>
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

const AdminAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "",
    type: "Annual",
    date: "",
    venue: "",
    status: "Upcoming",
  });

  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        Access denied. Admin token missing.
      </div>
    );
  }

  const fetchAnnouncements = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/announcements`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAnnouncements(
        Array.isArray(data?.announcements) ? data.announcements : []
      );
      setError("");
    } catch {
      setError("Failed to load announcements");
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [token]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.title.trim() || !form.date || !form.venue.trim()) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/announcements/add`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setForm({
        title: "",
        type: "Annual",
        date: "",
        venue: "",
        status: "Upcoming",
      });

      fetchAnnouncements();
    } catch {
      setError("Failed to add announcement");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/announcements/${deleteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDeleteId(null);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        fetchAnnouncements();
      }, 1500);
    } catch {
      setError("Failed to delete announcement");
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toISOString().split("T")[0] : "";

  return (
    <>
      {deleteId && (
        <ConfirmDeleteAlert
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {showSuccess && (
        <DeleteSuccessAlert onClose={() => setShowSuccess(false)} />
      )}

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="text-center mb-8">
            <h3 className="text-3xl md:text-4xl font-extrabold text-red-800">
              Admin Announcements
            </h3>
            <p className="text-sm text-red-600 font-semibold mt-1">
              Create & manage sports announcements
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-red-100">
            {error && (
              <div className="m-4 bg-red-100 text-red-700 p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                required
                placeholder="Event Title"
                className="border border-red-300 rounded-xl p-3"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <select
                className="border border-red-300 rounded-xl p-3"
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
                className="border border-red-300 rounded-xl p-3"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />

              <input
                required
                placeholder="Venue"
                className="border border-red-300 rounded-xl p-3"
                value={form.venue}
                onChange={(e) =>
                  setForm({ ...form, venue: e.target.value })
                }
              />

              <select
                className="border border-red-300 rounded-xl p-3"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option>Upcoming</option>
                <option>Ongoing</option>
                <option>Completed</option>
              </select>

              <button
                disabled={loading}
                className="col-span-full rounded-xl bg-red-600 px-6 py-3 font-semibold text-white cursor-pointer"
              >
                {loading ? "Saving..." : "Add Announcement"}
              </button>
            </form>

            {/* LIST */}
            <div className="p-4 md:p-6 grid gap-4">
              <h3 className="text-xl md:text-2xl font-extrabold text-red-800 text-center">
                Previous Announcements
              </h3>

              {announcements.length === 0 ? (
                <p className="text-center text-gray-500">
                  No announcements found
                </p>
              ) : (
                announcements.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl border shadow flex justify-between items-center p-4"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {item.title}
                      </h4>
                      <p className="text-sm text-red-600">
                        {item.type} • {formatDate(item.date)} •{" "}
                        {item.venue}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <NavLink
                        to={`/admin-dashboard/announcement/edit/${item._id}`}
                        title="Edit announcement"
                        className="text-red-600 hover:text-red-800"
                      >
                        <Edit2 size={16} />
                      </NavLink>

                      <button
                        onClick={() => setDeleteId(item._id)}
                        title="Delete announcement"
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminAnnouncement;