import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getUpcomingHolidays, addHoliday, deleteHoliday, getAllHolidays } from "../controllers/holidayController.js";

const router = express.Router();

router.get("/upcoming", authMiddleware, getUpcomingHolidays);
router.post("/add", authMiddleware, addHoliday); 
router.delete("/:id", authMiddleware, deleteHoliday);
router.get("/all", authMiddleware, getAllHolidays);

export default router;