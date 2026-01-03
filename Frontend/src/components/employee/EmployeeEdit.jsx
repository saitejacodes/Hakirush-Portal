import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const Edit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState({
    name: "",
    maritalStatus: "",
    salary: "",
  });

  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);

  // Load employee on mount
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/employee/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data.success) {
          const emp = res.data.employee;

          setEmployee({
            name: emp?.userId?.name || "",
            maritalStatus: emp?.maritalStatus || "",
            salary: emp?.salary || "",
          });

          if (emp?.userId?.profileImage) {
            setPreview(
              `http://localhost:5000/uploads/${emp.userId.profileImage}`
            );
          }
        }
      } catch (error) {
        console.error(error);
        alert("Failed to load employee data");
      }
    };

    fetchEmployee();
  }, [id]);

  // Handle field change
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // image input
    if (name === "image") {
      const file = files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
      return;
    }

    // text inputs
    setEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("name", employee.name);
    form.append("maritalStatus", employee.maritalStatus);
    form.append("salary", employee.salary);

    if (image) form.append("image", image);

    try {
      const res = await axios.put(
        `http://localhost:5000/api/employee/${id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        alert("Employee updated successfully 🎉");
        navigate("/admin-dashboard/employees");
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
          Edit Employee
        </h3>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Profile image */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-red-200 shadow">
                <img
                  src={preview || "/default-avatar.png"}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <label className="cursor-pointer text-red-600 font-semibold">
                Change Photo
                <input
                  type="file"
                  name="image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleChange}
                />
              </label>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              <input
                className="border p-2 rounded"
                name="name"
                value={employee.name}
                onChange={handleChange}
                placeholder="Full Name"
              />

              <select
                name="maritalStatus"
                className="border p-2 rounded"
                value={employee.maritalStatus}
                onChange={handleChange}
              >
                <option value="">Marital Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>

              <input
                type="number"
                name="salary"
                className="border p-2 rounded"
                value={employee.salary}
                onChange={handleChange}
                placeholder="Salary"
              />
            </div>

            <div className="text-center">
              <button className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700">
                Update Employee
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Edit;
