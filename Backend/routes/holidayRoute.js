import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getUpcomingHolidays, addHoliday, deleteHoliday } from "../controllers/holidayController.js";

const router = express.Router();

router.get("/upcoming", authMiddleware, getUpcomingHolidays);
router.post("/add", authMiddleware, addHoliday); 
router.delete("/:id", authMiddleware, deleteHoliday);

export default router;