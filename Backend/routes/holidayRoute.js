import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getUpcomingHolidays, addHoliday } from "../controllers/holidayController.js";

const router = express.Router();

router.get("/upcoming", authMiddleware, getUpcomingHolidays);
router.post("/add", authMiddleware, addHoliday); // optional

export default router;