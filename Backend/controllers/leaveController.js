import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";
import Holiday from "../models/Holiday.js";

/* ================= HELPER: CALCULATE NET WORK DAYS ================= */
const calculateNetWorkDays = (startDate, endDate, holidays = []) => {
    let count = 0;
    const curDate = new Date(startDate);
    const lastDate = new Date(endDate);
    curDate.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    const holidayStrings = holidays.map(h => new Date(h.date).toISOString().split('T')[0]);

    while (curDate <= lastDate) {
        const dayOfWeek = curDate.getDay();
        const curStr = curDate.toISOString().split('T')[0];

        // Skip Sunday (0) and Public Holidays
        if (dayOfWeek !== 0 && !holidayStrings.includes(curStr)) {
            count++;
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
};

/* ================= ADD LEAVE ================= */
const addLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employee = await Employee.findOne({ userId: req.user._id });
    const holidays = await Holiday.find();

    const daysRequested = calculateNetWorkDays(startDate, endDate, holidays);

    if (daysRequested <= 0) {
      return res.status(400).json({ success: false, error: "Selected dates consist only of Sundays or Holidays." });
    }

    // Balance Check logic
    const TOTAL_LIMIT = 12;
    const approved = await Leave.aggregate([
      { $match: { employeeId: employee._id, status: "Approved", leaveType } },
      { $group: { _id: null, daysUsed: { $sum: "$days" } } },
    ]);

    const used = approved.length ? approved[0].daysUsed : 0;
    const balance = TOTAL_LIMIT - used;

    if (daysRequested > balance) {
      return res.status(400).json({ success: false, error: `Insufficient balance. Available: ${balance}, Requested: ${daysRequested}` });
    }

    const leave = await Leave.create({
      employeeId: employee._id,
      leaveType,
      startDate,
      endDate,
      reason,
      status: "Pending",
      days: daysRequested, // Strictly storing the Net working days
    });

    return res.status(200).json({ success: true, leave });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= UPDATE LEAVE STATUS (ADMIN) ================= */
const updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const leave = await Leave.findById(id);
    const holidays = await Holiday.find();

    if (status === "Approved") {
      // Recalculate to ensure correctness before finalizing
      leave.days = calculateNetWorkDays(leave.startDate, leave.endDate, holidays);
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
    const employee = await Employee.findOne({ userId: req.user._id });
    const approved = await Leave.aggregate([
      { $match: { employeeId: employee._id, status: "Approved" } },
      { $group: { _id: "$leaveType", daysUsed: { $sum: "$days" } } },
    ]);

    const used = { "Casual Leave": 0, "Sick Leave": 0 };
    approved.forEach(item => { used[item._id] = item.daysUsed; });

    return res.status(200).json({
      success: true,
      casual: { total: 12, used: used["Casual Leave"], balance: 12 - used["Casual Leave"] },
      sick: { total: 12, used: used["Sick Leave"], balance: 12 - used["Sick Leave"] },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= STANDARD GETTERS ================= */
const getLeave = async (req, res) => {
  try {
    const { id, role } = req.params;
    let query = role === "admin" ? { employeeId: id } : { employeeId: (await Employee.findOne({ userId: id }))._id };
    const leaves = await Leave.find(query);
    return res.status(200).json({ success: true, leaves });
  } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
};

const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate({ path: "employeeId", populate: [{ path: "department" }, { path: "userId" }] }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, leaves });
  } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
};

const getLeaveDetail = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate({ path: "employeeId", populate: [{ path: "department" }, { path: "userId" }] });
    return res.status(200).json({ success: true, leave });
  } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
};

export { 
  addLeave, 
  getLeave, 
  getLeaves, 
  getLeaveDetail, 
  updateLeave, 
  getLeaveBalance 
};