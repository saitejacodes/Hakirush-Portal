import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState({
    planType: "",
    budget: "",
  });

  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);

  // Load client when page opens
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/client/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data.success) {
          const c = res.data.client;

          setClient({
            planType: c?.planType || "",
            budget: c?.budget || "",
          });

          if (c?.image) {
            setPreview(
              `${import.meta.env.VITE_BACKEND_URL}/uploads/${c.image}`
            );
          }
        }
      } catch (error) {
        console.error(error);
        alert("Failed to load client");
      }
    };

    fetchClient();
  }, [id]);

  // Handle inputs
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
      return;
    }

    setClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("planType", client.planType);
    fd.append("budget", client.budget);

    if (image) fd.append("image", image);

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/client/${id}`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        alert("Client updated successfully 🎉");
        navigate("/admin-dashboard/clients");
      }
    } catch (error) {
      console.error(error.response?.data);
      alert(error.response?.data?.error || "Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
      <div className="max-w-4xl mx-auto">

        <h3 className="text-4xl font-extrabold text-red-700 text-center mb-6">
          Edit Client
        </h3>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Logo */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-red-200 shadow">
                <img
                  src={preview || "/default-avatar.png"}
                  alt="logo"
                  className="w-full h-full object-cover"
                />
              </div>

              <label className="cursor-pointer text-red-600 font-semibold">
                Change Logo
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChange}
                />
              </label>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              <select
                name="planType"
                value={client.planType}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Plan Type</option>
                <option value="annual">Annual</option>
                <option value="quarterly">Quarterly</option>
              </select>


              <input
                type="number"
                name="budget"
                value={client.budget}
                onChange={handleChange}
                className="input"
                placeholder="Project Budget"
              />

            </div>

            <div className="text-center">
              <button className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700">
                Update Client
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditClient;