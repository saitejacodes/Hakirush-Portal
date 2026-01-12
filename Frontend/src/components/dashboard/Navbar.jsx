import React, { useEffect, useState } from "react"
import { Menu, LogOut } from "lucide-react"
import { useAuth } from "../../context/authContext"
import { useSidebar } from "../../context/sidebarContext"

const Navbar = () => {
  const { user, logout } = useAuth()
  const { setOpen } = useSidebar()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const getImageUrl = (imagePath) => {
  if (!imagePath) return "/default-avatar.png"

  // Already a full URL
  if (imagePath.startsWith("http")) return imagePath

  // Absolute path from backend
  if (imagePath.startsWith("/")) {
    return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`
  }

  // Stored as uploads/filename
  if (imagePath.startsWith("uploads/")) {
    return `${import.meta.env.VITE_BACKEND_URL}/${imagePath}`
  }

  // Fallback
  return `${import.meta.env.VITE_BACKEND_URL}/uploads/${imagePath}`
}

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300
        ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-md" : "bg-white"}
      `}
    >
      <div className="flex items-center justify-between px-4 py-3">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100"
          >
            <Menu />
          </button>

          <h1 className="text-lg font-bold text-gray-800 hidden sm:block">
            Welcome, <span className="text-red-700">{user?.name}</span>
          </h1>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
<div className="flex items-center gap-2">
  {user?.profileImage ? (
    <img
      src={getImageUrl(user.profileImage)}
      alt="profile"
      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-red-500 shadow"
    />
  ) : (
    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold shadow">
      {user?.name?.[0]?.toUpperCase()}
    </div>
  )}
</div>

          {/* Logout */}
          <button
  onClick={logout}
  className="
    flex items-center justify-center gap-2
    p-2 sm:px-4 sm:py-2
    rounded-full
    bg-red-600 text-white
    hover:bg-red-700
    transition
    min-w-[40px]
  "
  aria-label="Logout"
>
  <LogOut size={18} />
  <span className="hidden sm:inline font-semibold">Logout</span>
</button>

        </div>
      </div>
    </header>
  )
}

export default Navbar