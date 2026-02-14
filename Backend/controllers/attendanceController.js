import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import Holiday from "../models/Holiday.js";

/* ================= LOCAL DATE HELPER ================= */
const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/* ================= LOCAL DAY RANGE HELPER ================= */
const getLocalDayRange = (dateString) => {
  const [year, month, day] = dateString.split("-");
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);
  return { start, end };
};

/* ================= HELPER ================= */
const getStatusFromHours = (hours) => {
  if (hours >= 8) return "Present";
  if (hours >= 4) return "Half Day";
  if (hours > 0) return "Absent";
  return "Leave";
};

/* ================= GET TODAY ATTENDANCE (ADMIN) ================= */
const getAttendance = async (req, res) => {
  try {
    const today = new Date();
    const date = getLocalDate();

    if (today.getDay() === 0) {
      return res.json({
        success: true,
        attendance: [],
        isSunday: true,
      });
    }

    const { start, end } = getLocalDayRange(date);

    const holiday = await Holiday.findOne({
      date: { $gte: start, $lte: end },
    });

    if (holiday) {
      return res.json({
        success: true,
        attendance: [],
        isHoliday: true,
        holidayName: holiday.title,
      });
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
        workedHours: 0,
        employeeId: emp,
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

    const date = getLocalDate();

    const attendance = await Attendance.findOneAndUpdate(
      { employeeId, date },
      { employeeId, status, date },
      { upsert: true, new: true }
    ).populate({
      path: "employeeId",
      populate: ["userId", "department"],
    });

    return res.json({ success: true, attendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= CHECK-IN ================= */
const checkIn = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });

    const date = getLocalDate();

    let attendance = await Attendance.findOne({
      employeeId: employee._id,
      date,
    });

    if (attendance?.checkIn) {
      return res.json({ success: true, attendance });
    }

    attendance = await Attendance.findOneAndUpdate(
      { employeeId: employee._id, date },
      {
        $setOnInsert: {
          employeeId: employee._id,
          date,
          totalPausedMs: 0,
        },
        checkIn: new Date(),
        isPaused: false,
      },
      { upsert: true, new: true }
    );

    return res.json({ success: true, attendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= CHECK-OUT ================= */
const checkOut = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });

    const date = getLocalDate();

    const attendance = await Attendance.findOne({
      employeeId: employee._id,
      date,
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ success: false, message: "Check-in required" });
    }

    if (attendance.isPaused) {
      const pausedMs = new Date() - attendance.pauseStartedAt;
      attendance.totalPausedMs += pausedMs;
      attendance.isPaused = false;
      attendance.pauseStartedAt = null;
    }

    attendance.checkOut = new Date();

    const diffMs =
      attendance.checkOut -
      attendance.checkIn -
      (attendance.totalPausedMs || 0);

    const hours = diffMs / (1000 * 60 * 60);

    attendance.workedHours = Number(hours.toFixed(2));
    attendance.status = getStatusFromHours(attendance.workedHours);

    await attendance.save();

    return res.json({ success: true, attendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= PAUSE ================= */
const pauseAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    const date = getLocalDate();

    const attendance = await Attendance.findOne({
      employeeId: employee._id,
      date,
    });

    if (!attendance || attendance.checkOut || attendance.isPaused) {
      return res.json({ success: true, attendance });
    }

    attendance.isPaused = true;
    attendance.pauseStartedAt = new Date();

    await attendance.save();
    return res.json({ success: true, attendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= RESUME ================= */
const resumeAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    const date = getLocalDate();

    const attendance = await Attendance.findOne({
      employeeId: employee._id,
      date,
    });

    if (!attendance || !attendance.isPaused) {
      return res.json({ success: true, attendance });
    }

    const pausedMs = new Date() - attendance.pauseStartedAt;
    attendance.totalPausedMs += pausedMs;
    attendance.pauseStartedAt = null;
    attendance.isPaused = false;

    await attendance.save();
    return res.json({ success: true, attendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= MY TODAY ATTENDANCE ================= */
const getMyTodayAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    const date = getLocalDate();

    const attendance = await Attendance.findOne({
      employeeId: employee._id,
      date,
    });

    return res.json({ success: true, attendance: attendance || null });
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

    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0);
    const end = `${year}-${String(month).padStart(2, "0")}-${String(
      endDate.getDate()
    ).padStart(2, "0")}`;

    const records = await Attendance.find({
      employeeId: employee._id,
      date: { $gte: start, $lte: end },
    });

    return res.json({
      success: true,
      attendance: records.map((r) => ({
        date: r.date,
        status: r.status,
        workedHours: r.workedHours || 0,
      })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ATTENDANCE REPORT ================= */
/* ================= ATTENDANCE REPORT ================= */
const attendanceReport = async (req, res) => {
  try {
    const { date, search } = req.query;

    const filter = {};
    if (date) filter.date = date;

    const records = await Attendance.find(filter).populate({
      path: "employeeId",
      populate: ["userId", "department"],
    });

    /* ================= SEARCH FILTER ================= */
    let filtered = records;

    if (search) {
      const keyword = search.toLowerCase();
      filtered = records.filter((r) => {
        const name = r.employeeId?.userId?.name?.toLowerCase() || "";
        const empCode = r.employeeId?.employeeId?.toLowerCase() || "";
        return name.includes(keyword) || empCode.includes(keyword);
      });
    }

    /* ================= GROUP BY DATE ================= */
    const groupData = {};
    const holidayMap = {};

    for (const record of filtered) {
      const recordDate = record.date;

      if (!groupData[recordDate]) groupData[recordDate] = [];

      groupData[recordDate].push({
        _id: record._id,
        employeeId: record.employeeId?.employeeId || "N/A",
        employeeName: record.employeeId?.userId?.name || "Unknown",
        departmentName: record.employeeId?.department?.dep_name || "N/A",
        status: record.status || null,
        workedHours: record.workedHours || 0,
        checkIn: record.checkIn || null,
        checkOut: record.checkOut || null,
        isPaused: record.isPaused || false,
        pauseStartedAt: record.pauseStartedAt || null,
        totalPausedMs: record.totalPausedMs || 0,
      });
    }

    /* ================= HOLIDAY MAP ================= */
    const holidays = await Holiday.find();

    holidays.forEach((h) => {
      const holidayDate = new Date(h.date).toISOString().split("T")[0];
      holidayMap[holidayDate] = h.title;
    });

    return res.json({
      success: true,
      groupData,
      holidayMap,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ================= EXPORTS ================= */
export {
  getAttendance,
  updateAttendance,
  attendanceReport,
  getUserMonthlyAttendance,
  checkIn,
  checkOut,
  pauseAttendance,
  resumeAttendance,
  getMyTodayAttendance,
};