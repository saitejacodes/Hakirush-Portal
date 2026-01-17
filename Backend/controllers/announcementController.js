import Announcement from "../models/Announcement.js";


export const addAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const announcement = await Announcement.create(req.body);

    res.status(201).json({
      success: true,
      message: "Announcement added",
      announcement,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE
export const deleteAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Announcement deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      status: { $ne: "Completed" }, // optional
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      announcements,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.json({
      success: true,
      announcement,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.json({
      success: true,
      message: "Announcement updated",
      announcement: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};