import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { addEmployee, upload, getEmployees, getEmployee, updateEmployee, deleteEmployee, getEmployeesByDepartment, getNewEmployees, getLeaveBalance } from '../controllers/employeeController.js'


const router = express.Router()

router.get('/', authMiddleware, getEmployees)
router.post('/add', authMiddleware, upload.single("image"), addEmployee)
router.get('/:id', authMiddleware, getEmployee)
router.put('/:id', authMiddleware, upload.single("image"), updateEmployee)
router.delete('/:id', authMiddleware, deleteEmployee);
router.get("/by-department/me", authMiddleware, getEmployeesByDepartment);
router.get("/new/recent", authMiddleware, getNewEmployees);
router.get("/leave/balance/me", authMiddleware, getLeaveBalance);


export default router;