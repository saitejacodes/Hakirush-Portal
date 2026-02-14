import User from "../models/User.js";
import Client from "../models/Client.js";
import Employee from "../models/Employee.js"; // Import the Employee model
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User Not Found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Wrong Password"
      });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "10d" }
    );

    let finalUser = user.toObject();
    delete finalUser.password;

    // --- NEW LOGIC FOR EMPLOYEE DATA ---
    if (user.role === "employee") {
      const employee = await Employee.findOne({ userId: user._id });
      if (employee) {
        finalUser.employeeId = employee.employeeId; // This sends "HAKI0001"
        finalUser.designation = employee.designation;
      }
    }

    // Existing Logic for Client
    if (user.role === "client") {
      const client = await Client.findOne({ userId: user._id });
      if (client?.companyLogo) {
        finalUser.profileImage = client.companyLogo;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: finalUser
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};

const verify = async (req, res) => {
  try {
    let finalUser = req.user.toObject ? req.user.toObject() : { ...req.user };

    // --- ENSURE VERIFY ALSO RETURNS THE EMPLOYEE ID ---
    if (req.user.role === "employee") {
      const employee = await Employee.findOne({ userId: req.user._id });
      if (employee) {
        finalUser.employeeId = employee.employeeId; 
        finalUser.designation = employee.designation;
      }
    }

    if (req.user.role === "client") {
      const client = await Client.findOne({ userId: req.user._id });
      if (client?.companyLogo) {
        finalUser.profileImage = client.companyLogo;
      }
    }

    return res.status(200).json({
      success: true,
      user: finalUser
    });
  } catch (error) {
    console.error("VERIFY ERROR:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};

export { login, verify };