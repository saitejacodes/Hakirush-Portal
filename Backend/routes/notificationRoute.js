import express from "express";
import Notification from "../models/Notification.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get notifications for current user (admin or employee)
router.get("/", authMiddleware, async (req, res) => {
  try {
    let notifications = [];
    if (req.user.role === "admin") {
      notifications = await Notification.find({ "data.adminId": req.user._id }).sort({ createdAt: -1 });
    } else if (req.user.role === "employee") {
      notifications = await Notification.find({ "data.userId": req.user._id }).sort({ createdAt: -1 });
    }
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark notification as seen
router.patch("/:id/seen", authMiddleware, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ success: false, message: "Not found" });
    notif.seen = true;
    await notif.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
