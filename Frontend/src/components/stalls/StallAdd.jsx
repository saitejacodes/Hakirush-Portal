import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StallAdd = () => {
  const [formData, setFormData] = useState({});
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  /* LOAD EVENTS */
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/events`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }).then((res) => setEvents(res.data.events));
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    if (!formData.eventId || !formData.eventType || !formData.stallName) {
      alert("Please fill all required fields");
      return;
    }

    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/stalls/add`,
      formData,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    alert("Stall Added Successfully 🎉");
    navigate("/admin-dashboard/stalls");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h3 className="text-4xl font-extrabold text-red-700">
            Add Stall
          </h3>
          <p className="text-red-500 mt-2">
            Enter stall & vendor details
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-red-100">
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* EVENT TYPE */}
            <select
              name="eventType"
              onChange={handleChange}
              required
              className="input"
            >
              <option value="">Event Type</option>
              <option value="Annual">Annual Event</option>
              <option value="Quarterly">Quarterly Event</option>
            </select>

            <input
              name="stallName"
              placeholder="Stall Name"
              onChange={handleChange}
              className="input"
            />

            <input
              name="vendorName"
              placeholder="Vendor Name"
              onChange={handleChange}
              className="input"
            />

            <input
              name="stallNumber"
              placeholder="Stall Number"
              onChange={handleChange}
              className="input"
            />

            <input
              name="location"
              placeholder="Location"
              onChange={handleChange}
              className="input"
            />

            <input
              name="phone"
              placeholder="Phone"
              onChange={handleChange}
              className="input"
            />

            <select
              name="category"
              onChange={handleChange}
              className="input"
            >
              <option value="">Food Category</option>
              <option value="Snacks">Snacks</option>
              <option value="Drinks">Drinks</option>
              <option value="Fast Food">Fast Food</option>
              <option value="Ice Cream">Ice Cream</option>
              <option value="Meals">Meals</option>
            </select>

            <select
              name="status"
              onChange={handleChange}
              className="input"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button className="col-span-full bg-red-600 text-white py-3 rounded-xl">
              Create Stall
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default StallAdd;