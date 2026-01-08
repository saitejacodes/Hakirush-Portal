import Sponsor from "../models/Sponsor.js";
import multer from "multer";
import path from "path";

/* ================= MULTER ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

export const upload = multer({ storage });

/* ================= ADD ================= */
export const addSponsor = async (req, res) => {
  try {
    const { name, collaboration, eventsSponsored, reach, upcomingEvents } = req.body;

    const sponsor = await Sponsor.create({
      name,
      collaboration,
      eventsSponsored: Number(eventsSponsored) || 0,
      reach,
      upcomingEvents,
      logo: req.file?.filename || ""
    });

    res.status(201).json({ success: true, sponsor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= GET ALL ================= */
export const getSponsors = async (req, res) => {
  try {
    const sponsors = await Sponsor.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, sponsors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= GET ONE ================= */
export const getSponsor = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    if (!sponsor)
      return res.status(404).json({ success: false, message: "Sponsor not found" });

    res.status(200).json({ success: true, sponsor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= UPDATE ================= */
export const updateSponsor = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.logo = req.file.filename;

    await Sponsor.findByIdAndUpdate(req.params.id, data);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= DELETE ================= */
export const deleteSponsor = async (req, res) => {
  try {
    await Sponsor.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};