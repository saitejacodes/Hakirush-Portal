import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import Holiday from "../models/Holiday.js";

/* ================= GET TODAY ATTENDANCE ================= */
const getAttendance = async (req, res) => {
  try {
    const today = new Date();
    const date = today.toISOString().split("T")[0];

    // 🚫 If Sunday or Holiday → return empty attendance
    if (today.getDay() === 0) {
      return res.json({ success: true, attendance: [] });
    }

    const holiday = await Holiday.findOne({
      date: {
        $gte: new Date(date + "T00:00:00"),
        $lte: new Date(date + "T23:59:59"),
      },
    });

    if (holiday) {
      return res.json({ success: true, attendance: [] });
    }

    const employees = await Employee.find()
      .populate("userId")
      .populate("department");

    const todayAttendance = await Attendance.find({ date }).populate({
      path: "employeeId",
      populate: ["userId", "department"],
    });

    const attendance = employees.map((emp) => {
      const record = todayAttendance.find(
        (a) => String(a.employeeId?._id) === String(emp._id)
      );

      if (record) return record;

      return {
        _id: null,
        date,
        status: null,
        employeeId: emp,
        createdAt: null,
        updatedAt: null,
      };
    });

    return res.json({ success: true, attendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= UPDATE ATTENDANCE ================= */
const updateAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status } = req.body;

    const now = new Date();
    const date = now.toISOString().split("T")[0];

    // 🚫 Block Sunday
    if (now.getDay() === 0) {
      return res.status(400).json({
        success: false,
        message: "Attendance cannot be marked on Sunday",
      });
    }

    // 🚫 Block Holiday
    const holiday = await Holiday.findOne({
      date: {
        $gte: new Date(date + "T00:00:00"),
        $lte: new Date(date + "T23:59:59"),
      },
    });

    if (holiday) {
      return res.status(400).json({
        success: false,
        message: `Today is Holiday (${holiday.title})`,
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });

    const attendance = await Attendance.findOneAndUpdate(
      { employeeId: employee._id, date },
      { employeeId: employee._id, status, date },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate({
      path: "employeeId",
      populate: ["userId", "department"],
    });

    return res.json({ success: true, attendance, message: "Attendance updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= REPORT ================= */
const attendanceReport = async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = req.query.date;

    const holidays = await Holiday.find();
    const holidayDates = holidays.map(h =>
      new Date(h.date).toISOString().split("T")[0]
    );

    const data = await Attendance.find(filter)
      .populate({ path: "employeeId", populate: ["userId", "department"] })
      .sort({ date: -1 });

    const groupData = {};

    data.forEach(item => {
      const d = item.date;
      const day = new Date(d).getDay();

      if (day === 0 || holidayDates.includes(d)) return; // ❌ skip Sunday & Holiday

      if (!groupData[d]) groupData[d] = [];

      groupData[d].push({
        employeeId: item.employeeId?.employeeId || "N/A",
        employeeName: item.employeeId?.userId?.name || "Unknown",
        departmentName: item.employeeId?.department?.dep_name || "N/A",
        status: item.status || "Not Marked",
      });
    });

    return res.json({ success: true, groupData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= MONTHLY USER CALENDAR ================= */
const getUserMonthlyAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;

    const employee = await Employee.findOne({ userId });
    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const records = await Attendance.find({
      employeeId: employee._id,
      date: {
        $gte: start.toISOString().split("T")[0],
        $lte: end.toISOString().split("T")[0],
      },
    });

    const holidays = await Holiday.find({ date: { $gte: start, $lte: end } });
    const holidayDates = holidays.map(h =>
      new Date(h.date).toISOString().split("T")[0]
    );

    const clean = records.filter(r => {
      const day = new Date(r.date).getDay();
      return day !== 0 && !holidayDates.includes(r.date);
    });

    return res.json({
      success: true,
      attendance: clean.map(r => ({ date: r.date, status: r.status })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getAttendance,
  updateAttendance,
  attendanceReport,
  getUserMonthlyAttendance
};
