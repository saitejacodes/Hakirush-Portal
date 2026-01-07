import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";

const addLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const userId = req.user._id;
    const employee = await Employee.findOne({ userId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      });
    }

    // ---------- calculate number of days ----------
    const start = new Date(startDate);
    const end = new Date(endDate);

    const msInDay = 1000 * 60 * 60 * 24;
    const daysRequested = Math.floor((end - start) / msInDay) + 1;

    if (daysRequested <= 0) {
      return res.status(400).json({
        success: false,
        error: "End date must be after start date"
      });
    }

    // ---------- get approved leave count ----------
    const approved = await Leave.countDocuments({
      employeeId: employee._id,
      status: "Approved"
    });

    const TOTAL_ALLOWED = 18;
    const balance = TOTAL_ALLOWED - approved;

    // ---------- validate balance ----------
    if (daysRequested > balance) {
      return res.status(400).json({
        success: false,
        error: `You only have ${balance} leave(s) left. Requested ${daysRequested}.`
      });
    }

    // ---------- create leave ----------
    const leave = await Leave.create({
      employeeId: employee._id,
      leaveType,
      startDate,
      endDate,
      reason,
      status: "Pending",
      days: daysRequested
    });

    return res.status(200).json({
      success: true,
      leave,
      balanceLeftAfterApproval: balance - daysRequested
    });

  } catch (error) {
    console.log("LEAVE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


const getLeave = async (req, res) => {
    try {
        const {id, role} = req.params;
        let leaves
        if(role === "admin") {
           leaves = await Leave.find({employeeId: id})
        } else {
           const employee = await Employee.findOne({userId: id})
           leaves = await Leave.find({employeeId: employee._id})
        }
       
        return res.status(200).json({ success: true, leaves });
    } catch (error) {
    console.log("LEAVE ERROR:", error.message);
    return res.status(500).json({ success: false, error: error.message || "Server error" });
  }
}

const getLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find().populate({
           path: "employeeId",
           populate: [
              {
                 path: 'department',
                 select: 'dep_name'
              },
              {
                 path: 'userId',
                 select: 'name'
              }
           ]
        })
        return res.status(200).json({ success: true, leaves });
    } catch (error) {
    console.log("LEAVE ERROR:", error.message);
    return res.status(500).json({ success: false, error: error.message || "Server error" });
  }
}

const getLeaveDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id).populate({
      path: "employeeId",
      populate: [
        { path: "department", select: "dep_name" },
        { path: "userId", select: "name email profileImage" }
      ]
    });

    return res.status(200).json({ success: true, leave });
  } catch (error) {
    console.log("LEAVE ERROR:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        error: "Leave not found"
      });
    }

    // if approving — double-check balance again
    if (status === "Approved") {
      const approved = await Leave.countDocuments({
        employeeId: leave.employeeId,
        status: "Approved"
      });

      const TOTAL_ALLOWED = 18;
      const balance = TOTAL_ALLOWED - approved;

      if (leave.days > balance) {
        return res.status(400).json({
          success: false,
          error: `Insufficient balance. Remaining ${balance} days.`
        });
      }
    }

    leave.status = status;
    await leave.save();

    return res.status(200).json({ success: true, leave });

  } catch (error) {
    console.log("LEAVE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


export { addLeave, getLeave, getLeaves, getLeaveDetail, updateLeave };