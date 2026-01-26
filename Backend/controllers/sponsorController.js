import Sponsor from "../models/Sponsor.js";
import uploadToImageKit from "../utils/uploadToImageKit.js";

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

    let logo = null;
    if (req.file) {
      logo = await uploadToImageKit(req.file, "sponsors");
    }

    const sponsor = await Sponsor.create({
      name,
      collaboration,
      eventsSponsored: Number(eventsSponsored) || 0,
      reach,
      upcomingEvents,
      logo,
    });

    res.status(201).json({ success: true, sponsor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= GET ALL ================= */
export const getSponsors = async (req, res) => {
  const sponsors = await Sponsor.find().sort({ createdAt: -1 });
  res.json({ success: true, sponsors });
};

/* ================= GET SINGLE ================= */
export const getSponsor = async (req, res) => {
  const sponsor = await Sponsor.findById(req.params.id);
  if (!sponsor)
    return res.status(404).json({ success: false, message: "Sponsor not found" });

  res.json({ success: true, sponsor });
};

/* ================= UPDATE SPONSOR ================= */
export const updateSponsor = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      data.logo = await uploadToImageKit(req.file, "sponsors");
    }

    await Sponsor.findByIdAndUpdate(req.params.id, data);

    res.json({ success: true, message: "Sponsor updated" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= DELETE ================= */
export const deleteSponsor = async (req, res) => {
  await Sponsor.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Sponsor deleted" });
};