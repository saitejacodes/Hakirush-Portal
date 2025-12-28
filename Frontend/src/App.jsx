import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import PrivateRoutes from './utils/PrivateRoutes';
import RoleBaseRoutes from './utils/RoleBaseRoutes';
import AdminSummary from './components/dashboard/AdminSummary';
import DepartmentList from './components/departments/DepartmentList';
import AddDepartments from './components/departments/AddDepartments';
import EditDepartment from './components/departments/EditDepartment';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to="/admin-dashboard" />}/>
        <Route path='/login' element={<Login />}/>
       <Route path="/admin-dashboard" element={
           <PrivateRoutes>
             <RoleBaseRoutes requiredRole={["admin"]}>
               <AdminDashboard />
             </RoleBaseRoutes>
           </PrivateRoutes>
         }
       >
         <Route index element={<AdminSummary />} />
         <Route path="/admin-dashboard/departments" element={<DepartmentList />} />
         <Route path="/admin-dashboard/add-department" element={<AddDepartments />} />
         <Route path="/admin-dashboard/department/:id" element={<EditDepartment />} />
       </Route>
        <Route path='/employee-dashboard' element={<EmployeeDashboard />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
