import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  User, Calendar, CreditCard, ChevronLeft, 
  Heart, Fingerprint, Droplets, Briefcase, 
  Camera, CheckCircle2, X
} from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

/* ================= PREMIUM SUCCESS ALERT ================= */
const SuccessAlert = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-md z-50 animate-in fade-in duration-300" />
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10 text-center">
          <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            Update Verified
          </h3>
          <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed">
            The personnel database has been synchronized with your new records.
          </p>
          <button
            onClick={onClose}
            className="w-full mt-8 py-5 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest text-[11px] hover:bg-red-500 transition-all shadow-xl active:scale-95 cursor-pointer"
          >
            Return to Profile
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
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
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
          setPreview(
            profileImg.startsWith("http")
              ? profileImg
              : `${import.meta.env.VITE_BACKEND_URL}/${profileImg}`
          );
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
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setShowAlert(true);
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPulse />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 text-slate-900 font-sans p-4 lg:p-12">
      {showAlert && (
        <SuccessAlert
          onClose={() => navigate(`/employee-dashboard/profile/${employee._id}`)}
        />
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10 px-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-1">Configuration</p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Modify <span className="not-italic text-slate-400">Record</span></h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 transition-all shadow-sm cursor-pointer"
          >
            <X size={16} className="group-hover:rotate-90 transition-transform" /> Cancel
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-[3.5rem] p-10 shadow-sm flex flex-col items-center">
              <div className="relative group">
                <div className="w-48 h-48 rounded-[4rem] overflow-hidden ring-8 ring-slate-50 p-1 shadow-inner">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-cover rounded-[3.5rem]"
                  />
                </div>
                <label className="absolute bottom-2 right-2 w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:bg-red-600 transition-all active:scale-90">
                  <Camera size={24} />
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </label>
              </div>

              <div className="mt-8 w-full">
                <InputItem
                  label="Display Name"
                  icon={<User size={14}/>}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                />
              </div>

              <div className="mt-6 p-6 bg-slate-50 rounded-[2rem] w-full border border-slate-100">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Current Role</p>
                <p className="text-sm font-bold text-slate-800 text-center mt-1">{employee?.designation}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[3.5rem] p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-2 border-b border-slate-50 pb-6">
                <div className="p-2.5 bg-red-50 text-red-600 rounded-xl"><Briefcase size={14}/></div>
                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Personnel Data</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StaticItem label="Official Employee ID" value={employee.employeeId} icon={<Fingerprint size={16}/>} />
                <StaticItem label="Primary Department" value={employee.department?.dep_name} icon={<CreditCard size={16}/>} />
                
                <InputItem
                  label="Birth Registry"
                  type="date"
                  icon={<Calendar size={14}/>}
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
                <InputItem
                  label="Experience Years"
                  type="number"
                  icon={<Briefcase size={14}/>}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
                
                <SelectItem
                  label="Marital Registry"
                  icon={<Heart size={14}/>}
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  options={["Single", "Married", "Divorced"]}
                />
                <SelectItem
                  label="Biological Variant"
                  icon={<Droplets size={14}/>}
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
                />
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-[2] py-4 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-slate-200 hover:bg-red-500 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Synchronizing..." : "Authorize & Save Changes"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

/* ===== PREMIUM FORM COMPONENTS ===== */

const StaticItem = ({ label, value, icon }) => (
  <div className="p-4 rounded-[2rem] bg-slate-50/50 border border-slate-100 flex items-start gap-4">
    <div className="text-slate-300 mt-1">{icon}</div>
    <div>
      <p className="text-[6px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-xs font-bold text-slate-500">{value || "—"}</p>
    </div>
  </div>
);

const InputItem = ({ label, icon, ...props }) => (
  <div className="group p-4 rounded-[2rem] bg-white border border-slate-200 focus-within:border-slate-900 focus-within:shadow-xl focus-within:shadow-slate-100 transition-all">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-slate-400 group-focus-within:text-slate-900 transition-colors">{icon}</span>
      <p className="text-[6px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-slate-900">
        {label}
      </p>
    </div>
    <input
      {...props}
      className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 placeholder:text-slate-300"
    />
  </div>
);

const SelectItem = ({ label, icon, options, ...props }) => (
  <div className="group p-6 rounded-[2rem] bg-white border border-slate-200 focus-within:border-slate-900 focus-within:shadow-xl focus-within:shadow-slate-100 transition-all">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-slate-400 group-focus-within:text-slate-900 transition-colors">{icon}</span>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-slate-900">
        {label}
      </p>
    </div>
    <select
      {...props}
      className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 cursor-pointer"
    >
      <option value="">Choose Variant</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const LoadingPulse = () => (
  <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-6">
    <div className="w-16 h-16 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Establishing Secure Session</p>
  </div>
);

export default EditEmployeeProfile;