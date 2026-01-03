import React, { useEffect, useState } from "react";
import axios from "axios";
import { fetchDepartments } from "../../utils/EmployeeHelper";
import { useNavigate } from "react-router-dom";

const Add = () => {
  const [departments, setDepartments] = useState([]);
  const [loadingDept, setLoadingDept] = useState(false);
  const [formData, setFormData] = useState({});
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDept(true);
        const res = await fetchDepartments();
        setDepartments(res || []);
      } finally {
        setLoadingDept(false);
      }
    };

    loadDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key]);
    });

    try {
      const res = await axios.post(
        "http://localhost:5000/api/employee/add",
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        alert("Employee Added Successfully 🎉");
        navigate("/admin-dashboard/employees");
      }
    } catch (error) {
      console.log("SERVER ERROR:", error.response?.data);
      alert(error.response?.data?.error || "Failed to add employee");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-8">
          <h3 className="text-4xl font-extrabold text-red-700">
            Add New Employee
          </h3>
          <p className="text-red-500 mt-2">
            Enter employee information and credentials
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-red-100">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Profile Image Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-red-200 shadow">
                <img
                  src={preview || "/default-avatar.png"}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <label className="cursor-pointer text-red-600 font-semibold">
                Upload Profile Photo
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

              {/* personal */}
              <input name="name" placeholder="Full Name" required onChange={handleChange} className="input" />
              <input name="email" placeholder="Email Address" type="email" required onChange={handleChange} className="input" />

              <input name="employeeId" placeholder="Employee ID" required onChange={handleChange} className="input" />

              <input type="date" name="dob" onChange={handleChange} required className="input" />

              <select name="gender" onChange={handleChange} required className="input">
                <option value="">Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>

              <select name="maritalStatus" onChange={handleChange} className="input">
                <option value="">Marital Status</option>
                <option>Single</option>
                <option>Married</option>
              </select>

              <select name="bloodGroup" onChange={handleChange} required className="input">
                <option value="">Blood Group</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
                <option>O+</option>
                <option>O-</option>
              </select>

              {/* department */}
              <select name="department" required onChange={handleChange} className="input">
                <option value="">
                  {loadingDept ? "Loading..." : "Select Department"}
                </option>

                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.dep_name}
                  </option>
                ))}
              </select>

              <input type="number" name="salary" placeholder="Salary" required onChange={handleChange} className="input" />

              <input type="password" name="password" placeholder="Account Password" required onChange={handleChange} className="input" />

              <select name="role" required onChange={handleChange} className="input">
                <option value="">User Role</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
                <option value="client">Client</option>
              </select>
            </div>

            <div className="text-center">
              <button className="bg-red-600 hover:bg-red-700 transition text-white px-10 py-3 rounded-2xl shadow-lg font-semibold">
                Create Employee
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Add;
