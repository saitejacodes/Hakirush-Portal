import Client from "../models/Client.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import uploadToImageKit from "../utils/uploadToImageKit.js";

/* ================= ADD CLIENT ================= */
const addClient = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      dateOfJoining,
      planType,
      budget,
    } = req.body;

    /* ===== VALIDATION ===== */
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    if (!req.file?.buffer) {
      return res.status(400).json({ error: "Company logo required" });
    }

    /* ===== CHECK USER ===== */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    /* ===== HASH PASSWORD ===== */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* ===== CREATE USER ===== */
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "client",
    });

    /* ===== UPLOAD LOGO ===== */
    const logoUrl = await uploadToImageKit(req.file, "clients");

    /* ===== CREATE CLIENT ===== */
    const client = await Client.create({
      userId: user._id,
      name,
      email,
      dateOfJoining,
      planType,
      budget,
      companyLogo: logoUrl,
    });

    res.status(201).json({
      success: true,
      client,
    });
  } catch (error) {
    console.error("ADD CLIENT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET ALL CLIENTS ================= */
const getClients = async (req, res) => {
  try {
    const clients = await Client.find().populate("userId", "-password");
    res.json({ success: true, clients });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= GET SINGLE CLIENT ================= */
const getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate(
      "userId",
      "-password"
    );
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }
    res.json({ success: true, client });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= GET LOGGED-IN CLIENT ================= */
const getMyClient = async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user.id }).populate(
      "userId",
      "-password"
    );
    if (!client) {
      return res.status(404).json({ success: false });
    }
    res.json({ success: true, client });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= UPDATE CLIENT ================= */
const updateClient = async (req, res) => {
  try {
    const { budget, planType } = req.body;

    const update = {};

    if (budget !== undefined) update.budget = budget;

    if (planType !== undefined) {
      if (!["Annual", "Quarterly"].includes(planType)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid plan type" });
      }
      update.planType = planType;
    }

    if (req.file?.buffer) {
      update.companyLogo = await uploadToImageKit(req.file, "clients");
    }

    update.updatedAt = new Date();

    await Client.findByIdAndUpdate(req.params.id, update);

    res.json({ success: true, message: "Client updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= DELETE CLIENT ================= */
const deleteClient = async (req, res) => {
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

export {
  addClient,
  getClients,
  getClient,
  getMyClient,
  updateClient,
  deleteClient
}