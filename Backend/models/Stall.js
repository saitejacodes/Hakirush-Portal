import mongoose from "mongoose";

const StallSchema = new mongoose.Schema({
	name: { type: String, required: true },
	number: { type: String, required: true },
	type: { type: String, required: true },
	eventCount: { type: Number, default: 0 },
	plans: { type: [String], default: [] },
	logo: { type: String },
}, { timestamps: true });

const Stall = mongoose.model("Stall", StallSchema);
export default Stall;
