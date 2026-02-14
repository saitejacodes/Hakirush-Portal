import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-fade-in" />
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden animate-pop">
        <div className="h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-2xl mx-auto mb-4 shadow-inner">
            ✓
          </div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Update Successful</h3>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Your personnel records have been updated securely.
          </p>
          <button
            onClick={onClose}
            className="w-full mt-6 py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-lg active:scale-95"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  </>
);

const EditEmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [name, setName] = useState("");
  const [experience, setExperience] = useState("");
  const [dob, setDob] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("/default-avatar.png");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/employee/${id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        const emp = res.data.employee;
        setEmployee(emp);
        setName(emp?.userId?.name || "");
        setExperience(emp?.experience || "");
        setDob(emp?.dob ? emp.dob.split("T")[0] : "");
        setBloodGroup(emp?.bloodGroup || "");
        setMaritalStatus(emp?.maritalStatus || "");
        
        const profileImg = emp?.userId?.profileImage;
        if (profileImg) {
          setPreview(profileImg.startsWith('http') ? profileImg : `${import.meta.env.VITE_BACKEND_URL}/${profileImg}`);
        }
      } catch {
        console.error("Failed to load employee");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert("Image must be under 10MB");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("name", name);
      fd.append("experience", experience);
      fd.append("dob", dob);
      fd.append("bloodGroup", bloodGroup);
      fd.append("maritalStatus", maritalStatus);
      if (image) fd.append("profileImage", image);

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/employee/update-profile/${id}`,
        fd,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setShowAlert(true);
      setTimeout(() => navigate(`/employee-dashboard/profile/${employee._id}`), 2000);
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-red-600 font-black tracking-widest uppercase">Opening Records...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-4 md:p-8">
      {showAlert && <SuccessAlert onClose={() => navigate(`/employee-dashboard/profile/${employee._id}`)} />}
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
            <h3 className="text-3xl md:text-4xl font-extrabold text-red-700 tracking-tight uppercase">Edit Record</h3>
            <button onClick={() => navigate(-1)} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-red-600 transition-colors cursor-pointer">Cancel Changes</button>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
          <div className="h-24 bg-slate-900 w-full" />
          
          <div className="px-6 md:px-12 pb-12">
            {/* PHOTO UPLOAD SECTION */}
            <div className="relative -mt-12 flex flex-col items-center mb-10">
              <div className="group relative w-32 h-32 rounded-[2rem] border-4 border-white bg-white shadow-2xl overflow-hidden ring-1 ring-slate-100">
                <img src={preview} alt="preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Update</span>
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Employee Name"
                className="mt-4 text-2xl font-black text-slate-800 text-center bg-transparent border-b-2 border-transparent focus:border-red-500 outline-none transition-all px-2 pb-1"
              />
              <span className="mt-2 px-3 py-1 rounded-lg bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest border border-red-100">
                {employee.designation}
              </span>
            </div>

            {/* FORM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Identity Details</h4>
                <div className="space-y-3">
                  <StaticItem label="Official ID" value={employee.employeeId} />
                  <StaticItem label="Department" value={employee.department?.dep_name} />
                  <InputItem label="Birth Date" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Personal & Prof.</h4>
                <div className="space-y-3">
                  <SelectItem 
                    label="Blood Group" 
                    value={bloodGroup} 
                    onChange={(e) => setBloodGroup(e.target.value)}
                    options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
                  />
                  <SelectItem 
                    label="Marital Status" 
                    value={maritalStatus} 
                    onChange={(e) => setMaritalStatus(e.target.value)}
                    options={["Single", "Married", "Divorced"]}
                  />
                  <InputItem label="Total Experience (Years)" type="number" value={experience} onChange={(e) => setExperience(e.target.value)} />
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="mt-12 flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-5 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-red-200 hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {saving ? "Processing Records..." : "Save Personnel Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== FORM COMPONENTS ===== */
const StaticItem = ({ label, value }) => (
  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
    <p className="text-sm font-bold text-slate-500 italic">{value || "—"}</p>
  </div>
);

const InputItem = ({ label, ...props }) => (
  <div className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-red-200 focus-within:ring-4 focus-within:ring-red-500/5 focus-within:border-red-500 transition-all">
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
    <input {...props} className="w-full bg-transparent outline-none text-sm font-bold text-slate-800" />
  </div>
);

const SelectItem = ({ label, options, ...props }) => (
  <div className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-red-200 focus-within:ring-4 focus-within:ring-red-500/5 focus-within:border-red-500 transition-all">
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
    <select {...props} className="w-full bg-transparent outline-none text-sm font-bold text-slate-800">
      <option value="">Select Option</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default EditEmployeeProfile;