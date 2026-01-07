import axios from "axios"
import React, { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "../../context/authContext"

const EmployeeLeaveList = () => {
  const [leaves, setLeaves] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const { id } = useParams()
  const { user } = useAuth()

  const formatDate = (value) => {
    if (!value) return "—"

    // handle DD-MM-YYYY input
    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      const [d, m, y] = value.split("-")
      value = `${y}-${m}-${d}`
    }

    const d = new Date(value)
    if (isNaN(d)) return "—"

    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const fetchLeaves = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/leave/${id}/${user.role}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )

      if (response.data.success) {
        setLeaves(response.data.leaves || [])
      }
    } catch (error) {
      console.log(error)
      alert("Failed to fetch leaves")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredLeaves = leaves.filter((l) =>
    l.leaveType?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusClass = (status) => {
  if (!status) return "bg-gray-100 text-gray-700"

  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-700"
    case "approved":
      return "bg-green-100 text-green-700"
    case "rejected":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h3 className="text-4xl font-extrabold text-red-700">
            My Leave Requests
          </h3>
          <p className="text-gray-500 mt-2">
            Track your applied leaves and their status
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border rounded-2xl shadow-xl p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <input
              type="text"
              placeholder="Search by leave type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-1/2 rounded-xl border px-4 py-2.5 outline-none
                focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
            />

            {user.role === "employee" && (
              <Link
                to="/employee-dashboard/add-leave"
                className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white shadow-md 
                hover:bg-red-700 hover:shadow-lg transition"
              >
                + Apply Leave
              </Link>
            )}
          </div>

          {loading ? (
            <p className="text-center py-6 text-gray-500">Loading...</p>
          ) : filteredLeaves.length === 0 ? (
            <p className="text-center py-6 text-gray-500">
              No leave records found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-red-600 text-white">
                    <th className="px-4 py-3">S.No</th>
                    <th className="px-4 py-3">Leave Type</th>
                    <th className="px-4 py-3">From</th>
                    <th className="px-4 py-3">To</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Applied On</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLeaves.map((leave, index) => (
                    <tr
                      key={leave._id}
                      className="border-b hover:bg-red-50 transition"
                    >
                      <td className="px-4 py-3 text-center">{index + 1}</td>

                      <td className="px-4 py-3 font-semibold text-center">
                        {leave.leaveType}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {formatDate(leave.startDate)}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {formatDate(leave.endDate)}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {leave.reason || "—"}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {formatDate(
                          leave.appliedDate || leave.appliedOn || leave.createdAt
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(
                            leave.status
                          )}`}
                        >
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeeLeaveList
