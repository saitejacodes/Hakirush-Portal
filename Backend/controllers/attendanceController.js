import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import Holiday from "../models/Holiday.js";

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
    const date = today.toISOString().split("T")[0];

    /* ===== ADD ONLY ===== */
    if (today.getDay() === 0) {
      return res.json({
        success: true,
        attendance: [],
        isSunday: true,
      });
    }

    const holiday = await Holiday.findOne({
      date: {
        $gte: new Date(date + "T00:00:00"),
        $lte: new Date(date + "T23:59:59"),
      },
    });

    /* ===== ADD ONLY ===== */
    if (holiday) {
      return res.json({
        success: true,
        attendance: [],
        isHoliday: true,
        holidayName: holiday.title,
      });
    }

    /* ===== EXISTING CODE (UNCHANGED) ===== */
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

    const date = new Date().toISOString().split("T")[0];

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
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    const date = new Date().toISOString().split("T")[0];

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
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    const date = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      employeeId: employee._id,
      date,
    });

    if (!attendance || !attendance.checkIn) {
      return res
        .status(400)
        .json({ success: false, message: "Check-in required" });
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
    const date = new Date().toISOString().split("T")[0];

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
    const date = new Date().toISOString().split("T")[0];

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
    const date = new Date().toISOString().split("T")[0];

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
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const records = await Attendance.find({
      employeeId: employee._id,
      date: {
        $gte: start.toISOString().split("T")[0],
        $lte: end.toISOString().split("T")[0],
      },
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
const attendanceReport = async (req, res) => {
  try {
    const { date, search } = req.query;

    const holidays = await Holiday.find();

    /* ================= EXISTING: holiday map ================= */
    const holidayMap = {};
    const holidayDates = holidays.map((h) => {
      const d = new Date(h.date).toISOString().split("T")[0];
      holidayMap[d] = h.title;
      return d;
    });

    const employees = await Employee.find()
      .populate("userId")
      .populate("department");

    /* ================= FILTER LOGIC (UPDATED – ADD ONLY) ================= */
    const filter = {};

    // ✅ Date filter should ALWAYS apply if selected
    if (date) {
      filter.date = date;
    }

    const records = await Attendance.find(filter).populate({
      path: "employeeId",
      populate: ["userId", "department"],
    });

    const groupData = {};
    const nonWorkingDates = new Set();

    /* ================= ENSURE DATE EXISTS ================= */
    if (date) {
      const day = new Date(`${date}T00:00:00`).getDay();
      if (day === 0 || holidayDates.includes(date)) {
        groupData[date] = [];
        nonWorkingDates.add(date);
      }
    }

    /* ================= FIRST LOOP ================= */
    records.forEach((r) => {
      const d = r.date;
      const day = new Date(`${d}T00:00:00`).getDay();

      if (day === 0 || holidayDates.includes(d)) {
        nonWorkingDates.add(d);
        if (!groupData[d]) groupData[d] = [];
        return;
      }

      if (!groupData[d]) groupData[d] = [];
    });

    /* ================= SECOND LOOP ================= */
    records.forEach((r) => {
      const d = r.date;
      if (!groupData[d]) return;

      groupData[d].push({
        employeeId: r.employeeId?.employeeId || "N/A",
        employeeName: r.employeeId?.userId?.name || "Unknown",
        departmentName: r.employeeId?.department?.dep_name || "N/A",
        designation: r.employeeId?.designation || "N/A",
        status: r.status || "N/A",
        workedHours: r.workedHours || 0,
      });
    });

    /* ================= MARK ABSENT ================= */
    Object.keys(groupData).forEach((d) => {
      if (nonWorkingDates.has(d)) return;

      employees.forEach((emp) => {
        const exists = groupData[d].some(
          (r) => r.employeeId === emp.employeeId
        );

        if (!exists) {
          groupData[d].push({
            employeeId: emp.employeeId || "N/A",
            employeeName: emp.userId?.name || "Unknown",
            departmentName: emp.department?.dep_name || "N/A",
            designation: emp.designation || "N/A",
            status: "Absent",
            workedHours: 0,
          });
        }
      });
    });

    /* ================= SEARCH FILTER (UNCHANGED) ================= */
    if (search) {
      Object.keys(groupData).forEach((d) => {
        groupData[d] = groupData[d].filter(
          (r) =>
            r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
            r.employeeId.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

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
