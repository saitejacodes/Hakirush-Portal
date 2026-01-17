import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const StallEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stall, setStall] = useState({});
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/stalls/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => setStall(res.data.stall));

    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/events`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => setEvents(res.data.events));
  }, [id]);

  const submit = async e => {
    e.preventDefault();
    await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/stalls/${id}`,
      stall,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    alert("Stall updated");
    navigate("/admin-dashboard/stalls");
  };

  return (
    <form onSubmit={submit} className="p-6 grid gap-4 max-w-xl mx-auto">
      <select value={stall.eventId?._id} onChange={e => setStall({ ...stall, eventId: e.target.value })}>
        {events.map(e => <option key={e._id} value={e._id}>{e.eventName}</option>)}
      </select>

      <input value={stall.stallName || ""} onChange={e => setStall({ ...stall, stallName: e.target.value })} />
      <input value={stall.vendorName || ""} onChange={e => setStall({ ...stall, vendorName: e.target.value })} />
      <input value={stall.stallNumber || ""} onChange={e => setStall({ ...stall, stallNumber: e.target.value })} />
      <input value={stall.location || ""} onChange={e => setStall({ ...stall, location: e.target.value })} />
      <input value={stall.phone || ""} onChange={e => setStall({ ...stall, phone: e.target.value })} />

      <button className="bg-red-600 text-white p-3 rounded">Update Stall</button>
    </form>
  );
};

export default StallEdit;