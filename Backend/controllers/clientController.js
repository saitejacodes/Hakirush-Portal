import Client from "../models/Client.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

export const upload = multer({ storage });


export const addClient = async (req, res) => {
  try {
    const { name, email, password, dateOfJoining, budget, planType } = req.body;

    if (!name || !email || !password || !dateOfJoining || !budget || !planType)
      return res.status(400).json({ success: false, error: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists)
      return res
        .status(400)
        .json({ success: false, error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "client",
      profileImage: req.file ? req.file.filename : "",
    });

    const client = await Client.create({
      userId: user._id,
      dateOfJoining,
      budget,
      planType,
      companyLogo: req.file ? req.file.filename : "",
    });

    return res
      .status(201)
      .json({ success: true, message: "Client added", client });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};



export const getClients = async (req, res) => {
  try {
    const clients = await Client.find().populate("userId", "-password");
    return res.json({ success: true, clients });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};



export const getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate("userId", "-password");

    return res.json({ success: true, client });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, budget, dateOfJoining, planType } = req.body;

    const client = await Client.findById(id);
    if (!client)
      return res.status(404).json({ success: false, error: "Client not found" });

    await User.findByIdAndUpdate(client.userId, {
      name,
      profileImage: req.file ? req.file.filename : client.companyLogo
    });

    await Client.findByIdAndUpdate(id, {
      budget,
      dateOfJoining,
      planType,
      companyLogo: req.file ? req.file.filename : client.companyLogo
    });

    return res.json({ success: true, message: "Client updated" });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);
    if (!client)
      return res.status(404).json({ success: false, error: "Client not found" });

    await User.findByIdAndDelete(client.userId);
    await Client.findByIdAndDelete(id);

    return res.json({ success: true, message: "Client deleted" });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
