import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    checkIn: {
      type: Date,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    workedHours: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Present", "Half Day", "Absent", "Leave"],
      default: "",
    },

    isPaused: {
      type: Boolean,
      default: false,
    },

    pauseStartedAt: {
      type: Date,
      default: null,
    },

    totalPausedMs: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

AttendanceSchema.index(
  { employeeId: 1, date: 1 },
  { unique: true }
);

const Attendance = mongoose.model("Attendance", AttendanceSchema);
export default Attendance;
