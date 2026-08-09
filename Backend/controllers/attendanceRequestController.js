import AttendanceRequest from "../models/AttendanceRequest.js";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

/* ================= EMPLOYEE: CREATE REQUEST ================= */
const createAttendanceRequest = async (req, res) => {
  try {
    const { date, currentStatus, requestedStatus, reason } = req.body;
    if (!date || !currentStatus || !requestedStatus || !reason) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (currentStatus === requestedStatus) {
      return res.status(400).json({ success: false, message: "Requested status must differ from current status" });
    }

    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    // Block duplicate pending requests for the same date
    const existing = await AttendanceRequest.findOne({ employeeId: employee._id, date, status: "Pending" });
    if (existing) {
      return res.status(400).json({ success: false, message: "A request for this date is already pending" });
    }

    const request = await AttendanceRequest.create({
      employeeId: employee._id,
      date,
      currentStatus,
      requestedStatus,
      reason,
    });

    const admins = await User.find({ role: "admin" });
    if (admins.length > 0) {
      const employeeUser = await User.findById(req.user._id);
      const notifications = admins.map((admin) => ({
        type: "attendance-request",
        message: `${employeeUser?.name || "An employee"} submitted an attendance correction request for ${date}`,
        data: { requestId: request._id, adminId: admin._id, link: "/admin-dashboard/attendance-requests" },
      }));
      await Notification.insertMany(notifications);
    }

    return res.json({ success: true, request });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= EMPLOYEE: MY REQUESTS ================= */
const getMyAttendanceRequests = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    const requests = await AttendanceRequest.find({ employeeId: employee._id }).sort({ createdAt: -1 });
    return res.json({ success: true, requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ADMIN: ALL REQUESTS ================= */
const getAllAttendanceRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const requests = await AttendanceRequest.find(filter)
      .populate({ path: "employeeId", populate: ["userId", "department"] })
      .sort({ createdAt: -1 });
    return res.json({ success: true, requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ADMIN: REVIEW REQUEST ================= */
const reviewAttendanceRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { decision, remarks } = req.body; // decision: "Approved" | "Rejected"

    const request = await AttendanceRequest.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    if (request.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Request has already been reviewed" });
    }

    // Needed to resolve the employee's userId for the notification below
    const employeeDoc = await Employee.findById(request.employeeId);
    if (!employeeDoc) return res.status(404).json({ success: false, message: "Employee not found" });

    request.status = decision;
    request.reviewedBy = req.user._id;
    request.reviewRemarks = remarks || "";
    request.reviewedAt = new Date();
    await request.save();

    if (decision === "Approved") {
      const workedHours = request.requestedStatus === "Present" ? 8 : 4;
      const checkInTime = new Date(`${request.date}T09:00:00`);
      const checkOutTime = new Date(`${request.date}T17:00:00`);

      await Attendance.findOneAndUpdate(
        { employeeId: request.employeeId, date: request.date },
        {
          employeeId: request.employeeId,
          date: request.date,
          status: request.requestedStatus,
          workedHours,
          checkIn: checkInTime,
          checkOut: checkOutTime,
          isPaused: false,
          pauseStartedAt: null,
        },
        { upsert: true, new: true }
      );
    }

    // Notify the employee of the review outcome
    const statusText = decision === "Approved" ? "approved" : "rejected";
    await Notification.create({
      type: "attendance-request-status",
      message: `Your attendance correction request for ${request.date} (${request.requestedStatus}) was ${statusText}.${remarks ? ` Remarks: ${remarks}` : ""}`,
      seen: false,
      data: { userId: employeeDoc.userId },
    });

    return res.json({ success: true, request });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= EMPLOYEE: DELETE REQUEST ================= */

const deleteAttendanceRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const employee = await Employee.findOne({
      userId: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const request = await AttendanceRequest.findOne({
      _id: requestId,
      employeeId: employee._id,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Only allow deleting pending requests
    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be deleted",
      });
    }

    await AttendanceRequest.findByIdAndDelete(requestId);

    return res.json({
      success: true,
      message: "Request deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createAttendanceRequest,
  getMyAttendanceRequests,
  getAllAttendanceRequests,
  deleteAttendanceRequest,
  reviewAttendanceRequest,
};