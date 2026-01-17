import express from "express";
import {
  addAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  getPublicAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
} from "../controllers/announcementController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authMiddleware, addAnnouncement);
router.get("/public", authMiddleware, getPublicAnnouncements);
router.get("/", authMiddleware, getAnnouncements);
router.get("/:id", authMiddleware, getAnnouncementById);
router.put("/:id", authMiddleware, updateAnnouncement);
router.delete("/:id", authMiddleware, deleteAnnouncement);


export default router;