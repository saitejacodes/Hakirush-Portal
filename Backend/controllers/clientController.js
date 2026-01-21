import Client from "../models/Client.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

/* ================= ADD CLIENT ================= */
export const addClient = async (req, res) => {
  try {
    const { name, email, password, dateOfJoining, budget, planType } = req.body;

    if (!name || !email || !password || !dateOfJoining || !budget || !planType) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "client",
      profileImage: req.file ? req.file.path : "", // ✅ Cloudinary URL
    });

    const client = await Client.create({
      userId: user._id,
      dateOfJoining,
      budget,
      planType,
      companyLogo: req.file ? req.file.path : "", // ✅ Cloudinary URL
    });

    res.status(201).json({ success: true, message: "Client added", client });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= GET ALL CLIENTS ================= */
export const getClients = async (req, res) => {
  try {
    const clients = await Client.find().populate("userId", "-password");
    res.json({ success: true, clients });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= GET SINGLE CLIENT ================= */
export const getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate("userId", "-password");
    if (!client) return res.status(404).json({ success: false, error: "Client not found" });
    res.json({ success: true, client });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= UPDATE CLIENT ================= */
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, budget, dateOfJoining, planType } = req.body;

    const client = await Client.findById(id);
    if (!client) return res.status(404).json({ success: false, error: "Client not found" });

    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (req.file) userUpdate.profileImage = req.file.path;

    if (Object.keys(userUpdate).length)
      await User.findByIdAndUpdate(client.userId, userUpdate);

    const clientUpdate = {};
    if (budget) clientUpdate.budget = budget;
    if (dateOfJoining) clientUpdate.dateOfJoining = dateOfJoining;
    if (planType) clientUpdate.planType = planType;
    if (req.file) clientUpdate.companyLogo = req.file.path;

    await Client.findByIdAndUpdate(id, clientUpdate);

    res.json({ success: true, message: "Client updated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= DELETE CLIENT ================= */
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ success: false, error: "Client not found" });

    await User.findByIdAndDelete(client.userId);
    await Client.findByIdAndDelete(client._id);

    res.json({ success: true, message: "Client deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};