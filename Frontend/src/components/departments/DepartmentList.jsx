import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import { columns, DepartmentButtons } from '../../utils/DepartmentHelper'
import axios from 'axios'
import { useState } from 'react'


const DepartmentList = () => {
  const [departments, setDepartments] = useState([])
  const [depLoading, setDepLoading] = useState(false)

  useEffect(() => {
     const fetchDepartments = async () => {
       setDepLoading(true)
       try {
          const response = await axios.get('http://localhost:5000/api/department', {
             headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
             }
          })
          if(response.data.success) {
            let sno = 1;
              const data = await response.data.departments.map((dep) => (
                 {
                   _id: dep._id,
                   sno: sno++,
                   dep_name: dep.dep_name,
                   action: <DepartmentButtons _id={dep._d} />
                 }
              ))
              setDepartments(data)
          }
       } catch (error) {
          if(error.response && !error.response.data.success) {
              alert(error.response.data.error)
          }
       } finally {
          setDepLoading(false)
       }
     }
     fetchDepartments();
  }, [])
  return (
    <>{depLoading ? <div>Loading...</div> : 
    <div>
      <div>
        <h2 className="text-center py-10 text-3xl font-semibold text-red-600">Manage Departments</h2>
      </div>
        <div className="px-20 flex items-center justify-between">
          <input type="text" placeholder="Search Department" className="bg-gray-200 py-2 px-5 rounded-lg text-md" />
          <Link to="/admin-dashboard/add-department" className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-400">New Department</Link>
        </div>
        <div className='mt-5'>
           <DataTable columns={columns} data={departments} />
        </div>
    </div>  
  }</>
  )
}

export default DepartmentList
