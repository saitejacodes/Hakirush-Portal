import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddClient = () => {
  const [formData, setFormData] = useState({});
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setFormData((p) => ({ ...p, image: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.keys(formData).forEach((k) => fd.append(k, formData[k]));

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/client/add`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        alert("Client Added Successfully 🎉");
        navigate("/admin-dashboard/clients");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add client");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
      <div className="max-w-4xl mx-auto">

        <h3 className="text-4xl font-extrabold text-red-700 text-center mb-8">
          Add New Client
        </h3>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-red-100">
          <form onSubmit={handleSubmit} className="space-y-8">

            <div className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-red-200 shadow">
                <img
                  src={preview || "/default-avatar.png"}
                  className="w-full h-full object-cover"
                />
              </div>

              <label className="cursor-pointer text-red-600 font-semibold">
                Upload Company Logo
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input name="name" placeholder="Client Name" required onChange={handleChange} className="input" />
              <input name="email" placeholder="Email" type="email" required onChange={handleChange} className="input" />
              <input type="password" name="password" placeholder="Password" required onChange={handleChange} className="input" />
              <input type="date" name="dateOfJoining" onChange={handleChange} className="input" />

              <select name="planType" onChange={handleChange} className="input">
                <option value="">Select Plan</option>
                <option value="annual">Annual</option>
                <option value="quarterly">Quarterly</option>
              </select>

              <input type="number" name="budget" placeholder="Budget" onChange={handleChange} className="input" />
            </div>

            <div className="text-center">
              <button className="bg-red-600 hover:bg-red-700 text-white px-10 py-3 rounded-2xl shadow-lg font-semibold">
                Create Client
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClient;