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
      if (!file) return;

      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) return alert("Client name required");
    if (!formData.email) return alert("Email required");
    if (!formData.password) return alert("Password required");
    if (!formData.planType) return alert("Select client plan type");

    const fd = new FormData();
    Object.keys(formData).forEach((k) => fd.append(k, formData[k]));

    try {
      const res = await axios.post(
        "http://localhost:5000/api/client/add",
        fd,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        alert("Client Added Successfully 🎉");
        navigate("/admin-dashboard/clients");
      }
    } catch (err) {
      console.log("SERVER ERROR:", err.response?.data);
      alert(err.response?.data?.error || "Failed to add client");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-8">
          <h3 className="text-4xl font-extrabold text-red-700">
            Add New Client
          </h3>
          <p className="text-red-500 mt-2">
            Enter client details and login credentials
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-red-100">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Logo Preview */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-red-200 shadow">
                <img
                  src={preview || "/default-avatar.png"}
                  alt="logo preview"
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

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              <input
                name="name"
                placeholder="Client Name"
                required
                onChange={handleChange}
                className="input"
              />

              <input
                name="email"
                placeholder="Email Address"
                type="email"
                required
                onChange={handleChange}
                className="input"
              />

              <input
                type="password"
                name="password"
                placeholder="Account Password"
                required
                onChange={handleChange}
                className="input"
              />

              <input
                type="date"
                name="dateOfJoining"
                onChange={handleChange}
                className="input"
              />

              <select name="planType" onChange={handleChange}>
                <option value="">Select Plan Type</option>
                <option value="annual">Annual</option>
                <option value="quarterly">Quarterly</option>
              </select>

              <input
                type="number"
                name="budget"
                placeholder="Project Budget"
                onChange={handleChange}
                className="input"
              />

            </div>

            <div className="text-center">
              <button
                className="bg-red-600 hover:bg-red-700 transition text-white px-10 py-3 rounded-2xl shadow-lg font-semibold"
              >
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
