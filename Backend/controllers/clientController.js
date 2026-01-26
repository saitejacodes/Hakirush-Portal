import Client from "../models/Client.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import uploadToImageKit from "../utils/uploadToImageKit.js";

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

    let imageUrl = "";
    if (req.file?.buffer) {
      imageUrl = await uploadToImageKit(req.file, "clients");
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "client",
      profileImage: imageUrl, // ✅ ImageKit URL
    });

    const client = await Client.create({
      userId: user._id,
      dateOfJoining,
      budget,
      planType,
      companyLogo: imageUrl, // ✅ ImageKit URL
    });

    res.status(201).json({
      success: true,
      message: "Client added",
      client,
    });
  } catch (err) {
    console.error("ADD CLIENT ERROR:", err);
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
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }
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
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }

    /* ---------- USER UPDATE ---------- */
    const userUpdate = {};
    if (name !== undefined) userUpdate.name = name;

    if (req.file?.buffer) {
      userUpdate.profileImage = await uploadToImageKit(req.file, "clients");
    }

    if (Object.keys(userUpdate).length) {
      await User.findByIdAndUpdate(client.userId, userUpdate);
    }

    /* ---------- CLIENT UPDATE ---------- */
    const clientUpdate = {};
    if (budget !== undefined) clientUpdate.budget = budget;
    if (dateOfJoining !== undefined) clientUpdate.dateOfJoining = dateOfJoining;
    if (planType !== undefined) clientUpdate.planType = planType;

    if (req.file?.buffer) {
      clientUpdate.companyLogo = userUpdate.profileImage;
    }

    await Client.findByIdAndUpdate(id, clientUpdate);

    res.json({ success: true, message: "Client updated" });
  } catch (err) {
    console.error("UPDATE CLIENT ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= DELETE CLIENT ================= */
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }

    await User.findByIdAndDelete(client.userId);
    await Client.findByIdAndDelete(client._id);

    res.json({ success: true, message: "Client deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
