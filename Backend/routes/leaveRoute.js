import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addLeave,
  getLeave,
  getLeaves,
  getLeaveDetail,
  updateLeave,
  cancelLeave,
  getLeaveBalance,
  getLeaveBalanceByEmployeeId,
} from "../controllers/leaveController.js";

const router = express.Router();

router.post("/add", authMiddleware, addLeave);
router.get("/balance/me", authMiddleware, getLeaveBalance);
router.get("/balance/:employeeId", authMiddleware, getLeaveBalanceByEmployeeId);
router.get("/detail/:id", authMiddleware, getLeaveDetail);
router.get("/:id/:role", authMiddleware, getLeave);
router.get("/", authMiddleware, getLeaves);
router.put("/cancel/:id", authMiddleware, cancelLeave);
router.put("/:id", authMiddleware, updateLeave);


export default router;