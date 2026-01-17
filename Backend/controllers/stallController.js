import Stall from "../models/Stall.js";

export const addStall = async (req, res) => {
  try {
    const stall = await Stall.create(req.body);
    res.status(201).json({ success: true, stall });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStalls = async (req, res) => {
  try {
    const stalls = await Stall.find().populate("eventId", "eventName");
    res.json({ success: true, stalls });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStall = async (req, res) => {
  const stall = await Stall.findById(req.params.id).populate("eventId");
  res.json({ success: true, stall });
};

export const updateStall = async (req, res) => {
  await Stall.findByIdAndUpdate(req.params.id, req.body);
  res.json({ success: true });
};

export const deleteStall = async (req, res) => {
  await Stall.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};