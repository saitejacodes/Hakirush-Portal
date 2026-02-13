import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";
import Holiday from "../models/Holiday.js";

/* ================= HELPER: CALCULATE WORK DAYS ================= */
/**
 * Calculates days between start and end, skipping Weekends (Sat/Sun) and Public Holidays.
 */
const calculateWorkDays = (startDate, endDate, holidays = []) => {
    let count = 0;
    const curDate = new Date(startDate);
    const lastDate = new Date(endDate);
    
    // Convert holiday dates from DB to YYYY-MM-DD strings for fast comparison
    const holidayStrings = holidays.map(h => 
        new Date(h.date).toISOString().split('T')[0]
    );

    while (curDate <= lastDate) {
        const dayOfWeek = curDate.getDay();
        const curDateString = curDate.toISOString().split('T')[0];

        // 0 = Sunday, 6 = Saturday. We skip both.
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
        const isHoliday = holidayStrings.includes(curDateString);

        if (!isWeekend && !isHoliday) {
            count++;
        }
        // Move to the next day
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
};

/* ================= ADD LEAVE ================= */
const addLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const userId = req.user._id;

    const employee = await Employee.findOne({ userId });
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    const holidays = await Holiday.find();

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Calculate work days (skips Saturdays, Sundays, and Holidays)
    const daysRequested = calculateWorkDays(start, end, holidays);

    if (daysRequested <= 0) {
      return res.status(400).json({
        success: false,
        error: "Selected dates consist only of Weekends or Public Holidays.",
      });
    }

    // Logic for Leave Balance Check
    const TOTAL_CASUAL = 12;
    const TOTAL_SICK = 12;

    const approved = await Leave.aggregate([
      {
        $match: {
          employeeId: employee._id,
          status: "Approved",
          leaveType: leaveType
        },
      },
      {
        $group: { _id: null, daysUsed: { $sum: "$days" } },
      },
    ]);

    const used = approved.length ? approved[0].daysUsed : 0;
    const totalAllowed = leaveType === "Casual Leave" ? TOTAL_CASUAL : TOTAL_SICK;
    const balance = totalAllowed - used;

    if (daysRequested > balance) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. Remaining ${balance} days. Requested ${daysRequested} work days.`,
      });
    }

    const leave = await Leave.create({
      employeeId: employee._id,
      leaveType,
      startDate,
      endDate,
      reason,
      status: "Pending",
      days: daysRequested, // Storing the "Net Days"
    });

    return res.status(200).json({ success: true, leave });

  } catch (error) {
    console.log("LEAVE ERROR:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= UPDATE LEAVE STATUS (ADMIN) ================= */
const updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, error: "Leave not found" });
    }

    const holidays = await Holiday.find();
    
    // Recalculate days to ensure correctness before admin approval
    const recalculatedDays = calculateWorkDays(leave.startDate, leave.endDate, holidays);
    leave.days = recalculatedDays;

    if (status === "Approved") {
      const TOTAL_CASUAL = 12;
      const TOTAL_SICK = 12;

      const approved = await Leave.aggregate([
        {
          $match: {
            employeeId: leave.employeeId,
            status: "Approved",
            leaveType: leave.leaveType,
            _id: { $ne: leave._id }, // Exclude current record if it was already approved
          },
        },
        { $group: { _id: null, daysUsed: { $sum: "$days" } } },
      ]);

      const used = approved.length ? approved[0].daysUsed : 0;
      const totalAllowed = leave.leaveType === "Casual Leave" ? TOTAL_CASUAL : TOTAL_SICK;
      const balance = totalAllowed - used;

      if (leave.days > balance) {
        return res.status(400).json({
          success: false,
          error: `Cannot approve. Insufficient ${leave.leaveType} balance.`,
        });
      }
    }

    leave.status = status;
    await leave.save();
    return res.status(200).json({ success: true, leave });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= GET LEAVE BALANCE ================= */
const getLeaveBalance = async (req, res) => {
  try {
    const userId = req.user._id;
    const employee = await Employee.findOne({ userId });

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const TOTAL_CASUAL = 12;
    const TOTAL_SICK = 12;

    const approved = await Leave.aggregate([
      { $match: { employeeId: employee._id, status: "Approved" } },
      { $group: { _id: "$leaveType", daysUsed: { $sum: "$days" } } },
    ]);

    let usedCasual = 0;
    let usedSick = 0;

    approved.forEach((item) => {
      if (item._id === "Casual Leave") usedCasual = item.daysUsed;
      if (item._id === "Sick Leave") usedSick = item.daysUsed;
    });

    return res.status(200).json({
      success: true,
      casual: { total: TOTAL_CASUAL, used: usedCasual, balance: TOTAL_CASUAL - usedCasual },
      sick: { total: TOTAL_SICK, used: usedSick, balance: TOTAL_SICK - usedSick },
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= STANDARD GETTERS ================= */
const getLeave = async (req, res) => {
  try {
    const { id, role } = req.params;
    let leaves;
    if (role === "admin") {
      leaves = await Leave.find({ employeeId: id });
    } else {
      const employee = await Employee.findOne({ userId: id });
      leaves = await Leave.find({ employeeId: employee._id });
    }
    return res.status(200).json({ success: true, leaves });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate({
      path: "employeeId",
      populate: [
        { path: "department", select: "dep_name" },
        { path: "designation", select: "designation" },
        { path: "userId", select: "name" }
      ]
    }).sort({ createdAt: -1 }); // Added sorting for better UX
    return res.status(200).json({ success: true, leaves });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getLeaveDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id).populate({
      path: "employeeId",
      populate: [
        { path: "department", select: "dep_name" },
        { path: "designation", select: "designation" },
        { path: "userId", select: "name email profileImage" }
      ]
    });
    return res.status(200).json({ success: true, leave });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export {
  addLeave,
  getLeave,
  getLeaves,
  getLeaveDetail,
  updateLeave,
  getLeaveBalance
};