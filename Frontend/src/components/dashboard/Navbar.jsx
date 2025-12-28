import React from "react"
import { useAuth } from "../../context/authContext"

const Navbar = () => {
  const { user } = useAuth()

  return (
    <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl px-10 py-4 shadow-md">
      
      <p className="text-xl font-bold">
        Welcome, <span className="text-red-600">{user?.name}</span>
      </p>

      <div className="flex items-center gap-5">
        <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center font-bold text-red-700 uppercase">
          {user?.name?.[0] || "U"}
        </div>

        <button
          className="px-6 py-2 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-400 transition-all shadow"
        >
          Logout
        </button>
      </div>

    </div>
  )
}

export default Navbar
