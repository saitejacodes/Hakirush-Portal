import { response } from 'express'
import Attendance from '../models/Attendance.js'
import Employee from '../models/Employee.js'

const getAttendance = async (req, res) => {
  try {
    const date = new Date().toISOString().split("T")[0];

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
    const { employeeId } = req.params;
    const { status } = req.body;

    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const attendance = await Attendance.findOneAndUpdate(
      { employeeId: employee._id, date },
      {
        employeeId: employee._id,
        status,  // 🔥 Title-Case directly ("Present", "Absent", etc.)
        date,
      },
      {
        new: true,
        upsert: true,
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

const attendanceReport = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const skip = Number(req.query.skip) || 0;

    const filter = {};

    if (req.query.date) {
      filter.date = req.query.date;
    }

    if (req.query.search) {
      const search = req.query.search.trim();

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

    const startPrefix = `${year}-${String(month).padStart(2, "0")}-`;

    const employee = await Employee.findOne({ userId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const records = await Attendance.find({
      employeeId: employee._id,
      date: { $regex: `^${startPrefix}` }
    }).sort({ date: 1 });

    return res.status(200).json({
      success: true,
      attendance: records.map(r => ({
        date: r.date,
        status: r.status,   
      })),
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {getAttendance, updateAttendance, attendanceReport, getUserMonthlyAttendance}