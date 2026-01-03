import { User } from "lucide-react";
import React from "react";
import { useAuth } from "../../context/authContext";

const EmployeeSummary = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-8 rounded-2xl bg-white/70 backdrop-blur-xl shadow-xl animate-pulse">
        <div className="h-6 bg-gray-200 w-40 rounded mb-4" />
        <div className="h-10 bg-gray-200 w-64 rounded" />
      </div>
    );
  }

  return (
    <div className="relative max-w-2xl mx-auto mt-20 px-8 py-6 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-red-100 hover:border-red-300 transition-all duration-300">

      {/* glow blob */}
      <div className="absolute -top-6 -right-6 w-28 h-28 bg-red-300 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="flex items-center gap-6">
        
        {/* avatar */}
        <div className="w-16 h-16 rounded-2xl shadow-lg bg-gradient-to-br from-red-500 to-red-600 ring-4 ring-red-200 ring-offset-2 flex items-center justify-center text-white text-2xl font-bold">
          {user?.name
            ? user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            : <User size={28} />}
        </div>

        {/* text */}
        <div className="flex flex-col">
          <span className="text-xs tracking-widest text-red-600 font-semibold uppercase">
            Welcome Back
          </span>

          <span className="text-3xl font-extrabold text-gray-900">
            {user?.name || "Employee"}
          </span>

          {user?.role && (
            <span className="text-sm text-gray-600 mt-1">
              {user.role}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeSummary;
