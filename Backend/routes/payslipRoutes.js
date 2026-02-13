import express from "express";
import multer from "multer";
import {
  addPayslip,
  getPayslipsByEmployee,
} from "../controllers/payslipController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer();

router.post( "/add", authMiddleware, upload.single("payslip"), addPayslip);
router.get( "/employee/:id", authMiddleware, getPayslipsByEmployee );

export default router;