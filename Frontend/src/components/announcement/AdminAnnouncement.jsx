import React, { useState, useEffect } from "react";
import axios from "axios";
import { Edit2, ImagePlus, Trash2 } from "lucide-react";
import { NavLink } from "react-router-dom";

/* ================= PREMIUM CONFIRM DELETE ================= */
const ConfirmDeleteAlert = ({ onConfirm, onCancel }) => (
  <>
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden animate-scaleIn">
        <div className="h-1.5 bg-gradient-to-r from-red-600 via-red-400 to-red-600" />

        <div className="p-6 flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg">
            !
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-700">
              Delete Announcement
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              This action cannot be undone. Are you sure?
            </p>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="w-1/2 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg hover:opacity-90 transition cursor-pointer"
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden animate-scaleIn">
        <div className="h-1.5 bg-gradient-to-r from-red-600 via-red-400 to-red-600" />

        <div className="p-6 flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 text-lg">
            ✓
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-700">
              Announcement Deleted
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              The announcement has been removed successfully.
            </p>
          </div>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg hover:opacity-90 transition cursor-pointer"
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
    description: "",
    type: "Annual",
    date: "",
    venue: "",
    status: "Upcoming",
    image: null,
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v) formData.append(k, v);
      });

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/announcements/add`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setForm({
        title: "",
        description: "",
        type: "Annual",
        date: "",
        venue: "",
        status: "Upcoming",
        image: null,
      });

      fetchAnnouncements();
    } catch {
      setError("Failed to add announcement");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/announcements/${deleteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeleteId(null);
      setShowSuccess(true);
      fetchAnnouncements();
    } catch {
      setError("Failed to delete announcement");
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

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

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6">
        <div className="max-w-6xl mx-auto">

          {/* HEADER */}
          <div className="text-center mb-10">
            <h3 className="text-4xl font-extrabold text-red-800 tracking-tight">
              Admin Announcements
            </h3>
            <p className="text-red-500 font-medium mt-2">
              Create & manage sports announcements
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-100 p-8">

            {/* ADD FORM — UNTOUCHED */}
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <input
                required
                placeholder="Event Title"
                className="premium-input"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <select
                className="premium-input"
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value })
                }
              >
                <option>Annual</option>
                <option>Quarterly</option>
              </select>

              <textarea
                rows="3"
                placeholder="Announcement description"
                className="premium-input col-span-full"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <input
                type="date"
                required
                className="premium-input"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />

              <input
                required
                placeholder="Venue"
                className="premium-input"
                value={form.venue}
                onChange={(e) =>
                  setForm({ ...form, venue: e.target.value })
                }
              />

              <select
                className="premium-input"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option>Upcoming</option>
                <option>Ongoing</option>
                <option>Completed</option>
              </select>

              <div className="col-span-full">
                <label className="block text-sm font-semibold text-red-700 mb-2">
                  Upload Announcement Image
                </label>

                <label className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-red-300 bg-red-50/40 hover:bg-red-50 cursor-pointer transition-all">
                  <ImagePlus size={36} className="text-red-500 mb-2" />
                  <p className="text-sm font-medium text-red-700">
                    Click to upload image
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
                className="col-span-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-3 font-semibold text-white shadow-lg hover:scale-[1.01] transition cursor-pointer"
              >
                {loading ? "Saving..." : "Add Announcement"}
              </button>
            </form>

            {/* PREVIOUS ANNOUNCEMENTS — ONLY STYLED */}
            <div className="mt-12">
              <h3 className="text-2xl font-extrabold text-red-800 mb-4">
                Previous Announcements
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {announcements.map((item) => (
                  <div
                    key={item._id}
                    className="group bg-white rounded-2xl border shadow hover:shadow-2xl transition overflow-hidden"
                  >
                    {item.image && (
                      <div className="relative">
                        <img
                          src={item.image}
                          alt="announcement"
                          className="h-44 w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>
                    )}

                    <div className="p-5">
                      <h4 className="font-extrabold text-xl text-gray-800">
                        {item.title}
                      </h4>

                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {item.description}
                      </p>

                      <p className="text-xs text-red-600 mt-3">
                        {item.type} • {formatDate(item.date)} • {item.venue}
                      </p>

                      <div className="flex items-center justify-end gap-4 mt-5 pt-4 border-t">
                        <NavLink
                          to={`/admin-dashboard/announcement/edit/${item._id}`}
                          className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-800"
                        >
                          <Edit2 size={16} /> Edit
                        </NavLink>

                        <button
                          onClick={() => setDeleteId(item._id)}
                          className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminAnnouncement;
