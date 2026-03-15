import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'leave-request'
  message: { type: String, required: true },
  data: { type: Object, default: {} }, // extra info (employee, leaveId, etc)
  seen: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);