import mongoose from "mongoose";

const stallSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    eventType: {
      type: String,
      enum: ["Annual", "Quarterly"],
      required: true
    },
    stallName: { type: String, required: true },
    vendorName: { type: String, required: true },
    category: {
      type: String,
      enum: ["Snacks", "Drinks", "Fast Food", "Ice Cream", "Meals"],
      required: true
    },
    stallNumber: { type: String, required: true },
    location: { type: String, required: true },
    phone: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Stall", stallSchema);