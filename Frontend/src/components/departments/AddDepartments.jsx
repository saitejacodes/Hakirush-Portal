import React from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const AddDepartments = () => {
    const [department, setDepartment] = useState({
        dep_name: '',
        description: ''
    })

    const navigate = useNavigate()

    const handleChange = (e) => {
        const {name, value} = e.target;
        setDepartment({...department, [name] : value})
    } 

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post('http://localhost:5000/api/department/add', department, {
                headers: {
                    "Authorization" : `Bearer ${localStorage.getItem('token')}`
                }
            })
            if(response.data.success) {
                navigate("/admin-dashboard/departments")
            }
        } catch (error) {
            if(error.response && !error.response.data.success) {
                alert(error.response.data.error)
            }
        }
    }
  return (
    <div className="max-w-2xl mx-auto mt-12">
            <div className="bg-white rounded-2xl shadow-xl border p-8">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Add Department
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Department Name */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="dep_name" className="text-sm font-medium text-gray-700">Department Name</label>
                        <input
                            name="dep_name"
                            type="text"
                            onChange={handleChange}
                            placeholder="Enter department name"
                            className="border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            onChange={handleChange}
                            placeholder="Enter short description"
                            className="border rounded-xl px-4 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full rounded-xl py-3 font-medium bg-red-600 text-white hover:bg-red-700 active:scale-[.98] transition cursor-pointer"
                        >
                            Add Department
                        </button>
                    </div>
                </form>
            </div>
        </div>
  )
}

export default AddDepartments
