import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import {
  addEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByDepartment,
  getNewEmployees,
  getLeaveBalance,
} from "../controllers/employeeController.js";

const router = express.Router();

router.get("/by-department/me", authMiddleware, getEmployeesByDepartment);
router.get("/new/recent", authMiddleware, getNewEmployees);
router.get("/leave/balance/me", authMiddleware, getLeaveBalance);

router.get("/", authMiddleware, getEmployees);
router.post("/add", authMiddleware, upload.single("image"), addEmployee);
router.get("/:id", authMiddleware, getEmployee);
router.put("/:id", authMiddleware, upload.single("image"), updateEmployee);
router.delete("/:id", authMiddleware, deleteEmployee);

export default router;