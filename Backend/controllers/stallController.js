import Stall from "../models/Stall.js";
import uploadToImageKit from "../utils/uploadToImageKit.js";

// Get all stalls
export const getAllStalls = async (req, res) => {
	try {
		const stalls = await Stall.find();
		res.status(200).json({ success: true, stalls });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Get single stall by ID
export const getStallById = async (req, res) => {
	try {
		const stall = await Stall.findById(req.params.id);
		if (!stall) return res.status(404).json({ success: false, message: "Stall not found" });
		res.status(200).json({ success: true, stall });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Create new stall (with file upload)
export const createStall = async (req, res) => {
	try {
		let logo = null;
		if (req.file) {
			logo = await uploadToImageKit(req.file, "stalls");
		}
		// Parse plans as array if not already
		let plans = req.body.plans;
		if (typeof plans === "string") {
			plans = [plans];
		}
		const stall = await Stall.create({
			name: req.body.name,
			number: req.body.number,
			type: req.body.type,
			eventCount: Number(req.body.eventCount) || 0,
			plans: plans || [],
			logo,
		});
		res.status(201).json({ success: true, stall });
	} catch (error) {
		console.error('Error in createStall:', error);
		res.status(400).json({ success: false, message: error.message });
	}
};

// Update stall (with file upload)
export const updateStall = async (req, res) => {
	try {
		let data = { ...req.body };
		if (req.file) {
			data.logo = await uploadToImageKit(req.file, "stalls");
		}
		// Parse plans as array if not already
		if (typeof data.plans === "string") {
			data.plans = [data.plans];
		}
		const stall = await Stall.findByIdAndUpdate(req.params.id, data, { new: true });
		if (!stall) return res.status(404).json({ success: false, message: "Stall not found" });
		res.status(200).json({ success: true, stall });
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
	}
};

// Delete stall
export const deleteStall = async (req, res) => {
	try {
		const stall = await Stall.findByIdAndDelete(req.params.id);
		if (!stall) return res.status(404).json({ success: false, message: "Stall not found" });
		res.status(200).json({ success: true, message: "Stall deleted" });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};
