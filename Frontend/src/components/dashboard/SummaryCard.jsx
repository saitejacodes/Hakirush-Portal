import React from "react"

const SummaryCard = ({ icon, text, number }) => {
  return (
    <div className="flex items-center gap-5bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border p-6 hover:bg-red-50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      {/* Icon */}
      <div className="mr-5 w-14 h-14 flex items-center justify-center text-white text-3xl rounded-2xl shadow-md bg-gradient-to-br from-red-500 to-red-600 ring-4 ring-red-200 ring-offset-2">
        {icon}
      </div>
      {/* Text */}
      <div className="flex flex-col">
        <p className="text-sm font-semibold tracking-wide text-red-600 uppercase">
          {text}
        </p>

        <p className="text-4xl font-extrabold text-gray-900 leading-tight">
          {number}
        </p>
      </div>
    </div>
  )
}

export default SummaryCard
