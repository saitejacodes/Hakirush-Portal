import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { asyncHandler, badRequest, conflict, forbidden, notFound } from "../middleware/errorHandler.js";
import { requireObjectId, requireYmd, requireEnum, trimmedString, parsePagination } from "../utils/validate.js";
import { businessDate, addDays } from "../utils/orgTime.js";
import { now as clockNow } from "../services/clock.js";
import { getEmployeeForUser, resolveEmployeeForCaller } from "../services/employeeScope.js";
import { storedDateToYmd, ymdToDate, countWorkingDays } from "../services/businessCalendar.js";
import {
  LEAVE_TYPES,
  MAX_LEAVE_SPAN_DAYS,
  computeLeaveDays,
  computeLeaveBalance,
  findOverlappingLeave,
  formatLeaveRange,
} from "../services/leaveService.js";

const REASON_MAX = 1000;
const REVIEW_DECISIONS = ["Approved", "Rejected"];
const LEAVE_STATUSES = ["Pending", "Approved", "Rejected", "Cancelled"];

const EMPLOYEE_POPULATE = {
  path: "employeeId",
  populate: [
    { path: "department", select: "dep_name" },
    { path: "userId", select: "name email profileImage" },
  ],
};

/* Kept for backwards compatibility (pure helper, weekends + holidays excluded). */
const calculateNetWorkDays = (startDate, endDate, holidays = []) => {
  const s = storedDateToYmd(startDate);
  const e = storedDateToYmd(endDate);
  if (!s || !e) return 0;
  const map = new Map(holidays.map((h) => [storedDateToYmd(h.date ?? h), h.title || "Holiday"]));
  return countWorkingDays(s, e, map);
};

// Cancellable: Pending always; Approved only while the leave has not started
// (start date strictly after today's business date).
const canCancelLeave = (status, startYmd = null, todayYmd = null) => {
  if (status === "Pending") return true;
  if (status === "Approved") return !startYmd || !todayYmd ? false : startYmd > todayYmd;
  return false;
};

const notifyAdmins = async (type, message, data) => {
  const admins = await User.find({ role: "admin", isActive: { $ne: false } }).select("_id").lean();
  if (!admins.length) return;
  await Notification.insertMany(admins.map((a) => ({ type, message, data: { ...data, adminId: a._id } })));
};

/* ================= ADD LEAVE (EMPLOYEE) ================= */
const addLeave = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const leaveType = requireEnum(body.leaveType, LEAVE_TYPES, "leaveType");
  const startYmd = requireYmd(body.startDate, "startDate");
  const endYmd = requireYmd(body.endDate, "endDate");
  const reason = trimmedString(body.reason, "reason", { max: REASON_MAX, optional: true }) || "";
  if (endYmd < startYmd) throw badRequest("End date must be on or after start date");
  if (endYmd > addDays(startYmd, MAX_LEAVE_SPAN_DAYS - 1)) {
    throw badRequest(`A leave application cannot span more than ${MAX_LEAVE_SPAN_DAYS} days`);
  }

  const employee = await getEmployeeForUser(req.user._id);

  // Client-sent `days` is ignored: the server computes working days.
  const days = await computeLeaveDays(startYmd, endYmd);
  if (days < 1) throw badRequest("The selected range has no working days");

  const overlap = await findOverlappingLeave(employee._id, startYmd, endYmd);
  if (overlap) {
    throw conflict("You already have a pending or approved leave overlapping these dates", "CONFLICT", {
      leaveId: overlap._id,
      status: overlap.status,
    });
  }

  const leave = await Leave.create({
    employeeId: employee._id,
    leaveType,
    startDate: ymdToDate(startYmd),
    endDate: ymdToDate(endYmd),
    reason,
    status: "Pending",
    days,
  });

  const balance = await computeLeaveBalance(employee._id, clockNow());
  const typeBalance = leaveType === "Sick Leave" ? balance.sick : balance.casual;

  await notifyAdmins("leave-request", `${req.user.name || "An employee"} applied for ${leaveType} leave (${days} days)`, {
    leaveId: leave._id,
    employeeId: employee._id,
    link: "/admin-dashboard/leaves",
  });

  // Balance is reported, not enforced (owner decision; the web form blocks client-side).
  return res.status(200).json({ success: true, leave, exceedsBalance: days > typeBalance.balance });
});

/* ================= UPDATE LEAVE STATUS (ADMIN REVIEW) ================= */
const updateLeave = asyncHandler(async (req, res) => {
  const id = requireObjectId(req.params.id, "id");
  const status = requireEnum(req.body?.status, REVIEW_DECISIONS, "status");

  const current = await Leave.findById(id).lean();
  if (!current) throw notFound("Leave request not found");
  if (current.status !== "Pending") {
    throw conflict("Leave request has already been reviewed", "ALREADY_REVIEWED", { status: current.status });
  }

  const set = { status, reviewedBy: req.user._id, reviewedAt: clockNow() };
  if (status === "Approved") {
    // Re-evaluate with the current holiday calendar (original behaviour).
    const s = storedDateToYmd(current.startDate);
    const e = storedDateToYmd(current.endDate);
    if (s && e) set.days = await computeLeaveDays(s, e);
  }

  // Atomic Pending -> Approved/Rejected.
  const leave = await Leave.findOneAndUpdate({ _id: id, status: "Pending" }, { $set: set }, { returnDocument: "after" });
  if (!leave) {
    const latest = await Leave.findById(id).select("status").lean();
    throw conflict("Leave request has already been reviewed", "ALREADY_REVIEWED", { status: latest?.status });
  }

  const employee = await Employee.findById(leave.employeeId).select("userId").lean();
  if (employee?.userId) {
    await Notification.create({
      type: "leave-status",
      message: `Your leave request from ${formatLeaveRange(leave)} was ${status}`,
      data: { leaveId: leave._id, employeeId: employee._id, userId: employee.userId, status },
    });
  }

  return res.status(200).json({ success: true, leave });
});

/* ================= CANCEL LEAVE (EMPLOYEE, OWNER) ================= */
const cancelLeave = asyncHandler(async (req, res) => {
  const id = requireObjectId(req.params.id, "id");
  const employee = await getEmployeeForUser(req.user._id);
  const now = clockNow();
  const today = businessDate(now);

  // Approved leave whose start date is after today (stored as UTC midnight).
  const leave = await Leave.findOneAndUpdate(
    {
      _id: id,
      employeeId: employee._id,
      $or: [
        { status: "Pending" },
        { status: "Approved", startDate: { $gte: ymdToDate(addDays(today, 1)) } },
      ],
    },
    { $set: { status: "Cancelled", cancelledBy: req.user._id, cancelledAt: now } },
    { returnDocument: "after" }
  );

  if (!leave) {
    const own = await Leave.findOne({ _id: id, employeeId: employee._id }).select("status startDate").lean();
    if (!own) throw notFound("Leave request not found");
    throw conflict(
      own.status === "Approved"
        ? "Approved leave can only be cancelled before it starts"
        : "Only pending or not-yet-started approved leave can be cancelled",
      "INVALID_TRANSITION",
      { status: own.status }
    );
  }

  await Notification.create({
    type: "leave-status",
    message: `Your leave request from ${formatLeaveRange(leave)} was Cancelled`,
    data: { leaveId: leave._id, employeeId: employee._id, userId: req.user._id, status: "Cancelled" },
  });
  await notifyAdmins("leave-request", `${req.user.name || "An employee"} cancelled a ${leave.leaveType} leave (${formatLeaveRange(leave)})`, {
    leaveId: leave._id,
    employeeId: employee._id,
    status: "Cancelled",
    link: "/admin-dashboard/leaves",
  });

  return res.status(200).json({ success: true, leave });
});

/* ================= GET LEAVE BALANCE (SELF) ================= */
// Also mounted by the employee router at /api/employee/leave/balance/me.
const getLeaveBalance = asyncHandler(async (req, res) => {
  const employee = await getEmployeeForUser(req.user._id);
  const balance = await computeLeaveBalance(employee._id, clockNow());
  return res.status(200).json({ success: true, ...balance });
});

/* ================= GET LEAVE BALANCE BY EMPLOYEE ID (ADMIN, SELF) ================= */
const getLeaveBalanceByEmployeeId = asyncHandler(async (req, res) => {
  const employee = await resolveEmployeeForCaller(req, req.params.employeeId, "employeeId");
  const balance = await computeLeaveBalance(employee._id, clockNow());
  return res.status(200).json({ success: true, ...balance });
});

/* ================= GET MY LEAVES (EMPLOYEE) ================= */
const getMyLeaves = asyncHandler(async (req, res) => {
  const employee = await getEmployeeForUser(req.user._id);
  const leaves = await Leave.find({ employeeId: employee._id }).sort({ createdAt: -1 }).limit(500);
  return res.status(200).json({ success: true, leaves });
});

/* ================= GET LEAVE (LEGACY /:id/:role) ================= */
// The `:role` path segment is ignored: authority comes from req.user.
// Admin: `:id` = Employee._id or userId of any employee. Employee: only own id.
const getLeave = asyncHandler(async (req, res) => {
  const employee = await resolveEmployeeForCaller(req, req.params.id, "id");
  const leaves = await Leave.find({ employeeId: employee._id }).sort({ createdAt: -1 }).limit(500);
  return res.status(200).json({ success: true, leaves });
});

/* ================= GET LEAVES (ADMIN) ================= */
const getLeaves = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const employeeIds = await Employee.distinct("_id");
  const filter = { employeeId: { $in: employeeIds } };
  if (status !== undefined && status !== "" && status !== "All") {
    filter.status = requireEnum(status, LEAVE_STATUSES, "status");
  }
  const query = Leave.find(filter).populate(EMPLOYEE_POPULATE).sort({ createdAt: -1 });
  if (page !== undefined || limit !== undefined) {
    const p = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
    const [leaves, total] = await Promise.all([query.skip(p.skip).limit(p.limit), Leave.countDocuments(filter)]);
    return res.status(200).json({ success: true, leaves, page: p.page, limit: p.limit, total, hasMore: p.skip + leaves.length < total });
  }
  const leaves = await query.limit(2000);
  return res.status(200).json({ success: true, leaves });
});

/* ================= GET LEAVE DETAIL (ADMIN, OWNER) ================= */
const getLeaveDetail = asyncHandler(async (req, res) => {
  const id = requireObjectId(req.params.id, "id");
  const filter = { _id: id };
  if (req.user.role === "employee") {
    const own = await getEmployeeForUser(req.user._id);
    filter.employeeId = own._id;
  } else if (req.user.role !== "admin") {
    throw forbidden();
  }
  const leave = await Leave.findOne(filter).populate(EMPLOYEE_POPULATE);
  if (!leave) throw notFound("Leave request not found");
  return res.status(200).json({ success: true, leave });
});

export {
  calculateNetWorkDays,
  canCancelLeave,
  addLeave,
  updateLeave,
  cancelLeave,
  getLeaveBalance,
  getLeaveBalanceByEmployeeId,
  getMyLeaves,
  getLeave,
  getLeaves,
  getLeaveDetail,
};
