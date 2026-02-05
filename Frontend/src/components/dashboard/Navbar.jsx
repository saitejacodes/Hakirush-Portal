import React, { useEffect, useState } from "react";
import { Menu, LogOut, X, Mail, User } from "lucide-react";
import { useAuth } from "../../context/authContext";
import { useSidebar } from "../../context/sidebarContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { setOpen } = useSidebar();
  const [scrolled, setScrolled] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    console.log("LOGGED IN USER 👉", user);
  }, [user]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png";

    if (imagePath.startsWith("http")) return imagePath;

    const baseUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");

    if (imagePath.startsWith("/")) {
      return `${baseUrl}${imagePath}`;
    }

    return `${baseUrl}/${imagePath}`;
  };

  const getUserImage = (user) => {
    if (!user) return null;

    return (
      user.profileImage ||  
      user.clientImage ||    
      user.image ||          
      user.logo ||           
      user.avatar ||         
      null
    );
  };

  const getDisplayRole = (role) => {
    if (!role) return "User";

    switch (role.toLowerCase()) {
      case "admin":
        return "Admin";
      case "employee":
        return "Employee";
      case "client":
        return "Client";
      default:
        return role;
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300
          ${
            scrolled
              ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-red-100"
              : "bg-white"
          }
        `}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">

          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-red-50 transition"
            >
              <Menu className="text-red-600" />
            </button>

            <h1 className="hidden sm:block text-lg font-bold text-gray-800">
              Welcome,&nbsp;
              <span className="text-red-700">{user?.name}</span>
            </h1>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 sm:gap-4">

            {/* Avatar */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowAvatar(true)}
            >
              {getUserImage(user) ? (
                <img
                  src={getImageUrl(getUserImage(user))}
                  alt="profile"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-red-500 shadow-sm"
                />
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold shadow-sm">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all shadow-sm"
              aria-label="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline font-semibold cursor-pointer">
                Logout
              </span>
            </button>

          </div>
        </div>
      </header>

      {/* 🌟 PROFILE MODAL */}
      {showAvatar && (
        <div
          className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-md flex items-center justify-center"
          onClick={() => setShowAvatar(false)}
        >
          <div
            className="relative w-[90%] max-w-md bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setShowAvatar(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-600 cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Avatar */}
            <div className="flex justify-center">
              <div className="p-1 rounded-full bg-gradient-to-tr from-red-500 to-red-700 shadow-lg">
                {getUserImage(user) ? (
                  <img
                    src={getImageUrl(getUserImage(user))}
                    alt="profile-large"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-5xl font-bold border-4 border-white">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="mt-5 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                {user?.name}
              </h2>
              <p className="text-gray-600 text-sm">
                {getDisplayRole(user?.role)}
              </p>
            </div>

            {/* Details */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
                <User size={18} className="text-red-600" />
                <span className="text-gray-700 text-sm">
                  {user?.name}
                </span>
              </div>

              {user?.email && (
                <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
                  <Mail size={18} className="text-red-600" />
                  <span className="text-gray-700 text-sm">
                    {user.email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animation */}
      <style>
        {`
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-scaleIn {
            animation: scaleIn 0.25s ease-out;
          }
        `}
      </style>
    </>
  );
};

export default Navbar;