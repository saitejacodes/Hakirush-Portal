import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";

/* ================= ADD LEAVE ================= */
const addLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const userId = req.user._id;
    const employee = await Employee.findOne({ userId });

    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const msInDay = 1000 * 60 * 60 * 24;
    const daysRequested = Math.floor((end - start) / msInDay) + 1;

    if (daysRequested <= 0) {
      return res.status(400).json({
        success: false,
        error: "End date must be after start date",
      });
    }

    const approved = await Leave.aggregate([
      {
        $match: {
          employeeId: employee._id,
          status: "Approved",
        },
      },
      {
        $group: { _id: null, daysUsed: { $sum: "$days" } },
      },
    ]);

    const used = approved.length ? approved[0].daysUsed : 0;

    const TOTAL_ALLOWED = 24;
    const balance = TOTAL_ALLOWED - used;

    if (daysRequested > balance) {
      return res.status(400).json({
        success: false,
        error: `You only have ${balance} leave(s) left. Requested ${daysRequested}.`,
      });
    }

    const leave = await Leave.create({
      employeeId: employee._id,
      leaveType,
      startDate,
      endDate,
      reason,
      status: "Pending",
      days: daysRequested,
    });

    return res.status(200).json({
      success: true,
      leave,
      balanceLeftAfterApproval: balance - daysRequested,
    });

  } catch (error) {
    console.log("LEAVE ERROR:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= GET LEAVE ================= */
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
    console.log("LEAVE ERROR:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= GET ALL LEAVES ================= */
const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate({
      path: "employeeId",
      populate: [
        { path: "designation", select: "designation" },
        { path: "userId", select: "name" }
      ]
    });

    return res.status(200).json({ success: true, leaves });
  } catch (error) {
    console.log("LEAVE ERROR:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= GET LEAVE DETAIL ================= */
const getLeaveDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id).populate({
      path: "employeeId",
      populate: [
        { path: "designation", select: "designation" },
        { path: "userId", select: "name email profileImage" }
      ]
    });

    return res.status(200).json({ success: true, leave });
  } catch (error) {
    console.log("LEAVE ERROR:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({ success: false, error: "Leave not found" });
    }

    if (status === "Approved") {
      const approved = await Leave.aggregate([
        {
          $match: {
            employeeId: leave.employeeId,
            status: "Approved",
          },
        },
        {
          $group: { _id: null, daysUsed: { $sum: "$days" } },
        },
      ]);

      const used = approved.length ? approved[0].daysUsed : 0;

      const TOTAL_ALLOWED = 24;
      const balance = TOTAL_ALLOWED - used;

      if (leave.days > balance) {
        return res.status(400).json({
          success: false,
          error: `Insufficient balance. Remaining ${balance} days.`,
        });
      }
    }

    leave.status = status;
    await leave.save();

    return res.status(200).json({ success: true, leave });

  } catch (error) {
    console.log("LEAVE ERROR:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/* ================= GET LEAVE BALANCE ================= */
const getLeaveBalance = async (req, res) => {
  try {
    const userId = req.user._id;

    const employee = await Employee.findOne({ userId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const TOTAL_ALLOWED = 24;

    return res.status(200).json({
      success: true,
      total: TOTAL_ALLOWED,
      used: 0,
      balance: TOTAL_ALLOWED,
    });

  } catch (error) {
    console.log("LEAVE BALANCE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
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