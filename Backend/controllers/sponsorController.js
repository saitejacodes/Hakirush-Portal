import Sponsor from "../models/Sponsor.js";

/* ================= ADD SPONSOR ================= */
export const addSponsor = async (req, res) => {
  try {
    const {
      name,
      collaboration,
      eventsSponsored,
      reach,
      upcomingEvents,
    } = req.body;

    const sponsor = await Sponsor.create({
      name,
      collaboration,
      eventsSponsored: Number(eventsSponsored) || 0,
      reach,
      upcomingEvents,
      logo: req.file ? req.file.path : null, // ✅ Cloudinary URL
    });

    res.status(201).json({ success: true, sponsor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= GET ALL SPONSORS ================= */
export const getSponsors = async (req, res) => {
  try {
    const sponsors = await Sponsor.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, sponsors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= GET SINGLE SPONSOR ================= */
export const getSponsor = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    if (!sponsor) {
      return res
        .status(404)
        .json({ success: false, message: "Sponsor not found" });
    }

    res.status(200).json({ success: true, sponsor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= UPDATE SPONSOR ================= */
export const updateSponsor = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      data.logo = req.file.path; // ✅ Cloudinary URL
    }

    await Sponsor.findByIdAndUpdate(req.params.id, data);

    res.status(200).json({ success: true, message: "Sponsor updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= DELETE SPONSOR ================= */
export const deleteSponsor = async (req, res) => {
  try {
    await Sponsor.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Sponsor deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};