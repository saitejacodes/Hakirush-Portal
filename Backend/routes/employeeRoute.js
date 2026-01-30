import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

import {
  addEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  editEmployeeProfile,
  deleteEmployee,
  getEmployeesByDepartment,
  getNewEmployees,
  getLeaveBalance,
  getEmployeesByDepartmentId,
} from "../controllers/employeeController.js";

const router = express.Router();

router.use((req, res, next) => {
  console.log("EMPLOYEE ROUTE:", req.method, req.originalUrl);
  next();
});

/* ================= STATIC ROUTES ================= */

router.get("/by-department/me", authMiddleware, getEmployeesByDepartment);
router.get("/department/:id/employees", authMiddleware, getEmployeesByDepartmentId);
router.get("/new/recent", authMiddleware, getNewEmployees);
router.get("/leave/balance/me", authMiddleware, getLeaveBalance);
router.post("/add", authMiddleware, upload.single("profileImage"), addEmployee);
router.put("/update-profile/:id", authMiddleware, upload.single("profileImage"), editEmployeeProfile);
router.put("/:id", authMiddleware, upload.single("profileImage"), updateEmployee);
router.delete("/:id", authMiddleware, deleteEmployee);
router.get("/", authMiddleware, getEmployees);
router.get("/:id", authMiddleware, getEmployee);

export default router;
