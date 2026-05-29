import React, { useState } from "react";
import { Trash2, User, Shirt, PlusCircle, ShieldCheck } from "lucide-react";

const ClientRelationship = () => {
  // Local state management for form data and list elements
  const [employees, setEmployees] = useState([
   
  ]);
  
  const [formData, setFormData] = useState({
    name: "",
    jerseySize: ""
  });

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.jerseySize) return;

    const newEmployee = {
      id: Date.now(),
      name: formData.name.trim(),
      jerseySize: formData.jerseySize,
      registrationTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setEmployees((prev) => [newEmployee, ...prev]);
    setFormData({ name: "", jerseySize: "" }); // Reset fields
  };

  // Handle Data Deletion
  const handleDelete = (id) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 text-slate-900 font-sans p-6 lg:p-16 selection:bg-red-100">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* TITLE HEADER */}
        <div className="border-l-8 border-red-600 pl-8">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
            Roster & Apparel<br/><span className="text-red-600 text-5xl">Management</span>
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] mt-3">Personnel Unit Allocation</p>
        </div>

        {/* REGISTRATION FORM CARD */}
        <div className="bg-white/80 backdrop-blur-2xl border border-slate-100 p-8 rounded-[2.5rem] shadow-[0_8px_32px_rgba(220,38,38,0.04)]">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            
            {/* Input Name */}
            <div className="space-y-2">
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Employee Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none focus:border-red-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Selector Size */}
            <div className="space-y-2">
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Event Type</label>
              <div className="relative">
                <Shirt size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  name="jerseySize"
                  value={formData.jerseySize}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-black text-slate-700 focus:outline-none focus:border-red-400 focus:bg-white transition-all appearance-none uppercase italic"
                >
                  <option value="" disabled hidden>Select Size</option>
                  <option value="XS">XS - Extra Small</option>
                  <option value="S">S - Small</option>
                  <option value="M">M - Medium</option>
                  <option value="L">L - Large</option>
                  <option value="XL">XL - Extra Large</option>
                  <option value="XXL">XXL - Double Large</option>
                </select>
              </div>
              <div className="relative">
                <Shirt size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  name="jerseySize"
                  value={formData.jerseySize}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-black text-slate-700 focus:outline-none focus:border-red-400 focus:bg-white transition-all appearance-none uppercase italic"
                >
                  <option value="" disabled hidden>Select Size</option>
                  <option value="XS">XS - Extra Small</option>
                  <option value="S">S - Small</option>
                  <option value="M">M - Medium</option>
                  <option value="L">L - Large</option>
                  <option value="XL">XL - Extra Large</option>
                  <option value="XXL">XXL - Double Large</option>
                </select>
              </div>
            </div>

            {/* Action Submit */}
            <button
              type="submit"
              className="w-full bg-slate-950 hover:bg-red-600 text-white rounded-2xl py-3.5 px-6 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-red-600/20 active:scale-[0.98]"
            >
              <PlusCircle size={16} />
              Deploy to Roster
            </button>
          </form>
        </div>

        {/* DATA VISUALIZATION TABLE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Allocated Profiles ({employees.length})</span>
          </div>

          <div className="overflow-hidden bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="py-5 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee Profile</th>
                    <th className="py-5 px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Jersey Fit</th>
                    <th className="py-5 px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Timestamp</th>
                    <th className="py-5 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center">
                        <ShieldCheck size={32} className="mx-auto text-slate-200 mb-2" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Personnel Enrolled Currently</p>
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-red-50/10 transition-colors group">
                        <td className="py-5 px-8">
                          <span className="text-md font-black text-slate-800 uppercase italic tracking-tight group-hover:text-red-600 transition-colors">
                            {emp.name}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-center">
                          <span className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-black italic text-slate-700 tracking-wide border border-slate-200/40">
                            {emp.jerseySize}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-center text-xs font-bold text-slate-400">
                          {emp.registrationTime}
                        </td>
                        <td className="py-5 px-8 text-right">
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Remove Employee"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClientRelationship; 
