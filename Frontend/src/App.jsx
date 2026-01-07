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
import EmplyeeList from './components/employee/EmployeeList';
import EmplyeeAdd from './components/employee/EmployeeAdd';
import EmplyeeView from './components/employee/EmployeeView';
import EmplyeeEdit from './components/employee/EmployeeEdit';
import ClientList from './components/client/ClinetList'
import ClientAdd from './components/client/ClientAdd'
import ViewClient from './components/client/ClientView';
import EmpolyeeSummary from './components/EmpolyeeDashboard/EmployeeSummary'
import EmployeeLeaveList from './components/leave/EmployeeLeaveList';
import EmployeeLeaveAdd from './components/leave/EmployeeLeaveAdd';
import EmployeeSetting from './components/EmpolyeeDashboard/EmployeeSetting';
import AdminLeaveTable from './components/leave/AdminLeaveTable';
import LeaveDetails from './components/leave/LeaveDetails';
import AdminAttendence from './components/attendance/AdminAttendance';
import AdminAttendenceReport from './components/attendance/AdminAttendanceReport';
import ClientEdit from './components/client/ClientEdit';
import ClientDashboard from './pages/ClientDashboard';
import ClientSummary from './components/ClientDashboard/ClientSummary'
import Unauthorized from "./pages/Unauthorized";
import HolidaysList from "./components/holidays/HolidayList"
import AddHoliday from './components/holidays/AddHolidays';
import ClientRelationship from './components/ClientDashboard/ClientRelationship';
import ForgotPassword from './pages/ForgotPassword';



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
         <Route path="/admin-dashboard/department/:id" element={<EditDepartment />} />
         <Route path='/admin-dashboard/employees' element={<EmplyeeList />}/>
         <Route path='/admin-dashboard/add-employee' element={<EmplyeeAdd />} />
         <Route path='/admin-dashboard/employees/:id' element={<EmplyeeView />}/>
         <Route path='/admin-dashboard/employees/edit/:id' element={<EmplyeeEdit />}/>
         <Route path='/admin-dashboard/clients' element={<ClientList />}/>
         <Route path='/admin-dashboard/add-client' element={<ClientAdd />} />
         <Route path='/admin-dashboard/clients/:id' element={<ViewClient />}/>
         <Route path='/admin-dashboard/clients/edit/:id' element={<ClientEdit />}/>
         <Route path='/admin-dashboard/leaves' element={<AdminLeaveTable />}/>
         <Route path='/admin-dashboard/attendance' element={<AdminAttendence />} />
         <Route path='/admin-dashboard/attendance-report' element={<AdminAttendenceReport />} />
         <Route path='/admin-dashboard/leaves/:id' element={<LeaveDetails />}/>
         <Route path='/admin-dashboard/employees/leaves/:id' element={<EmployeeLeaveList />}/>
         <Route path='/admin-dashboard/attendance' element={<AdminAttendence />} />
         <Route path='/admin-dashboard/holidays' element={<HolidaysList />} />
         <Route path='/admin-dashboard/add-holiday' element={<AddHoliday />} />
       </Route>
       <Route path='/employee-dashboard' 
          element={
          <PrivateRoutes>
            <RoleBaseRoutes requiredRole={["admin","employee"]}>
              <EmployeeDashboard />
            </RoleBaseRoutes>
          </PrivateRoutes>
        } >
          <Route index element={<EmpolyeeSummary />} />
          <Route path='/employee-dashboard/profile/:id' element={<EmplyeeView />} />
          <Route path='/employee-dashboard/leaves/:id' element={<EmployeeLeaveList />} />
          <Route path='/employee-dashboard/add-leave' element={<EmployeeLeaveAdd />} />
          <Route path='/employee-dashboard/setting' element={<EmployeeSetting />} />
        </Route>
        <Route path='/client-dashboard'
          element={
            <PrivateRoutes>
            <RoleBaseRoutes requiredRole={["client"]}>
              <ClientDashboard />
            </RoleBaseRoutes>
          </PrivateRoutes>
          }>
            <Route index element={<ClientSummary />} />
            <Route path='/client-dashboard/ourrelationship/:id' element={<ClientRelationship />}/>
            <Route path='/client-dashboard/setting' element={<EmployeeSetting />} />
        </Route>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
