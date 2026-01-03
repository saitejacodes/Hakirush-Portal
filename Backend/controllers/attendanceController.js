import { response } from 'express'
import Attendance from '../models/Attendance.js'
import Employee from '../models/Employee.js'

const getAttendance = async (req, res) => {
    try {
        const date = new Date().toISOString().split('T')[0]
        Attendance.find({ date })

        const attendance = await Attendance.find({date}).populate({
            path: "employeeId",
            populate: [
                "department",
                "userId"
            ]
        })
        res.status(200).json({success: true, attendance})
    } catch (error) {
        return res.status(500).json({success: false, message: error.message})
    }
}

const updateAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status } = req.body;

    const date = new Date().toISOString().split("T")[0];

    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const attendance = await Attendance.findOneAndUpdate(
      { employeeId: employee._id, date },
      { status },
      { new: true }
    );

    return res.status(200).json({ success: true, attendance });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


const attendanceReport = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const skip = Number(req.query.skip) || 0;

    const filter = {};

    if (req.query.date) {
      filter.date = req.query.date;   // you store date as string
    }

    const data = await Attendance.find(filter)
      .populate({
        path: "employeeId",
        populate: [
          { path: "userId" },
          { path: "department" }
        ],
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

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



export {getAttendance, updateAttendance, attendanceReport}