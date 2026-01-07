import mongoose, { Schema } from "mongoose";

const clientSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  dateOfJoining: { type: Date, required: true },
  companyLogo: { type: String },
  budget: { type: Number, required: true },
  planType: { type: String, enum: ["annual", "quarterly"], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Client", clientSchema);
