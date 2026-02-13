import express from "express";
import {
  attendanceReport,
  getAttendance,
  getUserMonthlyAttendance,
  updateAttendance,
  checkIn,
  checkOut,
  pauseAttendance,
  resumeAttendance,
  getMyTodayAttendance,
} from "../controllers/attendanceController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import defaultAttendance from "../middleware/defaultAttendance.js";

const router = express.Router();

router.get("/", authMiddleware, defaultAttendance, getAttendance);
router.put("/update/:employeeId", authMiddleware, updateAttendance);

router.post("/check-in", authMiddleware, checkIn);
router.post("/check-out", authMiddleware, checkOut);

/* 🔥 PAUSE / RESUME */
router.post("/pause", authMiddleware, pauseAttendance);
router.post("/resume", authMiddleware, resumeAttendance);

router.get("/today/me", authMiddleware, getMyTodayAttendance);
router.get("/report", authMiddleware, attendanceReport);
router.get("/user/:userId/monthly", authMiddleware, getUserMonthlyAttendance);

export default router;
