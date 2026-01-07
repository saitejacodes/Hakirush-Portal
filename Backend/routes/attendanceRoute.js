import express from 'express'
import { attendanceReport, getAttendance, getUserMonthlyAttendance, updateAttendance } from '../controllers/attendanceController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import defaultAttendance from '../middleware/defaultAttendance.js'

const router = express.Router()

router.get('/', authMiddleware, defaultAttendance, getAttendance);
router.put('/update/:employeeId', authMiddleware, updateAttendance);
router.get('/report', authMiddleware, attendanceReport);
router.get('/user/:userId/monthly', authMiddleware, getUserMonthlyAttendance);


export default router;