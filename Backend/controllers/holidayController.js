import Holiday from "../models/Holiday.js";

const formatToLocalYMD = (dateInput) => {
    const d = new Date(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const addHoliday = async (req, res) => {
  try {
    const { title, date } = req.body;
    const holiday = await Holiday.create({ title, date });
    return res.status(201).json({ success: true, holiday });
  } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
};

const deleteHoliday = async (req, res) => {
  try {
    await Holiday.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Holiday deleted successfully" });
  } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
};

const getAllHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    const todayStr = formatToLocalYMD(new Date());

    const holidaysWithStatus = holidays.map(h => {
      const hDateStr = formatToLocalYMD(h.date);
      return {
        ...h._doc,
        status: hDateStr < todayStr ? "Past" : "Upcoming"
      };
    });

    return res.status(200).json({ success: true, holidays: holidaysWithStatus });
  } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
};

const getUpcomingHolidays = async (req, res) => {
  try {
    const todayStr = formatToLocalYMD(new Date());
    const holidays = await Holiday.find({ date: { $gte: new Date(todayStr) } }).sort({ date: 1 });
    return res.status(200).json({ success: true, holidays });
  } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
};

export {
  addHoliday,
  deleteHoliday,
  getAllHolidays,
  getUpcomingHolidays,
}