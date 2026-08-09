import express from "express";
import {
  createAttendanceRequest,
  getMyAttendanceRequests,
  getAllAttendanceRequests,
  deleteAttendanceRequest,
  reviewAttendanceRequest,
} from "../controllers/attendanceRequestController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createAttendanceRequest);
router.get("/me", authMiddleware, getMyAttendanceRequests);
router.get("/", authMiddleware, getAllAttendanceRequests);
router.delete("/:requestId", authMiddleware, deleteAttendanceRequest);  
router.put("/:requestId/review", authMiddleware, reviewAttendanceRequest);

export default router;