import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["Annual", "Quarterly"],
      required: true,
    },
    date: { type: String, required: true },
    venue: { type: String, required: true },
    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed"],
      default: "Upcoming",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);