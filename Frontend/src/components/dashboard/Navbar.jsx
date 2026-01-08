import React, { useEffect, useState } from "react"
import { useAuth } from "../../context/authContext"
import { LayoutDashboard } from "lucide-react"

const Navbar = () => {
  const { user, logout } = useAuth()
  const [small, setSmall] = useState(false)

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.png"
    if (imagePath.startsWith("http")) return imagePath
    if (imagePath.startsWith("/")) return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`
    if (imagePath.startsWith("uploads/")) return `${import.meta.env.VITE_BACKEND_URL}/${imagePath}`
    return `${import.meta.env.VITE_BACKEND_URL}/uploads/${imagePath}`
  }

  // 👇 shrink navbar on scroll
  useEffect(() => {
    const onScroll = () => setSmall(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      className={"sticky top-0 z-50 flex items-center justify-between backdrop-blur-xl shadow-md transition-all py-4 px-6 bg-white/90"}>
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <p className="text-xl font-bold">
            Welcome, <span className="text-red-800">{user?.name || "User"}</span>
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* Avatar always visible */}
        {user?.profileImage ? (
          <img
            src={getImageUrl(user.profileImage)}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover shadow"
            onError={(e) => (e.target.src = "/default-avatar.png")}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center font-bold text-red-800 uppercase">
            {user?.name?.[0] || "U"}
          </div>
        )}

        {/* Logout text becomes icon when minimized */}
        <button
          onClick={logout}
          className={`
            font-semibold rounded-xl transition-all shadow cursor-pointer
            ${small
              ? "p-2 bg-red-800 text-white"
              : "px-6 py-2 bg-red-800 text-white hover:bg-red-600"}
          `}
        >
          {small ? "⏻" : "Logout"}
        </button>
      </div>
    </div>
  )
}

export default Navbar
