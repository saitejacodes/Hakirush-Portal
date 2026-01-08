import Holiday from "../models/Holiday.js";

export const getUpcomingHolidays = async (req, res) => {
  try {
    const today = new Date();

    const holidays = await Holiday.find({
      date: { $gte: today }
    }).sort({ date: 1 });

    return res.status(200).json({
      success: true,
      holidays
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const addHoliday = async (req, res) => {
  try {
    const { title, date } = req.body;

    const holiday = await Holiday.create({ title, date });

    return res.status(201).json({ success: true, holiday });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findById(id);

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found"
      });
    }

    await Holiday.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Holiday deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};