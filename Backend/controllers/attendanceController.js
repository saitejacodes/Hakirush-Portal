import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import Holiday from "../models/Holiday.js";

/* ================= GET TODAY ATTENDANCE ================= */
const getAttendance = async (req, res) => {
  try {
    const today = new Date();
    const date = today.toISOString().split("T")[0];

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

    const attendance = employees.map(emp => {
      const record = todayAttendance.find(
        a => String(a.employeeId?._id) === String(emp._id)
      );

      if (record) return record;

      return {
        _id: null,
        date,
        status: null,
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

    const now = new Date();
    const date = now.toISOString().split("T")[0];

    if (now.getDay() === 0) {
      return res.status(400).json({
        success: false,
        message: "Attendance cannot be marked on Sunday",
      });
    }

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

/* ================= ATTENDANCE REPORT (FIXED) ================= */
const attendanceReport = async (req, res) => {
  try {
    const { date, search } = req.query;

    const holidays = await Holiday.find();
    const holidayDates = holidays.map(h =>
      new Date(h.date).toISOString().split("T")[0]
    );

    const employees = await Employee.find()
      .populate("userId")
      .populate("department");

    const filter = {};
    if (date) filter.date = date;

    const records = await Attendance.find(filter).populate({
      path: "employeeId",
      populate: ["userId", "department"],
    });

    const groupData = {};

    // 3️⃣ Create date buckets
    records.forEach(r => {
      const d = r.date;
      const day = new Date(d).getDay();

      if (day === 0 || holidayDates.includes(d)) return;

      if (!groupData[d]) groupData[d] = [];
    });

    // 4️⃣ Fill Present / Leave
    records.forEach(r => {
      const d = r.date;
      if (!groupData[d]) return;

      groupData[d].push({
        employeeId: r.employeeId?.employeeId || "N/A",
        employeeName: r.employeeId?.userId?.name || "Unknown",
        departmentName: r.employeeId?.department?.dep_name || "N/A",
        designation: r.employeeId?.designation || "N/A",
        status: r.status || "N/A",
      });
    });

    // 5️⃣ Auto-Absent
    Object.keys(groupData).forEach(d => {
      employees.forEach(emp => {
        const exists = groupData[d].some(
          r => r.employeeId === emp.employeeId
        );

        if (!exists) {
          groupData[d].push({
            employeeId: emp.employeeId || "N/A",
            employeeName: emp.userId?.name || "Unknown",
            departmentName: emp.department?.dep_name || "N/A",
            designation: emp.designation || "N/A",
            status: "Absent",
          });
        }
      });
    });

    // 6️⃣ Search filter
    if (search) {
      Object.keys(groupData).forEach(d => {
        groupData[d] = groupData[d].filter(r =>
          r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
          r.employeeId.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

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

    return res.json({
      success: true,
      attendance: records.map(r => ({ date: r.date, status: r.status })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getAttendance,
  updateAttendance,
  attendanceReport,
  getUserMonthlyAttendance,
};