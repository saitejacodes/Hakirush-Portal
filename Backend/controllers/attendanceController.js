import { response } from 'express'
import Attendance from '../models/Attendance.js'
import Employee from '../models/Employee.js'

const getAttendance = async (req, res) => {
  try {
    const date = new Date().toISOString().split("T")[0];

    // 1) all employees
    const employees = await Employee.find()
      .populate("userId")
      .populate("department");

    // 2) today's attendance
    const todayAttendance = await Attendance.find({ date }).populate({
      path: "employeeId",
      populate: ["userId", "department"],
    });

    // 3) merge employees + attendance
    const attendance = employees.map((emp) => {
      const record = todayAttendance.find(
        (a) => String(a.employeeId?._id) === String(emp._id)
      );

      if (record) return record;

      // virtual record when not marked yet
      return {
        _id: null,
        date,
        status: null,                 // IMPORTANT → so buttons show
        employeeId: emp,              // keep populated structure
        createdAt: null,
        updatedAt: null,
      };
    });

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("GET ATTENDANCE ERROR:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;     // this is EMP001 (not ObjectId)
    const { status } = req.body;

    const date = new Date().toISOString().split("T")[0];

    // find employee by employeeId code
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    // create if not exists, update if exists
    const attendance = await Attendance.findOneAndUpdate(
      { employeeId: employee._id, date },
      {
        employeeId: employee._id,
        status,
        date,
      },
      {
        new: true,
        upsert: true,          // 🔥 IMPORTANT
        setDefaultsOnInsert: true,
      }
    ).populate({
      path: "employeeId",
      populate: ["userId", "department"],
    });

    return res.status(200).json({
      success: true,
      attendance,
      message: "Attendance updated",
    });

  } catch (error) {
    console.error("UPDATE ATTENDANCE ERROR:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

const attendanceReport = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const skip = Number(req.query.skip) || 0;

    const filter = {};

    // date filter (optional)
    if (req.query.date) {
      filter.date = req.query.date;
    }

    // 🔍 search filter
    if (req.query.search) {
  const search = req.query.search.trim();

  // find employees matching ID or NAME
  const employees = await Employee.find().populate("userId");

  const matched = employees.filter(e =>
    e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    e.userId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const employeeIds = matched.map(e => e._id);

  filter.employeeId = { $in: employeeIds };
}

    const data = await Attendance.find(filter)
      .populate({
        path: "employeeId",
        populate: [{ path: "userId" }, { path: "department" }],
      })
      .sort({ date: -1 });

    // group by dates (existing logic kept same)
    const groupData = {};

    data.forEach((item) => {
      const d = item.date;

      if (!groupData[d]) groupData[d] = [];

      groupData[d].push({
        employeeId: item.employeeId?.employeeId || "N/A",
        employeeName: item.employeeId?.userId?.name || "Unknown",
        departmentName: item.employeeId?.department?.dep_name || "N/A",
        status: item.status || "Not Marked",
      });
    });

    return res.json({
      success: true,
      groupData,
    });
  } catch (error) {
    console.error("REPORT ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUserMonthlyAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const employee = await Employee.findOne({ userId });

    const records = await Attendance.find({
      employeeId: employee._id,
      date: {
        $gte: startDate.toISOString().split("T")[0],
        $lte: endDate.toISOString().split("T")[0],
      },
    }).sort({ date: 1 });

    // 👉 ADD HERE
    return res.status(200).json({
      success: true,
      attendance: records.map(r => ({
        date: new Date(r.date).toLocaleDateString("en-CA"),
        status: r.status,
      })),
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



export {getAttendance, updateAttendance, attendanceReport, getUserMonthlyAttendance}