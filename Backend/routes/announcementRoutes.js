import express from "express";
import {
  addAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  getPublicAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  markAsRead,
} from "../controllers/announcementController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// General Routes
router.get("/", authMiddleware, getAnnouncements);
router.get("/public", authMiddleware, getPublicAnnouncements);
router.post("/add", authMiddleware, upload.single("image"), addAnnouncement);

// ID Specific Routes
router.get("/:id", authMiddleware, getAnnouncementById);
router.put("/:id", authMiddleware, upload.single("image"), updateAnnouncement);
router.delete("/:id", authMiddleware, deleteAnnouncement);

// Mark as Read Route
router.put("/:id/read", authMiddleware, markAsRead);

export default router;