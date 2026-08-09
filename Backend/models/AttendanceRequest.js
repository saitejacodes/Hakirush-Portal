import mongoose from "mongoose";

const attendanceRequestSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD, same format as Attendance.date
    currentStatus: { type: String, required: true }, // e.g. "Absent", "Half Day"
    requestedStatus: { type: String, required: true, enum: ["Present", "Half Day"] },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewRemarks: { type: String, default: "" },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One active request per employee/date at a time
attendanceRequestSchema.index({ employeeId: 1, date: 1 });

export default mongoose.model("AttendanceRequest", attendanceRequestSchema);