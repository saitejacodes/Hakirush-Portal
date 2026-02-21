import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";
import Holiday from "../models/Holiday.js";

const toRawDateString = (dateInput) => {
    const d = new Date(dateInput);
    return d.toISOString().split('T')[0]; 
};

/* ================= UPDATED HELPER: EXCLUDES SAT & SUN ================= */
const calculateNetWorkDays = (startDate, endDate, holidays = []) => {
    let count = 0;
   
    const startStr = toRawDateString(startDate);
    const endStr = toRawDateString(endDate);
    
    let current = new Date(startStr);
    const end = new Date(endStr);
    
    const holidayStrings = holidays.map(h => toRawDateString(h.date));

    while (current <= end) {
        const dateStr = toRawDateString(current);
        const dayOfWeek = current.getUTCDay(); 

        const isSunday = dayOfWeek === 0;
        const isSaturday = dayOfWeek === 6; // Added Saturday check
        const isHoliday = holidayStrings.includes(dateStr);

        // Logic: Increment count ONLY if it is NOT a weekend and NOT a holiday
        if (!isSunday && !isSaturday && !isHoliday) {
            count++;
        }
        
        current.setUTCDate(current.getUTCDate() + 1);
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

    const leave = await Leave.create({
      employeeId: employee._id,
      leaveType,
      startDate,
      endDate,
      reason,
      status: "Pending",
      days: daysRequested, 
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

/* ================= GET LEAVE ================= */
const getLeave = async (req, res) => {
  try {
    const { id, role } = req.params;
    let query = role === "admin" ? { employeeId: id } : { employeeId: (await Employee.findOne({ userId: id }))._id };
    const leaves = await Leave.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, leaves });
  } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
};

/* ================= GET LEAVES ================= */
const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate({ path: "employeeId", populate: [{ path: "department" }, { path: "userId" }] }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, leaves });
  } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
};

/* ================= GET LEAVES DETAIL ================= */
const getLeaveDetail = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate({ path: "employeeId", populate: [{ path: "department" }, { path: "userId" }] });
    return res.status(200).json({ success: true, leave });
  } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
};


export {
   calculateNetWorkDays,
   addLeave,
   updateLeave,
   getLeaveBalance,
   getLeave,
   getLeaves,
   getLeaveDetail
}